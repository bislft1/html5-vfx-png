import { create } from 'zustand';
import { WaterConfig, defaultWaterConfig } from '../types';

interface AppState {
  // Configuration
  config: WaterConfig;
  
  // Generation state
  isGenerating: boolean;
  generationProgress: number;
  generatedFrames: ImageData[] | null;
  generationError: string | null;
  
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
  setGenerationError: (error: string | null) => void;
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
  generationError: null,
  isPlaying: false,
  currentFrameIndex: 0,
  showExportDialog: false,
  
  // Actions
  setConfig: (configUpdate) => set((state) => ({
    config: { ...state.config, ...configUpdate },
    // Clear generated frames and reset playback state on config change
    generatedFrames: null,
    isPlaying: false,
    currentFrameIndex: 0,
  })),
  
  resetConfig: () => set({ 
    config: { ...defaultWaterConfig },
    // Clear generated frames and reset playback state on reset
    generatedFrames: null,
    isPlaying: false,
    currentFrameIndex: 0,
  }),
  
  setGenerating: (isGenerating) => set({ isGenerating }),
  
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  
  setGeneratedFrames: (frames) => set({ generatedFrames: frames }),
  
  setGenerationError: (error) => set({ generationError: error }),
  
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  setCurrentFrameIndex: (index) => set({ currentFrameIndex: index }),
  
  setShowExportDialog: (show) => set({ showExportDialog: show }),
}));
