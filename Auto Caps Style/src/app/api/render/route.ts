import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';

// Suppress normal Puppeteer/Chromium target closing errors during render cancellation
if (typeof process !== 'undefined' && process.on) {
  process.on('unhandledRejection', (reason: unknown) => {
    const str = String(reason || '').toLowerCase();
    if (
      str.includes('target closed') ||
      str.includes('protocol error') ||
      str.includes('session closed') ||
      str.includes('page.bringtofront') ||
      str.includes('user cancelled')
    ) {
      return;
    }
    console.error('[Unhandled Rejection]', reason);
  });
}

// ─── In-memory job store ─────────────────────────────────────────────────────
const jobs: Record<string, { status: string; progress: number; url?: string; error?: string }> = {};

// ─── Bundle cache ─────────────────────────────────────────────────────────────
const PERSISTENT_BUNDLE_DIR = path.resolve(process.cwd(), '.remotion-bundle');
let cachedBundlePath: string | null = null;
let isBundling = false;
const bundleWaiters: Array<(p: string | null) => void> = [];

async function getBundle(): Promise<string | null> {
  if (cachedBundlePath && fs.existsSync(cachedBundlePath)) {
    return cachedBundlePath;
  }

  if (fs.existsSync(path.join(PERSISTENT_BUNDLE_DIR, 'index.html'))) {
    cachedBundlePath = PERSISTENT_BUNDLE_DIR;
    return cachedBundlePath;
  }

  if (isBundling) {
    return new Promise<string | null>((resolve) => {
      bundleWaiters.push(resolve);
    });
  }

  isBundling = true;

  try {
    const { bundle } = await import('@remotion/bundler');

    console.log('[Remotion] Bundling composition to persistent cache…');
    const bundlePath = await bundle({
      entryPoint: path.resolve(process.cwd(), 'src/remotion/index.ts'),
      outDir: PERSISTENT_BUNDLE_DIR,
      enableCaching: true,
    });

    cachedBundlePath = bundlePath;
    console.log('[Remotion] Persistent bundle saved at:', bundlePath);
    return bundlePath;
  } catch (err) {
    console.error('[Remotion] Bundling failed:', err);
    cachedBundlePath = null;
    return null;
  } finally {
    isBundling = false;
    const p = cachedBundlePath;
    bundleWaiters.forEach((r) => r(p));
    bundleWaiters.length = 0;
  }
}

// ─── Render Cache System ──────────────────────────────────────────────────────
const RENDER_CACHE_DIR = path.resolve(process.cwd(), '.render-cache');
if (!fs.existsSync(RENDER_CACHE_DIR)) {
  fs.mkdirSync(RENDER_CACHE_DIR, { recursive: true });
}

interface PreRenderJob {
  projectHash: string;
  status: 'caching' | 'ready' | 'failed';
  progress: number;
  error?: string;
}

const activePreRenderJobs: Map<string, PreRenderJob> = new Map();
let isPreRendering = false;
let pendingPreRender: { projectHash: string; inputProps: Record<string, unknown>; cachedFilePath: string } | null = null;

function computeProjectHash(inputProps: Record<string, unknown>): string {
  const clean = {
    captions: inputProps.captions,
    styleConfig: inputProps.styleConfig,
    fps: inputProps.fps,
    videoDuration: inputProps.videoDuration,
  };
  return crypto.createHash('sha256').update(JSON.stringify(clean)).digest('hex');
}

let currentlyRenderingHash: string | null = null;

const SYSTEM_PRESET_CONFIGS: Record<string, unknown>[] = [
  { name: '3-Way Focus', font: 'Montserrat', baseColor: '#ffffff', accentColor: '#FFD400', fontSize: 130, baseFontSizeMultiplier: 0.7, accentFontSizeMultiplier: 1.2, animationType: '3-line-focus', displayMode: 'word', highlightStyle: 'none' },
  { name: 'Classic Reels', font: 'Montserrat', baseColor: '#ffffff', accentColor: '#FFD400', fontSize: 100, baseFontSizeMultiplier: 1.0, accentFontSizeMultiplier: 1.3, animationType: 'slide-up', displayMode: 'line', highlightStyle: 'none' },
  { name: 'Dynamic Pop', font: 'Bebas Neue', baseColor: '#ffffff', accentColor: '#ccff00', fontSize: 120, baseFontSizeMultiplier: 0.35, accentFontSizeMultiplier: 1.0, animationType: 'slide-up', displayMode: 'line', highlightStyle: 'none' },
  { name: 'Cinematic Fade', font: 'Montserrat', baseColor: '#e0e0e0', accentColor: '#ffb703', fontSize: 60, baseFontSizeMultiplier: 1.0, accentFontSizeMultiplier: 1.2, animationType: 'slide-up', displayMode: 'line', highlightStyle: 'none' },
  { name: 'MrBeast Drop', font: 'Oswald', baseColor: '#ffffff', accentColor: '#00ffff', fontSize: 160, baseFontSizeMultiplier: 0.8, accentFontSizeMultiplier: 1.2, animationType: 'slide-up', displayMode: 'line', highlightStyle: 'none' },
  { name: 'The Hormozi', font: 'Inter', baseColor: '#000000', accentColor: '#ff0000', fontSize: 140, baseFontSizeMultiplier: 0.4, accentFontSizeMultiplier: 1.2, animationType: 'slide-up', displayMode: 'line', highlightStyle: 'none' },
  { name: 'Minimalist Type', font: 'Inter', baseColor: '#cccccc', accentColor: '#ffffff', fontSize: 80, baseFontSizeMultiplier: 1.0, accentFontSizeMultiplier: 1.0, animationType: 'slide-up', displayMode: 'line', highlightStyle: 'none' },
  { name: 'Neon Bounce', font: 'Oswald', baseColor: '#ffffff', accentColor: '#ff0055', fontSize: 90, baseFontSizeMultiplier: 1.0, accentFontSizeMultiplier: 1.5, animationType: 'slide-up', displayMode: 'line', highlightStyle: 'none' },
  { name: 'Retro Type', font: 'Oswald', baseColor: '#ff9900', accentColor: '#00ffcc', fontSize: 70, baseFontSizeMultiplier: 1.0, accentFontSizeMultiplier: 1.0, animationType: 'slide-up', displayMode: 'line', highlightStyle: 'none' },
  { name: 'Vlog Stagger', font: 'Inter', baseColor: '#ffffff', accentColor: '#ff3366', fontSize: 85, baseFontSizeMultiplier: 1.0, accentFontSizeMultiplier: 1.5, animationType: 'slide-up', displayMode: 'line', highlightStyle: 'none' },
  { name: 'Aggressive Impact', font: 'Bebas Neue', baseColor: '#cccccc', accentColor: '#ff0000', fontSize: 120, baseFontSizeMultiplier: 0.6, accentFontSizeMultiplier: 1.8, animationType: 'slide-up', displayMode: 'line', highlightStyle: 'none' },
  { name: 'Clean Corporate', font: 'Montserrat', baseColor: '#ffffff', accentColor: '#0066ff', fontSize: 50, baseFontSizeMultiplier: 1.0, accentFontSizeMultiplier: 1.0, animationType: 'slide-up', displayMode: 'line', highlightStyle: 'none' },
];

let idlePresetQueue: Array<{ projectHash: string; inputProps: Record<string, unknown>; cachedFilePath: string }> = [];

function populateIdlePresetQueue(baseInputProps: Record<string, unknown>) {
  if (!baseInputProps.captions || !Array.isArray(baseInputProps.captions) || baseInputProps.captions.length === 0) return;

  const baseStyle = (baseInputProps.styleConfig || {}) as Record<string, unknown>;

  for (const preset of SYSTEM_PRESET_CONFIGS) {
    const mergedStyle = {
      ...baseStyle,
      ...preset,
      activePreset: preset.name,
    };
    const presetProps = {
      ...baseInputProps,
      styleConfig: mergedStyle,
      isRendering: true,
    };
    const hash = computeProjectHash(presetProps);
    const movPath = path.join(RENDER_CACHE_DIR, `${hash}.mov`);

    if (!fs.existsSync(movPath) || fs.statSync(movPath).size === 0) {
      if (!idlePresetQueue.some((item) => item.projectHash === hash)) {
        idlePresetQueue.push({ projectHash: hash, inputProps: presetProps, cachedFilePath: movPath });
      }
    }
  }
}

function cleanupOldCaches() {
  try {
    if (!fs.existsSync(RENDER_CACHE_DIR)) return;
    const files = fs.readdirSync(RENDER_CACHE_DIR)
      .filter((f) => f.endsWith('.mov'))
      .map((f) => ({
        name: f,
        path: path.join(RENDER_CACHE_DIR, f),
        time: fs.statSync(path.join(RENDER_CACHE_DIR, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 35) {
      for (let i = 35; i < files.length; i++) {
        try {
          fs.unlinkSync(files[i].path);
        } catch (_) {}
      }
    }
  } catch (err) {
    console.error('[Render Cache Cleanup] Error:', err);
  }
}

let activePreRenderCancelController: { cancelSignal: any; cancel: () => void } | null = null;

async function processPreRenderQueue() {
  if (isPreRendering) return;

  let current = pendingPreRender;
  if (!current && idlePresetQueue.length > 0) {
    while (idlePresetQueue.length > 0) {
      const candidate = idlePresetQueue.shift()!;
      if (!fs.existsSync(candidate.cachedFilePath) || fs.statSync(candidate.cachedFilePath).size === 0) {
        current = candidate;
        break;
      }
    }
  }

  if (!current) return;

  pendingPreRender = null;
  isPreRendering = true;
  currentlyRenderingHash = current.projectHash;

  const { projectHash, inputProps, cachedFilePath } = current;

  const jobInfo: PreRenderJob = activePreRenderJobs.get(projectHash) || {
    projectHash,
    status: 'caching',
    progress: 10,
  };
  jobInfo.status = 'caching';
  activePreRenderJobs.set(projectHash, jobInfo);

  let tempOutput = '';
  try {
    // If cache was already created in the meantime
    if (fs.existsSync(cachedFilePath) && fs.statSync(cachedFilePath).size > 0) {
      jobInfo.status = 'ready';
      jobInfo.progress = 100;
      isPreRendering = false;
      currentlyRenderingHash = null;
      if (pendingPreRender || idlePresetQueue.length > 0) processPreRenderQueue();
      return;
    }

    const serveUrl = await getBundle();
    if (!serveUrl) {
      throw new Error('Failed to bundle Remotion composition');
    }
    jobInfo.progress = 15;

    const { renderMedia, selectComposition, makeCancelSignal } = await import('@remotion/renderer');

    const composition = await selectComposition({
      serveUrl,
      id: 'CaptionComposition',
      inputProps,
      timeoutInMilliseconds: 90000,
      chromiumOptions: {
        disableWebSecurity: true,
        ignoreCertificateErrors: true,
        gl: 'angle',
      },
    });
    jobInfo.progress = 25;

    const concurrency = Math.min(8, Math.max(2, os.cpus().length));
    tempOutput = `${cachedFilePath}.tmp_${Date.now()}.mov`;

    const cancelController = makeCancelSignal();
    activePreRenderCancelController = cancelController;

    await renderMedia({
      composition,
      serveUrl,
      codec: 'prores',
      proResProfile: '4444',
      pixelFormat: 'yuva444p10le',
      imageFormat: 'png',
      outputLocation: tempOutput,
      inputProps,
      concurrency,
      muted: true,
      cancelSignal: cancelController.cancelSignal,
      timeoutInMilliseconds: 90000,
      chromiumOptions: {
        disableWebSecurity: true,
        ignoreCertificateErrors: true,
        gl: 'angle',
      },
      onProgress: ({ progress }) => {
        jobInfo.progress = Math.min(100, 25 + Math.round(progress * 75));
      },
    });

    if (fs.existsSync(tempOutput)) {
      if (fs.existsSync(cachedFilePath)) {
        try { fs.unlinkSync(cachedFilePath); } catch (_) {}
      }
      fs.renameSync(tempOutput, cachedFilePath);
    }

    jobInfo.status = 'ready';
    jobInfo.progress = 100;
    cleanupOldCaches();

    // Notify any waiting user-initiated render jobs
    const waiters = preRenderWaiters.get(projectHash);
    if (waiters) {
      waiters.forEach((resolve) => resolve());
      preRenderWaiters.delete(projectHash);
    }

    // Populate idle presets only after the user's active preset finishes
    if (!pendingPreRender) {
      populateIdlePresetQueue(inputProps);
    }
  } catch (err: unknown) {
    const errStr = String(err).toLowerCase();
    if (
      errStr.includes('cancel') ||
      errStr.includes('abort') ||
      errStr.includes('target closed') ||
      errStr.includes('protocol error') ||
      errStr.includes('session closed')
    ) {
      console.log(`[PreRender ${projectHash}] Cancelled in favor of newer user edit.`);
      jobInfo.status = 'failed';
      jobInfo.error = 'Cancelled';
      if (tempOutput && fs.existsSync(tempOutput)) {
        try { fs.unlinkSync(tempOutput); } catch (_) {}
      }
      return;
    }

    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[PreRender ${projectHash}] Error:`, err);
    jobInfo.status = 'failed';
    jobInfo.error = errMsg;
    const waiters = preRenderWaiters.get(projectHash);
    if (waiters) {
      waiters.forEach((resolve) => resolve());
      preRenderWaiters.delete(projectHash);
    }
  } finally {
    isPreRendering = false;
    currentlyRenderingHash = null;
    activePreRenderCancelController = null;
    if (pendingPreRender || idlePresetQueue.length > 0) {
      setTimeout(() => {
        processPreRenderQueue().catch(() => {});
      }, 50);
    }
  }
}

const preRenderWaiters: Map<string, Array<() => void>> = new Map();

function queueBackgroundPreRender(
  projectHash: string,
  inputProps: Record<string, unknown>,
  cachedFilePath: string
) {
  pendingPreRender = { projectHash, inputProps, cachedFilePath };
  idlePresetQueue = []; // Give 100% CPU priority to the user's active edit

  // Cancel any running obsolete render immediately so the new preset starts right away!
  if (isPreRendering && currentlyRenderingHash !== projectHash && activePreRenderCancelController) {
    try {
      activePreRenderCancelController.cancel();
      activePreRenderCancelController = null;
    } catch (_) {}
  }

  processPreRenderQueue().catch((err) => {
    console.error('[PreRender Queue Error]:', err);
  });
}

// ─── POST /api/render ─────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const isPreRender = Boolean(body.isPreRender);
    let { inputProps, projectName } = body;
    inputProps = { ...inputProps, isRendering: true } as Record<string, unknown>;

    const projectHash = computeProjectHash(inputProps);
    const cachedMovPath = path.join(RENDER_CACHE_DIR, `${projectHash}.mov`);

    // ── Background Pre-Render Request ──
    if (isPreRender) {
      if (fs.existsSync(cachedMovPath) && fs.statSync(cachedMovPath).size > 0) {
        return NextResponse.json({ status: 'ready', progress: 100, cacheKey: projectHash, cached: true });
      }

      const existingJob = activePreRenderJobs.get(projectHash);
      if (existingJob && existingJob.status === 'ready') {
        return NextResponse.json({ status: 'ready', progress: 100, cacheKey: projectHash, cached: true });
      }

      const jobInfo: PreRenderJob = {
        projectHash,
        status: 'caching',
        progress: 10,
      };
      activePreRenderJobs.set(projectHash, jobInfo);

      queueBackgroundPreRender(projectHash, inputProps, cachedMovPath);

      return NextResponse.json({
        status: 'caching',
        progress: 10,
        cacheKey: projectHash,
      });
    }

    // ── Final User-Initiated Render ──
    const jobId = Math.random().toString(36).substring(7);
    jobs[jobId] = { status: 'processing', progress: 0 };

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

    // CASE 1: Instant cache hit (Already rendered in background!)
    if (fs.existsSync(cachedMovPath) && fs.statSync(cachedMovPath).size > 0) {
      console.log(`[Job ${jobId}] Instant cache hit! Copying ready MOV: ${projectHash}`);
      fs.copyFileSync(cachedMovPath, outputLocation);
      jobs[jobId] = {
        status: 'done',
        progress: 100,
        url: safeProjectName ? `/renders/${safeProjectName}/${fileName}` : `/renders/${fileName}`,
      };
      return NextResponse.json({ jobId, cached: true });
    }

    // CASE 2: Currently rendering in background pre-render queue (Attach to in-flight render!)
    if (currentlyRenderingHash === projectHash || pendingPreRender?.projectHash === projectHash) {
      const currentProgress = activePreRenderJobs.get(projectHash)?.progress || 30;
      jobs[jobId] = {
        status: 'processing',
        progress: Math.max(10, currentProgress),
      };

      const waitPromise = new Promise<void>((resolve) => {
        if (!preRenderWaiters.has(projectHash)) {
          preRenderWaiters.set(projectHash, []);
        }
        preRenderWaiters.get(projectHash)!.push(resolve);
      });

      (async () => {
        const interval = setInterval(() => {
          const pJob = activePreRenderJobs.get(projectHash);
          if (pJob && jobs[jobId] && jobs[jobId].status === 'processing') {
            jobs[jobId].progress = pJob.progress;
          }
        }, 200);

        try {
          await waitPromise;
          clearInterval(interval);
          if (fs.existsSync(cachedMovPath) && fs.statSync(cachedMovPath).size > 0) {
            fs.copyFileSync(cachedMovPath, outputLocation);
            jobs[jobId] = {
              status: 'done',
              progress: 100,
              url: safeProjectName ? `/renders/${safeProjectName}/${fileName}` : `/renders/${fileName}`,
            };
          } else {
            throw new Error('Pre-render completed but cached file missing');
          }
        } catch (err) {
          clearInterval(interval);
          runFullRender({ jobId, inputProps, outputLocation, cachedMovPath, safeProjectName, fileName }).catch((e) => {
            jobs[jobId].status = 'failed';
            jobs[jobId].error = String(e);
          });
        }
      })();

      return NextResponse.json({ jobId });
    }

    // CASE 3: Run Full Render with maximum CPU cores
    runFullRender({ jobId, inputProps, outputLocation, cachedMovPath, safeProjectName, fileName }).catch((err) => {
      console.error(`[Job ${jobId}] Unhandled render error:`, err);
      jobs[jobId].status = 'failed';
      jobs[jobId].error = String(err);
    });

    return NextResponse.json({ jobId });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function runFullRender({
  jobId,
  inputProps,
  outputLocation,
  cachedMovPath,
  safeProjectName,
  fileName,
}: {
  jobId: string;
  inputProps: Record<string, unknown>;
  outputLocation: string;
  cachedMovPath: string;
  safeProjectName: string;
  fileName: string;
}) {
  jobs[jobId].progress = 1;
  const serveUrl = await getBundle();
  if (!serveUrl) {
    jobs[jobId].status = 'failed';
    jobs[jobId].error = 'Failed to bundle the Remotion composition.';
    return;
  }
  jobs[jobId].progress = 10;

  try {
    const { renderMedia, selectComposition } = await import('@remotion/renderer');

    const composition = await selectComposition({
      serveUrl,
      id: 'CaptionComposition',
      inputProps,
    });

    const concurrency = os.cpus().length;

    await renderMedia({
      composition,
      serveUrl,
      codec: 'prores',
      proResProfile: '4444',
      pixelFormat: 'yuva444p10le',
      imageFormat: 'png',
      outputLocation,
      inputProps,
      concurrency,
      muted: true,
      onProgress: ({ progress }) => {
        jobs[jobId].progress = Math.min(100, Math.round(progress * 100));
      },
    });

    try {
      fs.copyFileSync(outputLocation, cachedMovPath);
      cleanupOldCaches();
    } catch (_) {}

    jobs[jobId].progress = 100;
    jobs[jobId].status = 'done';
    jobs[jobId].url = safeProjectName
      ? `/renders/${safeProjectName}/${fileName}`
      : `/renders/${fileName}`;

    console.log(`[Job ${jobId}] Full render complete: ${outputLocation}`);
  } catch (err: unknown) {
    console.error(`[Job ${jobId}] renderMedia failed:`, err);
    jobs[jobId].status = 'failed';
    jobs[jobId].error = err instanceof Error ? err.message : String(err);
    if (String(err).includes('bundle') || String(err).includes('serve')) {
      cachedBundlePath = null;
    }
  }
}

// ─── GET /api/render ──────────────────────────────────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const prewarm = searchParams.get('prewarm');

  if (prewarm === 'true') {
    getBundle().catch((err) => {
      console.error('[Remotion Prewarm] Failed:', err);
    });
    return NextResponse.json({ status: 'prewarming' });
  }

  const checkCacheKey = searchParams.get('checkCacheKey');
  if (checkCacheKey) {
    const cachedMov = path.join(RENDER_CACHE_DIR, `${checkCacheKey}.mov`);
    if (fs.existsSync(cachedMov) && fs.statSync(cachedMov).size > 0) {
      return NextResponse.json({ status: 'ready', progress: 100, cached: true });
    }

    const job = activePreRenderJobs.get(checkCacheKey);
    if (job) {
      return NextResponse.json({
        status: job.status,
        progress: job.progress,
        cached: job.status === 'ready',
        error: job.error,
      });
    }

    return NextResponse.json({ status: 'caching', progress: 15, cached: false });
  }

  const jobId = searchParams.get('jobId');

  if (!jobId || !jobs[jobId]) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json(jobs[jobId]);
}

