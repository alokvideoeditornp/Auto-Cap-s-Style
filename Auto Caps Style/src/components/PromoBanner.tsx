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
  // Automatically convert GitHub blob / raw view URLs to direct CDN URLs
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
        // Silently fail if offline or repo is empty
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
    if (adConfig.link) {
      e.preventDefault();
      window.open(adConfig.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`relative group overflow-hidden rounded-xl border border-[#2b2b36] bg-[#181820] shadow-lg transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/10 ${className}`}>
      {/* Dismiss Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsDismissed(true);
        }}
        title="Dismiss ad"
        className="absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-gray-300 backdrop-blur-md transition-all hover:bg-black hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Optional Badge */}
      {adConfig.badge && (
        <div className="absolute top-2 left-2 z-10 rounded bg-blue-600/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
          {adConfig.badge}
        </div>
      )}

      {/* Clickable Image */}
      <div 
        onClick={handleClick}
        className="block cursor-pointer overflow-hidden transition-transform duration-300 hover:scale-[1.01]"
      >
        <img
          src={adConfig.imageUrl}
          alt={adConfig.altText || 'Sponsored Promotion'}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-auto object-cover rounded-xl transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0 h-24 bg-[#21212a] animate-pulse'}`}
        />
        
        {/* Subtle hover overlay hint */}
        {adConfig.link && (
          <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-[10px] font-medium text-white opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100">
            <span>Open</span>
            <ExternalLink className="h-3 w-3" />
          </div>
        )}
      </div>
    </div>
  );
};
