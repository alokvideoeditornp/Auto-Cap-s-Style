'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, ExternalLink, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface SingleAd {
  enabled?: boolean | number | string;
  imageUrl?: string;
  videoUrl?: string;
  type?: 'image' | 'video';
  link?: string;
  altText?: string;
  badge?: string;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
}

interface AdConfig {
  enabled: boolean | number | string;
  imageUrl?: string;
  videoUrl?: string;
  type?: 'image' | 'video';
  link?: string;
  altText?: string;
  badge?: string;
  ads?: SingleAd[];
}

const PRIMARY_AD_URL = 'https://raw.githubusercontent.com/alokvideoeditornp/Auto-cap-s-Style-ad/main/ad.json';
const FALLBACK_AD_URL = 'https://raw.githubusercontent.com/alokvideoeditornp/Auto-cap-s-Style-ad/master/ad.json';
const CACHE_KEY = 'autocapstyle_cached_ads_v1';

// Default offline ad that displays if user has never connected to internet
const DEFAULT_OFFLINE_ADS: SingleAd[] = [
  {
    enabled: 1,
    badge: "FEATURED",
    altText: "Auto File Organizer Pro",
    imageUrl: "https://raw.githubusercontent.com/alokvideoeditornp/Auto-cap-s-Style-ad/main/Images/ad_Auto%20File%20Organizer%20Pro.png",
    link: "https://payhip.com/b/HbZKp",
    fallbackTitle: "Auto File Organizer Pro",
    fallbackSubtitle: "Automate and organize your DaVinci Resolve media in 1-Click"
  }
];

const resolveDirectMediaUrl = (url?: string): string => {
  if (!url) return '';
  let clean = url.trim();

  // If it's a relative path like "Images/ad.png" or "Videos/ad.webm" or "ad.gif"
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

const isVideoSource = (ad: SingleAd): boolean => {
  if (ad.type === 'video') return true;
  if (ad.videoUrl && ad.videoUrl.trim().length > 0) return true;
  const src = (ad.videoUrl || ad.imageUrl || '').toLowerCase();
  return src.endsWith('.webm') || src.endsWith('.mp4') || src.endsWith('.mov') || src.endsWith('.m4v') || src.includes('.webm?') || src.includes('.mp4?');
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
  const [adList, setAdList] = useState<SingleAd[]>(DEFAULT_OFFLINE_ADS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaErrorMap, setMediaErrorMap] = useState<{ [key: number]: boolean }>({});
  const [loadedMedia, setLoadedMedia] = useState<{ [key: number]: boolean }>({});
  const isOpeningRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    // 1. Load cached ads immediately for instant offline rendering
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAdList(parsed);
        }
      }
    } catch (_) {}

    // 2. Fetch fresh ads from GitHub
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
              .filter((ad: any) => isItemEnabled(ad.enabled) && (ad.imageUrl || ad.videoUrl))
              .map((ad: any) => ({
                ...ad,
                imageUrl: ad.imageUrl ? resolveDirectMediaUrl(ad.imageUrl) : undefined,
                videoUrl: ad.videoUrl ? resolveDirectMediaUrl(ad.videoUrl) : undefined
              }));
          } else if ((data.imageUrl || data.videoUrl) && isItemEnabled(data.enabled)) {
            list = [{
              imageUrl: data.imageUrl ? resolveDirectMediaUrl(data.imageUrl) : undefined,
              videoUrl: data.videoUrl ? resolveDirectMediaUrl(data.videoUrl) : undefined,
              type: data.type,
              link: data.link,
              altText: data.altText,
              badge: data.badge
            }];
          }

          if (list.length > 0 && isMounted) {
            setAdList(list);
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(list));
            } catch (_) {}
          }
        }
      } catch (err) {
        // Offline mode: Keep existing cached ads or DEFAULT_OFFLINE_ADS
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
  const hasError = mediaErrorMap[currentIndex];
  const isVideo = isVideoSource(currentAd) && !hasError;
  const mediaUrl = isVideo ? (currentAd.videoUrl || currentAd.imageUrl || '') : (currentAd.imageUrl || currentAd.videoUrl || '');

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

      {/* Clickable Media Banner (WebM Video, Image, or Offline Fallback Card) */}
      <div 
        onClick={(e) => handleOpenLink(e, currentAd.link)}
        className="relative block cursor-pointer overflow-hidden rounded-lg transition-transform duration-300 hover:scale-[1.01] bg-[#121216]"
      >
        {hasError ? (
          /* Offline styled visual card if image file is unreachable */
          <div className="w-full min-h-[90px] p-3 rounded-lg bg-gradient-to-r from-blue-950/70 via-[#181822] to-purple-950/70 border border-blue-500/20 flex flex-col justify-center gap-1">
            <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{currentAd.fallbackTitle || currentAd.altText || "Auto File Organizer Pro"}</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">
              {currentAd.fallbackSubtitle || "Automate and organize your DaVinci Resolve media in 1-Click."}
            </p>
          </div>
        ) : isVideo ? (
          <video
            key={mediaUrl}
            src={mediaUrl}
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            onError={() => {
              setMediaErrorMap(prev => ({ ...prev, [currentIndex]: true }));
            }}
            onLoadedMetadata={(e) => {
              e.currentTarget.muted = true;
              e.currentTarget.play().catch(() => {});
              setLoadedMedia(prev => ({ ...prev, [currentIndex]: true }));
            }}
            onCanPlay={(e) => {
              e.currentTarget.muted = true;
              e.currentTarget.play().catch(() => {});
              setLoadedMedia(prev => ({ ...prev, [currentIndex]: true }));
            }}
            className="w-full h-auto max-h-[140px] object-cover rounded-lg transition-opacity duration-300"
          />
        ) : (
          <img
            key={mediaUrl}
            src={mediaUrl}
            alt={currentAd.altText || 'Sponsored Promotion'}
            onError={() => {
              setMediaErrorMap(prev => ({ ...prev, [currentIndex]: true }));
            }}
            onLoad={() => setLoadedMedia(prev => ({ ...prev, [currentIndex]: true }))}
            className="w-full h-auto max-h-[140px] object-cover rounded-lg transition-opacity duration-300"
          />
        )}
        
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
