import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import React, { useRef, useLayoutEffect } from 'react';
import { CaptionSegment, StyleConfig } from '@/store/useProjectStore';

interface CaptionLineProps {
  segment: CaptionSegment;
  styleConfig: StyleConfig;
}

export const CaptionLine: React.FC<CaptionLineProps> = ({ segment, styleConfig }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = Math.round((segment.startTime / 1000) * fps);
  const endFrame = Math.round((segment.endTime / 1000) * fps);
  const durationInFrames = Math.max(1, endFrame - startFrame);

  // Exit animation
  const exitDurationFrames = Math.round((200 / 1000) * fps); // 200ms
  const framesUntilEnd = durationInFrames - frame;
  const exitProgress = framesUntilEnd < exitDurationFrames
    ? interpolate(framesUntilEnd, [0, exitDurationFrames], [1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' })
    : 0;

  const words = React.useMemo(() => segment.text.split(' '), [segment.text]);

  // Staggering config
  const staggerFrames = styleConfig.displayMode === 'line' ? 0 : 4; // 4 frames delay between words/letters

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current || !contentRef.current) return;
    if (!styleConfig.clipText) {
      contentRef.current.style.transform = 'none';
      return;
    }
    
    const container = containerRef.current;
    const content = contentRef.current;
    
    // Reset transform to measure true size
    content.style.transform = 'none';
    
    // Temporarily align left to accurately measure scrollWidth without left-overflow truncation
    const originalJustifyContent = content.style.justifyContent;
    const originalTextAlign = content.style.textAlign;
    content.style.justifyContent = 'flex-start';
    content.style.textAlign = 'left';
    
    // Strip transforms from animated children to get true layout size
    const childrenSpans = Array.from(content.querySelectorAll('span'));
    const originalTransforms = childrenSpans.map(child => (child as HTMLElement).style.transform);
    childrenSpans.forEach(child => (child as HTMLElement).style.transform = 'none');

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    const contentW = content.scrollWidth;
    const contentH = content.scrollHeight;
    
    // Restore children transforms
    childrenSpans.forEach((child, i) => (child as HTMLElement).style.transform = originalTransforms[i]);

    // Restore alignment
    content.style.justifyContent = originalJustifyContent;
    content.style.textAlign = originalTextAlign;
    
    let scale = 1;
    if (contentW > containerW || contentH > containerH) {
      const scaleX = containerW / contentW;
      const scaleY = containerH / contentH;
      scale = Math.min(scaleX, scaleY);
      // Small buffer to ensure no pixel clipping
      scale = scale * 0.98;
    }
    
    content.style.transform = `scale(${scale})`;
    content.style.transformOrigin = 'center center';
  }, [words, styleConfig.clipText, styleConfig.textBoxWidth, styleConfig.textBoxHeight, styleConfig.fontSize, styleConfig.wrapText, styleConfig.lineLayout, styleConfig.baseFontSizeMultiplier, styleConfig.accentFontSizeMultiplier]);

  const renderContent = () => {
    let itemIndex = 0; // global counter for letters if in letter mode

    const elements = words.map((word, wIdx) => {
      const cleanWord = word.replace(/[.,!?;:"'(){}[\\]\\-]/g, '').toLowerCase().trim();
      const isHighlighted = segment.highlightedIndices 
        ? segment.highlightedIndices.includes(wIdx) 
        : segment.highlightedWords.some(hw => hw.toLowerCase() === cleanWord);
      
      const color = isHighlighted ? styleConfig.accentColor : styleConfig.baseColor;
      const fontSize = isHighlighted 
        ? `${styleConfig.fontSize * styleConfig.accentFontSizeMultiplier}px` 
        : `${styleConfig.fontSize * styleConfig.baseFontSizeMultiplier}px`;

      const wordStyles: React.CSSProperties = { margin: '0 8px', display: 'flex', flexDirection: 'row' };

      if (styleConfig.displayMode === 'letter') {
        let letters: string[] = [];
        if (typeof Intl !== 'undefined' && Intl.Segmenter) {
          const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
          letters = Array.from(segmenter.segment(word)).map(s => s.segment);
        } else {
          letters = Array.from(word);
        }
        // We use a flex row so letters stay together like a word
        return (
          <span key={wIdx} style={wordStyles}>
            {letters.map((char, cIdx) => {
              const currentItemIndex = itemIndex++;
              return (
                <AnimatedItem
                  key={cIdx}
                  char={char === ' ' ? '\u00A0' : char}
                  frame={frame}
                  fps={fps}
                  delay={currentItemIndex * staggerFrames}
                  styleConfig={styleConfig}
                  exitProgress={exitProgress}
                  color={color}
                  fontSize={fontSize}
                  isHighlighted={isHighlighted}
                  index={currentItemIndex}
                />
              );
            })}
          </span>
        );
      }

      // Word or Line mode
      const delay = styleConfig.displayMode === 'word' ? wIdx * staggerFrames : 0;
      
      return (
        <span key={wIdx} style={wordStyles}>
          <AnimatedItem
            char={word}
            frame={frame}
            fps={fps}
            delay={delay}
            styleConfig={styleConfig}
            exitProgress={exitProgress}
            color={color}
            fontSize={fontSize}
            isHighlighted={isHighlighted}
            index={wIdx}
          />
        </span>
      );
    });

    if (styleConfig.lineLayout === 'double' && words.length > 2) {
      const half = Math.ceil(words.length / 2);
      elements.splice(half, 0, <div key="break" style={{ flexBasis: '100%', height: 0 }} />);
    }

    return elements;
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: styleConfig.lineLayout === 'single' ? '100%' : `${styleConfig.textBoxWidth ?? 80}%`,
        height: (styleConfig.clipText ?? false) ? `${styleConfig.textBoxHeight ?? 20}%` : 'auto',
        display: 'flex',
        justifyContent: styleConfig.textAlign === 'left' ? 'flex-start' : styleConfig.textAlign === 'right' ? 'flex-end' : 'center',
        alignItems: 'center',
        overflow: (styleConfig.clipText ?? false) ? 'hidden' : 'visible',
      }}
    >
      <div
        ref={contentRef}
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: (styleConfig.wrapText ?? true) && styleConfig.lineLayout !== 'single' ? 'wrap' : 'nowrap',
          justifyContent: styleConfig.textAlign === 'left' ? 'flex-start' : styleConfig.textAlign === 'right' ? 'flex-end' : 'center',
          alignItems: 'baseline',
          fontFamily: `"${styleConfig.font}", "Noto Sans Devanagari", "Noto Sans Arabic", "Noto Sans Bengali", "Noto Sans", sans-serif`,
          fontWeight: styleConfig.fontWeight ?? 800,
          textShadow: styleConfig.highlightStyle === 'subtitle' ? 'none' : '2px 4px 6px rgba(0,0,0,0.6)',
          textAlign: styleConfig.textAlign ?? 'center',
          whiteSpace: (styleConfig.wrapText ?? true) && styleConfig.lineLayout !== 'single' ? 'normal' : 'nowrap',
          width: '100%',
          lineHeight: 1.1,
          backgroundColor: styleConfig.highlightStyle === 'subtitle' ? (styleConfig.backgroundColor || '#000000') : 'transparent',
          padding: styleConfig.highlightStyle === 'subtitle' ? '24px 48px' : '0',
          borderRadius: styleConfig.highlightStyle === 'subtitle' ? '24px' : '0',
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
};

// Sub-component for animating individual words or letters
const AnimatedItem: React.FC<{
  char: string;
  frame: number;
  fps: number;
  delay: number;
  styleConfig: StyleConfig;
  exitProgress: number;
  color: string;
  fontSize: string;
  isHighlighted?: boolean;
  index: number;
}> = ({ char, frame, fps, delay, styleConfig, exitProgress, color, fontSize, isHighlighted, index }) => {
  const entranceDurationFrames = Math.round((300 / 1000) * fps); // 300ms
  
  // Start animation after delay
  const relativeFrame = Math.max(0, frame - delay);

  const entranceProgress = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 12 },
    durationInFrames: entranceDurationFrames,
  });

  let translateX = 0;
  let translateY = 0;
  let scale = 1;
  let rotate = 0;
  let opacity = 1;
  
  const extraStyles: React.CSSProperties = {};
  let finalColor = color;
  
  if (isHighlighted && styleConfig.highlightStyle === 'highlight') {
    extraStyles.backgroundColor = styleConfig.backgroundColor || '#000000';
    extraStyles.padding = styleConfig.displayMode === 'letter' ? '0px 2px' : '0px 16px';
    extraStyles.borderRadius = '16px';
  } else if (isHighlighted && styleConfig.highlightStyle === 'glow') {
    const intensity = styleConfig.glowIntensity ?? 3;
    extraStyles.textShadow = `0px 0px ${intensity}px ${styleConfig.accentColor}, 0px 0px ${intensity * 2}px ${styleConfig.accentColor}`;
  } else if (isHighlighted && styleConfig.highlightStyle === 'underline') {
    extraStyles.textDecoration = 'underline';
    extraStyles.textDecorationColor = styleConfig.backgroundColor || '#ff0000';
    // Use an absolute pixel value that scales nicely or em if we want relative
    extraStyles.textDecorationThickness = '0.1em';
    extraStyles.textUnderlineOffset = '0.15em';
  }

  if (styleConfig.animationType === 'slide-up') {
    translateY = interpolate(entranceProgress, [0, 1], [50, 0]) + interpolate(exitProgress, [0, 1], [0, 50]);
    opacity = interpolate(entranceProgress, [0, 1], [0, 1]) - interpolate(exitProgress, [0, 1], [0, 1]);
  } else if (styleConfig.animationType === 'fade') {
    opacity = interpolate(entranceProgress, [0, 1], [0, 1]) - interpolate(exitProgress, [0, 1], [0, 1]);
  } else if (styleConfig.animationType === 'pop') {
    scale = spring({
      frame: relativeFrame,
      fps,
      config: { damping: 10, mass: 0.5 },
      durationInFrames: entranceDurationFrames,
    });
    translateY = interpolate(scale, [0, 1], [50, 0]);
    opacity = interpolate(entranceProgress, [0, 1], [0, 1]) - interpolate(exitProgress, [0, 1], [0, 1]);
  } else if (styleConfig.animationType === 'elastic-bounce') {
    scale = spring({
      frame: relativeFrame,
      fps,
      config: { damping: 5, mass: 1, stiffness: 200 },
      durationInFrames: entranceDurationFrames * 2,
    });
    translateY = interpolate(exitProgress, [0, 1], [0, 50]);
    opacity = interpolate(entranceProgress, [0, 1], [0, 1]) - interpolate(exitProgress, [0, 1], [0, 1]);
  } else if (styleConfig.animationType === 'kinetic-clash') {
    const direction = isHighlighted ? -1 : 1;
    const startX = direction * 300; 
    
    translateX = interpolate(entranceProgress, [0, 1], [startX, 0]) + interpolate(exitProgress, [0, 1], [0, startX * 1.5]);
    opacity = interpolate(entranceProgress, [0, 0.5, 1], [0, 1, 1]) - interpolate(exitProgress, [0, 1], [0, 1]);
    
    const blurAmount = interpolate(entranceProgress, [0, 1], [20, 0]);
    const exitBlur = interpolate(exitProgress, [0, 1], [0, 20]);
    const currentBlur = Math.max(blurAmount, exitBlur);
    if (currentBlur > 0) extraStyles.filter = `blur(${currentBlur}px)`;
  } else if (styleConfig.animationType === 'chaos-converge') {
    const random = (seed: number) => { const x = Math.sin(seed + 1) * 10000; return x - Math.floor(x); };
    const angle = random(index) * Math.PI * 2;
    const distance = 400 + random(index + 10) * 300; 
    
    const startX = Math.cos(angle) * distance;
    const startY = Math.sin(angle) * distance;
    const startRot = (random(index + 20) - 0.5) * 360; 
    
    translateX = interpolate(entranceProgress, [0, 1], [startX, 0]) + interpolate(exitProgress, [0, 1], [0, startX * 1.5]);
    translateY = interpolate(entranceProgress, [0, 1], [startY, 0]) + interpolate(exitProgress, [0, 1], [0, startY * 1.5]);
    rotate = interpolate(entranceProgress, [0, 1], [startRot, 0]);
    scale = interpolate(exitProgress, [0, 1], [1, 0.5]);
    opacity = interpolate(entranceProgress, [0, 0.5, 1], [0, 1, 1]) - interpolate(exitProgress, [0, 1], [0, 1]);
  } else if (styleConfig.animationType === 'typewriter') {
    opacity = relativeFrame > 0 ? 1 : 0;
    opacity = opacity - interpolate(exitProgress, [0, 1], [0, 1]);
  }

  return (
    <span
      style={{
        display: 'inline-block',
        opacity,
        transform: `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
        color: finalColor,
        fontSize,
        ...extraStyles,
      }}
    >
      {char}
    </span>
  );
};
