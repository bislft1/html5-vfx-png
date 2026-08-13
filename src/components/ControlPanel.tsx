import React from 'react';

interface ControlPanelProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ containerRef }) => {
  return (
    <div 
      ref={containerRef}
      className="absolute top-4 right-4 z-10"
    />
  );
};
