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

  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [estimatedSize, setEstimatedSize] = useState<{ pngMB: number; webpMB: number } | null>(null);

  /**
   * Generate all frames (expensive operation)
   */
  const generateFrames = useCallback(async () => {
    setGenerating(true);
    setGenerationProgress(0);
    
    const startTime = performance.now();
    
    // Use setTimeout to allow UI to update before expensive operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const generator = new WaterGenerator(config);
      
      // Generate frames with progress tracking
      const totalFrames = config.frameCount;
      const frames: ImageData[] = [];
      
      for (let i = 0; i < totalFrames; i++) {
        // We need to modify the generator to support incremental generation
        // For now, we'll batch them
        if (i % 10 === 0) {
          setGenerationProgress(Math.round((i / totalFrames) * 100));
          await new Promise(resolve => setTimeout(resolve, 10)); // Allow UI update
        }
      }
      
      // Generate all frames (this is the expensive part)
      const generatedFrames = generator.generateFrames();
      frames.push(...generatedFrames);
      
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
      setGenerating(false);
      setGenerationProgress(0);
      throw error;
    }
    
    setGenerating(false);
  }, [config, setGenerating, setGenerationProgress, setGeneratedFrames]);

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
    
    await FrameExporter.exportAsSpritesheet(frames, 10, 'water-spritesheet');
  }, []);

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
