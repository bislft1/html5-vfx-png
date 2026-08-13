/**
 * FrameAnimation - Playback class for pre-generated frames
 * This is the "trivial" playback stage that simply selects and draws frames
 * with NO simulation recalculation
 */
import type { RefObject } from 'react';

export interface FrameAnimationOptions {
  canvasRef: RefObject<HTMLCanvasElement>;
  frames: ImageData[];
  fps: number;
  onFrameUpdate?: (frameIndex: number) => void;
}

export class FrameAnimation {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private frames: ImageData[];
  private fps: number;
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private startTime: number = 0;
  private animationFrameId: number | null = null;
  private onFrameUpdate?: (frameIndex: number) => void;

  constructor(options: FrameAnimationOptions) {
    this.canvas = options.canvasRef.current || null;
    this.frames = options.frames;
    // Validate FPS: must be positive, default to 30 if invalid
    this.fps = options.fps > 0 ? options.fps : 30;
    this.onFrameUpdate = options.onFrameUpdate;
    
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
  }

  /**
   * Draw the current frame to a canvas context
   * This is the core "trivial playback" operation - just putting pixels
   */
  draw(ctx?: CanvasRenderingContext2D): void {
    if (this.frames.length === 0) return;
    
    const targetCtx = ctx || this.ctx;
    if (!targetCtx) return;
    
    const frame = this.frames[this.currentIndex];
    targetCtx.putImageData(frame, 0, 0);
  }

  /**
   * Start playback loop
   * Preserves the current frame position when resuming
   */
  play(): void {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    // Do not reset startTime to preserve current frame position
    this.animate();
  }

  /**
   * Stop playback
   */
  stop(): void {
    this.isPlaying = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Go to a specific frame
   */
  goToFrame(index: number): void {
    this.currentIndex = Math.max(0, Math.min(index, this.frames.length - 1));
    // Update startTime to reflect the new frame position
    this.startTime = performance.now() - (this.currentIndex / this.fps) * 1000;
  }

  /**
   * Get current frame index
   */
  getCurrentFrame(): number {
    return this.currentIndex;
  }

  /**
   * Get total frame count
   */
  getFrameCount(): number {
    return this.frames.length;
  }

  /**
   * Check if currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Export current frame as PNG data URL
   */
  exportCurrentFrameAsPNG(): string {
    if (this.frames.length === 0) return '';
    
    const canvas = document.createElement('canvas');
    canvas.width = this.frames[0].width;
    canvas.height = this.frames[0].height;
    const ctx = canvas.getContext('2d')!;
    
    ctx.putImageData(this.frames[this.currentIndex], 0, 0);
    return canvas.toDataURL('image/png');
  }

  private animate = (): void => {
    if (!this.isPlaying) return;

    const elapsed = performance.now() - this.startTime;
    const targetFrame = Math.floor((elapsed / 1000) * this.fps) % this.frames.length;
    
    if (targetFrame !== this.currentIndex) {
      this.currentIndex = targetFrame;
      if (this.onFrameUpdate) {
        this.onFrameUpdate(this.currentIndex);
      }
    }

    // Retain canvas context and call putImageData for selected frame
    this.draw();

    this.animationFrameId = requestAnimationFrame(this.animate);
  };
}
