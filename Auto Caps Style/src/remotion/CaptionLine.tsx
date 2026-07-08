import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import React, { useRef, useLayoutEffect } from 'react';
import { CaptionSegment, StyleConfig, useProjectStore } from '../store/useProjectStore';


interface CaptionLineProps {
  segment: CaptionSegment;
  styleConfig: StyleConfig;
  isRendering?: boolean;
}

export const CaptionLine: React.FC<CaptionLineProps> = ({ segment, styleConfig, isRendering }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const showTextBoxBorder = useProjectStore(state => state.showTextBoxBorder);

  const startFrame = Math.round((segment.startTime / 1000) * fps);
  const endFrame = Math.round((segment.endTime / 1000) * fps);
  const durationInFrames = Math.max(1, endFrame - startFrame);

  // Exit animation
  const maxExitFrames = Math.max(0, Math.floor(durationInFrames / 2));
  const exitDurationFrames = Math.min(Math.round((200 / 1000) * fps), maxExitFrames); // 200ms or half duration
  const framesUntilEnd = durationInFrames - frame;
  const exitProgress = framesUntilEnd < exitDurationFrames
    ? interpolate(framesUntilEnd, [0, exitDurationFrames], [1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' })
    : 0;

  const words = React.useMemo(() => segment.text.split(' '), [segment.text]);

  // Estimate number of lines based on layout and word count
  let estimatedLines = 1;
  if (styleConfig.lineLayout === 'double' && words.length >= 2) {
    estimatedLines = 2;
  } else if (styleConfig.displayMode === 'line' && words.length >= 2) {
    // If they explicitly choose Line stagger, force a 2-line split for short captions
    estimatedLines = 2;
  } else if (styleConfig.lineLayout !== 'single' && words.length > 4) {
    estimatedLines = 2;
  }

  // Calculate total items to ensure stagger finishes before caption ends
  let totalItems = 1;
  if (styleConfig.displayMode === 'word') {
    totalItems = words.length;
  } else if (styleConfig.displayMode === 'line') {
    totalItems = estimatedLines;
  } else if (styleConfig.displayMode === 'letter') {
    totalItems = words.reduce((acc, word) => {
      let letters = [];
      if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        letters = Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(word));
      } else {
        letters = Array.from(word);
      }
      return acc + letters.length;
    }, 0);
  }

  // Staggering config
  let defaultStagger = styleConfig.displayMode === 'line' ? 0 : 4; 
  if (styleConfig.displayMode === 'letter') defaultStagger = 2; // Letters normally need faster stagger

  const maxItemIndex = Math.max(1, totalItems - 1);
  const entranceFrames = Math.round((300 / 1000) * fps); // 300ms entrance
  // Leave a tiny 2-frame buffer so the last letter is fully visible before exit starts
  const availableFramesForStagger = Math.max(0, durationInFrames - entranceFrames - exitDurationFrames - 2);
  const maxStaggerDelay = availableFramesForStagger / maxItemIndex;
  
  let staggerFrames = 0;
  if (styleConfig.displayMode !== 'line') {
    if (styleConfig.staggerSpeedMode === 'timecode') {
      staggerFrames = Math.max(0, maxStaggerDelay);
    } else {
      staggerFrames = Math.min(defaultStagger, Math.max(0, maxStaggerDelay));
    }
  } else {
    staggerFrames = defaultStagger; // Force line stagger to be the default constant delay, otherwise it might be 0 for short captions
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current || !contentRef.current) return;
    
    const container = containerRef.current;
    const content = contentRef.current;
    
    // Reset container height and content transform to measure true size
    container.style.height = (styleConfig.clipText ?? false) ? `${styleConfig.textBoxHeight ?? 20}%` : 'auto';
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
    const contentW = content.scrollWidth;
    
    // Always restrict height to the container's max available height so it scales down if it overflows the canvas
    const containerH = container.clientHeight;
    const contentH = content.scrollHeight;
    
    // Restore children transforms
    childrenSpans.forEach((child, i) => (child as HTMLElement).style.transform = originalTransforms[i]);

    // Restore alignment
    content.style.justifyContent = originalJustifyContent;
    content.style.textAlign = originalTextAlign;
    
    let scale = 1;
    const isOut = false;
    
    if (contentW > containerW || contentH > containerH) {
      const scaleX = containerW / contentW;
      const scaleY = containerH / contentH;
      
      // We ONLY scale down to fit. Never scale up above 1.
      scale = Math.min(scaleX, scaleY, 1);
      
      // Small buffer to ensure no pixel clipping if we actually scaled
      if (scale < 1) {
        scale = scale * 0.98;
      }
      // Round scale to 3 decimal places to prevent layout jitter across headless renderer frames
      scale = Math.floor(scale * 1000) / 1000;
    }
    
    useProjectStore.getState().setIsCaptionOutOfBounds(false);
    
    let transformOrigin = 'center center';
    if (styleConfig.textAlign === 'left') transformOrigin = 'left center';
    if (styleConfig.textAlign === 'right') transformOrigin = 'right center';
    
    content.style.transform = `scale(${scale})`;
    content.style.transformOrigin = transformOrigin;
    
    // Adjust container height to match scaled content to prevent empty vertical space
    if (!styleConfig.clipText && scale < 1) {
      container.style.height = `${contentH * scale}px`;
    }
  }, [words, styleConfig.clipText, styleConfig.textBoxWidth, styleConfig.textBoxHeight, styleConfig.fontSize, styleConfig.wrapText, styleConfig.lineLayout, styleConfig.baseFontSizeMultiplier, styleConfig.accentFontSizeMultiplier, styleConfig.textAlign]);

  const renderContent = () => {
    let itemIndex = 0; // global counter for letters if in letter mode
    
    // For math stagger
    const totalChars = words.reduce((sum, w) => sum + w.length, 0);

    const elements = words.map((word, wIdx) => {
      const cleanWord = word.replace(/[.,!?;:"'(){}[\]\-।॥]/g, '').toLowerCase().trim();
      
      let isHighlighted = false;
      let karaokeStartFrame = 0;
      
      if (styleConfig.displayMode === 'karaoke') {
        const totalChars = words.reduce((sum, w) => sum + w.length, 0);
        let startCharIndex = 0;
        for (let i = 0; i < wIdx; i++) {
          startCharIndex += words[i].length;
        }
        
        karaokeStartFrame = (startCharIndex / Math.max(1, totalChars)) * durationInFrames;
        const endFrame = ((startCharIndex + word.length) / Math.max(1, totalChars)) * durationInFrames;
        
        if (frame >= karaokeStartFrame && (wIdx === words.length - 1 ? frame <= endFrame : frame < endFrame)) {
          isHighlighted = true;
        }
      } else {
        isHighlighted = (segment.highlightedIndices || []).length > 0
          ? segment.highlightedIndices!.includes(wIdx) 
          : (segment.highlightedWords || []).some(hw => hw.toLowerCase() === cleanWord);
      }
      
      const color = isHighlighted ? styleConfig.accentColor : styleConfig.baseColor;
      
      let fontSize = isHighlighted 
        ? `${styleConfig.fontSize * styleConfig.accentFontSizeMultiplier}px` 
        : `${styleConfig.fontSize * styleConfig.baseFontSizeMultiplier}px`;
        
      let scaleMultiplier = 1;
      if (styleConfig.displayMode === 'karaoke') {
        fontSize = `${styleConfig.fontSize * styleConfig.baseFontSizeMultiplier}px`;
        // Scale is locked to 1 in karaoke mode to completely prevent overlapping text
        scaleMultiplier = 1;
      }
      
      const fontFamily = isHighlighted && styleConfig.enableHighlightFont 
        ? `"${styleConfig.highlightFont}", "Noto Sans Devanagari", "Noto Sans Arabic", "Noto Sans Bengali", "Noto Sans", sans-serif`
        : `"${styleConfig.font}", "Noto Sans Devanagari", "Noto Sans Arabic", "Noto Sans Bengali", "Noto Sans", sans-serif`;
      
      const fontWeight = isHighlighted && styleConfig.enableHighlightFont 
        ? (styleConfig.highlightFontWeight ?? 800)
        : (styleConfig.fontWeight ?? 800);

      const verticalMargin = ((styleConfig.lineSpacing ?? 1.1) - 1.1) * 0.5;
      const wordStyles: React.CSSProperties = { margin: `${verticalMargin}em 8px`, display: 'inline-block', whiteSpace: 'nowrap' };

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
                  fontFamily={fontFamily}
                  fontWeight={fontWeight as any}
                  durationInFrames={durationInFrames}
                  scaleMultiplier={scaleMultiplier}
                />
              );
            })}
          </span>
        );
      }

      let delay = 0;
      if (styleConfig.displayMode === 'word') {
        if (styleConfig.staggerSpeedMode === 'math') {
          let startCharIndex = 0;
          for (let i = 0; i < wIdx; i++) {
            startCharIndex += words[i].length;
          }
          delay = (startCharIndex / Math.max(1, totalChars)) * availableFramesForStagger;
        } else {
          delay = wIdx * staggerFrames;
        }
      } else if (styleConfig.displayMode === 'line') {
        delay = 0; // All text animates at once
      } else if (styleConfig.displayMode === 'karaoke') {
        delay = karaokeStartFrame; // Words animate in sequentially as they are highlighted
      }
      
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
            fontFamily={fontFamily}
            fontWeight={fontWeight as any}
            durationInFrames={durationInFrames}
            scaleMultiplier={scaleMultiplier}
            isFirstCaption={segment.startTime === 0}
            isRendering={isRendering}
          />
        </span>
      );
    });

    if (styleConfig.lineLayout === 'double' && elements.length > 1) {
      const half = Math.ceil(elements.length / 2);
      const line1 = elements.slice(0, half);
      const line2 = elements.slice(half);
      
      const align = styleConfig.textAlign === 'left' ? 'flex-start' : styleConfig.textAlign === 'right' ? 'flex-end' : 'center';

      return (
        <div style={{ display: 'flex', flexDirection: 'column', width: 'max-content', alignItems: align }}>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: align, alignItems: 'baseline' }}>
            {line1}
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: align, alignItems: 'baseline' }}>
            {line2}
          </div>
        </div>
      );
    }

    return elements;
  };

  const innerAngle = styleConfig.innerShadowAngle ?? 45;
  const innerDistance = styleConfig.innerShadowDistance ?? 15;
  const innerSoftness = styleConfig.innerShadowBlur ?? 20;
  const innerOpacity = styleConfig.innerShadowIntensity ?? 50;
  
  const innerShadowDistancePx = (innerDistance / 100) * 30;
  const innerShadowOffsetX = Math.cos((innerAngle * Math.PI) / 180) * innerShadowDistancePx;
  const innerShadowOffsetY = Math.sin((innerAngle * Math.PI) / 180) * innerShadowDistancePx;
  const innerShadowBlurPx = (innerSoftness / 100) * 40;
  const innerShadowAlpha = innerOpacity / 100;
  
  const innerShadowColorHex = styleConfig.innerShadowColor ?? '#000000';
  const innerRgbMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(innerShadowColorHex);
  const innerShadowRgb = innerRgbMatch 
    ? `${parseInt(innerRgbMatch[1], 16)}, ${parseInt(innerRgbMatch[2], 16)}, ${parseInt(innerRgbMatch[3], 16)}` 
    : '0, 0, 0';

  return (
    <div
      ref={containerRef}
      style={{
        width: styleConfig.lineLayout === 'single' ? '100%' : `${styleConfig.textBoxWidth ?? 96}%`,
        height: (styleConfig.clipText ?? false) ? `${styleConfig.textBoxHeight ?? 20}%` : 'auto',
        maxHeight: '90%', // Prevent overflowing the canvas vertically
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        justifyContent: styleConfig.textAlign === 'left' ? 'flex-start' : styleConfig.textAlign === 'right' ? 'flex-end' : 'center',
        alignItems: 'center',
        overflow: (styleConfig.clipText ?? false) ? 'hidden' : 'visible',
        border: showTextBoxBorder ? '2px dashed red' : 'none',
      }}
    >
      {styleConfig.enableInnerShadow !== false && (
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <filter id="inner-shadow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feOffset dx={innerShadowOffsetX} dy={innerShadowOffsetY}/>
            <feGaussianBlur stdDeviation={innerShadowBlurPx} result="offset-blur"/>
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
            <feFlood floodColor={`rgba(${innerShadowRgb}, ${innerShadowAlpha})`} floodOpacity="1" result="color"/>
            <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
            <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
          </filter>
        </svg>
      )}
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
          textAlign: styleConfig.textAlign ?? 'center',
          whiteSpace: (styleConfig.wrapText ?? true) && styleConfig.lineLayout !== 'single' ? 'normal' : 'nowrap',
          width: (styleConfig.highlightStyle === 'subtitle' || styleConfig.lineLayout === 'single' || styleConfig.lineLayout === 'double') ? 'max-content' : '100%',
          lineHeight: styleConfig.lineSpacing ?? 1.1,
          backgroundColor: styleConfig.highlightStyle === 'subtitle' ? (styleConfig.backgroundColor || '#000000') : 'transparent',
          padding: styleConfig.highlightStyle === 'subtitle' ? '0.2em 0.4em' : '0',
          borderRadius: styleConfig.highlightStyle === 'subtitle' ? '0.2em' : '0',
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
  fontFamily: string;
  fontWeight?: number;
  isFirstCaption?: boolean;
  isRendering?: boolean;
  durationInFrames: number;
  scaleMultiplier?: number;
}> = ({ char, frame, fps, delay, styleConfig, exitProgress, color, fontSize, isHighlighted, index, fontFamily, fontWeight, isFirstCaption, isRendering, durationInFrames, scaleMultiplier = 1 }) => {
  const defaultEntranceFrames = Math.round((300 / 1000) * fps); // 300ms
  const maxEntranceFrames = Math.max(1, durationInFrames - delay);
  const entranceDurationFrames = Math.min(defaultEntranceFrames, maxEntranceFrames);
  
  // Start animation after delay
  
  // Removed the pre-roll hack because it causes the first word of every caption to skip its animation during render.
  // The 1x1 pixel alpha hack in CaptionComposition should be sufficient to prevent DaVinci Resolve from blinking.
  const preRollFrames = 0;
  const relativeFrame = Math.max(0, frame - delay + preRollFrames);
  
  const entranceProgress = spring({ 
        frame: relativeFrame, 
        fps, 
        config: { damping: 12, stiffness: 100 }, 
        durationInFrames: entranceDurationFrames 
      });

  let translateX = 0;
  let translateY = 0;
  let scale = 1;
  let rotate = 0;
  let opacity = 1;
  
  const extraStyles: React.CSSProperties = {
    fontFamily,
    fontWeight,
  };
  const finalColor = color;
  
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

  if (styleConfig.animationType === 'none') {
    opacity = 1; // No fade in, no fade out
  } else if (styleConfig.animationType === 'slide-up') {
    translateY = interpolate(entranceProgress, [0, 1], [50, 0], { extrapolateLeft: 'clamp' }) + 
                 interpolate(exitProgress, [0, 1], [0, 50], { extrapolateLeft: 'clamp' });
    opacity = interpolate(entranceProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }) - 
              interpolate(exitProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  } else if (styleConfig.animationType === 'fade') {
    opacity = interpolate(entranceProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }) - 
              interpolate(exitProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  } else if (styleConfig.animationType === 'pop') {
    scale = spring({
      frame: relativeFrame,
      fps,
      config: { damping: 10, mass: 0.5 },
      durationInFrames: entranceDurationFrames,
    });
    translateY = interpolate(entranceProgress, [0, 1], [50, 0], { extrapolateLeft: 'clamp' });
    opacity = interpolate(entranceProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }) - 
              interpolate(exitProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  } else if (styleConfig.animationType === 'elastic-bounce') {
    scale = spring({
      frame: relativeFrame,
      fps,
      config: { damping: 5, mass: 1, stiffness: 200 },
      durationInFrames: entranceDurationFrames * 2,
    });
    translateY = interpolate(exitProgress, [0, 1], [0, 50], { extrapolateLeft: 'clamp' });
    opacity = interpolate(entranceProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }) - 
              interpolate(exitProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  } else if (styleConfig.animationType === 'kinetic-clash') {
    const direction = isHighlighted ? -1 : 1;
    const startX = direction * 300; 
    
    translateX = interpolate(entranceProgress, [0, 1], [startX, 0]) + interpolate(exitProgress, [0, 1], [0, startX * 1.5]);
    opacity = interpolate(entranceProgress, [0, 0.5, 1], [0, 1, 1]) - interpolate(exitProgress, [0, 1], [0, 1]);
    
    if (styleConfig.motionBlur) {
      const intensity = styleConfig.motionBlurIntensity ?? 15;
      const blurAmount = interpolate(entranceProgress, [0, 1], [intensity, 0]);
      const exitBlur = interpolate(exitProgress, [0, 1], [0, intensity]);
      const currentBlur = Math.max(blurAmount, exitBlur);
      if (currentBlur > 0) {
        if (extraStyles.filter) {
          extraStyles.filter += ` blur(${currentBlur}px)`;
        } else {
          extraStyles.filter = `blur(${currentBlur}px)`;
        }
      }
    }
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

  // Apply general motion blur if enabled
  if (styleConfig.motionBlur && styleConfig.animationType !== 'kinetic-clash') {
    const intensity = styleConfig.motionBlurIntensity ?? 15;
    const blurAmount = interpolate(entranceProgress, [0, 1], [intensity, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const exitBlur = interpolate(exitProgress, [0, 1], [0, intensity], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
    const currentBlur = Math.max(blurAmount, exitBlur);
    if (currentBlur > 0) {
      if (extraStyles.filter) {
        extraStyles.filter += ` blur(${currentBlur}px)`;
      } else {
        extraStyles.filter = `blur(${currentBlur}px)`;
      }
    }
  }

  // Kinetic clash handles its own extreme motion blur natively above, so we skip it here.

  // Calculate robust drop shadow
  const shadowOpacity = styleConfig.dropShadowIntensity ?? 50;
  const angle = styleConfig.dropShadowAngle ?? 45;
  const distance = styleConfig.dropShadowDistance ?? 15;
  const softness = styleConfig.dropShadowBlur ?? 20;

  // Convert distance percentage to actual pixel offset (max ~30px for extreme distance)
  const shadowDistance = (distance / 100) * 30;
  
  const shadowOffsetX = Math.cos((angle * Math.PI) / 180) * shadowDistance;
  const shadowOffsetY = Math.sin((angle * Math.PI) / 180) * shadowDistance;
  
  // Convert softness percentage to blur radius (max ~40px blur)
  const shadowBlur = (softness / 100) * 40;
  
  // Convert opacity percentage to alpha 0-1
  const shadowAlpha = shadowOpacity / 100;
  
  const shadowColorHex = styleConfig.dropShadowColor ?? '#000000';
  const rgbMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(shadowColorHex);
  const shadowRgb = rgbMatch 
    ? `${parseInt(rgbMatch[1], 16)}, ${parseInt(rgbMatch[2], 16)}, ${parseInt(rgbMatch[3], 16)}` 
    : '0, 0, 0';
  
  const applyDropShadow = styleConfig.enableDropShadow !== false &&
    ((isHighlighted && styleConfig.dropShadowOnHighlight !== false) ||
     (!isHighlighted && styleConfig.dropShadowOnBase !== false));

  if (styleConfig.highlightStyle !== 'subtitle' && applyDropShadow) {
    const dropShadowStr = `${shadowOffsetX.toFixed(1)}px ${shadowOffsetY.toFixed(1)}px ${shadowBlur}px rgba(${shadowRgb}, ${shadowAlpha})`;
    if (extraStyles.textShadow) {
      extraStyles.textShadow += `, ${dropShadowStr}`;
    } else {
      extraStyles.textShadow = dropShadowStr;
    }
  }

  const applyInnerShadow = styleConfig.enableInnerShadow !== false &&
    ((isHighlighted && styleConfig.innerShadowOnHighlight !== false) ||
     (!isHighlighted && styleConfig.innerShadowOnBase !== false));
     
  if (applyInnerShadow) {
    const innerShadowUrl = 'url(#inner-shadow-filter)';
    if (extraStyles.filter) {
      extraStyles.filter += ` ${innerShadowUrl}`;
    } else {
      extraStyles.filter = innerShadowUrl;
    }
  }

  return (
    <span
      style={{
        display: 'inline-block',
        opacity,
        transform: `translate(${translateX}px, ${translateY}px) scale(${scale * scaleMultiplier}) rotate(${rotate}deg)`,
        color: finalColor,
        fontSize,
        ...extraStyles,
      }}
    >
      {char}
    </span>
  );
};




