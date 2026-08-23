import { PromoBanner } from './PromoBanner';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useProjectStore, StyleConfig, defaultStyle } from '@/store/useProjectStore';
import { PaintBucket, Type, ChevronDown, ChevronUp, AlignLeft, AlignCenter, AlignRight, Check, Trash2, Plus, Download, Upload, Square, RotateCcw, Sparkles, Film, Layout, Zap, Sliders, Layers } from 'lucide-react';

const AccordionItem = ({ title, icon, badge, children, isOpen, onToggle }: { title: string, icon?: React.ReactNode, badge?: string, children: React.ReactNode, isOpen: boolean, onToggle: () => void }) => {
  return (
    <div className={`border transition-all duration-200 rounded-xl mb-2.5 overflow-hidden ${isOpen ? 'border-blue-500/40 bg-[#18181c]/70 shadow-lg shadow-black/20' : 'border-[#2b2b34] bg-[#18181c]/40 hover:border-[#383844]'}`}>
      <button 
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-3.5 py-3 transition-colors ${isOpen ? 'bg-[#212126]/80 text-white' : 'bg-[#212126]/60 text-gray-300 hover:text-white hover:bg-[#212126]/40'}`}
      >
        <div className="flex items-center gap-2.5">
          {icon && <span className={isOpen ? 'text-blue-400' : 'text-gray-400'}>{icon}</span>}
          <span className="font-semibold text-sm tracking-wide">{title}</span>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {badge}
            </span>
          )}
        </div>
        <div className="p-1 rounded-md text-gray-400 hover:text-gray-200">
          {isOpen ? <ChevronUp className="w-4 h-4 text-blue-400" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {isOpen && (
        <div className="p-4 flex flex-col gap-4 border-t border-[#2b2b34]/80 bg-[#18181c]/40">
          {children}
        </div>
      )}
    </div>
  );
};

export const CustomCheckbox: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}> = ({ checked, onChange, label, className = '' }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2.5 cursor-pointer text-xs font-medium text-left transition-all select-none group py-0.5 ${className}`}
    >
      <div
        className={`w-4 h-4 rounded-[5px] flex items-center justify-center transition-all border shrink-0 ${
          checked
            ? 'bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-600/30'
            : 'bg-[#18181c] border-[#3e3e4c] text-transparent hover:border-[#525264] group-hover:bg-[#202026]'
        }`}
      >
        <Check className={`w-3 h-3 stroke-[3] transition-transform ${checked ? 'scale-100' : 'scale-0'}`} />
      </div>
      <span className={`transition-colors text-xs ${checked ? 'text-gray-200 font-semibold' : 'text-gray-400 group-hover:text-gray-300'}`}>
        {label}
      </span>
    </button>
  );
};

const CustomPreview = ({ config }: { config: Partial<StyleConfig> }) => {
  const font = config.font || 'Montserrat';
  const color = config.baseColor || '#ffffff';
  const accent = config.accentColor || '#FFD400';
  const glow = config.highlightStyle === 'glow' ? `0px 0px 8px ${accent}` : 'none';
  const bg = config.highlightStyle === 'subtitle' ? config.backgroundColor || '#000000' : 'transparent';
  return (
    <span style={{ fontFamily: `"${font}"`, color: color, fontSize: '11px', fontWeight: 800, textShadow: glow, backgroundColor: bg, padding: bg !== 'transparent' ? '2px 4px' : '0', borderRadius: '4px' }}>
      MY <span style={{ color: accent }}>STYLE</span>
    </span>
  );
};

const PRESETS: { name: string; config: Partial<StyleConfig>; preview: React.ReactNode }[] = [
  {
    name: '3-Way Focus',
    config: {
      font: 'Montserrat', baseColor: '#ffffff', accentColor: '#FFD400', fontSize: 130, baseFontSizeMultiplier: 0.7, accentFontSizeMultiplier: 1.2, animationType: '3-line-focus', displayMode: 'word', highlightStyle: 'none'
    },
    preview: (
      <span style={{ fontFamily: 'Montserrat', color: '#ffffff', fontSize: '12px', fontWeight: 800 }}>
        3-WAY <span style={{ color: '#FFD400', fontSize: '1.2em' }}>FOCUS</span>
      </span>
    )
  },

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
  },
  {
    name: 'Underline Pop',
    config: {
      font: 'Montserrat', baseColor: '#ffffff', accentColor: '#FFD400', backgroundColor: '#ff0000', fontSize: 130, baseFontSizeMultiplier: 0.9, accentFontSizeMultiplier: 1.1, animationType: 'pop', displayMode: 'word', highlightStyle: 'underline'
    },
    preview: (
      <span style={{ fontFamily: 'Montserrat', color: '#ffffff', fontSize: '13px', fontWeight: 800 }}>
        UNDERLINE <span style={{ color: '#FFD400', textDecoration: 'underline', textDecorationColor: '#ff0000', textDecorationThickness: '0.1em', textUnderlineOffset: '0.15em' }}>POP</span>
      </span>
    )
  },
  {
    name: 'Auto Highlight',
    config: {
      font: 'Montserrat', baseColor: '#ffffff', accentColor: '#ffffff', backgroundColor: '#ff0000', fontSize: 130, baseFontSizeMultiplier: 0.9, accentFontSizeMultiplier: 1.1, animationType: 'pop', displayMode: 'word', highlightStyle: 'highlight'
    },
    preview: (
      <span style={{ fontFamily: 'Montserrat', color: '#ffffff', fontSize: '13px', fontWeight: 800 }}>
        AUTO <span style={{ color: '#ffffff', backgroundColor: '#ff0000', padding: '0px 4px', borderRadius: '4px' }}>HIGHLIGHT</span>
      </span>
    )
  },
  {
    name: 'Karaoke Word',
    config: {
      font: 'Montserrat', baseColor: '#ffffff', accentColor: '#ffffff', backgroundColor: '#ffb703', fontSize: 130, baseFontSizeMultiplier: 1.0, accentFontSizeMultiplier: 1.1, animationType: 'none', displayMode: 'karaoke', highlightStyle: 'highlight'
    },
    preview: (
      <span style={{ fontFamily: 'Montserrat', color: '#ffffff', fontSize: '13px', fontWeight: 800 }}>
        KARAOKE <span style={{ color: '#ffffff', backgroundColor: '#ffb703', padding: '0px 4px', borderRadius: '4px' }}>WORD</span>
      </span>
    )
  },
  {
    name: 'Audio Sync',
    config: {
      font: 'Montserrat', baseColor: '#777777', accentColor: '#ffffff', backgroundColor: '#000000', fontSize: 130, baseFontSizeMultiplier: 1.0, accentFontSizeMultiplier: 1.0, animationType: 'none', displayMode: 'karaoke-cumulative', highlightStyle: 'none'
    },
    preview: (
      <span style={{ fontFamily: 'Montserrat', color: '#777777', fontSize: '13px', fontWeight: 800 }}>
        AUDIO <span style={{ color: '#ffffff' }}>SYNC</span>
      </span>
    )
  },
  {
    name: '3-Line Focus',
    config: {
      font: 'Montserrat', baseColor: '#ffffff', accentColor: '#38bdf8', backgroundColor: '#000000', fontSize: 130, baseFontSizeMultiplier: 0.7, accentFontSizeMultiplier: 1.0, animationType: '3-line-focus', displayMode: 'word', highlightStyle: 'glow', glowIntensity: 5, lineLayout: 'single'
    },
    preview: (
      <span style={{ fontFamily: 'Montserrat', color: '#ffffff', fontSize: '13px', fontWeight: 800, textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '9px', opacity: 0.8 }}>नेपाली</span>
        <span style={{ color: '#38bdf8', textShadow: '0 0 10px rgba(56,189,248,0.8)' }}>महिला तथा</span>
        <span style={{ fontSize: '9px', opacity: 0.8 }}>पुरुष</span>
      </span>
    )
  }
];

export interface FontGroup {
  family: string;
  weights: { label: string; value: number; fullName: string }[];
}

const CustomFontPicker = ({ fonts, value, onChange, isLoading }: { fonts: FontGroup[], value: string, onChange: (v: string) => void, isLoading: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [renderLimit, setRenderLimit] = useState(50);
  
  useEffect(() => {
    const handleClick = () => setIsOpen(false);
    if (isOpen) {
       document.addEventListener('click', handleClick);
       setRenderLimit(50);
    }
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen]);

  const filteredFonts = fonts.filter(f => f.family.toLowerCase().includes(search.toLowerCase()));

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      setRenderLimit(prev => Math.min(prev + 50, filteredFonts.length));
    }
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button 
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        className="w-full flex items-center justify-between bg-[#18181c] border border-[#2e2e38] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate">{value}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#18181c] border border-[#2e2e38] rounded-lg shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '300px' }}>
          <div className="p-2 border-b border-[#2e2e38] bg-[#212126]">
            <input 
              autoFocus
              className="w-full bg-[#18181c] text-white px-3 py-1.5 text-sm rounded border border-[#2e2e38] focus:outline-none focus:border-blue-500"
              placeholder="Search fonts..."
              value={search}
              onChange={e => { setSearch(e.target.value); setRenderLimit(50); }}
            />
          </div>
          <div className="overflow-y-auto flex-1" onScroll={handleScroll}>
            {isLoading && <div className="p-4 text-xs text-gray-400 text-center">Loading Fonts...</div>}
            
            {filteredFonts.slice(0, renderLimit).map((font) => (
                <button
                  key={font.family}
                  onClick={() => {
                    onChange(font.family);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-600/20 flex items-center justify-between border-b border-[#2e2e38]/50 last:border-b-0 transition-colors ${value === font.family ? 'bg-blue-600/30 text-white' : 'text-gray-300'}`}
                >
                  <span style={{ fontFamily: `"${font.family}", sans-serif`, fontSize: '16px' }}>{font.family}</span>
                  {value === font.family && <Check className="w-4 h-4 text-blue-400" />}
                </button>
            ))}

            {!isLoading && filteredFonts.length === 0 && (
              <div className="p-4 text-xs text-gray-400 text-center">No fonts found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CustomColorPicker = ({ 
  label, 
  value, 
  onChange, 
  savedColors, 
  onSave, 
  onRemove 
}: { 
  label: string, 
  value: string, 
  onChange: (c: string) => void, 
  savedColors: string[], 
  onSave: (c: string) => void, 
  onRemove: (c: string) => void 
}) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 min-h-[16px] mb-1">
        <label className="text-[10px] leading-tight text-gray-400 font-medium flex-1 truncate" title={label}>{label}</label>
        <button 
          onClick={() => onSave(value)}
          className="shrink-0 text-[12px] font-bold w-4 h-4 flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded border border-blue-500/30 transition leading-none cursor-pointer"
          title="Save this color to your palette"
        >
          +
        </button>
      </div>
      <input 
        type="color" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 rounded-lg cursor-pointer bg-[#18181c] border border-[#2e2e38] p-1"
      />
      {savedColors.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {savedColors.map((c, i) => (
            <div 
              key={`${c}-${i}`}
              onClick={() => onChange(c)}
              onContextMenu={(e) => { e.preventDefault(); onRemove(c); }}
              className="w-4 h-4 rounded-sm border border-gray-600 cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
              title={`${c} (Right-click to remove)`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const StylePanel = () => {
  const { 
    styleConfig: globalStyleConfig, 
    setStyleConfig, 
    individualStylingEnabled, 
    setIndividualStylingEnabled,
    selectedCaptionId, 
    setSelectedCaptionId, 
    setHighlightSimilar,
    captions, 
    setCaptions,
    updateCaptionSegment,
    customPresets,
    saveCustomPreset,
    deleteCustomPreset,
    importCustomPresets,
    showTextBoxBorder,
    setShowTextBoxBorder,
    customColors,
    addCustomColor,
    removeCustomColor
  } = useProjectStore();

  const handleExportPresets = () => {
    if (customPresets.length === 0) return;
    const dataStr = JSON.stringify(customPresets, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "auto-caps-presets.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportPresets = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          importCustomPresets(json);
          alert("Successfully imported presets!");
        } else {
          alert("Invalid preset file format.");
        }
      } catch (err) {
        alert("Failed to parse preset file.");
      }
    };
    reader.readAsText(file);
    // clear input value so the same file can be uploaded again if needed
    e.target.value = '';
  };

  const selectedCaption = selectedCaptionId ? captions.find(c => c.id === selectedCaptionId) : null;
  const isEditingIndividual = individualStylingEnabled && !!selectedCaption;

  // The active config to display in the UI
  const styleConfig = isEditingIndividual
    ? { ...globalStyleConfig, ...(selectedCaption!.customStyle || {}) }
    : globalStyleConfig;

  const [systemFonts, setSystemFonts] = useState<FontGroup[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('systemFontsCache');
      if (cached) {
        try { return JSON.parse(cached); } catch(e) {}
      }
    }
    return [];
  });
  const [isLoadingFonts, setIsLoadingFonts] = useState(systemFonts.length === 0);
  const [presetTab, setPresetTab] = useState<'system'|'custom'>('system');
  const [newPresetName, setNewPresetName] = useState('');
  const [openPanels, setOpenPanels] = useState<string[]>(["Ã°Å¸â€™Â¡ Layout"]);
  const [autoCollapsePanels, setAutoCollapsePanels] = useState(false);
  const [presetContextMenu, setPresetContextMenu] = useState<{x: number, y: number, presetName: string} | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAutoCollapsePanels(localStorage.getItem('autoCollapsePanels') === 'true');
    }
  }, []);

  useEffect(() => {
    const handleClick = () => setPresetContextMenu(null);
    if (presetContextMenu) {
      document.addEventListener('click', handleClick);
    }
    return () => document.removeEventListener('click', handleClick);
  }, [presetContextMenu]);
  
  const togglePanel = (panelName: string) => {
    if (autoCollapsePanels) {
      if (openPanels.includes(panelName)) {
        setOpenPanels([]);
      } else {
        setOpenPanels([panelName]);
      }
    } else {
      if (openPanels.includes(panelName)) {
        setOpenPanels(openPanels.filter(p => p !== panelName));
      } else {
        setOpenPanels([...openPanels, panelName]);
      }
    }
  };

  const handleToggleAutoCollapse = () => {
    const newVal = !autoCollapsePanels;
    setAutoCollapsePanels(newVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('autoCollapsePanels', newVal.toString());
    }
    if (newVal && openPanels.length > 1) {
      setOpenPanels([openPanels[0]]);
    }
  };

  useEffect(() => {
    fetch('/api/fonts')
      .then(res => res.json())
      .then(data => {
        if (data.fontsGrouped) {
          setSystemFonts(data.fontsGrouped);
          if (typeof window !== 'undefined') {
            localStorage.setItem('systemFontsCache', JSON.stringify(data.fontsGrouped));
          }
        }
        setIsLoadingFonts(false);
      })
      .catch(err => {
        console.error('Failed to auto-load system fonts:', err);
        setIsLoadingFonts(false);
      });
  }, []);

  const handleUpdate = (updates: Partial<StyleConfig>) => {
    if (isEditingIndividual) {
      updateCaptionSegment(selectedCaptionId!, { 
        customStyle: { ...(selectedCaption!.customStyle || {}), ...updates } 
      });
    } else {
      // If a setting is manually changed, detach from the active preset
      const newConfig = { ...updates };
      if (!('activePreset' in updates)) {
        newConfig.activePreset = undefined;
      }
      setStyleConfig(newConfig);
    }
  };

  return (
    <div className="bg-[#18181c]/90 rounded-2xl p-5 shadow-2xl border border-[#2b2b34] flex flex-col transform-gpu">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2b2b34]/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <PaintBucket className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">Design & Animations</h3>
            <span className="text-[10px] font-semibold text-blue-400/80 tracking-wider">Alok Video Editor</span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button 
            onClick={handleToggleAutoCollapse}
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all border ${
              autoCollapsePanels 
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300' 
                : 'bg-[#212126]/80 border-[#2e2e38] text-gray-400 hover:text-gray-200'
            }`}
            title="When ON, opening a panel automatically closes others"
          >
            Auto Collapse: {autoCollapsePanels ? 'ON' : 'OFF'}
          </button>
          <button 
            onClick={() => setShowResetModal(true)} 
            className="text-xs px-2.5 py-1 bg-[#212126] hover:bg-[#282830] hover:text-white border border-[#2e2e38] rounded-lg text-gray-300 transition font-medium"
            title="Reset Options"
          >
            Reset
          </button>
        </div>
      </div>

      {isEditingIndividual ? (
        <div className="bg-blue-600/20 border border-blue-500/50 text-blue-200 px-3.5 py-2 rounded-xl text-xs font-semibold mb-4 flex items-center justify-between shadow-sm">
          <span>Editing Individual Caption</span>
          <button 
            onClick={() => updateCaptionSegment(selectedCaptionId!, { customStyle: {} })}
            className="bg-blue-500/30 hover:bg-blue-500/50 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition"
          >
            Reset
          </button>
        </div>
      ) : (
        <div className="bg-[#212126]/40 border border-[#2b2b34] text-gray-400 px-3.5 py-2 rounded-xl text-xs font-semibold mb-4 text-center">
          Editing Global Styles (All Captions)
        </div>
      )}

      <PromoBanner className="mb-4" />

      <AccordionItem 
        title="Video Settings" 
        icon={<Film className="w-4 h-4" />} 
        badge={styleConfig.aspectRatio || '9:16'}
        isOpen={openPanels.includes("Video Settings")} 
        onToggle={() => togglePanel("Video Settings")}
      >
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Video Format</label>
          <div className="grid grid-cols-2 gap-2 bg-[#141416]/80 p-1.5 rounded-xl border border-[#2b2b34]">
            {(['9:16', '16:9'] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => handleUpdate({ aspectRatio: ratio })}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all text-center flex items-center justify-center gap-1.5 ${
                  styleConfig.aspectRatio === ratio
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-[#212126]/60'
                }`}
              >
                {ratio === '9:16' ? 'Reels / Shorts (9:16)' : 'YouTube (16:9)'}
              </button>
            ))}
          </div>
        </div>

      </AccordionItem>

      <AccordionItem 
        title="Quick Presets" 
        icon={<Sparkles className="w-4 h-4" />} 
        badge={styleConfig.activePreset}
        isOpen={openPanels.includes("Quick Presets")} 
        onToggle={() => togglePanel("Quick Presets")}
      >
        <div className="flex bg-[#141416]/80 p-1 rounded-xl border border-[#2b2b34] mb-3">
          <button
            onClick={() => setPresetTab('system')}
            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
              presetTab === 'system' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            System
          </button>
          <button
            onClick={() => setPresetTab('custom')}
            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
              presetTab === 'custom' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Custom
          </button>
        </div>

        {presetTab === 'system' ? (
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  const baseReset = {
                    animationType: 'slide-up' as const,
                    displayMode: 'line' as const,
                    highlightStyle: 'none' as const,
                    glowIntensity: 3,
                    activePreset: preset.name,
                    ...preset.config
                  };
                  handleUpdate(baseReset);
                }}
                className={`relative h-16 bg-[#18181c] border rounded-lg overflow-hidden group transition ${
                  styleConfig.activePreset === preset.name 
                    ? 'border-blue-500 ring-2 ring-blue-500' 
                    : 'border-[#2e2e38] hover:border-blue-500'
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-[#212126] group-hover:bg-[#282830] transition pb-4 pointer-events-none">
                  {preset.preview}
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-black/80 py-1.5 flex items-center justify-center  border-t border-[#2e2e38]/50 z-10">
                  <span className="text-[9px] font-bold text-gray-100 tracking-wider uppercase drop-shadow-md">{preset.name}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Name your current style..."
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="flex-1 min-w-0 bg-[#18181c] border border-[#2e2e38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => {
                  if (newPresetName.trim()) {
                    saveCustomPreset(newPresetName.trim(), globalStyleConfig);
                    setNewPresetName('');
                  }
                }}
                disabled={!newPresetName.trim()}
                className="shrink-0 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition"
              >
                <Plus className="w-4 h-4" /> Save
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExportPresets}
                disabled={customPresets.length === 0}
                className="flex-1 bg-[#212126] hover:bg-[#2e2e38] disabled:opacity-50 text-gray-300 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-[#2e2e38] transition"
                title="Export all Custom Presets to a file"
              >
                <Download className="w-3 h-3" /> Export Presets
              </button>
              
              <label className="flex-1 bg-[#212126] hover:bg-[#2e2e38] text-gray-300 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-[#2e2e38] transition cursor-pointer">
                <Upload className="w-3 h-3" /> Import Presets
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportPresets}
                />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {customPresets.length === 0 ? (
                <div className="col-span-3 text-center text-sm text-gray-500 py-4">No custom presets saved yet.</div>
              ) : (
                customPresets.map(preset => (
                  <div key={preset.name} className="relative group">
                    <button
                      onClick={() => handleUpdate({ ...preset.config, activePreset: preset.name })}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setPresetContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          presetName: preset.name
                        });
                      }}
                      className={`relative w-full h-16 bg-[#18181c] border rounded-lg overflow-hidden transition ${
                        styleConfig.activePreset === preset.name 
                          ? 'border-blue-500 ring-2 ring-blue-500' 
                          : 'border-[#2e2e38] hover:border-blue-500'
                      }`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center bg-[#212126] group-hover:bg-[#282830] transition pb-4 pointer-events-none">
                        <CustomPreview config={preset.config} />
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-black/80 py-1.5 flex items-center justify-center  border-t border-[#2e2e38]/50 z-10">
                        <span className="text-[9px] font-bold text-gray-100 tracking-wider uppercase drop-shadow-md truncate px-1">{preset.name}</span>
                      </div>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </AccordionItem>

      <AccordionItem 
        title="Typography & Colors" 
        icon={<Type className="w-4 h-4" />} 
        badge={styleConfig.font}
        isOpen={openPanels.includes("Typography & Colors")} 
        onToggle={() => togglePanel("Typography & Colors")}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-blue-400" /> Font Family
            </label>
            {isLoadingFonts && (
              <span className="text-[10px] uppercase font-bold text-gray-400">Loading Fonts...</span>
            )}
          </div>
          <CustomFontPicker 
            fonts={systemFonts}
            value={styleConfig.font}
            onChange={(v) => {
               // When font changes, try to find a matching weight or fallback to 400 or the first one
               const fontGroup = systemFonts.find(f => f.family === v);
               let newWeight = styleConfig.fontWeight;
               if (fontGroup && fontGroup.weights.length > 0) {
                 if (!fontGroup.weights.find(w => w.value === newWeight)) {
                   // Preferred fallback sequence: 400 -> first available
                   newWeight = fontGroup.weights.find(w => w.value === 400)?.value || fontGroup.weights[0].value;
                 }
               }
               
               const updates: any = { font: v, fontWeight: newWeight };
               if (!styleConfig.enableHighlightFont) {
                 updates.highlightFont = v;
                 updates.highlightFontWeight = newWeight;
               }
               handleUpdate(updates);
            }}
            isLoading={isLoadingFonts}
          />
          {(() => {
            const currentFont = systemFonts.find(f => f.family === styleConfig.font);
            const availableWeights = currentFont ? currentFont.weights : [];
            
            if (availableWeights.length > 0) {
              return (
                <div className="mt-2">
                  <select
                    value={styleConfig.fontWeight || 800}
                    onChange={(e) => {
                      const newWeight = parseInt(e.target.value, 10);
                      const updates: any = { fontWeight: newWeight };
                      if (!styleConfig.enableHighlightFont) {
                        updates.highlightFontWeight = newWeight;
                      }
                      handleUpdate(updates);
                    }}
                    className="w-full bg-[#141416]/80 border border-[#2b2b34] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
                  >
                    {availableWeights.map(w => (
                      <option key={w.value} value={w.value}>{w.label} ({w.value})</option>
                    ))}
                  </select>
                </div>
              );
            }
            return null;
          })()}
        </div>

        <div className="flex flex-col gap-2 mt-1 pt-3 border-t border-[#2b2b34]">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between items-center">
            <span>Separate Highlight Font</span>
            <button
              onClick={() => handleUpdate({ enableHighlightFont: !styleConfig.enableHighlightFont })}
              className={`w-9 h-5 rounded-full relative transition-colors ${styleConfig.enableHighlightFont ? 'bg-blue-500' : 'bg-gray-700'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${styleConfig.enableHighlightFont ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </label>
          
          {styleConfig.enableHighlightFont && (
            <div className="mt-2 bg-[#141416]/80 p-3 rounded-xl border border-[#2b2b34]">
              <label className="text-[11px] text-gray-400 mb-2 block font-medium">Highlight Font Family</label>
              <CustomFontPicker 
                fonts={systemFonts}
                value={styleConfig.highlightFont}
                onChange={(v) => {
                   const fontGroup = systemFonts.find(f => f.family === v);
                   let newWeight = styleConfig.highlightFontWeight;
                   if (fontGroup && fontGroup.weights.length > 0) {
                     if (!fontGroup.weights.find(w => w.value === newWeight)) {
                       newWeight = fontGroup.weights.find(w => w.value === 400)?.value || fontGroup.weights[0].value;
                     }
                   }
                   handleUpdate({ highlightFont: v, highlightFontWeight: newWeight });
                }}
                isLoading={isLoadingFonts}
              />
              {(() => {
                const currentFont = systemFonts.find(f => f.family === styleConfig.highlightFont);
                const availableWeights = currentFont ? currentFont.weights : [];
                
                if (availableWeights.length > 0) {
                  return (
                    <div className="mt-2">
                      <select
                        value={styleConfig.highlightFontWeight || 800}
                        onChange={(e) => handleUpdate({ highlightFontWeight: parseInt(e.target.value, 10) })}
                        className="w-full bg-[#141416] border border-[#2b2b34] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
                      >
                        {availableWeights.map(w => (
                          <option key={w.value} value={w.value}>{w.label} ({w.value})</option>
                        ))}
                      </select>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Text Alignment</label>
          <div className="grid grid-cols-3 gap-1.5 bg-[#141416]/80 p-1.5 rounded-xl border border-[#2b2b34]">
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                onClick={() => handleUpdate({ textAlign: align })}
                className={`py-2 flex justify-center items-center rounded-lg transition-all ${
                  styleConfig.textAlign === align
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-[#212126]/60'
                }`}
                title={`Align ${align}`}
              >
                {align === 'left' ? <AlignLeft className="w-4 h-4" /> : align === 'center' ? <AlignCenter className="w-4 h-4" /> : <AlignRight className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between items-center">
            <span>Base Font Size</span>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-mono text-xs">{styleConfig.fontSize}px</span>
              <button onClick={() => handleUpdate({ fontSize: defaultStyle.fontSize })} className="text-gray-500 hover:text-white" title="Reset to default">
                <RotateCcw size={12} />
              </button>
            </div>
          </label>
          <input 
            type="range" 
            min="20" 
            max="200" 
            value={styleConfig.fontSize}
            onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between items-center">
            <span>Small Font Size Multiplier</span>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-mono text-xs">{styleConfig.baseFontSizeMultiplier}x</span>
              <button onClick={() => handleUpdate({ baseFontSizeMultiplier: defaultStyle.baseFontSizeMultiplier })} className="text-gray-500 hover:text-white" title="Reset to default">
                <RotateCcw size={12} />
              </button>
            </div>
          </label>
          <input 
            type="range" 
            min="0.1" 
            max="2.0" 
            step="0.1"
            value={styleConfig.baseFontSizeMultiplier}
            onChange={(e) => handleUpdate({ baseFontSizeMultiplier: parseFloat(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between items-center">
            <span>Highlight Size Multiplier</span>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-mono text-xs">{styleConfig.accentFontSizeMultiplier}x</span>
              <button onClick={() => handleUpdate({ accentFontSizeMultiplier: defaultStyle.accentFontSizeMultiplier })} className="text-gray-500 hover:text-white" title="Reset to default">
                <RotateCcw size={12} />
              </button>
            </div>
          </label>
          <input 
            type="range" 
            min="0.5" 
            max="4.0" 
            step="0.1"
            value={styleConfig.accentFontSizeMultiplier}
            onChange={(e) => handleUpdate({ accentFontSizeMultiplier: parseFloat(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between items-center">
            <span>Line Spacing</span>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-mono text-xs">{styleConfig.lineSpacing ?? 1.1}</span>
              <button onClick={() => handleUpdate({ lineSpacing: defaultStyle.lineSpacing ?? 1.1 })} className="text-gray-500 hover:text-white" title="Reset to default">
                <RotateCcw size={12} />
              </button>
            </div>
          </label>
          <input 
            type="range" 
            min="0.5" 
            max="3.0" 
            step="0.1"
            value={styleConfig.lineSpacing ?? 1.1}
            onChange={(e) => handleUpdate({ lineSpacing: parseFloat(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between items-center">
            <span>Word Spacing</span>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-mono text-xs">{styleConfig.wordSpacing ?? 8}px</span>
              <button onClick={() => handleUpdate({ wordSpacing: defaultStyle.wordSpacing ?? 8 })} className="text-gray-500 hover:text-white" title="Reset to default">
                <RotateCcw size={12} />
              </button>
            </div>
          </label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="1"
            value={styleConfig.wordSpacing ?? 8}
            onChange={(e) => handleUpdate({ wordSpacing: parseInt(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 mt-2">
          <CustomColorPicker 
            label="Text Color"
            value={styleConfig.baseColor}
            onChange={(c) => handleUpdate({ baseColor: c })}
            savedColors={customColors}
            onSave={addCustomColor}
            onRemove={removeCustomColor}
          />
          <CustomColorPicker 
            label="Highlight Text"
            value={styleConfig.accentColor}
            onChange={(c) => handleUpdate({ accentColor: c })}
            savedColors={customColors}
            onSave={addCustomColor}
            onRemove={removeCustomColor}
          />
          <CustomColorPicker 
            label={styleConfig.highlightStyle === 'underline' ? 'Underline' : 'Highlight Box'}
            value={styleConfig.backgroundColor}
            onChange={(c) => handleUpdate({ backgroundColor: c })}
            savedColors={customColors}
            onSave={addCustomColor}
            onRemove={removeCustomColor}
          />
        </div>

        <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-[#2b2b34]">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Highlight Style</label>
          <div className="grid grid-cols-3 gap-1.5 bg-[#141416]/80 p-1.5 rounded-xl border border-[#2b2b34]">
            {(['none', 'subtitle', 'glow', 'highlight', 'underline', 'gradient'] as const).map((hStyle) => (
              <button
                key={hStyle}
                onClick={() => handleUpdate({ highlightStyle: hStyle })}
                className={`py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                  styleConfig.highlightStyle === hStyle
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-[#212126]/60'
                }`}
              >
                {hStyle.charAt(0).toUpperCase() + hStyle.slice(1)}
              </button>
            ))}
          </div>
          {styleConfig.highlightStyle === 'gradient' && (
            <div className="flex flex-col gap-3 mt-3 p-3 bg-[#212126] rounded-lg border border-[#2e2e38]">
              <label className="text-sm font-bold text-gray-300">Gradient Settings</label>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Type</label>
                <div className="flex gap-2">
                  <button onClick={() => handleUpdate({ gradientType: 'linear' })} className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${styleConfig.gradientType !== 'radial' ? 'bg-blue-600 text-white shadow' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Linear</button>
                  <button onClick={() => handleUpdate({ gradientType: 'radial' })} className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${styleConfig.gradientType === 'radial' ? 'bg-blue-600 text-white shadow' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Radial</button>
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <label className="text-xs text-gray-400">Color Count</label>
                <div className="flex gap-2">
                  <button onClick={() => handleUpdate({ gradientColorCount: 2 })} className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${styleConfig.gradientColorCount === 2 ? 'bg-blue-600 text-white shadow' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>2 Colors</button>
                  <button onClick={() => handleUpdate({ gradientColorCount: 4 })} className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${styleConfig.gradientColorCount !== 2 ? 'bg-blue-600 text-white shadow' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>4 Colors</button>
                </div>
              </div>

              {styleConfig.gradientType === 'radial' ? (
                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-xs text-gray-400">Radial Center</label>
                  <select 
                    value={styleConfig.gradientRadialCenter || 'center'} 
                    onChange={(e) => handleUpdate({ gradientRadialCenter: e.target.value })}
                    className="w-full bg-[#18181c] border border-[#2e2e38] rounded p-1.5 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="center">Center</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>
              ) : (
                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-xs text-gray-400">Direction</label>
                  <select 
                    value={styleConfig.gradientDirection || '90deg'} 
                    onChange={(e) => handleUpdate({ gradientDirection: e.target.value })}
                    className="w-full bg-[#18181c] border border-[#2e2e38] rounded p-1.5 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="90deg">Left to Right</option>
                    <option value="180deg">Top to Bottom</option>
                    <option value="135deg">Diagonal Down</option>
                    <option value="45deg">Diagonal Up</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1 mt-2">
                <label className="text-xs text-gray-400 flex justify-between items-center">
                  <span>Gradient Spread</span>
                  <span className="text-blue-400">{styleConfig.gradientSpread ?? 100}%</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={styleConfig.gradientSpread ?? 100}
                  onChange={(e) => handleUpdate({ gradientSpread: parseInt(e.target.value) })}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <label className="text-xs text-gray-400 flex justify-between items-center">
                  <span>Gradient Softness</span>
                  <span className="text-blue-400">{styleConfig.gradientSoftness ?? 100}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={styleConfig.gradientSoftness ?? 100}
                  onChange={(e) => handleUpdate({ gradientSoftness: parseInt(e.target.value) })}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <label className="text-xs text-gray-400">Gradient Colors</label>
                <div className={`grid gap-2 ${styleConfig.gradientColorCount === 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
                  {[0, 1, 2, 3].slice(0, styleConfig.gradientColorCount === 2 ? 2 : 4).map((index) => (
                    <CustomColorPicker
                      key={index}
                      label={`Color #${index + 1}`}
                      value={(styleConfig.textGradientColors || ['#8B5CF6', '#F0ABFC', '#8B5CF6', '#F0ABFC'])[index] || '#ffffff'}
                      onChange={(c) => {
                        const newColors = [...(styleConfig.textGradientColors || ['#8B5CF6', '#F0ABFC', '#8B5CF6', '#F0ABFC'])];
                        newColors[index] = c;
                        handleUpdate({ textGradientColors: newColors });
                      }}
                      savedColors={customColors}
                      onSave={addCustomColor}
                      onRemove={removeCustomColor}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          {styleConfig.highlightStyle === 'glow' && (
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs text-gray-400 flex justify-between items-center">
                <span>Glow Intensity</span>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">{styleConfig.glowIntensity ?? 3}</span>
                  <button onClick={() => handleUpdate({ glowIntensity: defaultStyle.glowIntensity ?? 3 })} className="text-gray-500 hover:text-white" title="Reset to default">
                    <RotateCcw size={12} />
                  </button>
                </div>
              </label>
              <input 
                type="range" min="1" max="50" 
                value={styleConfig.glowIntensity ?? 3} 
                onChange={(e) => handleUpdate({ glowIntensity: parseInt(e.target.value) })} 
                className="w-full accent-blue-500" 
              />
            </div>
          )}
        </div>
      </AccordionItem>

      <AccordionItem 
        title="Layout & Positioning" 
        icon={<Layout className="w-4 h-4" />} 
        badge={styleConfig.position ? styleConfig.position.charAt(0).toUpperCase() + styleConfig.position.slice(1) : undefined}
        isOpen={openPanels.includes("Layout & Positioning")} 
        onToggle={() => togglePanel("Layout & Positioning")}
      >
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Lines per Caption</label>
          <div className="grid grid-cols-3 gap-1.5 bg-[#141416]/80 p-1.5 rounded-xl border border-[#2b2b34]">
            {(['auto', 'single', 'double'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => handleUpdate({ lineLayout: mode })}
                className={`py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                  styleConfig.lineLayout === mode 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                    : 'text-gray-400 hover:text-white hover:bg-[#212126]/60'
                }`}
              >
                {mode === 'auto' ? 'Auto Line' : mode === 'single' ? 'Single Line' : 'Double Line'}
              </button>
            ))}
          </div>
        </div>

        {styleConfig.lineLayout !== 'single' && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Text Box Options</label>
              <button 
                onClick={() => setShowTextBoxBorder(!showTextBoxBorder)}
                className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 border transition-colors ${showTextBoxBorder ? 'bg-red-900/50 text-red-400 border-red-700/50 hover:bg-red-800/50' : 'bg-[#212126]/80 text-gray-400 border-[#2e2e38] hover:text-gray-200 hover:bg-[#2e2e38]'}`}
                title="Toggle preview border"
              >
                <Square className="w-3 h-3" /> {showTextBoxBorder ? 'Hide Border' : 'Show Border'}
              </button>
            </div>
            <div className="flex flex-col gap-2.5 bg-[#141416]/80 p-3.5 rounded-xl border border-[#2b2b34]">
              <CustomCheckbox
                checked={styleConfig.wrapText ?? true}
                onChange={(c) => handleUpdate({ wrapText: c })}
                label="Wrap to Text Box"
              />

              {(styleConfig.wrapText ?? true) && (
                <div className="flex flex-col gap-3 mt-2 pt-3 border-t border-[#2b2b34]">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 flex justify-between items-center">
                      <span>Box Width</span>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400 font-mono text-xs">{styleConfig.textBoxWidth ?? 96}%</span>
                        <button onClick={() => handleUpdate({ textBoxWidth: defaultStyle.textBoxWidth ?? 96 })} className="text-gray-500 hover:text-white" title="Reset to default">
                          <RotateCcw size={12} />
                        </button>
                      </div>
                    </label>
                    <input 
                      type="range" min="10" max="100" 
                      value={styleConfig.textBoxWidth ?? 96} 
                      onChange={(e) => handleUpdate({ textBoxWidth: parseInt(e.target.value) })} 
                      className="w-full accent-blue-500" 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Position on Screen</label>
          <div className="grid grid-cols-3 gap-1.5 bg-[#141416]/80 p-1.5 rounded-xl border border-[#2b2b34]">
            {(['top', 'center', 'lower-third'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => handleUpdate({ position: pos })}
                className={`py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                  styleConfig.position === pos
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-[#212126]/60'
                }`}
              >
                {pos === 'top' ? 'Top' : pos === 'center' ? 'Center' : 'Bottom'}
              </button>
            ))}
          </div>
        </div>
      </AccordionItem>

      <AccordionItem 
        title="Animations" 
        icon={<Zap className="w-4 h-4" />} 
        badge={styleConfig.animationType !== 'none' ? (styleConfig.animationType === '3-line-focus' ? '3-Way Focus' : styleConfig.animationType) : undefined}
        isOpen={openPanels.includes("Animations")} 
        onToggle={() => togglePanel("Animations")}
      >
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Stagger Mode (Speed)</label>
          <div className="grid grid-cols-3 gap-1.5 bg-[#141416]/80 p-1.5 rounded-xl border border-[#2b2b34]">
            {(['line', 'word', 'letter'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => handleUpdate({ displayMode: mode })}
                className={`py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                  styleConfig.displayMode === mode
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-[#212126]/60'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
            {(['karaoke', 'karaoke-cumulative'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  handleUpdate({ displayMode: mode, staggerSpeedMode: 'math' });
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                  mode === 'karaoke' ? 'col-span-1' : 'col-span-2'
                } ${
                  styleConfig.displayMode === mode
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-[#212126]/60'
                }`}
              >
                {mode === 'karaoke-cumulative' ? 'Karaoke+ (Sync)' : 'Karaoke'}
              </button>
            ))}
          </div>

          {styleConfig.displayMode !== 'line' && (
            <div className="mt-2 flex flex-col gap-1.5">
              <label className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Stagger Speed Profile</label>
              <div className="grid grid-cols-3 gap-1.5 bg-[#141416]/80 p-1.5 rounded-xl border border-[#2b2b34]">
                {[
                  { id: 'auto', label: 'Auto Fast', desc: 'Default fast speed' },
                  { id: 'timecode', label: 'Timecode', desc: 'Stretch to caption duration' },
                  { id: 'math', label: 'Audio Sync', desc: 'Natural word length sync' }
                ].map((p) => {
                  const isKaraoke = styleConfig.displayMode === 'karaoke' || styleConfig.displayMode === 'karaoke-cumulative';
                  const disabled = isKaraoke && p.id !== 'math';
                  const active = (styleConfig.staggerSpeedMode ?? 'auto') === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleUpdate({ staggerSpeedMode: p.id as any })}
                      disabled={disabled}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                        active
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : disabled
                          ? 'text-gray-600 opacity-40 cursor-not-allowed'
                          : 'text-gray-400 hover:text-white hover:bg-[#212126]/60'
                      }`}
                      title={p.desc}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {styleConfig.displayMode === 'karaoke' && (
            <div className="mt-2 flex flex-col gap-1.5">
              <label className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Karaoke Color Fade</label>
              <div className="grid grid-cols-2 gap-1.5 bg-[#141416]/80 p-1.5 rounded-xl border border-[#2b2b34]">
                {[
                  { id: 'in-out', label: 'Fade In & Out' },
                  { id: 'in', label: 'Fade In Only' },
                  { id: 'out', label: 'Fade Out Only' },
                  { id: 'none', label: 'No Fade (Snap)' }
                ].map((fade) => (
                  <button
                    key={fade.id}
                    onClick={() => handleUpdate({ colorFadeType: fade.id as any })}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                      (styleConfig.colorFadeType ?? 'in-out') === fade.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white hover:bg-[#212126]/60'
                    }`}
                  >
                    {fade.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-[#2b2b34]">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Entrance Animation</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'none', label: 'None' },
              { id: 'slide-up', label: 'Slide Up' },
              { id: 'pop', label: 'Pop' },
              { id: 'fade', label: 'Fade' },
              { id: 'typewriter', label: 'Typewriter' },
              { id: 'elastic-bounce', label: 'Elastic' },
              { id: 'kinetic-clash', label: 'Kinetic' },
              { id: 'chaos-converge', label: 'Chaos' },
              { id: '3-line-focus', label: '3-Way Focus' },
            ].map((anim) => (
              <button
                key={anim.id}
                onClick={() => handleUpdate({ animationType: anim.id as any })}
                className={`py-2 px-1.5 rounded-xl text-xs font-semibold transition-all border text-center flex items-center justify-center ${
                  styleConfig.animationType === anim.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-[#141416]/80 border-[#2b2b34] text-gray-400 hover:border-[#2e2e38] hover:text-white hover:bg-[#212126]'
                }`}
              >
                {anim.label}
              </button>
            ))}
          </div>
          
          {styleConfig.animationType === '3-line-focus' && (
            <div className="flex flex-col gap-3 mt-3 p-3 bg-[#18181c]/50 rounded-lg border border-[#2e2e38]">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">3-Way Focus Layout</span>
              
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-500">Top Line (Past)</label>
                <div className="flex gap-1">
                  {(['left', 'center', 'right'] as const).map(align => (
                    <button
                      key={align}
                      onClick={() => handleUpdate({ focusPastAlignment: align })}
                      className={`flex-1 py-1 text-xs font-medium rounded transition-all ${
                        (styleConfig.focusPastAlignment || 'center') === align
                          ? 'bg-gray-700 text-white shadow'
                          : 'bg-[#212126] text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-500">Middle Line (Current)</label>
                <div className="flex gap-1">
                  {(['left', 'center', 'right'] as const).map(align => (
                    <button
                      key={align}
                      onClick={() => handleUpdate({ focusCurrentAlignment: align })}
                      className={`flex-1 py-1 text-xs font-medium rounded transition-all ${
                        (styleConfig.focusCurrentAlignment || 'center') === align
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-[#212126] text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-500">Bottom Line (Future)</label>
                <div className="flex gap-1">
                  {(['left', 'center', 'right'] as const).map(align => (
                    <button
                      key={align}
                      onClick={() => handleUpdate({ focusFutureAlignment: align })}
                      className={`flex-1 py-1 text-xs font-medium rounded transition-all ${
                        (styleConfig.focusFutureAlignment || 'center') === align
                          ? 'bg-gray-700 text-white shadow'
                          : 'bg-[#212126] text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-[#2b2b34]">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Motion Blur</label>
          <div className="grid grid-cols-2 gap-1.5 bg-[#141416]/80 p-1.5 rounded-xl border border-[#2b2b34]">
            <button
              onClick={() => handleUpdate({ motionBlur: false })}
              className={`py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                !styleConfig.motionBlur
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : 'text-gray-400 hover:text-white hover:bg-[#212126]/60'
              }`}
            >
              Off
            </button>
            <button
              onClick={() => handleUpdate({ motionBlur: true })}
              className={`py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                styleConfig.motionBlur
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : 'text-gray-400 hover:text-white hover:bg-[#212126]/60'
              }`}
            >
              On
            </button>
          </div>
          {styleConfig.motionBlur && (
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Intensity</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-blue-400">{styleConfig.motionBlurIntensity ?? 15}px</span>
                  <button onClick={() => handleUpdate({ motionBlurIntensity: defaultStyle.motionBlurIntensity ?? 15 })} className="text-gray-500 hover:text-white" title="Reset to default">
                    <RotateCcw size={12} />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={styleConfig.motionBlurIntensity ?? 15}
                onChange={(e) => handleUpdate({ motionBlurIntensity: parseFloat(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-[#2b2b34]">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Text Drop Shadow</label>
          <div className="grid grid-cols-2 gap-1.5 bg-[#141416]/80 p-1.5 rounded-xl border border-[#2b2b34]">
            <button
              onClick={() => handleUpdate({ enableDropShadow: false })}
              className={`py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                styleConfig.enableDropShadow === false
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : 'text-gray-400 hover:text-white hover:bg-[#212126]/60'
              }`}
            >
              Off
            </button>
            <button
              onClick={() => handleUpdate({ enableDropShadow: true })}
              className={`py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                styleConfig.enableDropShadow !== false
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : 'text-gray-400 hover:text-white hover:bg-[#212126]/60'
              }`}
            >
              On
            </button>
          </div>
          {styleConfig.enableDropShadow !== false && (
            <div className="mt-2 flex flex-col gap-3">
              <div className="flex flex-col gap-2.5 bg-[#141416]/80 p-3.5 rounded-xl border border-[#2b2b34]">
                <CustomCheckbox
                  checked={styleConfig.dropShadowOnBase !== false}
                  onChange={(c) => handleUpdate({ dropShadowOnBase: c })}
                  label="Apply to Normal Text"
                />
                <CustomCheckbox
                  checked={styleConfig.dropShadowOnHighlight !== false}
                  onChange={(c) => handleUpdate({ dropShadowOnHighlight: c })}
                  label="Apply to Highlighted Text"
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Shadow Opacity</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-400">{styleConfig.dropShadowIntensity ?? 50}%</span>
                    <button onClick={() => handleUpdate({ dropShadowIntensity: defaultStyle.dropShadowIntensity ?? 50 })} className="text-gray-500 hover:text-white" title="Reset to default">
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={styleConfig.dropShadowIntensity ?? 50}
                  onChange={(e) => handleUpdate({ dropShadowIntensity: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Shadow Angle</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-400">{styleConfig.dropShadowAngle ?? 45}&deg;</span>
                    <button onClick={() => handleUpdate({ dropShadowAngle: defaultStyle.dropShadowAngle ?? 45 })} className="text-gray-500 hover:text-white" title="Reset to default">
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={styleConfig.dropShadowAngle ?? 45}
                  onChange={(e) => handleUpdate({ dropShadowAngle: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Shadow Distance</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-400">{styleConfig.dropShadowDistance ?? 15}%</span>
                    <button onClick={() => handleUpdate({ dropShadowDistance: defaultStyle.dropShadowDistance ?? 15 })} className="text-gray-500 hover:text-white" title="Reset to default">
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={styleConfig.dropShadowDistance ?? 15}
                  onChange={(e) => handleUpdate({ dropShadowDistance: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Shadow Softness</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-400">{styleConfig.dropShadowBlur ?? 20}%</span>
                    <button onClick={() => handleUpdate({ dropShadowBlur: defaultStyle.dropShadowBlur ?? 20 })} className="text-gray-500 hover:text-white" title="Reset to default">
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={styleConfig.dropShadowBlur ?? 20}
                  onChange={(e) => handleUpdate({ dropShadowBlur: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <CustomColorPicker 
                label="Shadow Color"
                value={styleConfig.dropShadowColor ?? '#000000'}
                onChange={(c) => handleUpdate({ dropShadowColor: c })}
                savedColors={customColors}
                onSave={addCustomColor}
                onRemove={removeCustomColor}
              />
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-[#2b2b34]">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Text Inner Shadow</label>
          <div className="grid grid-cols-2 gap-1.5 bg-[#141416]/80 p-1.5 rounded-xl border border-[#2b2b34]">
            <button
              onClick={() => handleUpdate({ enableInnerShadow: false })}
              className={`py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                styleConfig.enableInnerShadow === false
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : 'text-gray-400 hover:text-white hover:bg-[#212126]/60'
              }`}
            >
              Off
            </button>
            <button
              onClick={() => handleUpdate({ enableInnerShadow: true })}
              className={`py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                styleConfig.enableInnerShadow !== false
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : 'text-gray-400 hover:text-white hover:bg-[#212126]/60'
              }`}
            >
              On
            </button>
          </div>
          {styleConfig.enableInnerShadow !== false && (
            <div className="mt-2 flex flex-col gap-3">
              <div className="flex flex-col gap-2.5 bg-[#141416]/80 p-3.5 rounded-xl border border-[#2b2b34]">
                <CustomCheckbox
                  checked={styleConfig.innerShadowOnBase !== false}
                  onChange={(c) => handleUpdate({ innerShadowOnBase: c })}
                  label="Apply to Normal Text"
                />
                <CustomCheckbox
                  checked={styleConfig.innerShadowOnHighlight !== false}
                  onChange={(c) => handleUpdate({ innerShadowOnHighlight: c })}
                  label="Apply to Highlighted Text"
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Shadow Opacity</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{styleConfig.innerShadowIntensity ?? 50}%</span>
                    <button onClick={() => handleUpdate({ innerShadowIntensity: defaultStyle.innerShadowIntensity ?? 50 })} className="text-gray-500 hover:text-white" title="Reset to default">
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={styleConfig.innerShadowIntensity ?? 50}
                  onChange={(e) => handleUpdate({ innerShadowIntensity: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Shadow Angle</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{styleConfig.innerShadowAngle ?? 45}&deg;</span>
                    <button onClick={() => handleUpdate({ innerShadowAngle: defaultStyle.innerShadowAngle ?? 45 })} className="text-gray-500 hover:text-white" title="Reset to default">
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={styleConfig.innerShadowAngle ?? 45}
                  onChange={(e) => handleUpdate({ innerShadowAngle: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Shadow Distance</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{styleConfig.innerShadowDistance ?? 15}%</span>
                    <button onClick={() => handleUpdate({ innerShadowDistance: defaultStyle.innerShadowDistance ?? 15 })} className="text-gray-500 hover:text-white" title="Reset to default">
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={styleConfig.innerShadowDistance ?? 15}
                  onChange={(e) => handleUpdate({ innerShadowDistance: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Shadow Softness</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{styleConfig.innerShadowBlur ?? 20}%</span>
                    <button onClick={() => handleUpdate({ innerShadowBlur: defaultStyle.innerShadowBlur ?? 20 })} className="text-gray-500 hover:text-white" title="Reset to default">
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={styleConfig.innerShadowBlur ?? 20}
                  onChange={(e) => handleUpdate({ innerShadowBlur: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <CustomColorPicker 
                label="Shadow Color"
                value={styleConfig.innerShadowColor ?? '#000000'}
                onChange={(c) => handleUpdate({ innerShadowColor: c })}
                savedColors={customColors}
                onSave={addCustomColor}
                onRemove={removeCustomColor}
              />
            </div>
          )}
        </div>
      </AccordionItem>

      {presetContextMenu && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed z-[9999] bg-[#212126] border border-[#2e2e38] rounded shadow-2xl py-1 w-48"
          style={{ top: presetContextMenu.y, left: presetContextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-[#2e2e38] text-xs font-bold text-gray-300 truncate">
            {presetContextMenu.presetName}
          </div>
          <button 
            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/30 flex items-center gap-2 transition"
            onClick={() => {
              if (confirm(`Delete preset "${presetContextMenu.presetName}"?`)) {
                deleteCustomPreset(presetContextMenu.presetName);
              }
              setPresetContextMenu(null);
            }}
          >
            <Trash2 className="w-4 h-4" /> Delete Preset
          </button>
        </div>,
        document.body
      )}
  
      {showResetModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowResetModal(false)}>
          <div className="bg-[#212126] border border-[#2e2e38] p-5 rounded-xl max-w-sm w-full shadow-2xl flex flex-col gap-3" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-100 text-lg mb-1">Reset Options</h3>
            <p className="text-sm text-gray-400 mb-2">What would you like to reset?</p>
            
            <button 
              className="w-full text-left p-3 rounded-lg bg-[#18181c] border border-[#2e2e38] hover:bg-[#2e2e38] transition flex flex-col gap-1"
              onClick={() => {
                setStyleConfig(defaultStyle);
                setShowResetModal(false);
              }}
            >
              <span className="text-gray-200 font-bold text-sm">Design & Animations</span>
              <span className="text-gray-500 text-xs">Reset global fonts, colors, and animations to default.</span>
            </button>
            <button 
              className="w-full text-left p-3 rounded-lg bg-[#18181c] border border-[#2e2e38] hover:bg-[#2e2e38] transition flex flex-col gap-1"
              onClick={() => {
                setStyleConfig({
                  ...styleConfig,
                  font: defaultStyle.font,
                  fontWeight: defaultStyle.fontWeight,
                  highlightFont: defaultStyle.highlightFont,
                  highlightFontWeight: defaultStyle.highlightFontWeight
                });
                setShowResetModal(false);
              }}
            >
              <span className="text-gray-200 font-bold text-sm">Fonts Only</span>
              <span className="text-gray-500 text-xs">Reset base and highlight fonts to plugin defaults.</span>
            </button>


            <button 
              className="w-full text-left p-3 rounded-lg bg-[#18181c] border border-[#2e2e38] hover:bg-[#2e2e38] transition flex flex-col gap-1"
              onClick={() => {
                setCaptions(captions.map(c => ({ 
                  ...c, 
                  customStyle: undefined, 
                  highlightedWords: c.originalHighlightedWords ? [...c.originalHighlightedWords] : [], 
                  highlightedIndices: c.originalHighlightedIndices ? [...c.originalHighlightedIndices] : [] 
                })));
                setIndividualStylingEnabled(false);
                setSelectedCaptionId(null);
                setHighlightSimilar(false);
                setShowResetModal(false);
              }}
            >
              <span className="text-gray-200 font-bold text-sm">Captions Only</span>
              <span className="text-gray-500 text-xs">Clear manual word highlights and individual caption edits.</span>
            </button>

            <button 
              className="w-full text-left p-3 rounded-lg bg-red-900/30 border border-red-800/50 hover:bg-red-900/50 transition flex flex-col gap-1"
              onClick={() => {
                setStyleConfig(defaultStyle);
                setCaptions(captions.map(c => ({ 
                  ...c, 
                  customStyle: undefined, 
                  highlightedWords: c.originalHighlightedWords ? [...c.originalHighlightedWords] : [], 
                  highlightedIndices: c.originalHighlightedIndices ? [...c.originalHighlightedIndices] : [] 
                })));
                setIndividualStylingEnabled(false);
                setSelectedCaptionId(null);
                setHighlightSimilar(false);
                setShowResetModal(false);
              }}
            >
              <span className="text-red-300 font-bold text-sm">Reset Everything</span>
              <span className="text-red-400/70 text-xs">Reset global style and all individual captions to default.</span>
            </button>

            <button 
              className="mt-2 w-full p-2 text-center text-sm font-medium text-gray-400 hover:text-white transition"
              onClick={() => setShowResetModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Preload the first 50 fonts to prevent lag when opening the font dropdown */}
      <div style={{ position: 'fixed', opacity: 0, pointerEvents: 'none', zIndex: -1, width: '1px', height: '1px', overflow: 'hidden' }}>
        {systemFonts.slice(0, 50).map(font => (
          <span key={font.family} style={{ fontFamily: `"${font.family}", sans-serif` }}>preload</span>
        ))}
      </div>
    </div>
  );
};






