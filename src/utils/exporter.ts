import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Export utilities for frame sequences
 */
export class FrameExporter {
  // Conservative canvas size limits (most browsers support up to 16384x16384)
  private static readonly MAX_CANVAS_SIZE = 16384;
  private static readonly MAX_PIXEL_AREA = 268435456; // 16384^2

  /**
   * Export frames as PNG sequence in a ZIP file
   */
  static async exportAsPNGSequence(
    frames: ImageData[],
    filename: string = 'water-animation'
  ): Promise<void> {
    // Guard against empty frames
    if (!frames || frames.length === 0) {
      throw new Error('No frames to export');
    }

    const zip = new JSZip();
    
    for (let i = 0; i < frames.length; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = frames[i].width;
      canvas.height = frames[i].height;
      const ctx = canvas.getContext('2d')!;
      
      ctx.putImageData(frames[i], 0, 0);
      
      const pngBlob = await this.canvasToBlob(canvas, 'image/png');
      const frameNumber = String(i).padStart(4, '0');
      zip.file(`frame_${frameNumber}.png`, pngBlob);
    }
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${filename}.zip`);
  }

  /**
   * Export frames as a spritesheet (single image with all frames)
   * @param frames - Array of ImageData frames
   * @param fps - Frames per second for metadata
   * @param columns - Number of columns in the spritesheet
   * @param filename - Base filename for output files
   */
  static async exportAsSpritesheet(
    frames: ImageData[],
    fps: number = 30,
    columns: number = 10,
    filename: string = 'water-spritesheet'
  ): Promise<void> {
    // Guard against empty frames
    if (!frames || frames.length === 0) {
      throw new Error('No frames to export');
    }

    const frameWidth = frames[0].width;
    const frameHeight = frames[0].height;
    const rows = Math.ceil(frames.length / columns);
    
    const totalWidth = frameWidth * columns;
    const totalHeight = frameHeight * rows;

    // Check for supported maximum dimensions
    if (totalWidth > this.MAX_CANVAS_SIZE || totalHeight > this.MAX_CANVAS_SIZE) {
      throw new Error(
        `Spritesheet dimensions (${totalWidth}x${totalHeight}) exceed maximum supported size (${this.MAX_CANVAS_SIZE}x${this.MAX_CANVAS_SIZE})`
      );
    }

    // Check for maximum pixel area
    const totalPixels = totalWidth * totalHeight;
    if (totalPixels > this.MAX_PIXEL_AREA) {
      throw new Error(
        `Spritesheet pixel area (${totalPixels}) exceeds maximum supported area (${this.MAX_PIXEL_AREA})`
      );
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d')!;
    
    // Fill with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw each frame
    for (let i = 0; i < frames.length; i++) {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x = col * frameWidth;
      const y = row * frameHeight;
      
      ctx.putImageData(frames[i], x, y);
    }
    
    const pngBlob = await this.canvasToBlob(canvas, 'image/png');
    saveAs(pngBlob, `${filename}.png`);
    
    // Also export metadata JSON with fps parameter
    const metadata = {
      frameWidth,
      frameHeight,
      frameCount: frames.length,
      columns,
      rows,
      fps
    };
    
    const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    saveAs(jsonBlob, `${filename}-metadata.json`);
  }

  /**
   * Export as WebP animation (if browser supports it)
   */
  static async exportAsWebP(
    frames: ImageData[],
    fps: number = 30,
    quality: number = 0.8,
    filename: string = 'water-animation'
  ): Promise<void> {
    // Guard against empty frames
    if (!frames || frames.length === 0) {
      throw new Error('No frames to export');
    }

    // For now, export as individual WebP frames in ZIP
    const zip = new JSZip();
    
    for (let i = 0; i < frames.length; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = frames[i].width;
      canvas.height = frames[i].height;
      const ctx = canvas.getContext('2d')!;
      
      ctx.putImageData(frames[i], 0, 0);
      
      const webpBlob = await this.canvasToBlob(canvas, 'image/webp', quality);
      const frameNumber = String(i).padStart(4, '0');
      zip.file(`frame_${frameNumber}.webp`, webpBlob);
    }
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${filename}-webp.zip`);
  }

  /**
   * Helper: Convert canvas to blob
   * Rejects when toBlob supplies no blob or when blob type doesn't match requested type
   */
  private static canvasToBlob(
    canvas: HTMLCanvasElement,
    type: string = 'image/png',
    quality?: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob returned null'));
            return;
          }
          if (blob.type !== type) {
            reject(new Error(`Canvas toBlob returned wrong type: ${blob.type} instead of ${type}`));
            return;
          }
          resolve(blob);
        },
        type,
        quality
      );
    });
  }

  /**
   * Get estimated file size for frames
   */
  static async estimateSize(frames: ImageData[]): Promise<{ pngMB: number; webpMB: number }> {
    // Guard against empty frames
    if (!frames || frames.length === 0) {
      return { pngMB: 0, webpMB: 0 };
    }

    const sampleSize = Math.min(10, frames.length);
    let totalPngSize = 0;
    let totalWebpSize = 0;
    
    for (let i = 0; i < sampleSize; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = frames[i].width;
      canvas.height = frames[i].height;
      const ctx = canvas.getContext('2d')!;
      
      ctx.putImageData(frames[i], 0, 0);
      
      const pngBlob = await this.canvasToBlob(canvas, 'image/png');
      const webpBlob = await this.canvasToBlob(canvas, 'image/webp', 0.8);
      
      totalPngSize += pngBlob.size;
      totalWebpSize += webpBlob.size;
    }
    
    const avgPngSize = totalPngSize / sampleSize;
    const avgWebpSize = totalWebpSize / sampleSize;
    
    return {
      pngMB: (avgPngSize * frames.length) / (1024 * 1024),
      webpMB: (avgWebpSize * frames.length) / (1024 * 1024)
    };
  }
}
