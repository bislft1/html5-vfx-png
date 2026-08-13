import { create } from 'zustand';
import { WaterConfig, defaultWaterConfig } from '../types';

interface AppState {
  // Configuration
  config: WaterConfig;
  
  // Generation state
  isGenerating: boolean;
  generationProgress: number;
  generatedFrames: ImageData[] | null;
  
  // Playback state
  isPlaying: boolean;
  currentFrameIndex: number;
  
  // UI state
  showExportDialog: boolean;
  
  // Actions
  setConfig: (config: Partial<WaterConfig>) => void;
  resetConfig: () => void;
  setGenerating: (isGenerating: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  setGeneratedFrames: (frames: ImageData[] | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentFrameIndex: (index: number) => void;
  setShowExportDialog: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  config: { ...defaultWaterConfig },
  isGenerating: false,
  generationProgress: 0,
  generatedFrames: null,
  isPlaying: false,
  currentFrameIndex: 0,
  showExportDialog: false,
  
  // Actions
  setConfig: (configUpdate) => set((state) => ({
    config: { ...state.config, ...configUpdate }
  })),
  
  resetConfig: () => set({ config: { ...defaultWaterConfig } }),
  
  setGenerating: (isGenerating) => set({ isGenerating }),
  
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  
  setGeneratedFrames: (frames) => set({ generatedFrames: frames }),
  
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  setCurrentFrameIndex: (index) => set({ currentFrameIndex: index }),
  
  setShowExportDialog: (show) => set({ showExportDialog: show }),
}));
