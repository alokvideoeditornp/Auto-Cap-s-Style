import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import os from 'os';

// ─── In-memory job store ─────────────────────────────────────────────────────
const jobs: Record<string, { status: string; progress: number; url?: string; error?: string }> = {};

// ─── Bundle cache ─────────────────────────────────────────────────────────────
// We cache the Webpack bundle path across requests so we only bundle ONCE per
// server session instead of on every render. This eliminates the 20-60 s cold
// start that caused most of the "slow render" complaints.
let cachedBundlePath: string | null = null;
let isBundling = false;
const bundleWaiters: Array<(p: string | null) => void> = [];

async function getBundle(): Promise<string | null> {
  // If we already have a valid cached bundle, return it immediately.
  if (cachedBundlePath && fs.existsSync(cachedBundlePath)) {
    return cachedBundlePath;
  }

  // If a bundle is already in progress, wait for it to finish.
  if (isBundling) {
    return new Promise<string | null>((resolve) => {
      bundleWaiters.push(resolve);
    });
  }

  isBundling = true;

  try {
    // Dynamically import to keep Next.js edge/SSR happy (these are Node-only).
    const { bundle } = await import('@remotion/bundler');

    console.log('[Remotion] Bundling composition (first render only)…');
    const bundlePath = await bundle({
      entryPoint: path.resolve(process.cwd(), 'src/remotion/index.ts'),
    });

    cachedBundlePath = bundlePath;
    console.log('[Remotion] Bundle cached at:', bundlePath);
    return bundlePath;
  } catch (err) {
    console.error('[Remotion] Bundling failed:', err);
    cachedBundlePath = null;
    return null;
  } finally {
    isBundling = false;
    // Notify all waiters
    const p = cachedBundlePath;
    bundleWaiters.forEach((r) => r(p));
    bundleWaiters.length = 0;
  }
}

// ─── POST /api/render ─────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { inputProps, projectName } = body;
    inputProps = { ...inputProps, isRendering: true } as Record<string, unknown>;

    const jobId = Math.random().toString(36).substring(7);
    jobs[jobId] = { status: 'processing', progress: 0 };

    // Sanitize project name for file paths
    const safeProjectName = projectName
      ? projectName.replace(/[^a-z0-9 _-]/gi, '').trim()
      : '';
    const baseDir = safeProjectName
      ? path.resolve(process.cwd(), 'public/renders', safeProjectName)
      : path.resolve(process.cwd(), 'public/renders');
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

    let fileName = `Cap's Vid.mov`;
    let outputLocation = path.join(baseDir, fileName);
    let counter = 1;
    while (fs.existsSync(outputLocation)) {
      const padded = counter.toString().padStart(2, '0');
      fileName = `Cap's Vid_${padded}.mov`;
      outputLocation = path.join(baseDir, fileName);
      counter++;
    }

    // Start the render asynchronously — don't await so the API responds immediately.
    runRender({ jobId, inputProps, outputLocation, safeProjectName, fileName }).catch(
      (err) => {
        console.error(`[Job ${jobId}] Unhandled render error:`, err);
        jobs[jobId].status = 'failed';
        jobs[jobId].error = String(err);
      }
    );

    return NextResponse.json({ jobId });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function runRender({
  jobId,
  inputProps,
  outputLocation,
  safeProjectName,
  fileName,
}: {
  jobId: string;
  inputProps: Record<string, unknown>;
  outputLocation: string;
  safeProjectName: string;
  fileName: string;
}) {
  // ── Step 1: Get (or build) the webpack bundle ─────────────────────────────
  jobs[jobId].progress = 1;
  const serveUrl = await getBundle();
  if (!serveUrl) {
    jobs[jobId].status = 'failed';
    jobs[jobId].error = 'Failed to bundle the Remotion composition.';
    return;
  }
  jobs[jobId].progress = 10; // bundling counts as ~10%

  try {
    // ── Step 2: Render with the Node.js API (no CLI spawning) ───────────────
    const { renderMedia, selectComposition } = await import('@remotion/renderer');

    // Resolve composition metadata (duration, width, height) using our props.
    const composition = await selectComposition({
      serveUrl,
      id: 'CaptionComposition',
      inputProps,
    });

    // Use ALL available CPU cores for maximum speed.
    const concurrency = os.cpus().length;

    await renderMedia({
      composition,
      serveUrl,
      codec: 'prores',
      // ProRes 4444 supports alpha but is very slow on CPU.
      // Switch to ProRes 422 HQ for ~2-3× speed gain with no visible quality loss
      // for caption-only overlays. Alpha channel is preserved via pixel format.
      proResProfile: '4444', // kept as 4444 to preserve transparency for DaVinci import
      pixelFormat: 'yuva444p10le',
      imageFormat: 'png',
      outputLocation,
      inputProps,
      concurrency,         // use all CPU cores
      muted: true,         // captions have no audio
      onProgress: ({ progress }) => {
        // Map render progress (0-1) from 10% to 99% in our job status
        jobs[jobId].progress = 10 + Math.round(progress * 89);
      },
    });

    jobs[jobId].progress = 100;
    jobs[jobId].status = 'done';
    jobs[jobId].url = safeProjectName
      ? `/renders/${safeProjectName}/${fileName}`
      : `/renders/${fileName}`;

    console.log(`[Job ${jobId}] Render complete: ${outputLocation}`);
  } catch (err: unknown) {
    console.error(`[Job ${jobId}] renderMedia failed:`, err);
    jobs[jobId].status = 'failed';
    jobs[jobId].error = err instanceof Error ? err.message : String(err);
    // Invalidate the bundle cache if it might be stale/corrupt
    if (String(err).includes('bundle') || String(err).includes('serve')) {
      cachedBundlePath = null;
    }
  }
}

// ─── GET /api/render?jobId=xxx ────────────────────────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  if (!jobId || !jobs[jobId]) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json(jobs[jobId]);
}
