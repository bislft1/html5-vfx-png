import { WaterConfig } from '../types';
import { SimplexNoise } from './noise';

interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Generates a single frame of water animation using Gerstner waves and noise
 */
export class WaterGenerator {
  private config: WaterConfig;
  private noise: SimplexNoise;
  
  constructor(config: WaterConfig) {
    this.config = config;
    this.noise = new SimplexNoise(config.seed);
  }

  /**
   * Generate a single frame at the specified index
   * This enables incremental generation with progress tracking
   */
  generateFrame(frameIndex: number): ImageData {
    const { width, height, frameCount, fps } = this.config;
    
    // Calculate loop duration for seamless looping
    const loopDuration = frameCount / fps;
    const time = frameIndex / fps;
    const normalizedTime = frameIndex / frameCount;
    
    // Create canvas for this frame
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Render water layers
    this.renderWater(ctx, width, height, time, normalizedTime, loopDuration);
    
    return ctx.getImageData(0, 0, width, height);
  }

  /**
   * Generate all frames for the animation sequence
   * Returns array of ImageData objects (one per frame)
   * Note: For large frame counts, use generateFrame() for incremental generation
   */
  generateFrames(): ImageData[] {
    const frames: ImageData[] = [];
    const { frameCount } = this.config;
    
    for (let f = 0; f < frameCount; f++) {
      frames.push(this.generateFrame(f));
    }
    
    return frames;
  }

  /**
   * Render water with multiple layers and shading
   */
  private renderWater(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    normalizedTime: number,
    loopDuration: number
  ): void {
    const { 
      baseColor, highlightColor, shadowColor,
      waveAmplitude, waveFrequency, waveSpeed, waveDirection,
      layerCount, layerDepthFactor,
      specularIntensity, roughness
    } = this.config;

    // Clear canvas
    ctx.fillStyle = shadowColor;
    ctx.fillRect(0, 0, width, height);

    // Parse colors
    const baseRGB = this.hexToRgb(baseColor);
    const highlightRGB = this.hexToRgb(highlightColor);
    const shadowRGB = this.hexToRgb(shadowColor);

    // Render each layer from back to front
    for (let layer = 0; layer < layerCount; layer++) {
      const depth = layer / layerCount;
      const layerScale = 1 - depth * (1 - layerDepthFactor);
      const layerAmplitude = waveAmplitude * (1 - depth * 0.5);
      const layerSpeed = waveSpeed * (1 - depth * 0.3);
      
      // Time offset for seamless looping - derive phase solely from normalizedTime
      // This ensures identical values at frame 0 and the next loop boundary
      const layerPhase = (normalizedTime * layerCount) % 1.0;
      const layerTime = time * layerSpeed + layerPhase * loopDuration;
      
      // Adjust noise sampling coordinates to follow the same periodic path
      this.noise.setSeedOffset(layer * 100);
      
      this.renderWaveLayer(
        ctx,
        width,
        height,
        layer,
        layerScale,
        layerAmplitude,
        layerTime,
        waveFrequency,
        waveDirection,
        baseRGB,
        highlightRGB,
        shadowRGB,
        specularIntensity,
        roughness,
        depth
      );
    }
  }

  /**
   * Render a single wave layer using Gerstner waves
   */
  private renderWaveLayer(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    layerIndex: number,
    scale: number,
    amplitude: number,
    time: number,
    frequency: number,
    direction: number,
    baseRGB: RGB,
    highlightRGB: RGB,
    shadowRGB: RGB,
    specularIntensity: number,
    roughness: number,
    depth: number
  ): void {
    const resolution = 4; // Pixel sampling resolution
    
    ctx.beginPath();
    
    // Generate wave path
    let firstPoint = true;
    for (let x = 0; x <= width; x += resolution) {
      const y = this.calculateWaveHeight(
        x,
        time,
        frequency,
        amplitude,
        direction,
        layerIndex
      );
      
      const screenY = height / 2 + y * scale;
      
      if (firstPoint) {
        ctx.moveTo(x, screenY);
        firstPoint = false;
      } else {
        ctx.lineTo(x, screenY);
      }
    }
    
    // Close the path to fill below the wave
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    
    // Create gradient for this layer
    const gradient = ctx.createLinearGradient(0, height / 2 - amplitude, 0, height);
    const blendFactor = depth * 0.3;
    
    gradient.addColorStop(0, this.rgbToString({
      r: Math.round(baseRGB.r + (highlightRGB.r - baseRGB.r) * blendFactor),
      g: Math.round(baseRGB.g + (highlightRGB.g - baseRGB.g) * blendFactor),
      b: Math.round(baseRGB.b + (highlightRGB.b - baseRGB.b) * blendFactor),
      a: 0.9 - depth * 0.3
    }));
    gradient.addColorStop(1, this.rgbToString({
      r: Math.round(baseRGB.r + (shadowRGB.r - baseRGB.r) * blendFactor),
      g: Math.round(baseRGB.g + (shadowRGB.g - baseRGB.g) * blendFactor),
      b: Math.round(baseRGB.b + (shadowRGB.b - baseRGB.b) * blendFactor),
      a: 1 - depth * 0.2
    }));
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add highlights on wave crests
    this.addHighlights(
      ctx,
      width,
      height,
      time,
      frequency,
      amplitude,
      direction,
      highlightRGB,
      specularIntensity,
      roughness,
      scale,
      layerIndex
    );
  }

  /**
   * Calculate wave height at a point using Gerstner waves combined with noise
   */
  private calculateWaveHeight(
    x: number,
    time: number,
    frequency: number,
    amplitude: number,
    direction: number,
    layerIndex: number
  ): number {
    // Primary Gerstner wave
    const wavePhase = x * frequency - time * 2 + layerIndex;
    let height = Math.sin(wavePhase) * amplitude;
    
    // Add secondary wave for complexity
    height += Math.sin(wavePhase * 2.3 + layerIndex) * amplitude * 0.3;
    
    // Add noise-based detail
    const noiseX = x * 0.01;
    const noiseTime = time * 0.5;
    const noiseValue = this.noise.fbm(noiseX, noiseTime, 3, 2, 0.5);
    height += noiseValue * amplitude * 0.2;
    
    // Apply directional component
    const dirRad = (direction * Math.PI) / 180;
    height *= Math.cos(dirRad);
    
    return height;
  }

  /**
   * Add specular highlights on wave crests
   * Uses full wave-height derivative including amplitude and secondary wave contribution
   */
  private addHighlights(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    frequency: number,
    amplitude: number,
    direction: number,
    highlightRGB: RGB,
    specularIntensity: number,
    roughness: number,
    scale: number,
    layerIndex: number
  ): void {
    const highlightWidth = 3;
    
    ctx.save();
    ctx.globalAlpha = specularIntensity * (1 - roughness);
    
    for (let x = 0; x <= width; x += highlightWidth * 2) {
      const wavePhase = x * frequency - time * 2 + layerIndex;
      
      // Full wave-height derivative including amplitude and secondary wave contribution
      const primaryDerivative = Math.cos(wavePhase) * frequency * amplitude;
      const secondaryDerivative = Math.cos(wavePhase * 2.3 + layerIndex) * (frequency * 2.3) * (amplitude * 0.3);
      const totalSlope = primaryDerivative + secondaryDerivative;
      
      // Highlight intensity based on calibrated wave slope
      const slope = Math.abs(totalSlope);
      // Calibrated thresholds for slope-based highlighting
      if (slope > 0.15 && slope < 0.5) {
        const y = this.calculateWaveHeight(x, time, frequency, amplitude, direction, layerIndex);
        const screenY = height / 2 + y * scale;
        
        // Intensity scaled by slope within calibrated range
        const intensity = Math.min(1, (slope - 0.15) / 0.35);
        ctx.fillStyle = this.rgbToString({
          r: highlightRGB.r,
          g: highlightRGB.g,
          b: highlightRGB.b,
          a: intensity * 0.6 * specularIntensity * (1 - roughness)
        });
        
        ctx.beginPath();
        ctx.ellipse(x, screenY, highlightWidth, highlightWidth * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  }

  /**
   * Utility: Convert hex color to RGB
   */
  private hexToRgb(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * Utility: Convert RGB to CSS rgba string
   */
  private rgbToString(rgb: RGB & { a?: number }): string {
    const a = rgb.a !== undefined ? rgb.a : 1;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
  }
}
