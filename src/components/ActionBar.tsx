import React from 'react';
import { useAppStore } from '../store/appStore';
import { useFrameGenerator } from '../hooks/useFrameGenerator';

export const ActionBar: React.FC = () => {
  const isGenerating = useAppStore((state) => state.isGenerating);
  const progress = useAppStore((state) => state.generationProgress);
  const generationTime = useAppStore((state) => state.generationTime);
  const generationError = useAppStore((state) => state.generationError);
  const generatedFrames = useAppStore((state) => state.generatedFrames);
  const isPlaying = useAppStore((state) => state.isPlaying);
  const setShowExportDialog = useAppStore((state) => state.setShowExportDialog);
  const setIsPlaying = useAppStore((state) => state.setIsPlaying);
  const setCurrentFrameIndex = useAppStore((state) => state.setCurrentFrameIndex);

  const { generateFrames } = useFrameGenerator();

  const handleGenerate = async () => {
    await generateFrames();
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(0);
  };

  const handleExport = () => {
    setShowExportDialog(true);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isGenerating
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            disabled={!generatedFrames || isGenerating}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !generatedFrames || isGenerating
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={handleStop}
            disabled={!generatedFrames || isGenerating}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !generatedFrames || isGenerating
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            Stop
          </button>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={!generatedFrames || isGenerating}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            !generatedFrames || isGenerating
              ? 'bg-gray-600 cursor-not-allowed text-gray-400'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          Export
        </button>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="flex-1 max-w-md">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 mt-1">
              {(progress * 100).toFixed(0)}% complete
            </span>
          </div>
        )}

        {/* Generation Time */}
        {generationTime && !isGenerating && (
          <span className="text-sm text-gray-400">
            Generated in {(generationTime / 1000).toFixed(2)}s
          </span>
        )}

        {/* Error Message */}
        {generationError && (
          <span className="text-sm text-red-400 ml-auto">
            {generationError}
          </span>
        )}
      </div>
    </div>
  );
};
