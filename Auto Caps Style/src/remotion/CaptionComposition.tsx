import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Sequence, Video, useVideoConfig, delayRender, continueRender } from 'remotion';
import { CaptionSegment, StyleConfig } from '../store/useProjectStore';
import { CaptionLine } from './CaptionLine';

export interface CaptionCompositionProps {
  videoUrl: string | null;
  captions: CaptionSegment[];
  styleConfig: StyleConfig;
  isRendering?: boolean;
}

export const CaptionComposition: React.FC<CaptionCompositionProps> = ({ videoUrl, captions, styleConfig, isRendering }) => {
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender('Loading fonts...'));

  useEffect(() => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        continueRender(handle);
      });
    } else {
      continueRender(handle);
    }
  }, [handle]);

  // Position styles
  let alignStyle: React.CSSProperties = { justifyContent: 'flex-end', paddingBottom: '10%' };
  if (styleConfig.position === 'center') alignStyle = { justifyContent: 'center' };
  if (styleConfig.position === 'top') alignStyle = { justifyContent: 'flex-start', paddingTop: '10%' };

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      {/* 1x1 black pixel to prevent DaVinci Resolve alpha channel bug on completely transparent first frames */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 1, backgroundColor: 'black', opacity: 1 }} />
      {videoUrl ? (
        <Video src={videoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      ) : (
        <AbsoluteFill style={{ backgroundColor: 'transparent' }} />
      )}
      
      <AbsoluteFill>
        {captions.map((segment) => {
          const startFrame = Math.round((segment.startTime / 1000) * fps) || 0;
          const endFrame = Math.round((segment.endTime / 1000) * fps) || 0;
          const durationInFrames = Math.max(1, endFrame - startFrame);

          return (
            <Sequence
              key={segment.id}
              from={startFrame}
              durationInFrames={durationInFrames}
            >
              <AbsoluteFill style={{ ...alignStyle, alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                <CaptionLine 
                  segment={segment} 
                  styleConfig={{ ...styleConfig, ...(segment.customStyle || {}) }} 
                  isRendering={isRendering}
                />
              </AbsoluteFill>
            </Sequence>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
