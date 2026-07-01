'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Player } from '@remotion/player';
import { useProjectStore } from '@/store/useProjectStore';
import { CaptionComposition } from '@/remotion/CaptionComposition';
import { parseSrt } from '@/lib/srtParser';
import { StylePanel } from './StylePanel';
import { Undo, Redo, Wand2, Repeat, RefreshCcw } from 'lucide-react';

export const Editor: React.FC = () => {
  const { videoUrl, captions, styleConfig, fps, videoDuration, undo, redo, pastCaptions, futureCaptions, individualStylingEnabled, selectedCaptionId } = useProjectStore();
  const setVideoData = useProjectStore((state) => state.setVideoData);
  const setCaptions = useProjectStore((state) => state.setCaptions);
  const updateCaptionSegment = useProjectStore((state) => state.updateCaptionSegment);
  const setIndividualStylingEnabled = useProjectStore((state) => state.setIndividualStylingEnabled);
  const setSelectedCaptionId = useProjectStore((state) => state.setSelectedCaptionId);

  const [highlightSimilar, setHighlightSimilar] = useState(false);

  const toggleHighlight = (captionId: string, word: string, wordIndex: number) => {
    const caption = captions.find(c => c.id === captionId);
    if (!caption) return;
    
    // Clean punctuation for matching but store the clean version
    const cleanWord = word.replace(/[.,!?;:"'(){}[\\]\\-]/g, '').toLowerCase().trim();
    
    let newHighlights = [...caption.highlightedWords];
    let newHighlightIndices = caption.highlightedIndices ? [...caption.highlightedIndices] : [];
    
    if (highlightSimilar) {
      if (newHighlights.some(w => w.toLowerCase() === cleanWord)) {
        newHighlights = newHighlights.filter(w => w.toLowerCase() !== cleanWord);
        // Remove all indices for this word
        const wordsArr = caption.text.split(' ');
        wordsArr.forEach((w, i) => {
          if (w.replace(/[.,!?;:"'(){}[\\]\\-]/g, '').toLowerCase().trim() === cleanWord) {
            newHighlightIndices = newHighlightIndices.filter(idx => idx !== i);
          }
        });
      } else {
        newHighlights.push(cleanWord);
        // Add all indices for this word
        const wordsArr = caption.text.split(' ');
        wordsArr.forEach((w, i) => {
          if (w.replace(/[.,!?;:"'(){}[\\]\\-]/g, '').toLowerCase().trim() === cleanWord && !newHighlightIndices.includes(i)) {
            newHighlightIndices.push(i);
          }
        });
      }
    } else {
      if (newHighlightIndices.includes(wordIndex)) {
        newHighlightIndices = newHighlightIndices.filter(idx => idx !== wordIndex);
        // Optional: remove from newHighlights if no more indices of this word exist
        const wordsArr = caption.text.split(' ');
        const hasMoreOfThisWord = newHighlightIndices.some(idx => wordsArr[idx].replace(/[.,!?;:"'(){}[\\]\\-]/g, '').toLowerCase().trim() === cleanWord);
        if (!hasMoreOfThisWord) {
          newHighlights = newHighlights.filter(w => w.toLowerCase() !== cleanWord);
        }
      } else {
        newHighlightIndices.push(wordIndex);
        if (!newHighlights.some(w => w.toLowerCase() === cleanWord)) {
          newHighlights.push(cleanWord);
        }
      }
    }
    
    updateCaptionSegment(captionId, { highlightedWords: newHighlights, highlightedIndices: newHighlightIndices });
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
      
      const cleanImportant = bestWord.replace(/[.,!?;:"'(){}[\\]\\-]/g, '').toLowerCase().trim();
      let bestIndex = -1;
      words.forEach((w, i) => {
        if (w === bestWord && bestIndex === -1) {
          bestIndex = i;
        }
      });
      return { 
        ...cap, 
        highlightedWords: cleanImportant ? [cleanImportant] : [],
        highlightedIndices: bestIndex !== -1 ? [bestIndex] : []
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
           setCaptions(parsed);
           window.history.replaceState({}, '', window.location.pathname);
        }
      })
      .catch(err => console.error(err));
  }, [setCaptions]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autoLoad') === 'true') {
      loadFromTimeline();
    }
  }, [loadFromTimeline]);

  const maxCaptionTime = captions.length > 0 ? captions[captions.length - 1].endTime : 0;
  
  let durationInFrames = 300; // Default 10 seconds
  if (videoDuration > 0) {
    durationInFrames = Math.max(1, Math.round((videoDuration / 1000) * fps));
  } else if (maxCaptionTime > 0) {
    durationInFrames = Math.max(1, Math.round((maxCaptionTime / 1000) * fps));
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

  useEffect(() => {
    setTimeout(() => setIsClient(true), 0);
  }, []);

  const handleRender = async () => {
    if (captions.length === 0) return;
    setIsRendering(true);
    setRenderProgress(0);
    setDownloadUrl(null);

    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputProps: {
            videoUrl,
            captions,
            styleConfig
          }
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
    <div className="flex flex-col md:flex-row h-screen bg-black text-white p-4 gap-6 relative">
      {/* Invisible video element to grab metadata */}
      <video ref={videoRef} className="hidden" />

      {/* Left Sidebar: Captions, Render */}
      <div className="w-80 bg-gray-900 border border-gray-800 flex flex-col rounded-xl relative z-10">
        {/* Watermark */}
        <div className="px-4 pt-5 pb-1 pointer-events-none select-none flex-shrink-0">
          <h1 className="text-white/30 text-base font-bold tracking-[0.15em] font-sans">
            ALOK VIDEO EDITOR
          </h1>
        </div>

        {/* Caption List */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-200">Captions</h2>
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => setConfirmAction({ type: 'reload', open: true })}
                className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-semibold text-white transition"
                title="Reload captions from DaVinci Timeline"
              >
                <RefreshCcw className="w-3 h-3" /> Reload
              </button>
              <button 
                onClick={() => setConfirmAction({ type: 'auto', open: true })}
                disabled={captions.length === 0}
                className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Auto-detect and highlight important words"
              >
                <Wand2 className="w-3 h-3" /> Auto-Highlight
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
            
            <label className="flex items-center gap-2 cursor-pointer bg-gray-800/50 p-2 rounded-lg border border-gray-700/30 w-fit">
              <input 
                type="checkbox"
                checked={highlightSimilar}
                onChange={(e) => setHighlightSimilar(e.target.checked)}
                className="w-3 h-3 rounded accent-indigo-500 bg-gray-700 border-gray-600"
              />
              <span className="text-xs text-gray-400">Select similar words automatically</span>
            </label>
          </div>
          
          <div className="space-y-2">
            {captions.map((cap) => {
              const isSelected = individualStylingEnabled && selectedCaptionId === cap.id;
              const hasCustomStyle = !!cap.customStyle && Object.keys(cap.customStyle).length > 0;
              
              return (
              <div 
                key={cap.id} 
                onClick={() => individualStylingEnabled && setSelectedCaptionId(cap.id)}
                className={`p-3 rounded-lg border transition-all ${
                  isSelected 
                    ? 'bg-indigo-900/60 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-default' 
                    : individualStylingEnabled 
                      ? 'bg-gray-800 border-gray-700 hover:border-indigo-500/50 cursor-pointer'
                      : 'bg-gray-800 border-gray-700/50'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs text-indigo-400 font-mono">
                    {cap.startTime}ms - {cap.endTime}ms
                  </div>
                  {hasCustomStyle && (
                    <span className="text-[10px] bg-indigo-600 px-1.5 py-0.5 rounded text-white font-bold">STYLED</span>
                  )}
                </div>
                <p className="text-sm text-gray-200 leading-relaxed flex flex-wrap gap-1 mt-2">
                  {cap.text.split(' ').map((word, i) => {
                    const cleanWord = word.replace(/[.,!?;:"'(){}[\\]\\-]/g, '').toLowerCase().trim();
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
                </p>
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

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleRender}
            disabled={captions.length === 0 || isRendering}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRendering ? `Rendering... ${renderProgress}%` : 'Render Final Video'}
          </button>
          {downloadUrl && (
            <a 
              href={downloadUrl} 
              download="captionflow-render.mov"
              className="block text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg mt-2 transition"
            >
              Download .MOV (ProRes)
            </a>
          )}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 min-h-0 bg-gray-950 flex flex-col items-center justify-center p-8 border-r border-gray-800 rounded-xl relative">
        {(videoUrl || captions.length > 0) ? (
          isClient && (
            <div className="flex flex-col items-center w-full h-full justify-center">
              <Player
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
                controls
                loop={isLooping}
                autoPlay
                style={{
                  width: '100%',
                  maxHeight: 'calc(100% - 60px)',
                  maxWidth: styleConfig.aspectRatio === '16:9' ? '640px' : '360px',
                  aspectRatio: styleConfig.aspectRatio === '16:9' ? '16/9' : '9/16',
                  boxShadow: '0 0 20px rgba(0,0,0,0.5)',
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
      <div className="w-96 bg-gray-900 border border-gray-800 overflow-y-auto flex flex-col rounded-xl p-4">
        <StylePanel />
      </div>
      {/* Confirmation Modal */}
      {confirmAction.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-2">
              {confirmAction.type === 'reload' ? 'Reload Captions?' : 'Auto Highlight?'}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {confirmAction.type === 'reload' 
                ? 'This will overwrite all your current captions and custom styles. Are you sure you want to proceed?' 
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
                  if (confirmAction.type === 'reload') loadFromTimeline();
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
    </div>
  );
};
