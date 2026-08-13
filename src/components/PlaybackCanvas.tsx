import React, { useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { useFrameAnimation } from '../hooks/useFrameAnimation';

export const PlaybackCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frames = useAppStore((state) => state.generatedFrames);
  const fps = useAppStore((state) => state.config.fps);
  const isPlaying = useAppStore((state) => state.isPlaying);
  const setCurrentFrameIndex = useAppStore((state) => state.setCurrentFrameIndex);

  const { goToFrame, getFrameCount } = useFrameAnimation({
    canvasRef,
    frames,
    fps,
    isPlaying,
    onFrameUpdate: (index) => setCurrentFrameIndex(index),
  });

  const frameCount = getFrameCount();
  const currentFrame = useAppStore((state) => state.currentFrameIndex);

  // Handle scrubber input
  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = parseInt(e.target.value, 10);
    goToFrame(newIndex);
  };

  if (!frames || frames.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg">
        <div className="text-center text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">No frames generated yet</p>
          <p className="text-sm mt-1">Click "Generate Frames" to create animation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Canvas container */}
      <div className="flex-1 flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Playback controls */}
      <div className="mt-4 p-4 bg-gray-800 rounded-lg">
        {/* Frame scrubber */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Frame {currentFrame + 1}</span>
            <span>{frameCount} frames</span>
          </div>
          <input
            type="range"
            min="0"
            max={frameCount - 1}
            value={currentFrame}
            onChange={handleScrubberChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Info bar */}
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>FPS: {fps}</span>
          <span>Duration: {(frameCount / fps).toFixed(2)}s</span>
          <span className={isPlaying ? 'text-green-400' : 'text-gray-400'}>
            {isPlaying ? '▶ Playing' : '⏸ Paused'}
          </span>
        </div>
      </div>
    </div>
  );
};
