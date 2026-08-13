import React, { useRef } from 'react';
import { useControlPanel } from './hooks/useControlPanel';
import { ControlPanel } from './components/ControlPanel';
import { PlaybackCanvas } from './components/PlaybackCanvas';
import { ActionBar } from './components/ActionBar';
import { ExportDialog } from './components/ExportDialog';

const App: React.FC = () => {
  const controlPanelRef = useRef<HTMLDivElement>(null);
  
  // Initialize control panel
  useControlPanel();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Procedural Frame Effects
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Generate once, play back cheaply
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Stage 1: Generation (Expensive)
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
              Stage 2: Playback (Trivial)
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Controls and Actions */}
          <div className="space-y-6">
            {/* Control Panel Container */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Parameters</h2>
              <ControlPanel containerRef={controlPanelRef} />
            </div>

            {/* Action Bar */}
            <ActionBar />
          </div>

          {/* Right column - Playback Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-4 h-[600px]">
              <h2 className="text-lg font-semibold mb-4">Preview Player</h2>
              <PlaybackCanvas />
            </div>
          </div>
        </div>

        {/* Info section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast Generation</h3>
            <p className="text-gray-400 text-sm">
              Uses Gerstner waves and simplex noise for realistic water simulation. 
              Generated frames are stored in memory for instant playback.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Trivial Playback</h3>
            <p className="text-gray-400 text-sm">
              Once generated, playback is simply drawing pre-rendered frames. 
              No simulation recalculation - just pure pixel display.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Multiple Exports</h3>
            <p className="text-gray-400 text-sm">
              Export as PNG sequence, spritesheet with metadata, or compressed WebP. 
              Perfect for game development and web animations.
            </p>
          </div>
        </div>
      </main>

      {/* Export Dialog */}
      <ExportDialog />
    </div>
  );
};

export default App;
