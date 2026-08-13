import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { PixelArtWaterGenerator } from '../utils/pixelArtGenerator';

export function useFrameGenerator() {
  const config = useAppStore((state) => state.config);
  const setGenerating = useAppStore((state) => state.setGenerating);
  const setProgress = useAppStore((state) => state.setGenerationProgress);
  const setGeneratedFrames = useAppStore((state) => state.setGeneratedFrames);
  const setGenerationTime = useAppStore((state) => state.setGenerationTime);
  const setGenerationError = useAppStore((state) => state.setGenerationError);

  const generateFrames = useCallback(async () => {
    // Clear previous state
    setGeneratedFrames(null);
    setGenerationTime(null);
    setGenerationError(null);
    setGenerating(true);
    setProgress(0);

    const startTime = performance.now();
    
    try {
      const generator = new PixelArtWaterGenerator(config);
      
      const frames = await generator.generateFrames((progress, _frame) => {
        setProgress(progress);
      });

      const endTime = performance.now();
      setGeneratedFrames(frames);
      setGenerationTime(endTime - startTime);
      setProgress(1);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      setGenerationError(errorMessage);
    } finally {
      setGenerating(false);
    }
  }, [config, setGenerating, setProgress, setGeneratedFrames, setGenerationTime, setGenerationError]);

  return { generateFrames };
}
