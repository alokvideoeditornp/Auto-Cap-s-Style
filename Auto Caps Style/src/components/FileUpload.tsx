'use client';

import React, { useRef } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { parseSrt } from '@/lib/srtParser';
import { Upload } from 'lucide-react';

export const FileUpload: React.FC = () => {
  const setVideoData = useProjectStore((state) => state.setVideoData);
  const setCaptions = useProjectStore((state) => state.setCaptions);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const srtInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      // We pass duration as 0 for now, the player will update it when metadata loads
      setVideoData(url, 0, 30);
    }
  };

  const handleSrtUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const segments = parseSrt(text);
        
        if (segments.length === 0) {
          alert('Could not find any valid captions in this SRT file.');
          return;
        }

        // Initial set
        setCaptions(segments);

        // Call AI highlighting API (mocked for now)
        try {
          const response = await fetch('/api/ai/highlight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lines: segments.map(s => s.text) })
          });
          const data = await response.json();
          
          if (data.results) {
            const highlightedSegments = segments.map((seg, idx) => ({
              ...seg,
              highlightedWords: data.results[idx]?.highlight || [],
              originalHighlightedWords: data.results[idx]?.highlight || []
            }));
            setCaptions(highlightedSegments);
          }
        } catch (err) {
          console.error("Failed to fetch highlights", err);
        }
      } catch (error) {
        console.error("Failed to parse SRT file", error);
        alert("There was an error parsing the SRT file. Make sure it is a valid .srt format.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-900 rounded-xl border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-2">Upload Files</h2>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400">Video File (.mp4, .mov)</label>
        <button 
          onClick={() => videoInputRef.current?.click()}
          className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition"
        >
          <Upload size={18} /> Choose Video
        </button>
        <input 
          type="file" 
          accept="video/mp4,video/quicktime" 
          ref={videoInputRef} 
          onChange={handleVideoUpload} 
          className="hidden" 
        />
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <label className="text-sm text-gray-400">SRT Subtitles (.srt)</label>
        <button 
          onClick={() => srtInputRef.current?.click()}
          className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition"
        >
          <Upload size={18} /> Choose SRT File
        </button>
        <input 
          type="file" 
          accept=".srt" 
          ref={srtInputRef} 
          onChange={handleSrtUpload} 
          className="hidden" 
        />
      </div>
    </div>
  );
};
