'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Player } from '@remotion/player';
import type { PlayerRef } from '@remotion/player';
import { useProjectStore } from '@/store/useProjectStore';
import { CaptionComposition } from '@/remotion/CaptionComposition';
import { parseSrt } from '@/lib/srtParser';
import { StylePanel } from './StylePanel';
import { Undo, Redo, Wand2, Repeat, RefreshCcw, Edit2, Check, X, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, AlertTriangle, BookOpen, Eraser } from 'lucide-react';

export const Editor: React.FC = () => {
  const { videoUrl, captions, styleConfig, fps, videoDuration, undo, redo, pastCaptions, futureCaptions, individualStylingEnabled, selectedCaptionId, isCaptionOutOfBounds, hasHydrated, projectName } = useProjectStore();
  const setVideoData = useProjectStore((state) => state.setVideoData);
  const setProjectName = useProjectStore((state) => state.setProjectName);
  const setCaptions = useProjectStore((state) => state.setCaptions);
  const updateCaptionSegment = useProjectStore((state) => state.updateCaptionSegment);
  const setIndividualStylingEnabled = useProjectStore((state) => state.setIndividualStylingEnabled);
  const setSelectedCaptionId = useProjectStore((state) => state.setSelectedCaptionId);

  const highlightSimilar = useProjectStore((state) => state.highlightSimilar);
  const setHighlightSimilar = useProjectStore((state) => state.setHighlightSimilar);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [editingCaptionText, setEditingCaptionText] = useState('');
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isMemoryBoxOpen, setIsMemoryBoxOpen] = useState(false);
  
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

  const loadFromTimeline = React.useCallback(() => {
    fetch('/auto.srt?t=' + Date.now()) // cache bust
      .then(res => res.text())
      .then(text => {
        if (text) {
           const parsed = parseSrt(text);
           const merged = parsed.map(newCap => {
             const oldCap = captions.find(c => 
               c.id === newCap.id || Math.abs(c.startTime - newCap.startTime) < 1000
             );
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
      })
      .catch(err => console.error(err));
  }, [setCaptions, captions]);

  useEffect(() => {
    if (!hasHydrated) return; // Wait for store to load from localStorage first!
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autoLoad') === 'true') {
      const fpsParam = urlParams.get('fps');
      const projParam = urlParams.get('projectName');
      if (projParam) {
        setProjectName(projParam);
      }
      if (fpsParam) {
        setVideoData(videoUrl || '', videoDuration || 0, parseFloat(fpsParam));
      }
      loadFromTimeline();
    }
  }, [loadFromTimeline, setVideoData, videoUrl, videoDuration, hasHydrated]);

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

  const pollStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/render?jobId=${jobId}`);
      const data = await res.json();
      if (data.status === 'processing') {
        setRenderProgress(data.progress);
      } else if (data.status === 'done') {
        setRenderProgress(100);
        setDownloadUrl(data.url);
        setIsRendering(false);
        clearInterval(interval);
        window.location.hash = `importMediaPool=${data.url}`;
      } else if (data.status === 'failed') {
        setIsRendering(false);
        clearInterval(interval);
        alert('Render failed: ' + (data.error || 'Unknown error'));
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden bg-black text-white p-4 gap-4 lg:gap-6 relative">
      {/* Invisible video element to grab metadata */}
      <video ref={videoRef} className="hidden" />

      {/* Left Sidebar: Captions, Render */}
      {isLeftPanelOpen && (
        <div className="w-full lg:w-80 flex-shrink-0 bg-gray-900 border border-gray-800 flex flex-col rounded-xl relative z-10 lg:h-full">
          {/* Watermark and Toggle */}
          <div className="px-4 pt-5 pb-1 flex justify-between items-center flex-shrink-0">
            <h1 className="text-white/30 text-base font-bold tracking-[0.15em] font-sans pointer-events-none select-none">
              ALOK VIDEO EDITOR
            </h1>
            <button onClick={() => setIsLeftPanelOpen(false)} className="text-gray-400 hover:text-white transition p-1" title="Close Panel">
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>

        {/* Caption List */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-200">Captions</h2>
            <div className="flex gap-2 items-center">              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMemoryBoxOpen(true);
                }}
                className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs font-semibold text-white transition"
                title="View Memory Box (Highlighted Text)"
              >
                <BookOpen className="w-3 h-3" /> Memory Box
              </button>

              <button 
                onClick={undo}
                disabled={pastCaptions.length === 0}
                className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button 
                onClick={redo}
                disabled={futureCaptions.length === 0}
                className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mb-4">
            <label className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700/80 p-3 rounded-lg border border-gray-700/50 cursor-pointer transition">
              <input 
                type="checkbox" 
                checked={highlightSimilar}
                onChange={(e) => setHighlightSimilar(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-900"
              />
              <span className="text-sm font-medium text-gray-200">Select similar words automatically</span>
            </label>

            <div className="flex justify-between items-center bg-gray-800/80 p-3 rounded-lg border border-gray-700/50">
              <span className="text-sm font-bold text-gray-200">Individual Styles</span>
              <button 
                onClick={() => {
                  setIndividualStylingEnabled(!individualStylingEnabled);
                  if (individualStylingEnabled) setSelectedCaptionId(null);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${individualStylingEnabled ? 'bg-indigo-500' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${individualStylingEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <button
              onClick={() => setConfirmAction({ type: 'reload', open: true })}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 py-2 rounded-lg border border-indigo-500/30 transition text-sm font-medium"
            >
              <RefreshCcw className="w-4 h-4" />
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
                className={`p-3 rounded-lg border transition-all ${
                  isSelected 
                    ? 'bg-indigo-900/60 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-default' 
                    : individualStylingEnabled 
                      ? 'bg-gray-800 border-gray-700 hover:border-indigo-500/50 cursor-pointer'
                      : 'bg-gray-800 border-gray-700/50 hover:border-indigo-500/30 cursor-pointer'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs text-indigo-400 font-mono flex items-center gap-2">
                    {cap.startTime}ms - {cap.endTime}ms
                    {editingCaptionId !== cap.id && (
                      <div className="flex gap-2 items-center">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            updateCaptionSegment(cap.id, { highlightedWords: [], highlightedIndices: [] });
                          }}
                          className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 text-[10px] font-medium flex items-center gap-1 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700 transition-colors"
                          title="Remove all highlights in this caption"
                        >
                          <Eraser className="w-3 h-3" /> Clear
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditingCaptionId(cap.id); 
                            setEditingCaptionText(cap.text); 
                          }}
                          className="text-gray-500 hover:text-white transition-colors"
                          title="Edit text"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  {hasCustomStyle && (
                    <span className="text-[10px] bg-indigo-600 px-1.5 py-0.5 rounded text-white font-bold">STYLED</span>
                  )}
                </div>
                
                {editingCaptionId === cap.id ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <textarea 
                      value={editingCaptionText}
                      onChange={(e) => setEditingCaptionText(e.target.value)}
                      className="w-full bg-gray-900 text-white text-sm p-2 rounded border border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                      rows={2}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingCaptionId(null); }}
                        className="px-2 py-1 bg-gray-700 hover:bg-gray-600 flex items-center gap-1 text-xs rounded text-white"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          updateCaptionSegment(cap.id, { text: editingCaptionText });
                          setEditingCaptionId(null); 
                        }}
                        className="px-2 py-1 bg-green-600 hover:bg-green-500 flex items-center gap-1 text-xs rounded text-white font-bold"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-200 leading-relaxed flex flex-wrap gap-1 mt-2">
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
                        className={`cursor-pointer px-1.5 py-0.5 rounded transition-colors ${
                          isHighlighted 
                            ? 'bg-indigo-500/30 text-indigo-300 font-medium' 
                            : 'hover:bg-gray-700'
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
              <div className="text-sm text-gray-500 text-center py-8">
                Upload an SRT file to see captions here.
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <button 
            onClick={handleRender}
            disabled={captions.length === 0 || isRendering}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRendering ? `Rendering... ${renderProgress}%` : 'Render Final Video'}
          </button>
          
          <button 
            onClick={handleOpenFolder}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Open Renders Folder
          </button>

          {downloadUrl && (
            <a
              href={downloadUrl}
              download="Auto-Caps-Style-render.mov"
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition"
            >
              Download .MOV (ProRes)
            </a>
          )}
        </div>
        </div>
      )}

      {/* Main Preview Area */}
      <div className="flex-none lg:flex-1 w-full h-[50vh] lg:h-full bg-gray-950 flex flex-col items-center justify-center p-4 lg:p-8 border border-gray-800 rounded-xl relative">
        {!isLeftPanelOpen && (
          <button onClick={() => setIsLeftPanelOpen(true)} className="absolute top-4 left-4 z-20 text-gray-400 hover:text-white bg-gray-900 p-2 rounded-lg border border-gray-700 shadow-lg transition" title="Open Captions Panel">
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}
        {!isRightPanelOpen && (
          <button onClick={() => setIsRightPanelOpen(true)} className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white bg-gray-900 p-2 rounded-lg border border-gray-700 shadow-lg transition" title="Open Design Panel">
            <PanelRightOpen className="w-5 h-5" />
          </button>
        )}

        {(videoUrl || captions.length > 0) ? (
          isClient && (
            <div className="flex flex-col items-center w-full h-full justify-center relative">
              {isCaptionOutOfBounds && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600/90 backdrop-blur text-white px-4 py-2 rounded-lg shadow-xl font-bold flex items-center gap-2 z-50 pointer-events-none border border-red-400">
                  <AlertTriangle className="w-5 h-5" />
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
                style={{
                  width: '100%',
                  maxHeight: 'calc(100% - 60px)',
                  maxWidth: styleConfig.aspectRatio === '16:9' ? '640px' : '360px',
                  aspectRatio: styleConfig.aspectRatio === '16:9' ? '16/9' : '9/16',
                  boxShadow: '0 0 30px rgba(0,0,0,0.8)',
                  border: '2px solid #000000',
                }}
              />
              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`mt-6 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${isLooping ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                <Repeat className="w-4 h-4" />
                {isLooping ? 'Auto-Loop: ON' : 'Auto-Loop: OFF'}
              </button>
            </div>
          )
        ) : (
          <div className="text-gray-500 text-center">
            <p>Upload a video or SRT file to see the preview</p>
          </div>
        )}
      </div>

      {/* Right Sidebar: Design & Animations */}
      {isRightPanelOpen && (
        <div className="w-full lg:w-96 flex-shrink-0 bg-gray-900 border border-gray-800 lg:overflow-y-auto flex flex-col rounded-xl p-4 relative transform-gpu lg:h-full">
          <div className="flex justify-end absolute top-4 right-4 z-20">
            <button onClick={() => setIsRightPanelOpen(false)} className="text-gray-400 hover:text-white transition p-1" title="Close Panel">
              <PanelRightClose className="w-5 h-5" />
            </button>
          </div>
          <StylePanel />
        </div>
      )}
      {/* Confirmation Modal */}
      {confirmAction.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-2">
              {confirmAction.type === 'reload' ? 'Reload Captions?' : 'Auto Highlight?'}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {confirmAction.type === 'reload' 
                ? 'This will reload text and timing from DaVinci Resolve, while preserving your current custom styles and highlighted words! Proceed?' 
                : 'This will overwrite your currently highlighted words. Are you sure you want to proceed?'}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmAction({ ...confirmAction, open: false })}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition"
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
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20"
              >
                Yes, proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Warning Modal */}
      {storageWarning.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-gray-800 border border-red-500/30 rounded-xl p-6 shadow-2xl max-w-md w-full mx-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/20 rounded-full flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Storage Warning</h3>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  Your rendered videos have exceeded <span className="font-bold text-red-400">10 GB</span> of storage 
                  (Currently using <span className="font-bold text-white">{storageWarning.sizeGB.toFixed(2)} GB</span>). 
                  Consider deleting old renders from the <span className="bg-gray-900 px-1.5 py-0.5 rounded text-gray-400 font-mono">public/renders</span> folder to free up space.
                </p>
                <div className="flex justify-end">
                  <button 
                    onClick={() => setStorageWarning({ ...storageWarning, show: false })}
                    className="px-5 py-2 rounded-lg text-sm font-medium bg-red-600/90 text-white hover:bg-red-500 transition shadow-lg shadow-red-900/20"
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={() => setIsMemoryBoxOpen(false)}
        >
          <div 
            className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.15)] w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-purple-400" />
                Memory Box
              </h3>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMemoryBoxOpen(false); }}
                className="text-gray-400 hover:text-white transition bg-gray-800 hover:bg-gray-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">
              Here are all the words and phrases you have highlighted in your video captions.
            </p>

            <div className="flex-1 overflow-y-auto bg-gray-950 rounded-lg p-4 border border-gray-800 space-y-6">
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
                          <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b border-gray-800">English</h4>
                          <div className="flex flex-wrap gap-2">
                            {englishWords.map((word, index) => (
                              <span key={`en-${word}-${index}`} className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/40 text-purple-200 rounded-md text-sm font-medium">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {hindiNepaliWords.length > 0 && (
                        <div>
                          <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b border-gray-800">Hindi / Nepali</h4>
                          <div className="flex flex-wrap gap-2">
                            {hindiNepaliWords.map((word, index) => (
                              <span key={`hn-${word}-${index}`} className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/40 text-blue-200 rounded-md text-sm font-medium">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {otherWords.length > 0 && (
                        <div>
                          <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b border-gray-800">Numbers / Symbols</h4>
                          <div className="flex flex-wrap gap-2">
                            {otherWords.map((word, index) => (
                              <span key={`oth-${word}-${index}`} className="px-3 py-1.5 bg-gray-500/20 border border-gray-500/40 text-gray-300 rounded-md text-sm font-medium">
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
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <BookOpen className="w-12 h-12 mb-3 opacity-20" />
                  <p>Your Memory Box is empty.</p>
                  <p className="text-xs mt-1">Highlight some words to see them here.</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMemoryBoxOpen(false); }}
                className="px-6 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-500 transition shadow-lg shadow-purple-500/20"
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
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-[100] cursor-not-allowed"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500 mb-6"></div>
          <h2 className="text-3xl font-bold text-white mb-2">Rendering Video</h2>
          <p className="text-gray-300 text-lg mb-8">Please wait, do not close the plugin...</p>
          
          <div className="w-64 h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <div 
              className="h-full bg-yellow-500 transition-all duration-300"
              style={{ width: `${Math.max(5, renderProgress)}%` }}
            ></div>
          </div>
          <p className="mt-3 text-yellow-500 font-mono font-bold text-xl">{renderProgress}%</p>
        </div>
      )}
    </div>
  );
};

