import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CaptionSegment = {
  id: string;
  startTime: number; // in milliseconds
  endTime: number; // in milliseconds
  text: string;
  highlightedWords: string[];
  highlightedIndices?: number[]; // Added to track specific instances of words
  originalHighlightedWords?: string[];
  originalHighlightedIndices?: number[];
  customStyle?: Partial<StyleConfig>;
};

export type AspectRatio = '9:16' | '16:9';
export type CaptionPosition = 'lower-third' | 'center' | 'top';
export type AnimationType = 'none' | 'slide-up' | 'pop' | 'fade' | 'typewriter' | 'elastic-bounce' | 'kinetic-clash' | 'chaos-converge' | '3-way-slide';
export type DisplayMode = 'line' | 'word' | 'letter' | 'karaoke';
export type TextAlign = 'left' | 'center' | 'right';
export type HighlightStyle = 'none' | 'subtitle' | 'glow' | 'highlight' | 'underline' | 'gradient';

export interface StyleConfig {
  font: string;
  fontWeight: number;
  baseColor: string;
  accentColor: string;
  backgroundColor: string;
  fontSize: number;
  baseFontSizeMultiplier: number;
  accentFontSizeMultiplier: number;
  position: CaptionPosition;
  textAlign: TextAlign;
  animationType: AnimationType;
  displayMode: DisplayMode;
  aspectRatio: AspectRatio;
  highlightStyle: HighlightStyle;
  glowIntensity: number;
  lineLayout: 'auto' | 'single' | 'double';
  wrapText: boolean;
  clipText: boolean;
  textBoxWidth: number;
  textBoxHeight: number;
  staggerSpeedMode: 'auto' | 'timecode' | 'math';
  motionBlur: boolean;
  motionBlurIntensity: number;
  enableHighlightFont: boolean;
  highlightFont: string;
  highlightFontWeight: number;
  lineSpacing: number;
  enableDropShadow: boolean;
  dropShadowIntensity: number; // Re-purposed as Opacity
  dropShadowAngle: number;
  dropShadowDistance: number;
  dropShadowBlur: number;
  dropShadowColor: string;
  dropShadowOnBase: boolean;
  dropShadowOnHighlight: boolean;
  dropShadowOnUnderlay: boolean;
  enableInnerShadow: boolean;
  innerShadowIntensity: number;
  innerShadowAngle: number;
  innerShadowDistance: number;
  innerShadowBlur: number;
  innerShadowColor: string;
  innerShadowOnBase: boolean;
  innerShadowOnHighlight: boolean;
  innerShadowOnUnderlay: boolean;
  activePreset?: string;
  wordSpacing?: number;
  enableTextGradient?: boolean;
  textGradientColors?: string[];
  gradientType?: 'linear' | 'radial';
  gradientDirection?: string;
  gradientColorCount?: 2 | 4;
  gradientSpread?: number;
  gradientSoftness?: number;
  gradientRadialCenter?: string;
  futureStyleType?: 'normal' | 'button';
  enableFutureItalic?: boolean;
  highlightTextTransform?: 'uppercase' | 'lowercase' | 'none';
}

export interface CustomPreset {
  name: string;
  config: Partial<StyleConfig>;
}

interface ProjectState {
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  videoUrl: string | null;
  videoDuration: number;
  fps: number;
  projectName: string | null;
  captions: CaptionSegment[];
  styleConfig: StyleConfig;
  
  individualStylingEnabled: boolean;
  selectedCaptionId: string | null;
  
  isCaptionOutOfBounds: boolean;
  showTextBoxBorder: boolean;

  // History tracking for Undo/Redo (we only track captions here for simplicity)
  pastCaptions: CaptionSegment[][];
  futureCaptions: CaptionSegment[][];

  customPresets: CustomPreset[];

  highlightSimilar: boolean;
  setHighlightSimilar: (highlight: boolean) => void;

  setVideoData: (url: string, duration: number, fps: number) => void;
  setProjectName: (name: string) => void;
  setCaptions: (captions: CaptionSegment[]) => void;
  updateCaptionSegment: (id: string, updates: Partial<CaptionSegment>) => void;
  setStyleConfig: (config: Partial<StyleConfig>) => void;
  
  setIndividualStylingEnabled: (enabled: boolean) => void;
  setSelectedCaptionId: (id: string | null) => void;
  setIsCaptionOutOfBounds: (isOut: boolean) => void;
  setShowTextBoxBorder: (show: boolean) => void;
  
  saveCustomPreset: (name: string, config: Partial<StyleConfig>) => void;
  deleteCustomPreset: (name: string) => void;
  importCustomPresets: (presets: CustomPreset[]) => void;

  customColors: string[];
  addCustomColor: (color: string) => void;
  removeCustomColor: (color: string) => void;

  undo: () => void;
  redo: () => void;
}

export const defaultStyle: StyleConfig = {
  font: 'Arial', // Default to Arial
  fontWeight: 800,
  baseColor: '#ffffff',
  accentColor: '#FFD400', // Yellow
  backgroundColor: '#000000', // Default black background for subtitle style
  fontSize: 100, // Increased for 1080x1920
  baseFontSizeMultiplier: 1.0,
  accentFontSizeMultiplier: 1.3,
  position: 'center',
  textAlign: 'center',
  animationType: 'slide-up',
  displayMode: 'word',
  aspectRatio: '9:16', // Default to Reels
  highlightStyle: 'none',
  glowIntensity: 3,
  lineLayout: 'auto',
  wrapText: true,
  clipText: false,
  wordSpacing: 8,
  textBoxWidth: 96,
  textBoxHeight: 20,
  staggerSpeedMode: 'auto',
  motionBlur: false,
  motionBlurIntensity: 15,
  enableHighlightFont: false,
  highlightFont: 'Arial',
  highlightFontWeight: 800,
  lineSpacing: 1.1,
  enableDropShadow: true,
  dropShadowIntensity: 50,
  dropShadowAngle: 45,
  dropShadowDistance: 15,
  dropShadowBlur: 20,
  dropShadowColor: '#000000',
  dropShadowOnBase: true,
  dropShadowOnHighlight: true,
  dropShadowOnUnderlay: false,
  enableInnerShadow: false,
  innerShadowIntensity: 50,
  innerShadowAngle: 45,
  innerShadowDistance: 15,
  innerShadowBlur: 20,
  innerShadowColor: '#000000',
  innerShadowOnBase: true,
  innerShadowOnHighlight: true,
  innerShadowOnUnderlay: false,
  enableTextGradient: false,
  textGradientColors: ['#8B5CF6', '#F0ABFC', '#8B5CF6', '#F0ABFC'],
  gradientType: 'linear',
  gradientDirection: '90deg',
  gradientColorCount: 4,
  gradientSpread: 100,
  gradientSoftness: 100,
  gradientRadialCenter: 'center',
  futureStyleType: 'normal',
  enableFutureItalic: false,
  highlightTextTransform: 'none',
};

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
      videoUrl: null,
  videoDuration: 0,
  fps: 30,
  projectName: null,
  captions: [],
  styleConfig: defaultStyle,
  individualStylingEnabled: false,
  selectedCaptionId: null,
  isCaptionOutOfBounds: false,
  showTextBoxBorder: false,
  
  pastCaptions: [],
  futureCaptions: [],
  customPresets: [],

  highlightSimilar: false,
  setHighlightSimilar: (highlight) => set({ highlightSimilar: highlight }),

  setVideoData: (url, duration, fps) => set({ videoUrl: url, videoDuration: duration, fps }),
  setProjectName: (name) => set({ projectName: name }),
  
  setCaptions: (captions) => set((state) => {
    // Only save history if we already had captions
    const saveHistory = state.captions.length > 0;
    return {
      captions,
      pastCaptions: saveHistory ? [...state.pastCaptions, state.captions] : state.pastCaptions,
      futureCaptions: saveHistory ? [] : state.futureCaptions,
    };
  }),

  updateCaptionSegment: (id, updates) => set((state) => {
    const newCaptions = state.captions.map((cap) => (cap.id === id ? { ...cap, ...updates } : cap));
    return {
      captions: newCaptions,
      pastCaptions: [...state.pastCaptions, state.captions],
      futureCaptions: [],
    };
  }),

  setIndividualStylingEnabled: (enabled) => set({ individualStylingEnabled: enabled }),
  setSelectedCaptionId: (id) => set({ selectedCaptionId: id }),
  setIsCaptionOutOfBounds: (isOut) => set({ isCaptionOutOfBounds: isOut }),
  setShowTextBoxBorder: (show) => set({ showTextBoxBorder: show }),

  setStyleConfig: (config) => set((state) => ({
    styleConfig: { ...state.styleConfig, ...config },
  })),

  saveCustomPreset: (name, config) => set((state) => {
    const existingIndex = state.customPresets.findIndex(p => p.name === name);
    if (existingIndex >= 0) {
      const updated = [...state.customPresets];
      updated[existingIndex] = { name, config };
      return { customPresets: updated };
    }
    return { customPresets: [...state.customPresets, { name, config }] };
  }),

  deleteCustomPreset: (name) => set((state) => ({
    customPresets: state.customPresets.filter(p => p.name !== name)
  })),

  importCustomPresets: (presets) => set((state) => {
    const newPresets = [...state.customPresets];
    presets.forEach(p => {
      const idx = newPresets.findIndex(ext => ext.name === p.name);
      if (idx >= 0) newPresets[idx] = p;
      else newPresets.push(p);
    });
    return { customPresets: newPresets };
  }),

  customColors: [],
  
  addCustomColor: (color) => set((state) => {
    if (state.customColors.includes(color)) return state;
    return { customColors: [...state.customColors, color] };
  }),
  
  removeCustomColor: (color) => set((state) => ({
    customColors: state.customColors.filter(c => c !== color)
  })),

  undo: () => set((state) => {
    if (state.pastCaptions.length === 0) return state;
    const previous = state.pastCaptions[state.pastCaptions.length - 1];
    const newPast = state.pastCaptions.slice(0, -1);
    return {
      captions: previous,
      pastCaptions: newPast,
      futureCaptions: [state.captions, ...state.futureCaptions],
    };
  }),

  redo: () => set((state) => {
    if (state.futureCaptions.length === 0) return state;
    const next = state.futureCaptions[0];
    const newFuture = state.futureCaptions.slice(1);
    return {
      captions: next,
      pastCaptions: [...state.pastCaptions, state.captions],
      futureCaptions: newFuture,
    };
  }),
  }),
  {
    name: 'captionflow-storage',
    partialize: (state) => Object.fromEntries(
      Object.entries(state).filter(([key]) => !['pastCaptions', 'futureCaptions', 'hasHydrated'].includes(key))
    ),
    onRehydrateStorage: () => (state) => {
      if (state) state.setHasHydrated(true);
    },
  }
));

