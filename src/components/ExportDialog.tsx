import React, { useRef, useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { exportAsPngSequence, exportAsSpritesheet, exportAsWebP } from '../utils/exporter';
import { saveAs } from 'file-saver';

export const ExportDialog: React.FC = () => {
  const showExportDialog = useAppStore((state) => state.showExportDialog);
  const generatedFrames = useAppStore((state) => state.generatedFrames);
  const fps = useAppStore((state) => state.config.fps);
  const setShowExportDialog = useAppStore((state) => state.setShowExportDialog);

  const [isExporting, setIsExporting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Close dialog on Escape key
  useEffect(() => {
    if (!showExportDialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowExportDialog(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showExportDialog, setShowExportDialog]);

  // Manage focus when dialog opens/closes
  useEffect(() => {
    if (showExportDialog) {
      // Store previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus first button in dialog
      setTimeout(() => {
        dialogRef.current?.querySelector('button')?.focus();
      }, 0);
    } else {
      // Restore focus when closed
      previousFocusRef.current?.focus();
    }
  }, [showExportDialog]);

  if (!showExportDialog || !generatedFrames) return null;

  const handleExportPng = async () => {
    setIsExporting(true);
    try {
      const result = await exportAsPngSequence(generatedFrames, 'pixel_water');
      if (result.success && result.blob) {
        saveAs(result.blob, 'pixel_water_animation.zip');
        setShowExportDialog(false);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSpritesheet = async () => {
    setIsExporting(true);
    try {
      const result = await exportAsSpritesheet(generatedFrames, fps, 'pixel_water_sheet');
      if (result.success && result.blob) {
        saveAs(result.blob, 'pixel_water_spritesheet.zip');
        setShowExportDialog(false);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWebP = async () => {
    setIsExporting(true);
    try {
      const result = await exportAsWebP(generatedFrames, fps, 'pixel_water');
      if (result.success && result.blob) {
        saveAs(result.blob, 'pixel_water_webp.zip');
        setShowExportDialog(false);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => setShowExportDialog(false)}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-dialog-title"
        className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="export-dialog-title" className="text-xl font-bold text-white mb-4">
          Export Animation
        </h2>
        
        <p className="text-gray-300 mb-6">
          Choose your export format. All options include metadata for game engine integration.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleExportPng}
            disabled={isExporting}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            PNG Sequence (ZIP)
          </button>
          
          <button
            onClick={handleExportSpritesheet}
            disabled={isExporting}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Spritesheet + JSON
          </button>
          
          <button
            onClick={handleExportWebP}
            disabled={isExporting}
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            WebP Sequence (ZIP)
          </button>
        </div>

        <button
          onClick={() => setShowExportDialog(false)}
          disabled={isExporting}
          className="mt-6 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300 rounded-lg transition-colors"
        >
          Cancel
        </button>

        {isExporting && (
          <p className="mt-4 text-sm text-gray-400 text-center">
            Exporting frames...
          </p>
        )}
      </div>
    </div>
  );
};
