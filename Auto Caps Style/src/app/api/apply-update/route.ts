import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function POST(req: Request) {
  const tempDir = path.join(os.tmpdir(), `autocap_update_${Date.now()}`);
  try {
    const body = await req.json().catch(() => ({}));
    const repoZipUrl = body.url || 'https://github.com/alokvideoeditornp/Auto-Cap-s-Style/archive/refs/heads/main.zip';

    fs.mkdirSync(tempDir, { recursive: true });
    const zipPath = path.join(tempDir, 'update.zip');
    const extractPath = path.join(tempDir, 'extracted');

    // 1. Download latest archive from GitHub
    const res = await fetch(repoZipUrl, {
      headers: {
        'User-Agent': 'AutoCapsStyle-AutoUpdater',
        'Cache-Control': 'no-cache',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to download update package (HTTP ${res.status})` },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(zipPath, buffer);

    // 2. Extract Archive
    if (process.platform === 'win32') {
      await execPromise(`powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${extractPath}' -Force"`);
    } else {
      await execPromise(`unzip -o "${zipPath}" -d "${extractPath}"`);
    }

    // 3. Locate source directory inside extracted folder
    let sourceDir = '';
    const extractedEntries = fs.readdirSync(extractPath);
    for (const entry of extractedEntries) {
      const candidate1 = path.join(extractPath, entry, 'Auto Caps Style');
      const candidate2 = path.join(extractPath, entry);
      if (fs.existsSync(path.join(candidate1, 'package.json'))) {
        sourceDir = candidate1;
        break;
      } else if (fs.existsSync(path.join(candidate2, 'package.json'))) {
        sourceDir = candidate2;
        break;
      }
    }

    if (!sourceDir) {
      return NextResponse.json(
        { success: false, error: 'Could not find valid update structure in archive' },
        { status: 500 }
      );
    }

    const targetDir = process.cwd();

    // 4. Recursive replace files, strictly protecting data/ (colors, presets, settings) & node_modules
    function copyRecursive(src: string, dest: string) {
      const items = fs.readdirSync(src);
      for (const item of items) {
        if (item === 'node_modules' || item === 'data' || item === '.next' || item === '.git') {
          continue; // Protected user data & dependencies
        }
        const srcItem = path.join(src, item);
        const destItem = path.join(dest, item);
        const stat = fs.statSync(srcItem);

        if (stat.isDirectory()) {
          if (!fs.existsSync(destItem)) {
            fs.mkdirSync(destItem, { recursive: true });
          }
          copyRecursive(srcItem, destItem);
        } else {
          fs.copyFileSync(srcItem, destItem);
        }
      }
    }

    copyRecursive(sourceDir, targetDir);

    // 5. Compile production build in targetDir
    try {
      const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      await execPromise(`"${npmCmd}" run build`, { cwd: targetDir, timeout: 180000 });
    } catch (buildErr: any) {
      console.warn('Post-update build notice:', buildErr?.message || buildErr);
    }

    // 6. Cleanup temp files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'Update installed successfully!',
    });
  } catch (err: any) {
    try {
      if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (_) {}
    console.error('Apply update failed:', err);
    return NextResponse.json({ success: false, error: String(err?.message || err) }, { status: 500 });
  }
}
