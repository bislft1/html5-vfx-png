import { useState, useCallback } from 'react';
import { WaterGenerator } from '../utils/waterGenerator';
import { FrameExporter } from '../utils/exporter';
import { useAppStore } from '../store/appStore';

/**
 * Hook to handle frame generation and export
 */
export function useFrameGenerator() {
  const config = useAppStore((state) => state.config);
  const setGenerating = useAppStore((state) => state.setGenerating);
  const setGenerationProgress = useAppStore((state) => state.setGenerationProgress);
  const setGeneratedFrames = useAppStore((state) => state.setGeneratedFrames);
  const setShowExportDialog = useAppStore((state) => state.setShowExportDialog);
  const setGenerationError = useAppStore((state) => state.setGenerationError);

  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [estimatedSize, setEstimatedSize] = useState<{ pngMB: number; webpMB: number } | null>(null);

  /**
   * Generate all frames (expensive operation)
   * Uses incremental per-frame generation with event loop yielding
   */
  const generateFrames = useCallback(async () => {
    // Clear previous state before starting new generation
    setGeneratedFrames(null);
    setGenerationTime(null);
    setEstimatedSize(null);
    setGenerationError(null);
    
    setGenerating(true);
    setGenerationProgress(0);
    
    const startTime = performance.now();
    
    try {
      const generator = new WaterGenerator(config);
      
      // Generate frames incrementally
      const totalFrames = config.frameCount;
      const frames: ImageData[] = [];
      
      for (let i = 0; i < totalFrames; i++) {
        // Generate single frame using generateFrame method
        const frame = generator.generateFrame(i);
        frames.push(frame);
        
        // Update progress after each frame completion
        const progress = Math.round(((i + 1) / totalFrames) * 100);
        setGenerationProgress(progress);
        
        // Yield to event loop between frames to keep UI responsive
        if (i % 5 === 0 || i === totalFrames - 1) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;
      
      setGenerationProgress(100);
      setGeneratedFrames(frames);
      setGenerationTime(duration);
      
      // Estimate file sizes
      const sizeEstimate = await FrameExporter.estimateSize(frames);
      setEstimatedSize(sizeEstimate);
      
      console.log(`Generated ${frames.length} frames in ${duration.toFixed(2)}s`);
      console.log(`Estimated PNG size: ${sizeEstimate.pngMB.toFixed(2)} MB`);
      console.log(`Estimated WebP size: ${sizeEstimate.webpMB.toFixed(2)} MB`);
      
    } catch (error) {
      console.error('Frame generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      setGenerationError(errorMessage);
      setGenerating(false);
      setGenerationProgress(0);
      return; // Don't rethrow, surface error through store
    }
    
    setGenerating(false);
  }, [config, setGenerating, setGenerationProgress, setGeneratedFrames, setGenerationError]);

  /**
   * Export frames as PNG sequence
   */
  const exportPNGSequence = useCallback(async () => {
    const frames = useAppStore.getState().generatedFrames;
    if (!frames || frames.length === 0) return;
    
    await FrameExporter.exportAsPNGSequence(frames, 'water-animation');
  }, []);

  /**
   * Export frames as spritesheet
   */
  const exportSpritesheet = useCallback(async () => {
    const frames = useAppStore.getState().generatedFrames;
    if (!frames || frames.length === 0) return;
    
    await FrameExporter.exportAsSpritesheet(frames, config.fps, 10, 'water-spritesheet');
  }, [config.fps]);

  /**
   * Export frames as WebP sequence
   */
  const exportWebP = useCallback(async () => {
    const frames = useAppStore.getState().generatedFrames;
    if (!frames || frames.length === 0) return;
    
    await FrameExporter.exportAsWebP(frames, config.fps, 0.8, 'water-animation-webp');
  }, [config.fps]);

  /**
   * Open export dialog
   */
  const openExportDialog = useCallback(() => {
    setShowExportDialog(true);
  }, [setShowExportDialog]);

  return {
    generateFrames,
    exportPNGSequence,
    exportSpritesheet,
    exportWebP,
    openExportDialog,
    generationTime,
    estimatedSize,
  };
}
