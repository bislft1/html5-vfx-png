import React from 'react';
import { useAppStore } from '../store/appStore';
import { useFrameGenerator } from '../hooks/useFrameGenerator';

export const ActionBar: React.FC = () => {
  const isGenerating = useAppStore((state) => state.isGenerating);
  const generationProgress = useAppStore((state) => state.generationProgress);
  const generatedFrames = useAppStore((state) => state.generatedFrames);
  const isPlaying = useAppStore((state) => state.isPlaying);
  const setIsPlaying = useAppStore((state) => state.setIsPlaying);
  
  const { generateFrames, openExportDialog, generationTime, estimatedSize } = useFrameGenerator();

  const handleGenerate = async () => {
    await generateFrames();
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      {/* Generation section */}
      <div className="mb-4">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isGenerating
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white'
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating... {generationProgress}%
            </span>
          ) : (
            '🎬 Generate Frames'
          )}
        </button>

        {/* Progress bar */}
        {isGenerating && (
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-cyan-500 h-full transition-all duration-200"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
        )}

        {/* Generation stats */}
        {generationTime && !isGenerating && generatedFrames && (
          <div className="mt-3 p-3 bg-gray-700 rounded-lg text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-400">Generation time:</span>
              <span className="text-white font-medium">{generationTime.toFixed(2)}s</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-400">Total frames:</span>
              <span className="text-white font-medium">{generatedFrames.length}</span>
            </div>
            {estimatedSize && (
              <>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Est. PNG size:</span>
                  <span className="text-white font-medium">{estimatedSize.pngMB.toFixed(2)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. WebP size:</span>
                  <span className="text-white font-medium">{estimatedSize.webpMB.toFixed(2)} MB</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Playback controls */}
      {generatedFrames && generatedFrames.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={handlePlayPause}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isPlaying
                ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            {isPlaying ? '⏸ Pause Playback' : '▶ Play Animation'}
          </button>

          <button
            onClick={openExportDialog}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
          >
            📦 Export Animation
          </button>
        </div>
      )}

      {/* Info note */}
      {!generatedFrames && (
        <div className="mt-4 p-3 bg-gray-700/50 rounded-lg text-xs text-gray-400">
          <p>💡 <strong>How it works:</strong></p>
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            <li>Adjust parameters in the control panel</li>
            <li>Click "Generate Frames" (expensive, one-time)</li>
            <li>Playback is trivial - just drawing pre-rendered images</li>
            <li>Export to PNG sequence, spritesheet, or WebP</li>
          </ol>
        </div>
      )}
    </div>
  );
};
