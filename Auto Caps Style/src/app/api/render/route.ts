import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const jobs: Record<string, { status: string; progress: number; url?: string; error?: string }> = {};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { inputProps, projectName } = body;
    inputProps = { ...inputProps, isRendering: true };
    
    const jobId = Math.random().toString(36).substring(7);
    jobs[jobId] = { status: 'processing', progress: 0 };
    
    // Save props to a temporary file because passing large JSON via CLI arguments breaks on Windows
    const tempDir = path.resolve(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const propsPath = path.join(tempDir, `props-${jobId}.json`);
    fs.writeFileSync(propsPath, JSON.stringify(inputProps));
    
    // Sanitize project name to be safe for file paths
    const safeProjectName = projectName ? projectName.replace(/[^a-z0-9 _-]/gi, '').trim() : '';
    const baseDir = safeProjectName 
      ? path.resolve(process.cwd(), 'public/renders', safeProjectName)
      : path.resolve(process.cwd(), 'public/renders');
      
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
    
    let fileName = `Cap's Vid.mov`;
    let outputLocation = path.join(baseDir, fileName);
    let counter = 1;
    while (fs.existsSync(outputLocation)) {
      const paddedCounter = counter.toString().padStart(2, '0');
      fileName = `Cap's Vid_${paddedCounter}.mov`;
      outputLocation = path.join(baseDir, fileName);
      counter++;
    }

    console.log(`[Job ${jobId}] Spawning Remotion CLI for ProRes 4444...`);
    
    // Spawn the Remotion CLI in a separate process
    const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const remotionArgs = [
      'remotion',
      'render',
      'src/remotion/index.ts',
      'CaptionComposition',
      `"${outputLocation}"`,
      `--codec=prores`,
      `--prores-profile=4444`,
      `--pixel-format=yuva444p10le`,
      `--image-format=png`,
      `--muted`,
      `--props="${propsPath}"`
    ];

    const remotionProcess = spawn(npxCmd, remotionArgs, {
      cwd: process.cwd(),
      shell: true // Required for npx on Windows
    });

    let lastError = '';

    remotionProcess.stdout.on('data', (data) => {
      const output = data.toString();
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes('Bundling')) {
          const match = line.match(/Bundling\s+(\d+)%/);
          if (match) {
            jobs[jobId].progress = Math.round(parseInt(match[1]) * 0.2); // 0-20%
          }
        }
        if (line.includes('Rendered')) {
          const match = line.match(/Rendered\s+(\d+)\/(\d+)/);
          if (match) {
            const current = parseInt(match[1]);
            const total = parseInt(match[2]);
            jobs[jobId].progress = 20 + Math.round((current / total) * 70); // 20-90%
          }
        }
        if (line.includes('Encoded')) {
          const match = line.match(/Encoded\s+(\d+)\/(\d+)/);
          if (match) {
            const current = parseInt(match[1]);
            const total = parseInt(match[2]);
            jobs[jobId].progress = 90 + Math.round((current / total) * 10); // 90-100%
          }
        }
      }
    });

    remotionProcess.stderr.on('data', (data) => {
      const msg = data.toString();
      console.error(`[Job ${jobId}] Remotion stderr:`, msg);
      // Capture the last error message or the full stderr if it's short enough
      lastError += msg;
      if (lastError.length > 500) {
        lastError = lastError.substring(lastError.length - 500);
      }
    });

    remotionProcess.on('exit', (code) => {
      // Clean up temp props file
      if (fs.existsSync(propsPath)) fs.unlinkSync(propsPath);
      
      if (code === 0 || code === null) {
        console.log(`[Job ${jobId}] Render complete!`);
        jobs[jobId].progress = 100;
        jobs[jobId].status = 'done';
        jobs[jobId].url = safeProjectName ? `/renders/${safeProjectName}/${fileName}` : `/renders/${fileName}`;
      } else {
        console.error(`[Job ${jobId}] Render failed with code ${code}`);
        jobs[jobId].status = 'failed';
        jobs[jobId].error = `Render failed: ${lastError.trim() || 'Unknown error'}`;
      }
    });

    return NextResponse.json({ jobId });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  if (!jobId || !jobs[jobId]) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json(jobs[jobId]);
}
