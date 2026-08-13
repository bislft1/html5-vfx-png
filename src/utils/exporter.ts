import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Export utilities for frame sequences
 */
export class FrameExporter {
  /**
   * Export frames as PNG sequence in a ZIP file
   */
  static async exportAsPNGSequence(
    frames: ImageData[],
    filename: string = 'water-animation'
  ): Promise<void> {
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
   */
  static async exportAsSpritesheet(
    frames: ImageData[],
    columns: number = 10,
    filename: string = 'water-spritesheet'
  ): Promise<void> {
    const frameWidth = frames[0].width;
    const frameHeight = frames[0].height;
    const rows = Math.ceil(frames.length / columns);
    
    const canvas = document.createElement('canvas');
    canvas.width = frameWidth * columns;
    canvas.height = frameHeight * rows;
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
    
    // Also export metadata JSON
    const metadata = {
      frameWidth,
      frameHeight,
      frameCount: frames.length,
      columns,
      rows,
      fps: 30
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
    // Check if WebP animation is supported
    const testCanvas = document.createElement('canvas');
    testCanvas.width = frames[0].width;
    testCanvas.height = frames[0].height;
    
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
   */
  private static canvasToBlob(
    canvas: HTMLCanvasElement,
    type: string = 'image/png',
    quality?: number
  ): Promise<Blob> {
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob!),
        type,
        quality
      );
    });
  }

  /**
   * Get estimated file size for frames
   */
  static async estimateSize(frames: ImageData[]): Promise<{ pngMB: number; webpMB: number }> {
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
