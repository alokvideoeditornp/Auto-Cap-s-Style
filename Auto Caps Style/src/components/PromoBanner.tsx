'use client';

import React, { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface AdConfig {
  enabled: boolean;
  imageUrl?: string;
  link?: string;
  altText?: string;
  badge?: string;
}

const PRIMARY_AD_URL = 'https://raw.githubusercontent.com/alokvideoeditornp/Auto-cap-s-Style-ad/main/ad.json';
const FALLBACK_AD_URL = 'https://raw.githubusercontent.com/alokvideoeditornp/Auto-cap-s-Style-ad/master/ad.json';

const resolveDirectImageUrl = (url?: string): string => {
  if (!url) return '';
  let clean = url.trim();
  if (clean.includes('github.com') && clean.includes('/blob/')) {
    clean = clean.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  } else if (clean.includes('github.com') && clean.includes('/raw/')) {
    clean = clean.replace('github.com', 'raw.githubusercontent.com').replace('/raw/', '/');
  }
  return clean;
};

export const PromoBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [adConfig, setAdConfig] = useState<AdConfig | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAd = async () => {
      try {
        const timestamp = Date.now();
        let res = await fetch(`${PRIMARY_AD_URL}?t=${timestamp}`, { cache: 'no-store' });
        if (!res.ok) {
          res = await fetch(`${FALLBACK_AD_URL}?t=${timestamp}`, { cache: 'no-store' });
        }
        if (res.ok) {
          const data: AdConfig = await res.json();
          if (isMounted && data && data.enabled && data.imageUrl) {
            setAdConfig({
              ...data,
              imageUrl: resolveDirectImageUrl(data.imageUrl)
            });
          }
        }
      } catch (err) {
        // Silently fail if offline
      }
    };

    fetchAd();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!adConfig || !adConfig.enabled || !adConfig.imageUrl || isDismissed) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!adConfig.link) return;

    const targetUrl = adConfig.link.trim();

    // 1. Call background server API (opens in system default browser)
    fetch('/api/open-external', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: targetUrl })
    }).catch(() => {});

    // 2. Trigger hash navigation for Qt WebEngine listener
    window.location.hash = 'openBrowser=' + encodeURIComponent(targetUrl);

    // 3. Fallback window.open
    try {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch (_) {}
  };

  return (
    <div className={`group overflow-hidden rounded-xl border border-[#2b2b36] bg-[#181820] p-2 shadow-lg transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/10 ${className}`}>
      {/* Top Header Row - Badge and Close Button sitting neatly ABOVE the image */}
      <div className="flex items-center justify-between mb-1.5 px-1">
        {adConfig.badge ? (
          <span className="rounded bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
            {adConfig.badge}
          </span>
        ) : (
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
            Sponsored
          </span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          title="Dismiss ad"
          className="flex h-5 w-5 items-center justify-center rounded-md text-gray-400 hover:bg-[#282834] hover:text-white transition-all"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Clickable Image - 100% Unobstructed & Clean */}
      <div 
        onClick={handleClick}
        className="relative block cursor-pointer overflow-hidden rounded-lg transition-transform duration-300 hover:scale-[1.01]"
      >
        <img
          src={adConfig.imageUrl}
          alt={adConfig.altText || 'Sponsored Promotion'}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-auto object-cover rounded-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0 h-20 bg-[#21212a] animate-pulse'}`}
        />
        
        {/* Hover overlay hint */}
        {adConfig.link && (
          <div 
            onClick={handleClick}
            className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded-md bg-black/80 hover:bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <span>Open</span>
            <ExternalLink className="h-3 w-3" />
          </div>
        )}
      </div>
    </div>
  );
};
