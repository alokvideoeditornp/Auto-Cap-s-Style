import { create } from 'zustand';

export type CaptionSegment = {
  id: string;
  startTime: number; // in milliseconds
  endTime: number; // in milliseconds
  text: string;
  highlightedWords: string[];
  highlightedIndices?: number[]; // Added to track specific instances of words
  customStyle?: Partial<StyleConfig>;
};

export type AspectRatio = '9:16' | '16:9';
export type CaptionPosition = 'lower-third' | 'center' | 'top';
export type AnimationType = 'slide-up' | 'pop' | 'fade' | 'typewriter' | 'elastic-bounce' | 'kinetic-clash' | 'chaos-converge';
export type DisplayMode = 'line' | 'word' | 'letter';
export type TextAlign = 'left' | 'center' | 'right';
export type HighlightStyle = 'none' | 'subtitle' | 'glow' | 'highlight' | 'underline';

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
  activePreset?: string;
}

interface ProjectState {
  videoUrl: string | null;
  videoDuration: number;
  fps: number;
  captions: CaptionSegment[];
  styleConfig: StyleConfig;
  
  individualStylingEnabled: boolean;
  selectedCaptionId: string | null;

  // History tracking for Undo/Redo (we only track captions here for simplicity)
  pastCaptions: CaptionSegment[][];
  futureCaptions: CaptionSegment[][];

  setVideoData: (url: string, duration: number, fps: number) => void;
  setCaptions: (captions: CaptionSegment[]) => void;
  updateCaptionSegment: (id: string, updates: Partial<CaptionSegment>) => void;
  setStyleConfig: (config: Partial<StyleConfig>) => void;
  
  setIndividualStylingEnabled: (enabled: boolean) => void;
  setSelectedCaptionId: (id: string | null) => void;
  
  undo: () => void;
  redo: () => void;
}

export const defaultStyle: StyleConfig = {
  font: 'Montserrat', // Default to Montserrat
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
  textBoxWidth: 80,
  textBoxHeight: 20,
};

export const useProjectStore = create<ProjectState>((set) => ({
  videoUrl: null,
  videoDuration: 0,
  fps: 30,
  captions: [],
  styleConfig: defaultStyle,
  individualStylingEnabled: false,
  selectedCaptionId: null,
  
  pastCaptions: [],
  futureCaptions: [],

  setVideoData: (url, duration, fps) => set({ videoUrl: url, videoDuration: duration, fps }),
  
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

  setStyleConfig: (config) => set((state) => ({
    styleConfig: { ...state.styleConfig, ...config },
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
}));
