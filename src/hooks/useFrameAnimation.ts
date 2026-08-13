import { useEffect, useRef, useCallback } from 'react';
import { FrameAnimation } from '../utils/frameAnimation';

interface UseFrameAnimationOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  frames: ImageData[];
  fps: number;
  isPlaying: boolean;
  currentFrameIndex: number;
  onFrameUpdate?: (frameIndex: number) => void;
}

export function useFrameAnimation({
  canvasRef,
  frames,
  fps,
  isPlaying,
  currentFrameIndex,
  onFrameUpdate,
}: UseFrameAnimationOptions) {
  const animationRef = useRef<FrameAnimation | null>(null);
  const onFrameUpdateRef = useRef(onFrameUpdate);

  // Keep callback ref updated
  useEffect(() => {
    onFrameUpdateRef.current = onFrameUpdate;
  }, [onFrameUpdate]);

  // Initialize animation instance
  useEffect(() => {
    if (!canvasRef.current || frames.length === 0) return;

    animationRef.current = new FrameAnimation({
      canvasRef,
      frames,
      fps,
      onFrameUpdate: (index: number) => {
        onFrameUpdateRef.current?.(index);
      },
    });

    // Draw initial frame
    animationRef.current.goToFrame(currentFrameIndex);

    return () => {
      animationRef.current?.destroy();
      animationRef.current = null;
    };
  }, []); // Only run once on mount

  // Update frames when they change
  useEffect(() => {
    if (animationRef.current && frames.length > 0) {
      animationRef.current.setFrames(frames);
    }
  }, [frames]);

  // Handle play/pause based on isPlaying and frames availability
  useEffect(() => {
    if (!animationRef.current || frames.length === 0) return;

    if (isPlaying) {
      animationRef.current.play();
    } else {
      animationRef.current.pause();
    }
  }, [isPlaying, fps, frames.length]);

  // Handle frame navigation
  useEffect(() => {
    if (animationRef.current && frames.length > 0) {
      animationRef.current.goToFrame(currentFrameIndex);
    }
  }, [currentFrameIndex, frames.length]);

  const goToFrame = useCallback((index: number) => {
    animationRef.current?.goToFrame(index);
  }, []);

  const play = useCallback(() => {
    animationRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    animationRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    animationRef.current?.stop();
  }, []);

  return { goToFrame, play, pause, stop };
}
