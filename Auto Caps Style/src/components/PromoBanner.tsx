'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

interface SingleAd {
  enabled?: boolean | number | string;
  imageUrl: string;
  link?: string;
  altText?: string;
  badge?: string;
}

interface AdConfig {
  enabled: boolean | number | string;
  imageUrl?: string;
  link?: string;
  altText?: string;
  badge?: string;
  ads?: SingleAd[];
}

const PRIMARY_AD_URL = 'https://raw.githubusercontent.com/alokvideoeditornp/Auto-cap-s-Style-ad/main/ad.json';
const FALLBACK_AD_URL = 'https://raw.githubusercontent.com/alokvideoeditornp/Auto-cap-s-Style-ad/master/ad.json';

const resolveDirectImageUrl = (url?: string): string => {
  if (!url) return '';
  let clean = url.trim();

  // If it's a relative path like "images/ad1.png" or "banner.png"
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = clean.replace(/^\.\//, '').replace(/^\//, '');
    return `https://raw.githubusercontent.com/alokvideoeditornp/Auto-cap-s-Style-ad/main/${clean}`;
  }

  // If it's a GitHub URL
  if (clean.includes('github.com') && clean.includes('/blob/')) {
    clean = clean.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
  } else if (clean.includes('github.com') && clean.includes('/raw/')) {
    clean = clean.replace('github.com', 'raw.githubusercontent.com').replace('/raw/', '/');
  }
  return clean;
};

const isItemEnabled = (val: any): boolean => {
  if (val === undefined || val === null) return true;
  if (val === 1 || val === '1' || val === true || val === 'true') return true;
  if (val === 0 || val === '0' || val === false || val === 'false') return false;
  return Boolean(val);
};

export const PromoBanner: React.FC<{ className?: string; dismissible?: boolean }> = ({ 
  className = '',
  dismissible = false
}) => {
  const [adList, setAdList] = useState<SingleAd[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loadedImages, setLoadedImages] = useState<{ [key: number]: boolean }>({});
  const isOpeningRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAds = async () => {
      try {
        const timestamp = Date.now();
        let res = await fetch(`${PRIMARY_AD_URL}?t=${timestamp}`, { cache: 'no-store' });
        if (!res.ok) {
          res = await fetch(`${FALLBACK_AD_URL}?t=${timestamp}`, { cache: 'no-store' });
        }
        if (res.ok) {
          const data = await res.json();
          if (!isMounted || !data || !isItemEnabled(data.enabled)) return;

          let list: SingleAd[] = [];
          if (Array.isArray(data.ads) && data.ads.length > 0) {
            list = data.ads
              .filter((ad: any) => isItemEnabled(ad.enabled) && !!ad.imageUrl)
              .map((ad: any) => ({
                ...ad,
                imageUrl: resolveDirectImageUrl(ad.imageUrl)
              }));
          } else if (data.imageUrl && isItemEnabled(data.enabled)) {
            list = [{
              imageUrl: resolveDirectImageUrl(data.imageUrl),
              link: data.link,
              altText: data.altText,
              badge: data.badge
            }];
          }

          if (list.length > 0) {
            setAdList(list);
          }
        }
      } catch (err) {
        // Silently fail if offline
      }
    };

    fetchAds();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-rotation timer for multiple ads (changes every 6 seconds)
  useEffect(() => {
    if (adList.length <= 1 || isPaused || (dismissible && isDismissed)) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % adList.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [adList.length, isPaused, dismissible, isDismissed]);

  if (adList.length === 0 || (dismissible && isDismissed)) {
    return null;
  }

  const currentAd = adList[currentIndex] || adList[0];

  const handleOpenLink = async (e: React.MouseEvent, link?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!link || isOpeningRef.current) return;

    isOpeningRef.current = true;
    setTimeout(() => {
      isOpeningRef.current = false;
    }, 1500);

    const targetUrl = link.trim();

    // Single unified API call to open in default browser (Opens exactly 1 tab)
    try {
      await fetch('/api/open-external', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
    } catch (_) {}
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + adList.length) % adList.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % adList.length);
  };

  return (
    <div 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`group overflow-hidden rounded-xl border border-[#2b2b36] bg-[#181820] p-2 shadow-lg transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/10 ${className}`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="flex items-center gap-2">
          {currentAd.badge ? (
            <span className="rounded bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm transition-all">
              {currentAd.badge}
            </span>
          ) : (
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
              Sponsored
            </span>
          )}

          {/* Multiple Ads Indicator Counter */}
          {adList.length > 1 && (
            <span className="text-[9px] font-mono text-gray-500 font-medium">
              {currentIndex + 1}/{adList.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Navigation Arrows if > 1 ad */}
          {adList.length > 1 && (
            <div className="flex items-center gap-0.5 mr-1">
              <button
                onClick={handlePrev}
                title="Previous Ad"
                className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-[#282834] hover:text-white transition"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleNext}
                title="Next Ad"
                className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-[#282834] hover:text-white transition"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Close Button only if dismissible is true */}
          {dismissible && (
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
          )}
        </div>
      </div>

      {/* Clickable Image Banner */}
      <div 
        onClick={(e) => handleOpenLink(e, currentAd.link)}
        className="relative block cursor-pointer overflow-hidden rounded-lg transition-transform duration-300 hover:scale-[1.01]"
      >
        <img
          key={currentAd.imageUrl}
          src={currentAd.imageUrl}
          alt={currentAd.altText || 'Sponsored Promotion'}
          onLoad={() => setLoadedImages(prev => ({ ...prev, [currentIndex]: true }))}
          className={`w-full h-auto object-cover rounded-lg transition-all duration-300 ${loadedImages[currentIndex] ? 'opacity-100' : 'opacity-0 h-20 bg-[#21212a] animate-pulse'}`}
        />
        
        {/* Hover overlay hint */}
        {currentAd.link && (
          <div 
            onClick={(e) => handleOpenLink(e, currentAd.link)}
            className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded-md bg-black/80 hover:bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <span>Open</span>
            <ExternalLink className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Dot Indicators if > 1 ad */}
      {adList.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {adList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                currentIndex === idx 
                  ? 'w-4 bg-blue-500' 
                  : 'w-1.5 bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
