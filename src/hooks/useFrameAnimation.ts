import { useEffect, useRef, useCallback } from 'react';
import type { RefObject } from 'react';
import { FrameAnimation, FrameAnimationOptions } from '../utils/frameAnimation';

interface UseFrameAnimationOptions {
  canvasRef: RefObject<HTMLCanvasElement>;
  frames: ImageData[] | null;
  fps: number;
  isPlaying: boolean;
  onFrameUpdate?: (frameIndex: number) => void;
}

/**
 * Hook to manage frame animation playback
 */
export function useFrameAnimation({
  canvasRef,
  frames,
  fps,
  isPlaying,
  onFrameUpdate,
}: UseFrameAnimationOptions) {
  const animationRef = useRef<FrameAnimation | null>(null);
  const callbackRef = useRef(onFrameUpdate);

  // Store latest callback in ref to stabilize onFrameUpdate
  useEffect(() => {
    callbackRef.current = onFrameUpdate;
  }, [onFrameUpdate]);

  // Initialize animation when frames change
  useEffect(() => {
    if (!frames || frames.length === 0 || !canvasRef.current) return;

    // Set canvas size before first draw
    canvasRef.current.width = frames[0].width;
    canvasRef.current.height = frames[0].height;

    const options: FrameAnimationOptions = {
      canvasRef,
      frames,
      fps,
      onFrameUpdate: (index: number) => {
        if (callbackRef.current) {
          callbackRef.current(index);
        }
      },
    };

    animationRef.current = new FrameAnimation(options);
    
    // Draw initial frame
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      animationRef.current.draw(ctx);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [frames, fps, canvasRef]);

  // Handle play/pause - responds to animation changes
  useEffect(() => {
    if (!animationRef.current) return;

    if (isPlaying) {
      animationRef.current.play();
    } else {
      animationRef.current.stop();
    }
  }, [isPlaying, frames, fps]);

  const goToFrame = useCallback((index: number) => {
    if (animationRef.current) {
      animationRef.current.goToFrame(index);
      
      // Redraw immediately
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          animationRef.current!.draw(ctx);
        }
      }
    }
  }, []);

  const getCurrentFrame = useCallback(() => {
    return animationRef.current?.getCurrentFrame() ?? 0;
  }, []);

  const getFrameCount = useCallback(() => {
    return animationRef.current?.getFrameCount() ?? 0;
  }, []);

  return {
    goToFrame,
    getCurrentFrame,
    getFrameCount,
  };
}
