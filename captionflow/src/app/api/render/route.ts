import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const jobs: Record<string, { status: string; progress: number; url?: string; error?: string }> = {};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { inputProps } = body;
    
    const jobId = Math.random().toString(36).substring(7);
    jobs[jobId] = { status: 'processing', progress: 0 };
    
    // Save props to a temporary file because passing large JSON via CLI arguments breaks on Windows
    const tempDir = path.resolve(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const propsPath = path.join(tempDir, `props-${jobId}.json`);
    fs.writeFileSync(propsPath, JSON.stringify(inputProps));
    
    const outputLocation = path.resolve(process.cwd(), `public/renders/render-${jobId}.mov`);
    const outputDir = path.dirname(outputLocation);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

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
      `--concurrency=100%`,
      `--props="${propsPath}"`
    ];

    const remotionProcess = spawn(npxCmd, remotionArgs, {
      cwd: process.cwd(),
      shell: true // Required for npx on Windows
    });

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
      console.error(`[Job ${jobId}] Remotion stderr:`, data.toString());
    });

    remotionProcess.on('close', (code) => {
      // Clean up temp props file
      if (fs.existsSync(propsPath)) fs.unlinkSync(propsPath);
      
      if (code === 0) {
        console.log(`[Job ${jobId}] Render complete!`);
        jobs[jobId].progress = 100;
        jobs[jobId].status = 'done';
        jobs[jobId].url = `/renders/render-${jobId}.mov`;
      } else {
        console.error(`[Job ${jobId}] Render failed with code ${code}`);
        jobs[jobId].status = 'failed';
        jobs[jobId].error = `Render process exited with code ${code}`;
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
