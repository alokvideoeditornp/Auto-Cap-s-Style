import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function parseVersion(v: string): number[] {
  return v
    .replace(/^v/i, '')
    .trim()
    .split('.')
    .map((num) => parseInt(num, 10) || 0);
}

function isNewerVersion(remote: string, local: string): boolean {
  const r = parseVersion(remote);
  const l = parseVersion(local);
  const len = Math.max(r.length, l.length);
  for (let i = 0; i < len; i++) {
    const rVal = r[i] || 0;
    const lVal = l[i] || 0;
    if (rVal > lVal) return true;
    if (rVal < lVal) return false;
  }
  return false;
}

export async function GET() {
  try {
    let currentVersion = '1.0.1';
    
    // Check all local version files
    const localCandidates = [
      path.resolve(process.cwd(), 'version.json'),
      path.resolve(process.cwd(), '..', 'version.json'),
      path.resolve(process.cwd(), 'package.json'),
    ];

    for (const cPath of localCandidates) {
      if (fs.existsSync(cPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(cPath, 'utf-8'));
          if (data.version && isNewerVersion(data.version, currentVersion)) {
            currentVersion = data.version;
          }
        } catch (_) {}
      }
    }

    const timestamp = Date.now();
    const urls = [
      `https://raw.githubusercontent.com/alokvideoeditornp/Auto-Cap-s-Style/main/version.json?t=${timestamp}`,
      `https://raw.githubusercontent.com/alokvideoeditornp/Auto-Cap-s-Style/main/Auto%20Caps%20Style/version.json?t=${timestamp}`,
      `https://raw.githubusercontent.com/alokvideoeditornp/Auto-Cap-s-Style/main/Auto%20Caps%20Style/package.json?t=${timestamp}`,
    ];

    let latestVersion = currentVersion;
    let downloadUrl = 'https://github.com/alokvideoeditornp/Auto-Cap-s-Style/archive/refs/heads/main.zip';
    let changelog = '';

    for (const u of urls) {
      try {
        const res = await fetch(u, {
          cache: 'no-store',
          headers: {
            'User-Agent': 'AutoCapsStyle-Updater',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.version) {
            latestVersion = json.version;
            if (json.downloadUrl) downloadUrl = json.downloadUrl;
            if (json.changelog) changelog = json.changelog;
            break;
          }
        }
      } catch (_) {}
    }

    const hasUpdate = isNewerVersion(latestVersion, currentVersion);

    return NextResponse.json({
      success: true,
      hasUpdate,
      currentVersion,
      latestVersion,
      downloadUrl,
      changelog
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      hasUpdate: false,
      currentVersion: '1.0.1',
      latestVersion: '1.0.1'
    });
  }
}
