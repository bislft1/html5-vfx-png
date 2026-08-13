import React, { useRef, useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { useFrameAnimation } from '../hooks/useFrameAnimation';

export const PlaybackCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frames = useAppStore((state) => state.generatedFrames);
  const fps = useAppStore((state) => state.config.fps);
  const isPlaying = useAppStore((state) => state.isPlaying);
  const currentFrameIndex = useAppStore((state) => state.currentFrameIndex);
  const setCurrentFrameIndex = useAppStore((state) => state.setCurrentFrameIndex);
  const setIsPlaying = useAppStore((state) => state.setIsPlaying);

  const [isScrubbing, setIsScrubbing] = useState(false);
  const frameCount = frames?.length || 0;

  const { goToFrame, play, pause } = useFrameAnimation({
    canvasRef,
    frames: frames || [],
    fps,
    isPlaying,
    currentFrameIndex,
    onFrameUpdate: (index) => {
      if (!isScrubbing) {
        setCurrentFrameIndex(index);
      }
    },
  });

  // Handle scrubbing
  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = parseInt(e.target.value, 10);
    setCurrentFrameIndex(newIndex);
    goToFrame(newIndex);
    
    // Pause during scrubbing
    if (isPlaying) {
      pause();
    }
  };

  const handleScrubberStart = () => {
    setIsScrubbing(true);
  };

  const handleScrubberEnd = () => {
    setIsScrubbing(false);
    if (isPlaying) {
      play();
    }
  };

  const duration = frameCount > 0 ? (frameCount / fps).toFixed(2) : '0.00';

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        className="border border-gray-600 rounded-lg shadow-lg"
        style={{ 
          imageRendering: 'pixelated',
          width: '512px',
          height: '512px',
        }}
      />
      
      {frameCount > 0 && (
        <div className="w-full max-w-md px-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 w-12">
              {currentFrameIndex + 1}
            </span>
            <input
              type="range"
              min="0"
              max={frameCount - 1}
              value={currentFrameIndex}
              onChange={handleScrubberChange}
              onMouseDown={handleScrubberStart}
              onMouseUp={handleScrubberEnd}
              onTouchStart={handleScrubberStart}
              onTouchEnd={handleScrubberEnd}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-400 w-12 text-right">
              {frameCount}
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Duration: {duration}s at {fps} FPS
          </div>
        </div>
      )}
    </div>
  );
};
