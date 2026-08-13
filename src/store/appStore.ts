import { create } from 'zustand';
import { PixelArtConfig, defaultPixelArtConfig } from '../types';

interface AppState {
  config: PixelArtConfig;
  isGenerating: boolean;
  generationProgress: number;
  generatedFrames: ImageData[] | null;
  generationError: string | null;
  generationTime: number | null;
  isPlaying: boolean;
  currentFrameIndex: number;
  showExportDialog: boolean;

  setConfig: (config: Partial<PixelArtConfig>) => void;
  resetConfig: () => void;
  setGenerating: (isGenerating: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  setGenerationTime: (time: number | null) => void;
  setGeneratedFrames: (frames: ImageData[] | null) => void;
  setGenerationError: (error: string | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentFrameIndex: (index: number) => void;
  setShowExportDialog: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  config: { ...defaultPixelArtConfig },
  isGenerating: false,
  generationProgress: 0,
  generatedFrames: null,
  generationError: null,
  generationTime: null,
  isPlaying: false,
  currentFrameIndex: 0,
  showExportDialog: false,

  setConfig: (configUpdate) => set((state) => ({
    config: { ...state.config, ...configUpdate },
    generatedFrames: null,
    isPlaying: false,
    currentFrameIndex: 0,
  })),

  resetConfig: () => set({
    config: { ...defaultPixelArtConfig },
    generatedFrames: null,
    isPlaying: false,
    currentFrameIndex: 0,
  }),

  setGenerating: (isGenerating) => set({ isGenerating }),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  setGenerationTime: (time) => set({ generationTime: time }),
  setGeneratedFrames: (frames) => set({ generatedFrames: frames }),
  setGenerationError: (error) => set({ generationError: error }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentFrameIndex: (index) => set({ currentFrameIndex: index }),
  setShowExportDialog: (show) => set({ showExportDialog: show }),
}));
