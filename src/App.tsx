import React, { useRef } from 'react';
import { useAppStore } from './store/appStore';
import { ControlPanel } from './components/ControlPanel';
import { PlaybackCanvas } from './components/PlaybackCanvas';
import { ActionBar } from './components/ActionBar';
import { ExportDialog } from './components/ExportDialog';
import { useControlPanel } from './hooks/useControlPanel';

const App: React.FC = () => {
  const controlPanelRef = useRef<HTMLDivElement>(null);
  useControlPanel(controlPanelRef);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold">Pixel Art Water Generator</h1>
        <p className="text-sm text-gray-400 mt-1">
          Generate procedural water animations for 2D games
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8 pb-32">
        <PlaybackCanvas />
      </main>

      {/* Control Panel Container */}
      <ControlPanel containerRef={controlPanelRef} />

      {/* Action Bar */}
      <ActionBar />

      {/* Export Dialog */}
      <ExportDialog />
    </div>
  );
};

export default App;
