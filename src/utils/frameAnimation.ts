/**
 * FrameAnimation - Playback class for pre-generated frames
 * This is the "trivial" playback stage that simply selects and draws frames
 * with NO simulation recalculation
 */
export class FrameAnimation {
  private frames: ImageData[];
  private fps: number;
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private startTime: number = 0;
  private animationFrameId: number | null = null;
  private onFrameUpdate?: (frameIndex: number) => void;

  constructor(frames: ImageData[], fps: number, onFrameUpdate?: (frameIndex: number) => void) {
    this.frames = frames;
    this.fps = fps;
    this.onFrameUpdate = onFrameUpdate;
  }

  /**
   * Draw the current frame to a canvas context
   * This is the core "trivial playback" operation - just putting pixels
   */
  draw(ctx: CanvasRenderingContext2D): void {
    if (this.frames.length === 0) return;
    
    const frame = this.frames[this.currentIndex];
    ctx.putImageData(frame, 0, 0);
  }

  /**
   * Start playback loop
   */
  play(): void {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.startTime = performance.now();
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

    this.animationFrameId = requestAnimationFrame(this.animate);
  };
}
