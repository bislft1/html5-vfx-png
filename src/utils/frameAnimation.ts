export interface FrameAnimationOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  frames: ImageData[];
  fps: number;
  onFrameUpdate?: (frameIndex: number) => void;
}

export class FrameAnimation {
  private canvas: HTMLCanvasElement | null;
  private ctx: CanvasRenderingContext2D | null;
  private frames: ImageData[];
  private fps: number;
  private isPlaying: boolean;
  private currentFrameIndex: number;
  private animationId: number | null;
  private lastFrameTime: number;
  private onFrameUpdate?: (frameIndex: number) => void;

  constructor(options: FrameAnimationOptions) {
    this.canvas = options.canvasRef.current || null;
    this.ctx = this.canvas?.getContext('2d') || null;
    this.frames = options.frames;
    
    // Validate FPS
    this.fps = options.fps > 0 ? options.fps : 30;
    
    this.isPlaying = false;
    this.currentFrameIndex = 0;
    this.animationId = null;
    this.lastFrameTime = 0;
    this.onFrameUpdate = options.onFrameUpdate;
  }

  /**
   * Update the frames array (e.g., after regeneration)
   */
  setFrames(frames: ImageData[]) {
    this.frames = frames;
    this.currentFrameIndex = Math.min(this.currentFrameIndex, frames.length - 1);
  }

  /**
   * Set the callback for frame updates
   */
  setFrameUpdateCallback(callback?: (frameIndex: number) => void) {
    this.onFrameUpdate = callback;
  }

  /**
   * Start playback from current frame position
   */
  play() {
    if (this.isPlaying || this.frames.length === 0) return;
    
    this.isPlaying = true;
    this.lastFrameTime = performance.now();
    this.animate();
  }

  /**
   * Pause playback, retaining current frame
   */
  pause() {
    this.isPlaying = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Stop and reset to first frame
   */
  stop() {
    this.pause();
    this.currentFrameIndex = 0;
    this.drawCurrentFrame();
  }

  /**
   * Go to a specific frame
   */
  goToFrame(index: number) {
    const clampedIndex = Math.max(0, Math.min(this.frames.length - 1, index));
    this.currentFrameIndex = clampedIndex;
    this.drawCurrentFrame();
  }

  /**
   * Get current frame index
   */
  getCurrentFrameIndex(): number {
    return this.currentFrameIndex;
  }

  /**
   * Check if currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get total frame count
   */
  getFrameCount(): number {
    return this.frames.length;
  }

  /**
   * Draw the current frame to canvas
   */
  private drawCurrentFrame() {
    if (!this.ctx || this.frames.length === 0) return;
    
    const frame = this.frames[this.currentFrameIndex];
    this.ctx.putImageData(frame, 0, 0);
    
    if (this.onFrameUpdate) {
      this.onFrameUpdate(this.currentFrameIndex);
    }
  }

  /**
   * Animation loop
   */
  private animate = () => {
    if (!this.isPlaying || this.frames.length === 0) return;

    const now = performance.now();
    const frameInterval = 1000 / this.fps;

    if (now - this.lastFrameTime >= frameInterval) {
      // Advance to next frame
      this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
      this.drawCurrentFrame();
      this.lastFrameTime = now;
    }

    this.animationId = requestAnimationFrame(this.animate);
  };

  /**
   * Cleanup resources
   */
  destroy() {
    this.pause();
    this.canvas = null;
    this.ctx = null;
    this.frames = [];
  }
}
