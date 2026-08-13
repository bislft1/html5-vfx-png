import JSZip from 'jszip';

const MAX_CANVAS_SIZE = 8192;
const MAX_TOTAL_PIXELS = 64 * 1024 * 1024; // 64 megapixels

export interface ExportResult {
  success: boolean;
  error?: string;
  blob?: Blob;
}

/**
 * Estimate the size of a frame in bytes (rough estimate for PNG)
 */
function estimateFrameSize(width: number, height: number): number {
  // Rough estimate: 3-4 bytes per pixel for simple graphics, more for complex
  return Math.floor(width * height * 3.5);
}

/**
 * Export frames as individual PNG files in a ZIP archive
 */
export async function exportAsPngSequence(
  frames: ImageData[],
  filename: string = 'animation'
): Promise<ExportResult> {
  if (frames.length === 0) {
    return { success: false, error: 'No frames to export' };
  }

  try {
    const zip = new JSZip();
    const frameDir = zip.folder(filename);

    for (let i = 0; i < frames.length; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = frames[i].width;
      canvas.height = frames[i].height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(frames[i], 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      const paddedIndex = String(i).padStart(4, '0');
      frameDir?.file(`${filename}_${paddedIndex}.png`, blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return { success: true, blob: zipBlob };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Export failed' 
    };
  }
}

/**
 * Export frames as a spritesheet with metadata
 */
export async function exportAsSpritesheet(
  frames: ImageData[],
  fps: number,
  filename: string = 'spritesheet'
): Promise<ExportResult> {
  if (frames.length === 0) {
    return { success: false, error: 'No frames to export' };
  }

  const frameWidth = frames[0].width;
  const frameHeight = frames[0].height;

  // Validate dimensions
  if (frameWidth <= 0 || frameHeight <= 0) {
    return { success: false, error: 'Invalid frame dimensions' };
  }

  // Check against maximum limits
  const totalPixels = frameWidth * frameHeight * frames.length;
  if (totalPixels > MAX_TOTAL_PIXELS) {
    return { 
      success: false, 
      error: `Total pixel count (${totalPixels}) exceeds maximum (${MAX_TOTAL_PIXELS})` 
    };
  }

  // Calculate grid layout
  const columns = Math.ceil(Math.sqrt(frames.length));
  const rows = Math.ceil(frames.length / columns);
  const sheetWidth = frameWidth * columns;
  const sheetHeight = frameHeight * rows;

  // Check canvas size limits
  if (sheetWidth > MAX_CANVAS_SIZE || sheetHeight > MAX_CANVAS_SIZE) {
    return { 
      success: false, 
      error: `Spritesheet dimensions (${sheetWidth}x${sheetHeight}) exceed maximum (${MAX_CANVAS_SIZE}x${MAX_CANVAS_SIZE})` 
    };
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = sheetWidth;
    canvas.height = sheetHeight;
    const ctx = canvas.getContext('2d')!;
    
    ctx.imageSmoothingEnabled = false;

    // Draw all frames onto the spritesheet
    for (let i = 0; i < frames.length; i++) {
      const col = i % columns;
      const row = Math.floor(i / columns);
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = frameWidth;
      tempCanvas.height = frameHeight;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.putImageData(frames[i], 0, 0);

      ctx.drawImage(
        tempCanvas,
        col * frameWidth,
        row * frameHeight
      );
    }

    // Create metadata JSON
    const metadata = {
      frameWidth,
      frameHeight,
      totalFrames: frames.length,
      fps,
      columns,
      rows,
      animations: {
        default: {
          start: 0,
          end: frames.length - 1,
          loop: true,
        },
      },
    };

    // Export as ZIP with image and metadata
    const zip = new JSZip();
    
    const imageBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    });
    zip.file(`${filename}.png`, imageBlob);
    zip.file(`${filename}.json`, JSON.stringify(metadata, null, 2));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return { success: true, blob: zipBlob };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Export failed' 
    };
  }
}

/**
 * Export frames as WebP animation (if supported) or fallback to PNG sequence
 */
export async function exportAsWebP(
  frames: ImageData[],
  fps: number,
  filename: string = 'animation'
): Promise<ExportResult> {
  if (frames.length === 0) {
    return { success: false, error: 'No frames to export' };
  }

  // Check if WebP is supported
  const webpSupported = await checkWebPSupport();
  
  if (!webpSupported) {
    // Fallback to PNG sequence
    return exportAsPngSequence(frames, filename);
  }

  try {
    // For animated WebP, we need to use a different approach
    // Since browser support varies, we'll export as individual WebP frames in ZIP
    const zip = new JSZip();
    const frameDir = zip.folder(filename);

    for (let i = 0; i < frames.length; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = frames[i].width;
      canvas.height = frames[i].height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(frames[i], 0, 0);

      const blob = await canvasToBlob(canvas, 'image/webp', 0.8);
      
      const paddedIndex = String(i).padStart(4, '0');
      frameDir?.file(`${filename}_${paddedIndex}.webp`, blob);
    }

    // Add a simple metadata file for animation timing
    const metadata = {
      fps,
      frameCount: frames.length,
      format: 'webp',
    };
    zip.file('metadata.json', JSON.stringify(metadata, null, 2));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return { success: true, blob: zipBlob };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Export failed' 
    };
  }
}

/**
 * Check if WebP format is supported
 */
async function checkWebPSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1, 1);
    
    canvas.toBlob((blob) => {
      resolve(blob !== null && blob.type === 'image/webp');
    }, 'image/webp');
  });
}

/**
 * Convert canvas to blob with validation
 */
async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string = 'image/png',
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob from canvas'));
        return;
      }
      
      if (blob.type !== type) {
        reject(new Error(`Requested ${type} but got ${blob.type}`));
        return;
      }
      
      resolve(blob);
    }, type, quality);
  });
}

/**
 * Estimate total export size
 */
export function estimateExportSize(
  frames: ImageData[],
  format: 'png' | 'webp' | 'spritesheet'
): number {
  if (frames.length === 0) return 0;

  const baseSize = estimateFrameSize(frames[0].width, frames[0].height);
  
  switch (format) {
    case 'png':
      return baseSize * frames.length * 1.1; // ~10% overhead for ZIP
    case 'webp':
      return baseSize * frames.length * 0.7; // WebP is typically 30% smaller
    case 'spritesheet':
      return baseSize * frames.length * 0.9; // Slightly more efficient
    default:
      return baseSize * frames.length;
  }
}
