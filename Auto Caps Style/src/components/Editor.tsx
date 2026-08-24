'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Player } from '@remotion/player';
import type { PlayerRef } from '@remotion/player';
import { useProjectStore } from '@/store/useProjectStore';
import { CaptionComposition } from '@/remotion/CaptionComposition';
import { parseSrt } from '@/lib/srtParser';
import { StylePanel, CustomCheckbox } from './StylePanel';
import { PromoBanner } from './PromoBanner';
import { Undo, Redo, Wand2, Repeat, RefreshCcw, Edit2, Check, X, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, AlertTriangle, BookOpen, Eraser } from 'lucide-react';

export const Editor: React.FC = () => {
  const { videoUrl, captions, styleConfig, fps, videoDuration, undo, redo, pastCaptions, futureCaptions, individualStylingEnabled, selectedCaptionId, isCaptionOutOfBounds, hasHydrated, projectName } = useProjectStore();
  const setVideoData = useProjectStore((state) => state.setVideoData);
  const setProjectName = useProjectStore((state) => state.setProjectName);
  const setCaptions = useProjectStore((state) => state.setCaptions);
  const updateCaptionSegment = useProjectStore((state) => state.updateCaptionSegment);
  const setIndividualStylingEnabled = useProjectStore((state) => state.setIndividualStylingEnabled);
  const setSelectedCaptionId = useProjectStore((state) => state.setSelectedCaptionId);
  const setStyleConfig = useProjectStore((state) => state.setStyleConfig);
  const customPresets = useProjectStore((state) => state.customPresets);
  const customColors = useProjectStore((state) => state.customColors);

  const highlightSimilar = useProjectStore((state) => state.highlightSimilar);
  const setHighlightSimilar = useProjectStore((state) => state.setHighlightSimilar);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [editingCaptionText, setEditingCaptionText] = useState('');
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isMemoryBoxOpen, setIsMemoryBoxOpen] = useState(false);

  // Stable ref for captions — used inside callbacks to avoid stale closures
  // without putting `captions` in dependency arrays (which would cause re-render loops).
  const captionsRef = useRef(captions);
  useEffect(() => { captionsRef.current = captions; }, [captions]);

  // Stable ref for the render poll interval — lets us clear it on unmount.
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const [mounted, setMounted] = useState(false);
  const [storageWarning, setStorageWarning] = useState<{ show: boolean; sizeGB: number }>({ show: false, sizeGB: 0 });

  useEffect(() => {
    setMounted(true);
    fetch('/api/storage')
      .then(res => res.json())
      .then(data => {
        if (data.sizeGB > 10) {
          setStorageWarning({ show: true, sizeGB: data.sizeGB });
        }
      })
      .catch(err => console.error('Failed to fetch storage size:', err));
  }, []);

  const toggleHighlight = (captionId: string, word: string, wordIndex: number) => {
    const caption = captions.find(c => c.id === captionId);
    if (!caption) return;
    
    // Clean punctuation for matching but store the clean version
    const cleanWord = word.replace(/[.,!?;:"'(){}[\]\-।॥]/g, '').toLowerCase().trim();
    
    if (highlightSimilar) {
      let isCurrentlyHighlighted = false;
      const currentIndices = caption.highlightedIndices;
      if (currentIndices) {
        isCurrentlyHighlighted = currentIndices.includes(wordIndex);
      } else {
        isCurrentlyHighlighted = caption.highlightedWords.some(hw => hw.toLowerCase() === cleanWord);
      }

      const newCaptions = captions.map(cap => {
        let capCurrentIndices = cap.highlightedIndices;
        if (!capCurrentIndices) {
          capCurrentIndices = [];
          const wordsArr = cap.text.split(' ');
          wordsArr.forEach((w, i) => {
            const cw = w.replace(/[.,!?;:"'(){}[\]\-।॥]/g, '').toLowerCase().trim();
            if (cap.highlightedWords.some(hw => hw.toLowerCase() === cw)) {
              capCurrentIndices!.push(i);
            }
          });
        }
        
        let newHighlights = [...cap.highlightedWords];
        let newHighlightIndices = [...capCurrentIndices];

        if (isCurrentlyHighlighted) {
          newHighlights = newHighlights.filter(w => w.toLowerCase() !== cleanWord);
          const wordsArr = cap.text.split(' ');
          wordsArr.forEach((w, i) => {
            if (w.replace(/[.,!?;:"'(){}[\]\-।॥]/g, '').toLowerCase().trim() === cleanWord) {
              newHighlightIndices = newHighlightIndices.filter(idx => idx !== i);
            }
          });
        } else {
          newHighlights.push(cleanWord);
          const wordsArr = cap.text.split(' ');
          wordsArr.forEach((w, i) => {
            if (w.replace(/[.,!?;:"'(){}[\]\-।॥]/g, '').toLowerCase().trim() === cleanWord && !newHighlightIndices.includes(i)) {
              newHighlightIndices.push(i);
            }
          });
        }
        
        return { ...cap, highlightedWords: newHighlights, highlightedIndices: newHighlightIndices };
      });
      
      setCaptions(newCaptions);
    } else {
      // Normalize indices if they don't exist
      let currentIndices = caption.highlightedIndices;
      if (!currentIndices) {
        currentIndices = [];
        const wordsArr = caption.text.split(' ');
        wordsArr.forEach((w, i) => {
          const cw = w.replace(/[.,!?;:"'(){}[\]\-।॥]/g, '').toLowerCase().trim();
          if (caption.highlightedWords.some(hw => hw.toLowerCase() === cw)) {
            currentIndices!.push(i);
          }
        });
      }

      let newHighlights = [...caption.highlightedWords];
      let newHighlightIndices = [...currentIndices];
      
      if (newHighlightIndices.includes(wordIndex)) {
        newHighlightIndices = newHighlightIndices.filter(idx => idx !== wordIndex);
        // Optional: remove from newHighlights if no more indices of this word exist
        const wordsArr = caption.text.split(' ');
        const hasMoreOfThisWord = newHighlightIndices.some(idx => wordsArr[idx].replace(/[.,!?;:"'(){}[\]\-।॥]/g, '').toLowerCase().trim() === cleanWord);
        if (!hasMoreOfThisWord) {
          newHighlights = newHighlights.filter(w => w.toLowerCase() !== cleanWord);
        }
      } else {
        newHighlightIndices.push(wordIndex);
        if (!newHighlights.some(w => w.toLowerCase() === cleanWord)) {
          newHighlights.push(cleanWord);
        }
      }
      
      updateCaptionSegment(captionId, { highlightedWords: newHighlights, highlightedIndices: newHighlightIndices });
    }
  };

  const autoHighlightAll = () => {
    const newCaptions = captions.map(cap => {
      const words = cap.text.split(' ').filter(w => w.trim().length > 0);
      if (words.length === 0) return cap;

      let bestWord = words[0];
      let maxScore = -100;

      words.forEach((w, index) => {
        let score = w.length; 
        
        if (index === words.length - 1) score += 3; // Punchline bonus
        if (index === 0) score += 1; // Start word bonus
        
        if (w.match(/[A-Z]/)) {
          if (w === w.toUpperCase()) {
            score += 5; // All caps bonus
          } else {
            score += 2; // Title case bonus
          }
        }
        
        if (w.length <= 2) score -= 10; // Penalize stop words strongly
        if (w.length >= 7) score += 2; // Reward long descriptive words

        if (score > maxScore) {
          maxScore = score;
          bestWord = w;
        }
      });
      
      const cleanImportant = bestWord.replace(/[.,!?;:"'(){}[\]\-।॥]/g, '').toLowerCase().trim();
      let bestIndex = -1;
      words.forEach((w, i) => {
        if (w === bestWord && bestIndex === -1) {
          bestIndex = i;
        }
      });
      return { 
        ...cap, 
        highlightedWords: cleanImportant ? [cleanImportant] : [],
        highlightedIndices: bestIndex !== -1 ? [bestIndex] : [],
        originalHighlightedWords: cleanImportant ? [cleanImportant] : [],
        originalHighlightedIndices: bestIndex !== -1 ? [bestIndex] : []
      };
    });
    setCaptions(newCaptions);
  };

  // loadFromTimeline reads captions via captionsRef to avoid stale-closure re-render loops.
  // It is intentionally NOT dependent on `captions` so the autoLoad useEffect below
  // only fires once (on hydration) and not every time captions change.
  const loadFromTimeline = useCallback((forceReload = false) => {
    fetch('/auto.srt?t=' + Date.now()) // cache bust
      .then(res => res.text())
      .then(text => {
        if (text && text.trim().length > 0) {
           const parsed = parseSrt(text);
           if (parsed && parsed.length > 0) {
             const currentCaptions = captionsRef.current;
             // If user already has saved customizations in history and this is not a forced reload, preserve them!
             if (!forceReload && currentCaptions && currentCaptions.length > 0) {
               window.history.replaceState({}, '', window.location.pathname);
               return;
             }
             
             const merged = parsed.map(newCap => {
               const oldCap = currentCaptions ? currentCaptions.find(c =>
                 c.id === newCap.id || Math.abs(c.startTime - newCap.startTime) < 1000
               ) : undefined;
               if (oldCap) {
                 return {
                   ...newCap,
                   highlightedWords: oldCap.highlightedWords || [],
                   highlightedIndices: oldCap.highlightedIndices || [],
                   customStyle: oldCap.customStyle
                 };
               }
               return newCap;
             });
             setCaptions(merged);
             window.history.replaceState({}, '', window.location.pathname);
           }
        }
      })
      .catch(err => console.error(err));
  }, [setCaptions]);

  useEffect(() => {
    if (!hasHydrated) return; // Wait for store to load from localStorage first!
    
    const urlParams = new URLSearchParams(window.location.search);
    const isForceReload = urlParams.get('forceReload') === 'true';
    const fpsParam = urlParams.get('fps');
    const projParam = urlParams.get('projectName');
    if (projParam) {
      setProjectName(projParam);
    }
    if (fpsParam) {
      setVideoData(videoUrl || '', videoDuration || 0, parseFloat(fpsParam));
    }
    
    // Only fetch fresh if captions are completely empty or user requested force reload
    if (captions.length === 0 || isForceReload) {
      loadFromTimeline(isForceReload);
    }
  }, [hasHydrated, setVideoData, setProjectName, videoUrl, videoDuration, captions.length, loadFromTimeline]);

  const maxCanvasTime = captions.length > 0 ? captions[captions.length - 1].endTime : 0;
  
  let durationInFrames = 300; // Default 10 seconds
  if (videoDuration > 0) {
    durationInFrames = Math.max(1, Math.round((Math.max(videoDuration, maxCanvasTime) / 1000) * fps));
  } else if (maxCanvasTime > 0) {
    durationInFrames = Math.max(1, Math.round((maxCanvasTime / 1000) * fps));
  }

  // Helper to load video metadata
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.src = videoUrl;
      videoRef.current.onloadedmetadata = () => {
        // Update duration in store (in ms)
        setVideoData(videoUrl, videoRef.current!.duration * 1000, fps);
      };
    }
  }, [videoUrl, fps, setVideoData]);

  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{type: 'reload' | 'auto', open: boolean}>({ type: 'reload', open: false });

  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    let animationFrameId: number;
    const updateActiveCaption = () => {
      if (playerRef.current && captions.length > 0) {
        const frame = playerRef.current.getCurrentFrame();
        const timeMs = (frame / fps) * 1000;
        
        captions.forEach(cap => {
          const el = document.getElementById(`caption-item-${cap.id}`);
          if (el) {
            const isActive = timeMs >= cap.startTime && timeMs <= cap.endTime;
            if (isActive) {
              el.style.borderColor = '#6366f1'; 
              el.style.backgroundColor = 'rgba(49, 46, 129, 0.4)';
              el.style.boxShadow = '0 0 10px rgba(99,102,241,0.2)';
            } else {
              el.style.borderColor = '';
              el.style.backgroundColor = '';
              el.style.boxShadow = '';
            }
          }
        });
      }
      animationFrameId = requestAnimationFrame(updateActiveCaption);
    };
    updateActiveCaption();
    return () => cancelAnimationFrame(animationFrameId);
  }, [captions, fps]);

  useEffect(() => {
    setTimeout(() => setIsClient(true), 0);
  }, []);

  
  // Server-Side Disk Auto-Save
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadDone = useRef<boolean>(false);

  // 1. Initial State Load from Server-Side Disk File
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const res = await fetch('/api/project-state?t=' + Date.now());
        if (res.ok) {
          const json = await res.json();
          if (json.exists && json.data) {
            if (json.data.styleConfig) {
              setStyleConfig(json.data.styleConfig);
            }
            if (Array.isArray(json.data.captions) && json.data.captions.length > 0) {
              setCaptions(json.data.captions);
            }
            isInitialLoadDone.current = true;
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load server state:', err);
      } finally {
        isInitialLoadDone.current = true;
        if (captions.length === 0) {
          loadFromTimeline(false);
        }
      }
    };

    loadSavedState();
  }, []);

  // 2. Debounced Auto-Save to Disk whenever State Changes
  useEffect(() => {
    if (!isInitialLoadDone.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch('/api/project-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            styleConfig,
            captions,
            customPresets,
            customColors,
            projectName,
            updatedAt: Date.now()
          })
        });
      } catch (err) {
        console.error('Auto-save error:', err);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [styleConfig, captions, customPresets, customColors, projectName]);

  const handleOpenFolder = async () => {
    try {
      await fetch('/api/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName }),
      });
    } catch (err) {
      console.error('Failed to open folder:', err);
    }
  };

  const handleRender = async () => {
    if (captions.length === 0) return;
    setIsRendering(true);
    setRenderProgress(0);
    setDownloadUrl(null);
    playerRef.current?.pause();

    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputProps: {
            videoUrl,
            captions,
            styleConfig,
            fps
          },
          projectName: projectName || "Auto Cap's Style"
        })
      });
      const data = await res.json();
      if (data.jobId) {
        pollStatus(data.jobId);
      } else {
        console.error('Render API Error:', data.error);
        alert('Render failed to start: ' + (data.error || 'Unknown error'));
        setIsRendering(false);
      }
    } catch (err) {
      console.error(err);
      alert('Network error while starting render');
      setIsRendering(false);
    }
  };

  const pollStatus = (jobId: string) => {
    // Clear any existing poll before starting a new one
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/render?jobId=${jobId}`);
        const data = await res.json();
        if (data.status === 'processing') {
          setRenderProgress(data.progress);
        } else if (data.status === 'done') {
          setRenderProgress(100);
          setDownloadUrl(data.url);
          setIsRendering(false);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          window.location.hash = `importMediaPool=${data.url}`;
        } else if (data.status === 'failed') {
          setIsRendering(false);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          alert('Render failed: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 2000);
  };

  // Clean up the poll interval when the component unmounts
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden bg-[#141416] text-[#e5e7eb] p-3 lg:p-4 gap-3 lg:gap-4 relative font-sans">
      {/* Invisible video element to grab metadata */}
      <video ref={videoRef} className="hidden" />

      {/* Left Sidebar: Captions, Render */}
      {isLeftPanelOpen && (
        <div className="w-full lg:w-[300px] xl:w-[380px] 2xl:w-[450px] flex-shrink-0 bg-[#18181c] border border-[#2b2b34] flex flex-col rounded-2xl relative z-10 lg:h-full shadow-2xl transition-all duration-200">
          {/* Watermark and Toggle */}
          <div className="px-4 py-3 flex justify-between items-center flex-shrink-0 border-b border-[#2b2b34]/80">
            <div className="flex flex-col">
              <h1 className="text-white text-xs font-extrabold tracking-[0.18em] font-sans select-none uppercase flex items-center gap-1.5">
                <span className="text-blue-500">Auto Cap&apos;s</span> Style
              </h1>
              <span className="text-[10px] font-semibold text-blue-400/90 tracking-wider">
                Alok Video Editor
              </span>
            </div>
            <button onClick={() => setIsLeftPanelOpen(false)} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-[#282830]" title="Close Panel">
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

        {/* Caption List */}
        <div className="flex-1 p-3.5 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-white tracking-wide">Captions</h2>
            <div className="flex gap-1.5 items-center">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMemoryBoxOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#282832] hover:bg-[#343440] border border-[#383844] rounded-lg text-xs font-semibold text-gray-200 transition"
                title="View Memory Box (Highlighted Text)"
              >
                <BookOpen className="w-3 h-3 text-blue-400" /> Memory Box
              </button>

              <button 
                onClick={undo}
                disabled={pastCaptions.length === 0}
                className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-[#282830]"
                title="Undo"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={redo}
                disabled={futureCaptions.length === 0}
                className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-[#282830]"
                title="Redo"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mb-3">
            <div className="bg-[#212126] hover:bg-[#282830] p-2.5 rounded-xl border border-[#2e2e38] transition">
              <CustomCheckbox
                checked={highlightSimilar}
                onChange={setHighlightSimilar}
                label="Select similar words automatically"
              />
            </div>

            <div className="flex justify-between items-center bg-[#212126] p-2.5 rounded-xl border border-[#2e2e38]">
              <span className="text-xs font-semibold text-gray-300">Individual Styles</span>
              <button 
                onClick={() => {
                  setIndividualStylingEnabled(!individualStylingEnabled);
                  if (individualStylingEnabled) setSelectedCaptionId(null);
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${individualStylingEnabled ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${individualStylingEnabled ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <button
              onClick={() => setConfirmAction({ type: 'reload', open: true })}
              className="mt-1 w-full flex items-center justify-center gap-2 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 py-2 rounded-xl border border-blue-500/30 transition text-xs font-semibold"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Re-Analyze Timeline Caption
            </button>
          </div>
          
          <div className="space-y-2">
            {captions.map((cap) => {
              const isSelected = individualStylingEnabled && selectedCaptionId === cap.id;
              const hasCustomStyle = !!cap.customStyle && Object.keys(cap.customStyle).length > 0;
              
              return (
              <div 
                id={`caption-item-${cap.id}`}
                key={cap.id} 
                onClick={() => {
                  if (individualStylingEnabled) {
                    setSelectedCaptionId(cap.id);
                  }
                  if (playerRef.current) {
                    const midTime = cap.startTime + (cap.endTime - cap.startTime) / 2;
                    const frameToSeek = Math.round((midTime / 1000) * fps);
                    playerRef.current.seekTo(frameToSeek);
                  }
                }}
                className={`p-3 rounded-xl border transition-all ${
                  isSelected 
                    ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-950/50 cursor-default' 
                    : individualStylingEnabled 
                      ? 'bg-[#212126] border-[#2e2e38] hover:border-blue-500/50 cursor-pointer'
                      : 'bg-[#212126] border-[#2e2e38] hover:border-gray-600 cursor-pointer'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="text-[11px] text-blue-400 font-mono flex items-center gap-2">
                    {cap.startTime}ms - {cap.endTime}ms
                    {editingCaptionId !== cap.id && (
                      <div className="flex gap-1.5 items-center">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            updateCaptionSegment(cap.id, { highlightedWords: [], highlightedIndices: [] });
                          }}
                          className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 text-[9px] font-medium flex items-center gap-1 bg-[#18181c] px-1.5 py-0.5 rounded border border-[#2b2b34] transition-colors"
                          title="Remove all highlights in this caption"
                        >
                          <Eraser className="w-2.5 h-2.5" /> Clear
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditingCaptionId(cap.id); 
                            setEditingCaptionText(cap.text); 
                          }}
                          className="text-gray-500 hover:text-white transition-colors p-0.5"
                          title="Edit text"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {hasCustomStyle && (
                    <span className="text-[9px] bg-blue-600 px-1.5 py-0.5 rounded text-white font-bold tracking-wider">STYLED</span>
                  )}
                </div>
                
                {editingCaptionId === cap.id ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <textarea 
                      value={editingCaptionText}
                      onChange={(e) => setEditingCaptionText(e.target.value)}
                      className="w-full bg-[#141416] text-white text-xs p-2.5 rounded-lg border border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingCaptionId(null); }}
                        className="px-2.5 py-1 bg-[#282830] hover:bg-[#34343d] flex items-center gap-1 text-xs rounded-lg text-gray-300"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          updateCaptionSegment(cap.id, { text: editingCaptionText });
                          setEditingCaptionId(null); 
                        }}
                        className="px-2.5 py-1 bg-green-600 hover:bg-green-500 flex items-center gap-1 text-xs rounded-lg text-white font-bold"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-200 leading-relaxed flex flex-wrap gap-1 mt-1.5">
                    {cap.text.replace(/\n/g, ' \n ').split(' ').filter(w => w !== '').map((word, i) => {
                    if (word === '\n') {
                      return <div key={`br-${i}`} className="basis-full h-0 m-0 p-0" />;
                    }
                    const cleanWord = word.replace(/[.,!?;:"'(){}[\]\-।॥]/g, '').toLowerCase().trim();
                    const isHighlighted = cap.highlightedIndices 
                      ? cap.highlightedIndices.includes(i)
                      : cap.highlightedWords.some(w => w.toLowerCase() === cleanWord);
                    return (
                      <span
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent selecting the block if clicking a word
                          toggleHighlight(cap.id, word, i);
                        }}
                        className={`cursor-pointer px-1.5 py-0.5 rounded-md transition-colors ${
                          isHighlighted 
                            ? 'bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/40' 
                            : 'hover:bg-[#282830]'
                        }`}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
                )}
              </div>
              );
            })}
            {captions.length === 0 && (
              <div className="text-xs text-gray-500 text-center py-8">
                Upload an SRT file to see captions here.
              </div>
            )}
          </div>
        </div>

        <div className="p-3.5 border-t border-[#2b2b34] space-y-2">
          <button 
            onClick={handleRender}
            disabled={captions.length === 0 || isRendering}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider"
          >
            {isRendering ? `Rendering... ${renderProgress}%` : 'Render Final Video'}
          </button>
          
          <button 
            onClick={handleOpenFolder}
            className="w-full bg-[#282832] hover:bg-[#343440] text-gray-200 border border-[#383844] font-semibold py-2 px-4 rounded-xl transition text-xs"
          >
            Open Renders Folder
          </button>

          <PromoBanner className="mt-2" dismissible={false} />

          {downloadUrl && (
            <a
              href={downloadUrl}
              download="Auto-Caps-Style-render.mov"
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition text-xs"
            >
              Download .MOV (ProRes)
            </a>
          )}
        </div>
        </div>
      )}

      {/* Main Preview Area */}
      <div className="flex-1 min-w-0 w-full h-full bg-[#18181c] flex flex-col items-center justify-center p-3 lg:p-6 border border-[#2b2b34] rounded-2xl relative shadow-2xl overflow-hidden">
        {!isLeftPanelOpen && (
          <button onClick={() => setIsLeftPanelOpen(true)} className="absolute top-4 left-4 z-20 text-gray-400 hover:text-white bg-[#212126] p-2 rounded-xl border border-[#2e2e38] shadow-lg transition" title="Open Captions Panel">
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}
        {!isRightPanelOpen && (
          <button onClick={() => setIsRightPanelOpen(true)} className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white bg-[#212126] p-2 rounded-xl border border-[#2e2e38] shadow-lg transition" title="Open Design Panel">
            <PanelRightOpen className="w-4 h-4" />
          </button>
        )}

        {(videoUrl || captions.length > 0) ? (
          isClient && (
            <div className="flex flex-col items-center w-full h-full justify-center relative">
              {isCaptionOutOfBounds && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600/90 backdrop-blur text-white px-4 py-2 rounded-xl shadow-xl font-bold flex items-center gap-2 z-50 pointer-events-none border border-red-400 text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Caption was Out of Canvas</span>
                </div>
              )}
              <Player
                ref={playerRef}
                renderLoading={() => (
                  <div style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 1, backgroundColor: 'black', opacity: 1 }} />
                  </div>
                )}
                component={CaptionComposition}
                inputProps={{
                  videoUrl,
                  captions,
                  styleConfig,
                }}
                durationInFrames={durationInFrames}
                compositionWidth={styleConfig.aspectRatio === '16:9' ? 1920 : 1080}
                compositionHeight={styleConfig.aspectRatio === '16:9' ? 1080 : 1920}
                fps={fps}
                controls={!isRendering}
                clickToPlay={!isRendering}
                loop={isLooping}
                autoPlay
                acknowledgeRemotionLicense={true}
                style={styleConfig.aspectRatio === '16:9' ? {
                  width: '100%',
                  maxWidth: 'min(100%, calc((100vh - 180px) * 16 / 9))',
                  maxHeight: 'calc(100% - 65px)',
                  aspectRatio: '16 / 9',
                  boxShadow: '0 0 45px rgba(0,0,0,0.95)',
                  border: '2px solid #24242e',
                  borderRadius: '14px',
                  overflow: 'hidden',
                } : {
                  height: '100%',
                  maxHeight: 'calc(100% - 65px)',
                  maxWidth: 'min(100%, calc((100vh - 180px) * 9 / 16))',
                  aspectRatio: '9 / 16',
                  boxShadow: '0 0 45px rgba(0,0,0,0.95)',
                  border: '2px solid #24242e',
                  borderRadius: '14px',
                  overflow: 'hidden',
                }}
              />
              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`mt-4 flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isLooping 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30' 
                    : 'bg-[#212126] border-[#2e2e38] text-gray-400 hover:text-white hover:bg-[#282830]'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                {isLooping ? 'Auto-Loop: ON' : 'Auto-Loop: OFF'}
              </button>
            </div>
          )
        ) : (
          <div className="text-gray-500 text-center text-xs">
            <p>Upload a video or SRT file to see the preview</p>
          </div>
        )}

        {/* Watermark Badge */}
        <div className="absolute bottom-2.5 right-4 z-10 flex items-center gap-1.5 opacity-40 select-none pointer-events-none">
          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            Alok Video Editor
          </span>
        </div>
      </div>

      {/* Right Sidebar: Design & Animations */}
      {isRightPanelOpen && (
        <div className="w-full lg:w-[360px] xl:w-[440px] 2xl:w-[520px] flex-shrink-0 bg-[#18181c] border border-[#2b2b34] lg:overflow-y-auto flex flex-col rounded-2xl p-3 relative transform-gpu lg:h-full shadow-2xl transition-all duration-200">
          <div className="flex justify-end absolute top-3.5 right-3.5 z-20">
            <button onClick={() => setIsRightPanelOpen(false)} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-[#282830]" title="Close Panel">
              <PanelRightClose className="w-4 h-4" />
            </button>
          </div>
          <StylePanel />
        </div>
      )}
      {/* Confirmation Modal */}
      {confirmAction.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c22] border border-[#2e2e38] rounded-2xl p-5 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-base font-bold text-white mb-2">
              {confirmAction.type === 'reload' ? 'Reload Captions?' : 'Auto Highlight?'}
            </h3>
            <p className="text-gray-400 text-xs mb-5 leading-relaxed">
              {confirmAction.type === 'reload' 
                ? 'This will reload text and timing from DaVinci Resolve, while preserving your current custom styles and highlighted words! Proceed?' 
                : 'This will overwrite your currently highlighted words. Are you sure you want to proceed?'}
            </p>
            <div className="flex justify-end gap-2.5">
              <button 
                onClick={() => setConfirmAction({ ...confirmAction, open: false })}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-300 bg-[#282832] hover:bg-[#343440] border border-[#383844] transition"
              >
                No, cancel
              </button>
              <button 
                onClick={() => {
                  if (confirmAction.type === 'reload') {
                    window.location.hash = 'reanalyzeSubtitles=' + Date.now();
                  }
                  if (confirmAction.type === 'auto') autoHighlightAll();
                  setConfirmAction({ ...confirmAction, open: false });
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/20"
              >
                Yes, proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Warning Modal */}
      {storageWarning.show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[#1c1c22] border border-red-500/40 rounded-2xl p-5 shadow-2xl max-w-md w-full mx-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-red-500/20 rounded-xl flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1.5">Storage Warning</h3>
                <p className="text-gray-300 text-xs mb-4 leading-relaxed">
                  Your rendered videos have exceeded <span className="font-bold text-red-400">10 GB</span> of storage 
                  (Currently using <span className="font-bold text-white">{storageWarning.sizeGB.toFixed(2)} GB</span>). 
                  Consider deleting old renders from the <span className="bg-[#141416] px-1.5 py-0.5 rounded text-gray-400 font-mono text-[11px]">public/renders</span> folder.
                </p>
                <div className="flex justify-end">
                  <button 
                    onClick={() => setStorageWarning({ ...storageWarning, show: false })}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-red-600/90 text-white hover:bg-red-500 transition shadow-lg shadow-red-900/20"
                  >
                    I Understand
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right Sidebar: Video Preview, Memory Box, Export */}
      {isMemoryBoxOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={() => setIsMemoryBoxOpen(false)}
        >
          <div 
            className="bg-[#18181c] border border-[#2b2b34] rounded-2xl p-5 shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#2b2b34]/80">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                Memory Box
              </h3>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMemoryBoxOpen(false); }}
                className="text-gray-400 hover:text-white transition bg-[#212126] hover:bg-[#282830] p-1 rounded-lg border border-[#2e2e38]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-gray-400 text-xs mb-3">
              Words and phrases you have highlighted in your video captions.
            </p>

            <div className="flex-1 overflow-y-auto bg-[#141416] rounded-xl p-3.5 border border-[#2b2b34] space-y-4">
              {captions.some(c => c.highlightedWords && c.highlightedWords.length > 0) ? (
                (() => {
                  const allWords = captions.flatMap((c) => {
                    if (c.highlightedIndices && c.highlightedIndices.length > 0) {
                      const wordsArr = c.text.split(' ');
                      return c.highlightedIndices.map(idx => wordsArr[idx] || '').filter(Boolean);
                    } else if (c.highlightedWords && c.highlightedWords.length > 0) {
                      return c.highlightedWords;
                    }
                    return [];
                  });

                  // Deduplicate using clean lowercase version, but keep original for display
                  const uniqueWordsMap = new Map<string, string>();
                  allWords.forEach(word => {
                    const clean = word.replace(/[.,!?;:"'(){}[\]\-।॥]/g, '').toLowerCase().trim();
                    if (clean && !uniqueWordsMap.has(clean)) {
                      uniqueWordsMap.set(clean, word);
                    }
                  });
                  
                  const uniqueWordsList = Array.from(uniqueWordsMap.values());

                  const englishWords: string[] = [];
                  const hindiNepaliWords: string[] = [];
                  const otherWords: string[] = [];

                  uniqueWordsList.forEach(word => {
                    if (/[\u0900-\u097F]/.test(word)) {
                      hindiNepaliWords.push(word);
                    } else if (/[a-zA-Z]/.test(word)) {
                      englishWords.push(word);
                    } else {
                      otherWords.push(word);
                    }
                  });

                  return (
                    <>
                      {englishWords.length > 0 && (
                        <div>
                          <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2 pb-1 border-b border-[#2b2b34]">English</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {englishWords.map((word, index) => (
                              <span key={`en-${word}-${index}`} className="px-2.5 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg text-xs font-semibold">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {hindiNepaliWords.length > 0 && (
                        <div>
                          <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2 pb-1 border-b border-[#2b2b34]">Hindi / Nepali</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {hindiNepaliWords.map((word, index) => (
                              <span key={`hn-${word}-${index}`} className="px-2.5 py-1 bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded-lg text-xs font-semibold">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {otherWords.length > 0 && (
                        <div>
                          <h4 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2 pb-1 border-b border-[#2b2b34]">Numbers / Symbols</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {otherWords.map((word, index) => (
                              <span key={`oth-${word}-${index}`} className="px-2.5 py-1 bg-gray-600/20 border border-gray-500/30 text-gray-300 rounded-lg text-xs font-semibold">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 py-8">
                  <BookOpen className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-xs">Your Memory Box is empty.</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">Highlight words in your captions to collect them.</p>
                </div>
              )}
            </div>
            
            <div className="mt-3.5 flex justify-end">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMemoryBoxOpen(false); }}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rendering Overlay */}
      {isRendering && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-[100] cursor-not-allowed"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="animate-spin rounded-full h-14 w-14 border-t-3 border-b-3 border-blue-500 mb-5"></div>
          <h2 className="text-xl font-bold text-white mb-1.5 tracking-wide">Rendering Video</h2>
          <p className="text-gray-400 text-xs mb-6">Processing frames in DaVinci Resolve format...</p>
          
          <div className="w-64 h-3 bg-[#18181c] rounded-full overflow-hidden border border-[#2b2b34]">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${Math.max(5, renderProgress)}%` }}
            ></div>
          </div>
          <p className="mt-2.5 text-blue-400 font-mono font-bold text-base">{renderProgress}%</p>
        </div>
      )}
    </div>
  );
};

