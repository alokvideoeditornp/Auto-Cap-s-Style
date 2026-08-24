import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PRIMARY_AD_URL = 'https://raw.githubusercontent.com/alokvideoeditornp/Auto-cap-s-Style-ad/main/ad.json';
const FALLBACK_AD_URL = 'https://raw.githubusercontent.com/alokvideoeditornp/Auto-cap-s-Style-ad/master/ad.json';

const resolveDirectMediaUrl = (url?: string): string => {
  if (!url) return '';
  let clean = url.trim();

  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = clean.replace(/^\.\//, '').replace(/^\//, '');
    clean = `https://raw.githubusercontent.com/alokvideoeditornp/Auto-cap-s-Style-ad/main/${clean}`;
  } else if (clean.includes('github.com') && clean.includes('/blob/')) {
    clean = clean.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  } else if (clean.includes('github.com') && clean.includes('/raw/')) {
    clean = clean.replace('github.com', 'raw.githubusercontent.com').replace('/raw/', '/');
  }

  try {
    return encodeURI(decodeURI(clean));
  } catch (_) {
    return encodeURI(clean);
  }
};

const isItemEnabled = (val: any): boolean => {
  if (val === undefined || val === null) return true;
  if (val === 1 || val === '1' || val === true || val === 'true') return true;
  if (val === 0 || val === '0' || val === false || val === 'false') return false;
  return Boolean(val);
};

const getCacheFileName = (url: string): string => {
  const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 12);
  let ext = path.extname(url.split('?')[0]).toLowerCase();
  if (!ext || ext.length > 5) {
    if (url.includes('.webm')) ext = '.webm';
    else if (url.includes('.mp4')) ext = '.mp4';
    else if (url.includes('.gif')) ext = '.gif';
    else if (url.includes('.webp')) ext = '.webp';
    else ext = '.png';
  }
  return `ad_${hash}${ext}`;
};

export async function GET() {
  const dataDir = path.join(process.cwd(), 'data');
  const cacheDir = path.join(process.cwd(), 'public', 'ads_cache');
  const manifestPath = path.join(dataDir, 'synced_ads.json');

  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  let online = false;
  let rawData: any = null;

  try {
    const timestamp = Date.now();
    let res = await fetch(`${PRIMARY_AD_URL}?t=${timestamp}`, {
      cache: 'no-store',
      headers: { 'User-Agent': 'Auto-Caps-Style-Client/1.0' },
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) {
      res = await fetch(`${FALLBACK_AD_URL}?t=${timestamp}`, {
        cache: 'no-store',
        headers: { 'User-Agent': 'Auto-Caps-Style-Client/1.0' },
        signal: AbortSignal.timeout(4000)
      });
    }

    if (res.ok) {
      rawData = await res.json();
      online = true;
    }
  } catch (_) {
    online = false;
  }

  // ONLINE MODE: Download new assets, purge old assets, and update manifest
  if (online && rawData && isItemEnabled(rawData.enabled)) {
    try {
      let incomingAds: any[] = [];
      if (Array.isArray(rawData.ads) && rawData.ads.length > 0) {
        incomingAds = rawData.ads.filter((ad: any) => isItemEnabled(ad.enabled) && (ad.imageUrl || ad.videoUrl));
      } else if ((rawData.imageUrl || rawData.videoUrl) && isItemEnabled(rawData.enabled)) {
        incomingAds = [{
          imageUrl: rawData.imageUrl,
          videoUrl: rawData.videoUrl,
          type: rawData.type,
          link: rawData.link,
          altText: rawData.altText,
          badge: rawData.badge
        }];
      }

      const activeFileNames = new Set<string>();
      const processedAds: any[] = [];

      for (const ad of incomingAds) {
        const fullImageUrl = ad.imageUrl ? resolveDirectMediaUrl(ad.imageUrl) : undefined;
        const fullVideoUrl = ad.videoUrl ? resolveDirectMediaUrl(ad.videoUrl) : undefined;

        let localImageRel = '';
        let localVideoRel = '';

        // Cache Image
        if (fullImageUrl) {
          const fileName = getCacheFileName(fullImageUrl);
          activeFileNames.add(fileName);
          const localPath = path.join(cacheDir, fileName);
          localImageRel = `/ads_cache/${fileName}`;

          if (!fs.existsSync(localPath)) {
            try {
              const fileRes = await fetch(fullImageUrl, { signal: AbortSignal.timeout(8000) });
              if (fileRes.ok) {
                const arrayBuffer = await fileRes.arrayBuffer();
                fs.writeFileSync(localPath, Buffer.from(arrayBuffer));
              }
            } catch (_) {}
          }
        }

        // Cache Video
        if (fullVideoUrl) {
          const fileName = getCacheFileName(fullVideoUrl);
          activeFileNames.add(fileName);
          const localPath = path.join(cacheDir, fileName);
          localVideoRel = `/ads_cache/${fileName}`;

          if (!fs.existsSync(localPath)) {
            try {
              const fileRes = await fetch(fullVideoUrl, { signal: AbortSignal.timeout(12000) });
              if (fileRes.ok) {
                const arrayBuffer = await fileRes.arrayBuffer();
                fs.writeFileSync(localPath, Buffer.from(arrayBuffer));
              }
            } catch (_) {}
          }
        }

        processedAds.push({
          ...ad,
          imageUrl: fullImageUrl,
          videoUrl: fullVideoUrl,
          localImageUrl: localImageRel || fullImageUrl,
          localVideoUrl: localVideoRel || fullVideoUrl
        });
      }

      // PURGE: Remove any old cached files no longer in active ads!
      if (fs.existsSync(cacheDir)) {
        const existingFiles = fs.readdirSync(cacheDir);
        for (const file of existingFiles) {
          if (!activeFileNames.has(file)) {
            try {
              fs.unlinkSync(path.join(cacheDir, file));
            } catch (_) {}
          }
        }
      }

      // Save manifest to disk for offline access
      fs.writeFileSync(manifestPath, JSON.stringify(processedAds, null, 2), 'utf-8');

      return NextResponse.json({
        success: true,
        online: true,
        ads: processedAds
      });
    } catch (err) {
      console.error('[Ads-Sync] Error caching ads:', err);
    }
  }

  // OFFLINE MODE: Load from disk manifest
  if (fs.existsSync(manifestPath)) {
    try {
      const cachedData = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      if (Array.isArray(cachedData) && cachedData.length > 0) {
        return NextResponse.json({
          success: true,
          online: false,
          ads: cachedData
        });
      }
    } catch (_) {}
  }

  return NextResponse.json({
    success: true,
    online: false,
    ads: []
  });
}
