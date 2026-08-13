import { PixelArtConfig } from '../types';
import seedrandom from 'seedrandom';

export class PixelArtWaterGenerator {
  private config: PixelArtConfig;
  private rng: () => number;
  private tileWidth: number;
  private tileHeight: number;
  
  constructor(config: PixelArtConfig) {
    this.config = config;
    this.rng = seedrandom(config.seed.toString());
    this.tileWidth = Math.floor(config.width / config.tileResolution);
    this.tileHeight = Math.floor(config.height / config.tileResolution);
  }

  /**
   * Simple 2D noise function using seeded RNG
   */
  private noise2D(x: number, y: number): number {
    const combined = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (combined - Math.floor(combined)) * 2 - 1;
  }

  /**
   * Smooth noise with interpolation
   */
  private smoothNoise(x: number, y: number): number {
    const intX = Math.floor(x);
    const intY = Math.floor(y);
    const fracX = x - intX;
    const fracY = y - intY;

    const v1 = this.noise2D(intX, intY);
    const v2 = this.noise2D(intX + 1, intY);
    const v3 = this.noise2D(intX, intY + 1);
    const v4 = this.noise2D(intX + 1, intY + 1);

    const i1 = v1 * (1 - fracX) + v2 * fracX;
    const i2 = v3 * (1 - fracX) + v4 * fracX;
    return i1 * (1 - fracY) + i2 * fracY;
  }

  /**
   * Perlin-like noise with octaves
   */
  private octaveNoise(x: number, y: number, octaves: number = 3): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += this.smoothNoise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return value / maxValue;
  }

  /**
   * Generate a single frame of pixel art water animation
   */
  generateFrame(frameIndex: number): ImageData {
    const { width, height, tileResolution, colorPalette, turbulence, flowOffset, animationSpeed } = this.config;
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Disable smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false;
    
    const time = frameIndex * animationSpeed * 0.1;
    
    // Generate tiles using noise-based cellular automata
    for (let ty = 0; ty < this.tileHeight; ty++) {
      for (let tx = 0; tx < this.tileWidth; tx++) {
        // Calculate noise value for this tile
        const noiseX = (tx + time * flowOffset) * 0.1;
        const noiseY = ty * 0.1;
        
        // Layer multiple noise octaves for detail
        let noiseValue = 0;
        noiseValue += this.octaveNoise(noiseX, noiseY) * 1.0;
        noiseValue += this.octaveNoise(noiseX * 2, noiseY * 2 + time) * 0.5;
        noiseValue += this.octaveNoise(noiseX * 4, noiseY * 4 - time) * 0.25;
        
        // Normalize to 0-1 range
        noiseValue = (noiseValue + 1) / 2;
        noiseValue = Math.max(0, Math.min(1, noiseValue));
        
        // Add turbulence distortion
        const distortion = this.octaveNoise(tx * 0.05 + time, ty * 0.05 - time) * turbulence;
        noiseValue = Math.max(0, Math.min(1, noiseValue + distortion * 0.3));
        
        // Select color from palette based on noise value
        const colorIndex = Math.floor(noiseValue * (colorPalette.length - 1));
        const color = colorPalette[Math.max(0, Math.min(colorPalette.length - 1, colorIndex))];
        
        // Draw tile at scaled position
        ctx.fillStyle = color;
        ctx.fillRect(
          tx * tileResolution,
          ty * tileResolution,
          tileResolution,
          tileResolution
        );
      }
    }
    
    // Add horizontal flow lines for animation feel
    this.addFlowLines(ctx, time, width, height, tileResolution);
    
    return ctx.getImageData(0, 0, width, height);
  }

  /**
   * Add subtle flow lines to enhance the water animation effect
   */
  private addFlowLines(ctx: CanvasRenderingContext2D, time: number, width: number, height: number, tileSize: number) {
    const lineCount = Math.floor(height / (tileSize * 3));
    
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ffffff';
    
    for (let i = 0; i < lineCount; i++) {
      const baseY = (i + 1) * (height / (lineCount + 1));
      const waveOffset = Math.sin(time * 2 + i * 0.5) * (tileSize * 0.5);
      
      // Draw intermittent highlight lines
      for (let x = 0; x < width; x += tileSize * 2) {
        const segmentNoise = this.octaveNoise(x * 0.02 + time, i * 0.3);
        if (segmentNoise > 0.3) {
          ctx.fillRect(
            x,
            baseY + waveOffset,
            tileSize,
            Math.max(1, Math.floor(tileSize * 0.25))
          );
        }
      }
    }
    
    ctx.globalAlpha = 1.0;
  }

  /**
   * Generate all frames for the animation
   */
  async generateFrames(
    onProgress?: (progress: number, frame: ImageData) => void
  ): Promise<ImageData[]> {
    const frames: ImageData[] = [];
    const totalFrames = this.config.frameCount;
    
    for (let i = 0; i < totalFrames; i++) {
      const frame = this.generateFrame(i);
      frames.push(frame);
      
      if (onProgress) {
        onProgress((i + 1) / totalFrames, frame);
      }
      
      // Yield to event loop to keep UI responsive
      if (i % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    return frames;
  }

  /**
   * Generate a single frame without storing it (for streaming)
   */
  generateFrameSync(frameIndex: number): ImageData {
    return this.generateFrame(frameIndex);
  }
}
