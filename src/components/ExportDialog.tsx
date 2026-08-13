import React, { useRef, useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useFrameGenerator } from '../hooks/useFrameGenerator';

export const ExportDialog: React.FC = () => {
  const showExportDialog = useAppStore((state) => state.showExportDialog);
  const setShowExportDialog = useAppStore((state) => state.setShowExportDialog);
  
  const { exportPNGSequence, exportSpritesheet, exportWebP } = useFrameGenerator();
  const [isExporting, setIsExporting] = useState(false);

  // Ref for managing focus
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Move early return below hooks
  if (!showExportDialog) return null;

  // Manage initial focus within the dialog and restore it when closed
  useEffect(() => {
    // Store the currently focused element before opening dialog
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the first button in the dialog when it opens
    const firstButton = dialogRef.current?.querySelector('button');
    if (firstButton) {
      firstButton.focus();
    }

    // Cleanup: restore focus when dialog closes
    return () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  // Handle Escape key to dismiss dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowExportDialog(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setShowExportDialog]);

  const handleClose = () => {
    setShowExportDialog(false);
  };

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      await exportPNGSequence();
    } finally {
      setIsExporting(false);
      handleClose();
    }
  };

  const handleExportSpritesheet = async () => {
    setIsExporting(true);
    try {
      await exportSpritesheet();
    } finally {
      setIsExporting(false);
      handleClose();
    }
  };

  const handleExportWebP = async () => {
    setIsExporting(true);
    try {
      await exportWebP();
    } finally {
      setIsExporting(false);
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
    >
      <div 
        ref={dialogRef}
        className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
      >
        <h2 id="export-dialog-title" className="text-xl font-bold text-white mb-4">Export Animation</h2>
        
        <div className="space-y-4">
          {/* PNG Sequence */}
          <button
            onClick={handleExportPNG}
            disabled={isExporting}
            className="w-full p-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg text-left transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-medium">PNG Sequence (ZIP)</div>
                <div className="text-gray-400 text-sm">Individual frames as PNG files</div>
              </div>
            </div>
          </button>

          {/* Spritesheet */}
          <button
            onClick={handleExportSpritesheet}
            disabled={isExporting}
            className="w-full p-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg text-left transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-medium">Spritesheet</div>
                <div className="text-gray-400 text-sm">All frames in single image + metadata</div>
              </div>
            </div>
          </button>

          {/* WebP Sequence */}
          <button
            onClick={handleExportWebP}
            disabled={isExporting}
            className="w-full p-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg text-left transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-medium">WebP Sequence (ZIP)</div>
                <div className="text-gray-400 text-sm">Compressed frames, smaller file size</div>
              </div>
            </div>
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isExporting}
          className="mt-6 w-full py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
