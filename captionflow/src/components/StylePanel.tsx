import React, { useState } from 'react';
import { useProjectStore, StyleConfig } from '@/store/useProjectStore';
import { PaintBucket, Type, ChevronDown, ChevronUp, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const AccordionItem = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden mb-2 bg-gray-900/50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-750 transition-colors"
      >
        <span className="font-semibold text-gray-200 text-sm">{title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-700 bg-gray-900/30 flex flex-col gap-5">
          {children}
        </div>
      )}
    </div>
  );
};

const PRESETS: { name: string; config: Partial<StyleConfig>; preview: React.ReactNode }[] = [
  {
    name: 'Classic Reels',
    config: {
      font: 'Montserrat', baseColor: '#ffffff', accentColor: '#FFD400', fontSize: 100, baseFontSizeMultiplier: 1.0, accentFontSizeMultiplier: 1.3
    },
    preview: (
      <span style={{ fontFamily: 'Montserrat', color: '#ffffff', fontSize: '12px', fontWeight: 800, textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
        CLASSIC <span style={{ color: '#FFD400' }}>REELS</span>
      </span>
    )
  },
  {
    name: 'Dynamic Pop',
    config: {
      font: 'Bebas Neue', baseColor: '#ffffff', accentColor: '#ccff00', fontSize: 120, baseFontSizeMultiplier: 0.35, accentFontSizeMultiplier: 1.0
    },
    preview: (
      <span style={{ fontFamily: '"Bebas Neue"', color: '#ffffff', fontSize: '14px', fontWeight: 800, textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
        <span style={{ fontSize: '0.5em' }}>DYNAMIC </span><span style={{ color: '#ccff00' }}>POP</span>
      </span>
    )
  },
  {
    name: 'Minimalist Type',
    config: {
      font: 'Inter', baseColor: '#cccccc', accentColor: '#ffffff', fontSize: 80, baseFontSizeMultiplier: 1.0, accentFontSizeMultiplier: 1.0
    },
    preview: (
      <span style={{ fontFamily: 'Inter', color: '#cccccc', fontSize: '12px', fontWeight: 800, textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
        MINIMALIST <span style={{ color: '#ffffff' }}>TYPE</span>
      </span>
    )
  },
  {
    name: 'Neon Bounce',
    config: {
      font: 'Oswald', baseColor: '#ffffff', accentColor: '#ff0055', fontSize: 90, baseFontSizeMultiplier: 1.0, accentFontSizeMultiplier: 1.5
    },
    preview: (
      <span style={{ fontFamily: 'Oswald', color: '#ffffff', fontSize: '11px', fontWeight: 800, textShadow: '0px 0px 4px #ff0055' }}>
        NEON <span style={{ color: '#ff0055', fontSize: '1.3em' }}>BOUNCE</span>
      </span>
    )
  },
  {
    name: 'Cinematic Fade',
    config: {
      font: 'Montserrat', baseColor: '#e0e0e0', accentColor: '#ffb703', fontSize: 60, baseFontSizeMultiplier: 1.0, accentFontSizeMultiplier: 1.2
    },
    preview: (
      <span style={{ fontFamily: 'Montserrat', color: '#e0e0e0', fontSize: '10px', fontWeight: 800, letterSpacing: '1px' }}>
        CINEMATIC <span style={{ color: '#ffb703' }}>FADE</span>
      </span>
    )
  },
  {
    name: 'Retro Type',
    config: {
      font: 'Oswald', baseColor: '#ff9900', accentColor: '#00ffcc', fontSize: 70, baseFontSizeMultiplier: 1.0, accentFontSizeMultiplier: 1.0
    },
    preview: (
      <span style={{ fontFamily: 'Oswald', color: '#ff9900', fontSize: '12px', fontWeight: 800, textShadow: '1px 1px 0px #000' }}>
        RETRO <span style={{ color: '#00ffcc' }}>TYPE</span>
      </span>
    )
  },
  {
    name: 'Vlog Stagger',
    config: {
      font: 'Inter', baseColor: '#ffffff', accentColor: '#ff3366', fontSize: 85, baseFontSizeMultiplier: 1.0, accentFontSizeMultiplier: 1.5
    },
    preview: (
      <span style={{ fontFamily: 'Inter', color: '#ffffff', fontSize: '11px', fontWeight: 800, textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
        VLOG <span style={{ color: '#ff3366', fontSize: '1.3em' }}>STAGGER</span>
      </span>
    )
  },
  {
    name: 'Aggressive Impact',
    config: {
      font: 'Bebas Neue', baseColor: '#cccccc', accentColor: '#ff0000', fontSize: 120, baseFontSizeMultiplier: 0.6, accentFontSizeMultiplier: 1.8
    },
    preview: (
      <span style={{ fontFamily: '"Bebas Neue"', color: '#cccccc', fontSize: '13px', fontWeight: 800, textShadow: '2px 2px 0px #000' }}>
        <span style={{ fontSize: '0.6em' }}>AGGRESSIVE </span><span style={{ color: '#ff0000', fontSize: '1.5em' }}>IMPACT</span>
      </span>
    )
  },
  {
    name: 'Clean Corporate',
    config: {
      font: 'Montserrat', baseColor: '#ffffff', accentColor: '#0066ff', fontSize: 50, baseFontSizeMultiplier: 1.0, accentFontSizeMultiplier: 1.0
    },
    preview: (
      <span style={{ fontFamily: 'Montserrat', color: '#ffffff', fontSize: '11px', fontWeight: 800, backgroundColor: '#0066ff', padding: '2px 4px', borderRadius: '4px' }}>
        CLEAN CORP
      </span>
    )
  },
  {
    name: 'The Hormozi',
    config: {
      font: 'Inter', baseColor: '#000000', accentColor: '#ff0000', fontSize: 140, baseFontSizeMultiplier: 0.4, accentFontSizeMultiplier: 1.2
    },
    preview: (
      <span style={{ fontFamily: 'Inter', color: '#000000', fontSize: '14px', fontWeight: 900, textShadow: '2px 2px 0px #ffffff, -1px -1px 0px #ffffff, 1px -1px 0px #ffffff, -1px 1px 0px #ffffff' }}>
        <span style={{ fontSize: '0.4em' }}>do what&apos;s </span><span style={{ color: '#ff0000', fontSize: '1.2em' }}>interesting</span><span style={{ fontSize: '0.4em', filter: 'blur(1px)' }}> to you</span>
      </span>
    )
  },
  {
    name: 'MrBeast Drop',
    config: {
      font: 'Oswald', baseColor: '#ffffff', accentColor: '#00ffff', fontSize: 160, baseFontSizeMultiplier: 0.8, accentFontSizeMultiplier: 1.2
    },
    preview: (
      <span style={{ fontFamily: 'Oswald', color: '#ffffff', fontSize: '15px', fontWeight: 900, textShadow: '3px 3px 0px #000000' }}>
        <span style={{ fontSize: '0.8em' }}>MRBEAST </span><span style={{ color: '#00ffff', fontSize: '1.2em' }}>DROP</span>
      </span>
    )
  },
  {
    name: 'Iman Wealth',
    config: {
      font: 'Montserrat', baseColor: '#ffffff', accentColor: '#ffd700', fontSize: 90, baseFontSizeMultiplier: 1.0, accentFontSizeMultiplier: 1.1
    },
    preview: (
      <span style={{ fontFamily: 'Montserrat', color: '#ffffff', fontSize: '12px', fontWeight: 700, textShadow: '0px 0px 10px rgba(255, 215, 0, 0.5)' }}>
        IMAN <span style={{ color: '#ffd700' }}>WEALTH</span>
      </span>
    )
  },
  {
    name: 'Ali Productivity',
    config: {
      font: 'Inter', baseColor: '#e0e0e0', accentColor: '#ffb703', fontSize: 110, baseFontSizeMultiplier: 0.9, accentFontSizeMultiplier: 1.1
    },
    preview: (
      <span style={{ fontFamily: 'Inter', color: '#e0e0e0', fontSize: '12px', fontWeight: 800, textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
        ALI <span style={{ color: '#ffb703' }}>PRODUCTIVITY</span>
      </span>
    )
  },
  {
    name: 'Devin Fast Pop',
    config: {
      font: 'Bebas Neue', baseColor: '#ffffff', accentColor: '#39ff14', fontSize: 170, baseFontSizeMultiplier: 0.6, accentFontSizeMultiplier: 1.2
    },
    preview: (
      <span style={{ fontFamily: '"Bebas Neue"', color: '#ffffff', fontSize: '16px', fontWeight: 900, textShadow: '2px 2px 0px #000000' }}>
        <span style={{ fontSize: '0.6em' }}>FAST </span><span style={{ color: '#39ff14', fontSize: '1.2em' }}>POP</span>
      </span>
    )
  },
  {
    name: 'The Kinetic',
    config: {
      font: 'Anton', baseColor: '#ffffff', accentColor: '#ff2a2a', fontSize: 150, baseFontSizeMultiplier: 0.8, accentFontSizeMultiplier: 1.5, animationType: 'kinetic-clash', displayMode: 'word', highlightStyle: 'none'
    },
    preview: (
      <span style={{ fontFamily: 'Anton', color: '#ffffff', fontSize: '15px', fontWeight: 900, fontStyle: 'italic', textShadow: '4px 0px 8px rgba(255,42,42,0.6)', transform: 'skewX(-10deg)', display: 'inline-block' }}>
        KINETIC <span style={{ color: '#ff2a2a' }}>CLASH</span>
      </span>
    )
  },
  {
    name: 'Absolute Chaos',
    config: {
      font: 'Impact', baseColor: '#e5e7eb', accentColor: '#a855f7', fontSize: 160, baseFontSizeMultiplier: 0.7, accentFontSizeMultiplier: 1.3, animationType: 'chaos-converge', displayMode: 'word', highlightStyle: 'glow'
    },
    preview: (
      <span style={{ fontFamily: 'Impact', color: '#e5e7eb', fontSize: '16px', fontWeight: 400, textShadow: '0px 0px 10px #a855f7', transform: 'rotate(-5deg)', display: 'inline-block' }}>
        <span style={{ display: 'inline-block', transform: 'rotate(10deg)' }}>ABSOLUTE</span> <span style={{ color: '#a855f7', display: 'inline-block', transform: 'rotate(-15deg)' }}>CHAOS</span>
      </span>
    )
  }
];

export const StylePanel = () => {
  const { 
    styleConfig: globalStyleConfig, 
    setStyleConfig, 
    individualStylingEnabled, 
    selectedCaptionId, 
    captions, 
    updateCaptionSegment 
  } = useProjectStore();

  const selectedCaption = selectedCaptionId ? captions.find(c => c.id === selectedCaptionId) : null;
  const isEditingIndividual = individualStylingEnabled && !!selectedCaption;

  // The active config to display in the UI
  const styleConfig = isEditingIndividual
    ? { ...globalStyleConfig, ...(selectedCaption!.customStyle || {}) }
    : globalStyleConfig;

  const handleUpdate = (updates: Partial<StyleConfig>) => {
    if (isEditingIndividual) {
      updateCaptionSegment(selectedCaptionId!, { 
        customStyle: { ...(selectedCaption!.customStyle || {}), ...updates } 
      });
    } else {
      setStyleConfig(updates);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700/50 flex flex-col">
      <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
        <PaintBucket className="w-5 h-5 text-indigo-400" />
        Design & Animations
      </h3>

      {isEditingIndividual ? (
        <div className="bg-indigo-600/20 border border-indigo-500/50 text-indigo-200 px-3 py-2 rounded-lg text-xs font-semibold mb-4 flex items-center justify-between">
          <span>Editing Individual Caption</span>
          <button 
            onClick={() => updateCaptionSegment(selectedCaptionId!, { customStyle: {} })}
            className="bg-indigo-500/30 hover:bg-indigo-500/50 px-2 py-1 rounded text-[10px] uppercase tracking-wider"
          >
            Reset
          </button>
        </div>
      ) : (
        <div className="bg-gray-700/30 text-gray-400 px-3 py-2 rounded-lg text-xs font-semibold mb-4 text-center">
          Editing Global Styles (All Captions)
        </div>
      )}

      <AccordionItem title="⚙️ Video Settings" defaultOpen={true}>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400 font-medium">Video Format</label>
          <div className="flex gap-2">
            {(['9:16', '16:9'] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => handleUpdate({ aspectRatio: ratio })}
                className={`flex-1 py-2 rounded-lg border text-sm transition-colors ${
                  styleConfig.aspectRatio === ratio
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {ratio === '9:16' ? 'Reels (9:16)' : 'YouTube (16:9)'}
              </button>
            ))}
          </div>
        </div>

      </AccordionItem>

      <AccordionItem title="✨ Quick Presets" defaultOpen={true}>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleUpdate(preset.config)}
              className="relative h-16 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden group hover:border-indigo-500 transition"
            >
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 group-hover:bg-gray-750 transition pb-4">
                {preset.preview}
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1 flex items-center justify-center backdrop-blur-sm border-t border-gray-700/50">
                <span className="text-[9px] font-medium text-gray-300 tracking-wider uppercase">{preset.name}</span>
              </div>
            </button>
          ))}
        </div>
      </AccordionItem>

      <AccordionItem title="📝 Typography & Colors" defaultOpen={true}>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400 font-medium flex items-center gap-1">
            <Type className="w-4 h-4" /> Font Family
          </label>
          <select 
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={styleConfig.font}
            onChange={(e) => handleUpdate({ font: e.target.value })}
          >
            <option value="Montserrat">Montserrat</option>
            <option value="Inter">Inter</option>
            <option value="Oswald">Oswald</option>
            <option value="Bebas Neue">Bebas Neue</option>
            <option value="Anton">Anton</option>
            <option value="Poppins">Poppins</option>
            <option value="Roboto">Roboto</option>
            <option value="Rubik">Rubik</option>
            <option value="Lato">Lato</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Nunito">Nunito</option>
            <option value="Raleway">Raleway</option>
            <option value="Playfair Display">Playfair Display</option>
            <option value="Impact">Impact</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
            <option value="Courier New">Courier New</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <label className="text-sm text-gray-400 font-medium">Text Alignment</label>
          <div className="flex gap-2">
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                onClick={() => handleUpdate({ textAlign: align })}
                className={`flex-1 flex justify-center items-center py-2 rounded-lg border transition-colors ${
                  styleConfig.textAlign === align
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
                title={`Align ${align}`}
              >
                {align === 'left' ? <AlignLeft className="w-4 h-4" /> : align === 'center' ? <AlignCenter className="w-4 h-4" /> : <AlignRight className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400 font-medium flex justify-between">
            <span>Base Font Size</span>
            <span className="text-indigo-400">{styleConfig.fontSize}px</span>
          </label>
          <input 
            type="range" 
            min="20" 
            max="200" 
            value={styleConfig.fontSize}
            onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400 font-medium flex justify-between">
            <span>Small Font Size Multiplier</span>
            <span className="text-indigo-400">{styleConfig.baseFontSizeMultiplier}x</span>
          </label>
          <input 
            type="range" 
            min="0.1" 
            max="2.0" 
            step="0.1"
            value={styleConfig.baseFontSizeMultiplier}
            onChange={(e) => handleUpdate({ baseFontSizeMultiplier: parseFloat(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400 font-medium flex justify-between">
            <span>Highlight Size Multiplier</span>
            <span className="text-indigo-400">{styleConfig.accentFontSizeMultiplier}x</span>
          </label>
          <input 
            type="range" 
            min="0.5" 
            max="4.0" 
            step="0.1"
            value={styleConfig.accentFontSizeMultiplier}
            onChange={(e) => handleUpdate({ accentFontSizeMultiplier: parseFloat(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-medium">Text Color</label>
            <input 
              type="color" 
              value={styleConfig.baseColor}
              onChange={(e) => handleUpdate({ baseColor: e.target.value })}
              className="w-full h-10 rounded-lg cursor-pointer bg-gray-900 border border-gray-700 p-1"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-medium">Highlight Color</label>
            <input 
              type="color" 
              value={styleConfig.accentColor}
              onChange={(e) => handleUpdate({ accentColor: e.target.value })}
              className="w-full h-10 rounded-lg cursor-pointer bg-gray-900 border border-gray-700 p-1"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-medium">Background Color</label>
            <input 
              type="color" 
              value={styleConfig.backgroundColor}
              onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
              className="w-full h-10 rounded-lg cursor-pointer bg-gray-900 border border-gray-700 p-1"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-700">
          <label className="text-sm text-gray-400 font-medium">Highlight Style</label>
          <div className="grid grid-cols-2 gap-2">
            {(['none', 'subtitle', 'glow', 'highlight'] as const).map((hStyle) => (
              <button
                key={hStyle}
                onClick={() => handleUpdate({ highlightStyle: hStyle })}
                className={`py-2 text-sm font-medium rounded-lg border transition-all ${
                  styleConfig.highlightStyle === hStyle
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {hStyle.charAt(0).toUpperCase() + hStyle.slice(1)}
              </button>
            ))}
          </div>
          {styleConfig.highlightStyle === 'glow' && (
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs text-gray-400 flex justify-between">
                <span>Glow Intensity</span>
                <span className="text-indigo-400">{styleConfig.glowIntensity ?? 3}</span>
              </label>
              <input 
                type="range" min="1" max="50" 
                value={styleConfig.glowIntensity ?? 3} 
                onChange={(e) => handleUpdate({ glowIntensity: parseInt(e.target.value) })} 
                className="w-full accent-indigo-500" 
              />
            </div>
          )}
        </div>
      </AccordionItem>

      <AccordionItem title="📐 Layout & Positioning">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400 font-medium">Lines per Caption</label>
          <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700">
            {(['auto', 'single', 'double'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => handleUpdate({ lineLayout: mode })}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  styleConfig.lineLayout === mode 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)} Line
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400 font-medium">Text Box Options</label>
          <div className="flex flex-col gap-2 bg-gray-900 p-3 rounded-lg border border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
              <input 
                type="checkbox" 
                checked={styleConfig.wrapText ?? true}
                onChange={(e) => handleUpdate({ wrapText: e.target.checked })}
                className="w-4 h-4 rounded accent-indigo-500 bg-gray-800 border-gray-600"
              />
              Wrap to Text Box
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
              <input 
                type="checkbox" 
                checked={styleConfig.clipText ?? false}
                onChange={(e) => handleUpdate({ clipText: e.target.checked })}
                className="w-4 h-4 rounded accent-indigo-500 bg-gray-800 border-gray-600"
              />
              Clip to Text Box
            </label>

            {(styleConfig.clipText || !(styleConfig.wrapText ?? true)) && (
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-700">
                <label className="text-xs text-gray-400 flex justify-between">
                  <span>Box Width</span>
                  <span>{styleConfig.textBoxWidth ?? 80}%</span>
                </label>
                <input 
                  type="range" min="10" max="100" 
                  value={styleConfig.textBoxWidth ?? 80} 
                  onChange={(e) => handleUpdate({ textBoxWidth: parseInt(e.target.value) })} 
                  className="w-full accent-indigo-500" 
                />

                {styleConfig.clipText && (
                  <>
                    <label className="text-xs text-gray-400 flex justify-between">
                      <span>Box Height</span>
                      <span>{styleConfig.textBoxHeight ?? 20}%</span>
                    </label>
                    <input 
                      type="range" min="5" max="100" 
                      value={styleConfig.textBoxHeight ?? 20} 
                      onChange={(e) => handleUpdate({ textBoxHeight: parseInt(e.target.value) })} 
                      className="w-full accent-indigo-500" 
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400 font-medium">Position on Screen</label>
          <select 
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={styleConfig.position}
            onChange={(e) => handleUpdate({ position: e.target.value as 'top'|'center'|'lower-third' })}
          >
            <option value="top">Top</option>
            <option value="center">Center</option>
            <option value="lower-third">Lower Third (Bottom)</option>
          </select>
        </div>
      </AccordionItem>

      <AccordionItem title="🎬 Animations">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400 font-medium">Stagger Mode (Speed)</label>
          <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700">
            {(['line', 'word', 'letter'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => handleUpdate({ displayMode: mode })}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  styleConfig.displayMode === mode 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400 font-medium">Entrance Animation</label>
          <div className="grid grid-cols-2 gap-2">
            {(['slide-up', 'pop', 'fade', 'typewriter', 'elastic-bounce', 'kinetic-clash', 'chaos-converge'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleUpdate({ animationType: type })}
                className={`py-2 rounded-lg border text-sm transition-colors ${
                  styleConfig.animationType === type
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {type === 'slide-up' ? 'Slide up' : 
                 type === 'pop' ? 'Pop' : 
                 type === 'fade' ? 'Fade' : 
                 type === 'elastic-bounce' ? 'Elastic Bounce' : 
                 type === 'kinetic-clash' ? 'Kinetic Clash' :
                 type === 'chaos-converge' ? 'Chaos Converge' : 'Typewriter'}
              </button>
            ))}
          </div>
        </div>
      </AccordionItem>

    </div>
  );
};
