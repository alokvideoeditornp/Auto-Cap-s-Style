import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useProjectStore, StyleConfig, defaultStyle } from '@/store/useProjectStore';
import { PaintBucket, Type, ChevronDown, ChevronUp, AlignLeft, AlignCenter, AlignRight, Check, Trash2, Plus, Download, Upload, Square } from 'lucide-react';

const AccordionItem = ({ title, children, isOpen, onToggle }: { title: string, children: React.ReactNode, isOpen: boolean, onToggle: () => void }) => {
  return (
    <div className="border border-gray-700 rounded-lg mb-2 bg-gray-900/50">
      <button 
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-750 transition-colors ${isOpen ? 'rounded-t-lg' : 'rounded-lg'}`}
      >
        <span className="font-semibold text-gray-200 text-sm">{title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-700 bg-gray-900/30 flex flex-col gap-5 rounded-b-lg">
          {children}
        </div>
      )}
    </div>
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
        className="w-full flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <span className="truncate">{value}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '300px' }}>
          <div className="p-2 border-b border-gray-700 bg-gray-800">
            <input 
              autoFocus
              className="w-full bg-gray-900 text-white px-3 py-1.5 text-sm rounded border border-gray-700 focus:outline-none focus:border-indigo-500"
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
                  className={`w-full text-left px-4 py-3 hover:bg-indigo-600/20 flex items-center justify-between border-b border-gray-700/50 last:border-b-0 transition-colors ${value === font.family ? 'bg-indigo-600/30 text-white' : 'text-gray-300'}`}
                >
                  <span style={{ fontFamily: `"${font.family}", sans-serif`, fontSize: '16px' }}>{font.family}</span>
                  {value === font.family && <Check className="w-4 h-4 text-indigo-400" />}
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
          className="shrink-0 text-[12px] font-bold w-4 h-4 flex items-center justify-center bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 rounded border border-indigo-500/30 transition leading-none cursor-pointer"
          title="Save this color to your palette"
        >
          +
        </button>
      </div>
      <input 
        type="color" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 rounded-lg cursor-pointer bg-gray-900 border border-gray-700 p-1"
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
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700/50 flex flex-col transform-gpu">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <PaintBucket className="w-5 h-5 text-indigo-400" />
          Design & Animations
        </h3>
        <div className="flex gap-2 items-center">
          <button 
            onClick={handleToggleAutoCollapse}
            className={`text-[10px] px-2 py-1 rounded transition border ${autoCollapsePanels ? 'bg-indigo-900/40 border-indigo-500/50 text-indigo-300' : 'bg-gray-700/50 border-gray-600/50 text-gray-400 hover:text-gray-200'}`}
            title="When ON, opening a panel automatically closes others"
          >
            Auto Collapse: {autoCollapsePanels ? 'ON' : 'OFF'}
          </button>
          <button 
            onClick={() => setShowResetModal(true)} 
            className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-200 transition font-medium"
            title="Reset Options"
          >
            Reset
          </button>
        </div>
      </div>

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

      <AccordionItem title="Video Settings" isOpen={openPanels.includes("Video Settings")} onToggle={() => togglePanel("Video Settings")}>
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

      <AccordionItem title="Quick Presets" isOpen={openPanels.includes("Quick Presets")} onToggle={() => togglePanel("Quick Presets")}>
        <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700 mb-2">
          <button
            onClick={() => setPresetTab('system')}
            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
              presetTab === 'system' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            System
          </button>
          <button
            onClick={() => setPresetTab('custom')}
            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
              presetTab === 'custom' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'
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
                className={`relative h-16 bg-gray-900 border rounded-lg overflow-hidden group transition ${
                  styleConfig.activePreset === preset.name 
                    ? 'border-indigo-500 ring-2 ring-indigo-500' 
                    : 'border-gray-700 hover:border-indigo-500'
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 group-hover:bg-gray-750 transition pb-4 pointer-events-none">
                  {preset.preview}
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-black/80 py-1.5 flex items-center justify-center  border-t border-gray-700/50 z-10">
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
                className="flex-1 min-w-0 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => {
                  if (newPresetName.trim()) {
                    saveCustomPreset(newPresetName.trim(), globalStyleConfig);
                    setNewPresetName('');
                  }
                }}
                disabled={!newPresetName.trim()}
                className="shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition"
              >
                <Plus className="w-4 h-4" /> Save
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExportPresets}
                disabled={customPresets.length === 0}
                className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-gray-700 transition"
                title="Export all Custom Presets to a file"
              >
                <Download className="w-3 h-3" /> Export Presets
              </button>
              
              <label className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-gray-700 transition cursor-pointer">
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
                      className={`relative w-full h-16 bg-gray-900 border rounded-lg overflow-hidden transition ${
                        styleConfig.activePreset === preset.name 
                          ? 'border-indigo-500 ring-2 ring-indigo-500' 
                          : 'border-gray-700 hover:border-indigo-500'
                      }`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800 group-hover:bg-gray-750 transition pb-4 pointer-events-none">
                        <CustomPreview config={preset.config} />
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-black/80 py-1.5 flex items-center justify-center  border-t border-gray-700/50 z-10">
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

      <AccordionItem title="Typography & Colors" isOpen={openPanels.includes("Typography & Colors")} onToggle={() => togglePanel("Typography & Colors")}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400 font-medium flex items-center gap-1">
              <Type className="w-4 h-4" /> Font Family
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
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200"
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

        <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-700">
          <label className="text-sm text-gray-400 font-medium flex justify-between items-center">
            <span>Separate Highlight Font</span>
            <button
              onClick={() => handleUpdate({ enableHighlightFont: !styleConfig.enableHighlightFont })}
              className={`w-10 h-5 rounded-full relative transition-colors ${styleConfig.enableHighlightFont ? 'bg-indigo-500' : 'bg-gray-700'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${styleConfig.enableHighlightFont ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </label>
          
          {styleConfig.enableHighlightFont && (
            <div className="mt-2 bg-gray-900/50 p-3 rounded-lg border border-gray-700">
              <label className="text-xs text-gray-400 mb-2 block">Highlight Font Family</label>
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
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200"
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

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400 font-medium flex justify-between">
            <span>Line Spacing</span>
            <span className="text-indigo-400">{styleConfig.lineSpacing ?? 1.1}</span>
          </label>
          <input 
            type="range" 
            min="0.5" 
            max="3.0" 
            step="0.1"
            value={styleConfig.lineSpacing ?? 1.1}
            onChange={(e) => handleUpdate({ lineSpacing: parseFloat(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </div>


        <div className="grid grid-cols-3 gap-4 mt-2">
          <CustomColorPicker 
            label="Text Color"
            value={styleConfig.baseColor}
            onChange={(c) => handleUpdate({ baseColor: c })}
            savedColors={customColors}
            onSave={addCustomColor}
            onRemove={removeCustomColor}
          />
          <CustomColorPicker 
            label="Highlighted Text Color"
            value={styleConfig.accentColor}
            onChange={(c) => handleUpdate({ accentColor: c })}
            savedColors={customColors}
            onSave={addCustomColor}
            onRemove={removeCustomColor}
          />
          <CustomColorPicker 
            label={styleConfig.highlightStyle === 'underline' ? 'Underline Color' : 'Highlight Box Color'}
            value={styleConfig.backgroundColor}
            onChange={(c) => handleUpdate({ backgroundColor: c })}
            savedColors={customColors}
            onSave={addCustomColor}
            onRemove={removeCustomColor}
          />
        </div>

        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-700">
          <label className="text-sm text-gray-400 font-medium">Highlight Style</label>
          <div className="grid grid-cols-2 gap-2">
            {(['none', 'subtitle', 'glow', 'highlight', 'underline'] as const).map((hStyle) => (
              <button
                key={hStyle}
                onClick={() => handleUpdate({ highlightStyle: hStyle })}
                className={`py-2 text-sm font-medium rounded-lg border transition-all ${hStyle === 'underline' ? 'col-span-2' : ''} ${
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

      <AccordionItem title="Layout & Positioning" isOpen={openPanels.includes("Layout & Positioning")} onToggle={() => togglePanel("Layout & Positioning")}>
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
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-400 font-medium">Text Box Options</label>
            <button 
              onClick={() => setShowTextBoxBorder(!showTextBoxBorder)}
              className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 border transition-colors ${showTextBoxBorder ? 'bg-red-900/50 text-red-400 border-red-700/50 hover:bg-red-800/50' : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-gray-200 hover:bg-gray-700'}`}
              title="Toggle preview border"
            >
              <Square className="w-3 h-3" /> {showTextBoxBorder ? 'Hide Border' : 'Show Border'}
            </button>
          </div>
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

            {(styleConfig.clipText || (styleConfig.wrapText ?? true)) && (
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-700">
                <label className="text-xs text-gray-400 flex justify-between">
                  <span>Box Width</span>
                  <span>{styleConfig.textBoxWidth ?? 96}%</span>
                </label>
                <input 
                  type="range" min="10" max="100" 
                  value={styleConfig.textBoxWidth ?? 96} 
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

      <AccordionItem title="Animations" isOpen={openPanels.includes("Animations")} onToggle={() => togglePanel("Animations")}>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400 font-medium">Stagger Mode (Speed)</label>
          <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700">
            {(['line', 'word', 'letter', 'karaoke'] as const).map((mode) => (
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
          {styleConfig.displayMode !== 'line' && (
            <div className="mt-2">
              <label className="text-xs text-gray-500 font-medium mb-1 block">Stagger Speed Profile</label>
              <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700">
                <button
                  onClick={() => handleUpdate({ staggerSpeedMode: 'auto' })}
                  className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                    (styleConfig.staggerSpeedMode ?? 'auto') === 'auto'
                      ? 'bg-gray-700 text-white shadow' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                  title="Default fast speed"
                >
                  Auto Fast
                </button>
                <button
                  onClick={() => handleUpdate({ staggerSpeedMode: 'timecode' })}
                  className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                    styleConfig.staggerSpeedMode === 'timecode'
                      ? 'bg-gray-700 text-white shadow' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                  title="Stretch perfectly to caption timecode"
                >
                  Match Timecode
                </button>
                <button
                  onClick={() => handleUpdate({ staggerSpeedMode: 'math' })}
                  className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                    (styleConfig.staggerSpeedMode ?? 'auto') === 'math'
                      ? 'bg-gray-700 text-white shadow' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                  title="Natural voice sync based on word length"
                >
                  Audio Sync
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400 font-medium">Entrance Animation</label>
          <div className="grid grid-cols-2 gap-2">
            {(['none', 'slide-up', 'pop', 'fade', 'typewriter', 'elastic-bounce', 'kinetic-clash', 'chaos-converge'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleUpdate({ animationType: type })}
                className={`py-2 rounded-lg border text-sm transition-colors ${
                  styleConfig.animationType === type
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {type === 'none' ? 'None' :
                 type === 'slide-up' ? 'Slide up' : 
                 type === 'pop' ? 'Pop' : 
                 type === 'fade' ? 'Fade' : 
                 type === 'elastic-bounce' ? 'Elastic Bounce' : 
                 type === 'kinetic-clash' ? 'Kinetic Clash' :
                 type === 'chaos-converge' ? 'Chaos Converge' : 'Typewriter'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-700">
          <label className="text-sm text-gray-400 font-medium">Motion Blur</label>
          <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700">
            <button
              onClick={() => handleUpdate({ motionBlur: false })}
              className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                !styleConfig.motionBlur
                  ? 'bg-gray-700 text-white shadow' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Off
            </button>
            <button
              onClick={() => handleUpdate({ motionBlur: true })}
              className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                styleConfig.motionBlur
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              On
            </button>
          </div>
          {styleConfig.motionBlur && (
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Intensity</span>
                <span className="font-mono">{styleConfig.motionBlurIntensity ?? 15}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={styleConfig.motionBlurIntensity ?? 15}
                onChange={(e) => handleUpdate({ motionBlurIntensity: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-700">
          <label className="text-sm text-gray-400 font-medium">Text Drop Shadow</label>
          <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700">
            <button
              onClick={() => handleUpdate({ enableDropShadow: false })}
              className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                styleConfig.enableDropShadow === false
                  ? 'bg-gray-700 text-white shadow' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Off
            </button>
            <button
              onClick={() => handleUpdate({ enableDropShadow: true })}
              className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                styleConfig.enableDropShadow !== false
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              On
            </button>
          </div>
          {styleConfig.enableDropShadow !== false && (
            <div className="mt-2 flex flex-col gap-3">
              <div className="flex flex-col gap-2 bg-gray-900/50 p-2 rounded-lg border border-gray-700/50">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={styleConfig.dropShadowOnBase !== false}
                    onChange={(e) => handleUpdate({ dropShadowOnBase: e.target.checked })}
                    className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-indigo-500 focus:ring-indigo-500"
                  />
                  Apply to Normal Text
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={styleConfig.dropShadowOnHighlight !== false}
                    onChange={(e) => handleUpdate({ dropShadowOnHighlight: e.target.checked })}
                    className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-indigo-500 focus:ring-indigo-500"
                  />
                  Apply to Highlighted Text
                </label>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Shadow Opacity</span>
                  <span className="font-mono">{styleConfig.dropShadowIntensity ?? 50}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={styleConfig.dropShadowIntensity ?? 50}
                  onChange={(e) => handleUpdate({ dropShadowIntensity: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Shadow Angle</span>
                  <span className="font-mono">{styleConfig.dropShadowAngle ?? 45}&deg;</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={styleConfig.dropShadowAngle ?? 45}
                  onChange={(e) => handleUpdate({ dropShadowAngle: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Shadow Distance</span>
                  <span className="font-mono">{styleConfig.dropShadowDistance ?? 15}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={styleConfig.dropShadowDistance ?? 15}
                  onChange={(e) => handleUpdate({ dropShadowDistance: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Shadow Softness</span>
                  <span className="font-mono">{styleConfig.dropShadowBlur ?? 20}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={styleConfig.dropShadowBlur ?? 20}
                  onChange={(e) => handleUpdate({ dropShadowBlur: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
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
        
        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-700">
          <label className="text-sm text-gray-400 font-medium">Text Inner Shadow</label>
          <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-700">
            <button
              onClick={() => handleUpdate({ enableInnerShadow: false })}
              className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                styleConfig.enableInnerShadow === false
                  ? 'bg-gray-700 text-white shadow' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Off
            </button>
            <button
              onClick={() => handleUpdate({ enableInnerShadow: true })}
              className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                styleConfig.enableInnerShadow !== false
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              On
            </button>
          </div>
          {styleConfig.enableInnerShadow !== false && (
            <div className="mt-2 flex flex-col gap-3">
              <div className="flex flex-col gap-2 bg-gray-900/50 p-2 rounded-lg border border-gray-700/50">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={styleConfig.innerShadowOnBase !== false}
                    onChange={(e) => handleUpdate({ innerShadowOnBase: e.target.checked })}
                    className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-indigo-500 focus:ring-indigo-500"
                  />
                  Apply to Normal Text
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={styleConfig.innerShadowOnHighlight !== false}
                    onChange={(e) => handleUpdate({ innerShadowOnHighlight: e.target.checked })}
                    className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-indigo-500 focus:ring-indigo-500"
                  />
                  Apply to Highlighted Text
                </label>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Shadow Opacity</span>
                  <span className="font-mono">{styleConfig.innerShadowIntensity ?? 50}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={styleConfig.innerShadowIntensity ?? 50}
                  onChange={(e) => handleUpdate({ innerShadowIntensity: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Shadow Angle</span>
                  <span className="font-mono">{styleConfig.innerShadowAngle ?? 45}&deg;</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={styleConfig.innerShadowAngle ?? 45}
                  onChange={(e) => handleUpdate({ innerShadowAngle: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Shadow Distance</span>
                  <span className="font-mono">{styleConfig.innerShadowDistance ?? 15}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={styleConfig.innerShadowDistance ?? 15}
                  onChange={(e) => handleUpdate({ innerShadowDistance: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Shadow Softness</span>
                  <span className="font-mono">{styleConfig.innerShadowBlur ?? 20}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={styleConfig.innerShadowBlur ?? 20}
                  onChange={(e) => handleUpdate({ innerShadowBlur: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
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
          className="fixed z-[9999] bg-gray-800 border border-gray-700 rounded shadow-2xl py-1 w-48"
          style={{ top: presetContextMenu.y, left: presetContextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-gray-700 text-xs font-bold text-gray-300 truncate">
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
          <div className="bg-gray-800 border border-gray-700 p-5 rounded-xl max-w-sm w-full shadow-2xl flex flex-col gap-3" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-100 text-lg mb-1">Reset Options</h3>
            <p className="text-sm text-gray-400 mb-2">What would you like to reset?</p>
            
            <button 
              className="w-full text-left p-3 rounded-lg bg-gray-900 border border-gray-700 hover:bg-gray-700 transition flex flex-col gap-1"
              onClick={() => {
                setStyleConfig(defaultStyle);
                setShowResetModal(false);
              }}
            >
              <span className="text-gray-200 font-bold text-sm">Design & Animations</span>
              <span className="text-gray-500 text-xs">Reset global fonts, colors, and animations to default.</span>
            </button>
            <button 
              className="w-full text-left p-3 rounded-lg bg-gray-900 border border-gray-700 hover:bg-gray-700 transition flex flex-col gap-1"
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
              className="w-full text-left p-3 rounded-lg bg-gray-900 border border-gray-700 hover:bg-gray-700 transition flex flex-col gap-1"
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






