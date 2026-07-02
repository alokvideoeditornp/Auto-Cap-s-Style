import React from 'react';
import { AbsoluteFill, Sequence, Video, useVideoConfig } from 'remotion';
import { CaptionSegment, StyleConfig } from '@/store/useProjectStore';
import { CaptionLine } from './CaptionLine';

export interface CaptionCompositionProps {
  videoUrl: string | null;
  captions: CaptionSegment[];
  styleConfig: StyleConfig;
}

export const CaptionComposition: React.FC<CaptionCompositionProps> = ({ videoUrl, captions, styleConfig }) => {
  const { fps } = useVideoConfig();

  // Position styles
  let alignStyle: React.CSSProperties = { justifyContent: 'flex-end', paddingBottom: '10%' };
  if (styleConfig.position === 'center') alignStyle = { justifyContent: 'center' };
  if (styleConfig.position === 'top') alignStyle = { justifyContent: 'flex-start', paddingTop: '10%' };

  const bgColor = 'transparent';

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      {videoUrl ? (
        <Video src={videoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      ) : (
        <AbsoluteFill style={{ backgroundColor: bgColor }} />
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
                />
              </AbsoluteFill>
            </Sequence>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
