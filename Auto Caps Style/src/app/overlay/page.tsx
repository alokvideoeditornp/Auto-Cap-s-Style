'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Player } from '@remotion/player';
import { CaptionComposition } from '@/remotion/CaptionComposition';

function OverlayContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [props, setProps] = useState<any>(null);
  const [error, setError] = useState('');

  // Force transparent background for OBS/OGraf
  useEffect(() => {
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.backgroundColor = 'transparent';
    return () => {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  useEffect(() => {
    if (!jobId) {
      setTimeout(() => setError('No jobId provided'), 0);
      return;
    }
    fetch(`/renders/render-${jobId}.json`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => setProps(data))
      .catch(() => setError('Failed to load graphic data. Please re-export from the editor.'));
  }, [jobId]);

  if (error) return <div style={{ color: 'white', background: 'red', padding: '20px', fontFamily: 'sans-serif' }}>{error}</div>;
  if (!props) return null;

  const { videoUrl, captions, styleConfig } = props;
  
  // Use standard 30fps for broadcast graphics
  const fps = 30; 
  const maxCaptionTime = captions.length > 0 ? captions[captions.length - 1].endTime : 0;
  // Give it a 2-second tail after the last caption
  const durationInFrames = Math.max(1, Math.round(((maxCaptionTime + 2000) / 1000) * fps));

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'transparent', overflow: 'hidden' }}>
      <Player
        renderLoading={() => (
          <div style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 1, backgroundColor: 'black', opacity: 1 }} />
          </div>
        )}
        component={CaptionComposition}
        inputProps={{ videoUrl, captions, styleConfig }}
        durationInFrames={durationInFrames}
        compositionWidth={styleConfig.aspectRatio === '16:9' ? 1920 : 1080}
        compositionHeight={styleConfig.aspectRatio === '16:9' ? 1080 : 1920}
        fps={fps}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent'
        }}
        autoPlay
        loop
      />
    </div>
  );
}

export default function OverlayPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OverlayContent />
    </Suspense>
  );
}
