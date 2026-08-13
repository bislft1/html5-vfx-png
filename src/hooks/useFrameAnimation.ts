import { useEffect, useRef } from 'react';
import { FrameAnimation } from '../utils/frameAnimation';

interface UseFrameAnimationOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>;
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

  // Initialize animation when frames change
  useEffect(() => {
    if (!frames || frames.length === 0 || !canvasRef.current) return;

    animationRef.current = new FrameAnimation(frames, fps, onFrameUpdate);
    
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
  }, [frames, fps, canvasRef, onFrameUpdate]);

  // Handle play/pause
  useEffect(() => {
    if (!animationRef.current) return;

    if (isPlaying) {
      animationRef.current.play();
    } else {
      animationRef.current.stop();
    }
  }, [isPlaying]);

  // Update canvas size when frames change
  useEffect(() => {
    if (!frames || frames.length === 0 || !canvasRef.current) return;

    canvasRef.current.width = frames[0].width;
    canvasRef.current.height = frames[0].height;
  }, [frames, canvasRef]);

  const goToFrame = (index: number) => {
    if (animationRef.current) {
      animationRef.current.goToFrame(index);
      
      // Redraw immediately
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          animationRef.current.draw(ctx);
        }
      }
    }
  };

  const getCurrentFrame = () => {
    return animationRef.current?.getCurrentFrame() ?? 0;
  };

  const getFrameCount = () => {
    return animationRef.current?.getFrameCount() ?? 0;
  };

  return {
    goToFrame,
    getCurrentFrame,
    getFrameCount,
  };
}
