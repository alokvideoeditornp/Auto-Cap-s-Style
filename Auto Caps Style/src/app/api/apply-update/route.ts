import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

function findFrontendDir(dir: string, depth = 0): string | null {
  if (depth > 4) return null;
  try {
    if (fs.existsSync(path.join(dir, 'package.json')) && fs.existsSync(path.join(dir, 'src'))) {
      return dir;
    }
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const full = path.join(dir, entry);
      try {
        if (fs.statSync(full).isDirectory()) {
          const found = findFrontendDir(full, depth + 1);
          if (found) return found;
        }
      } catch (_) {}
    }
  } catch (_) {}
  return null;
}

export async function POST(req: Request) {
  const tempDir = path.join(os.tmpdir(), `autocap_update_${Date.now()}`);
  try {
    const body = await req.json().catch(() => ({}));
    let repoZipUrl = (body?.url || '').trim();

    if (!repoZipUrl || !repoZipUrl.endsWith('.zip')) {
      repoZipUrl = 'https://github.com/alokvideoeditornp/Auto-Cap-s-Style/archive/refs/heads/main.zip';
    }

    fs.mkdirSync(tempDir, { recursive: true });
    const zipPath = path.join(tempDir, 'update.zip');
    const extractPath = path.join(tempDir, 'extracted');

    // 1. Download latest zip from GitHub
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

    // 2. Extract Archive safely
    if (process.platform === 'win32') {
      await execPromise(`powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${extractPath}' -Force"`);
    } else {
      await execPromise(`unzip -o "${zipPath}" -d "${extractPath}"`);
    }

    // 3. Find frontend source directory containing package.json & src
    const sourceDir = findFrontendDir(extractPath);

    if (!sourceDir) {
      return NextResponse.json(
        { success: false, error: 'Could not find valid update structure in archive' },
        { status: 500 }
      );
    }

    const targetDir = process.cwd();

    // 4. Read latest version from extracted version.json or package.json
    let newVersion = '1.0.2';
    try {
      const extractedVerFile = path.join(sourceDir, 'version.json');
      const extractedPkgFile = path.join(sourceDir, 'package.json');
      if (fs.existsSync(extractedVerFile)) {
        const vd = JSON.parse(fs.readFileSync(extractedVerFile, 'utf-8'));
        if (vd.version) newVersion = vd.version;
      } else if (fs.existsSync(extractedPkgFile)) {
        const pd = JSON.parse(fs.readFileSync(extractedPkgFile, 'utf-8'));
        if (pd.version) newVersion = pd.version;
      }
    } catch (_) {}

    // 5. Recursive replace files, strictly preserving data/ and NEVER touching .lua files
    function copyRecursive(src: string, dest: string) {
      const items = fs.readdirSync(src);
      for (const item of items) {
        if (item === 'node_modules' || item === 'data' || item === '.next' || item === '.git' || item.endsWith('.lua')) {
          continue; // Strict protection of user data and .lua files!
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

    // 6. Ensure version files in targetDir reflect the new version
    try {
      const targetVer = path.join(targetDir, 'version.json');
      fs.writeFileSync(targetVer, JSON.stringify({
        version: newVersion,
        downloadUrl: repoZipUrl,
        changelog: 'Auto Caps Style updates and improvements!'
      }, null, 2), 'utf-8');

      const targetPkg = path.join(targetDir, 'package.json');
      if (fs.existsSync(targetPkg)) {
        const pd = JSON.parse(fs.readFileSync(targetPkg, 'utf-8'));
        pd.version = newVersion;
        fs.writeFileSync(targetPkg, JSON.stringify(pd, null, 2), 'utf-8');
      }
    } catch (_) {}

    // 7. Recompile production build in targetDir
    try {
      const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      await execPromise(`"${npmCmd}" run build`, { cwd: targetDir, timeout: 180000 });
    } catch (buildErr: any) {
      console.warn('Post-update build notice:', buildErr?.message || buildErr);
    }

    // 8. Cleanup temp files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'Update installed successfully!',
      newVersion
    });
  } catch (err: any) {
    try {
      if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (_) {}
    console.error('Apply update failed:', err);
    return NextResponse.json({ success: false, error: String(err?.message || err) }, { status: 500 });
  }
}
