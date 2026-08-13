export interface PixelArtConfig {
  seed: number;
  width: number;
  height: number;
  frameCount: number;
  fps: number;

  // Pixel art settings
  tileResolution: number; // Size of each tile in pixels (e.g., 4 for 4x4 pixel tiles)
  
  // Animation parameters
  animationSpeed: number;
  turbulence: number; // How much the water distorts
  
  // Color palette (ordered from deep to surface)
  colorPalette: string[];
  
  // Flow settings
  flowOffset: number; // Horizontal flow per frame
}

export const defaultPixelArtConfig: PixelArtConfig = {
  seed: 12345,
  width: 128,
  height: 128,
  frameCount: 60,
  fps: 15,
  
  tileResolution: 4,
  animationSpeed: 1.0,
  turbulence: 0.5,
  colorPalette: ['#1a4d6b', '#2d7da0', '#4da6ff', '#80c1ff', '#b3d9ff'],
  flowOffset: 1,
};
