// Low Data Mode Optimization for Nepal
// Compresses images, reduces quality, and provides data-saving utilities
// for mobile data (Ncell/NTc) which is expensive in Nepal

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'webp' | 'jpeg';
}

// Default low-data settings: aggressive compression for mobile
export const LOW_DATA_DEFAULTS: ImageOptimizationOptions = {
  maxWidth: 600,
  maxHeight: 600,
  quality: 0.6,
  format: 'webp',
};

// Normal quality for desktop/wifi
export const NORMAL_DEFAULTS: ImageOptimizationOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  format: 'webp',
};

// Check if low data mode is enabled (localStorage flag or connection API)
export function isLowDataMode(): boolean {
  // Check user preference
  const saved = localStorage.getItem('pasal_low_data');
  if (saved !== null) return saved === 'true';

  // Check Network Information API
  const conn = (navigator as any).connection;
  if (conn) {
    // Save data mode or slow connection
    if (conn.saveData) return true;
    const effectiveType = conn.effectiveType;
    if (effectiveType === '2g' || effectiveType === 'slow-2g') return true;
  }

  return false;
}

// Set low data mode preference
export function setLowDataMode(enabled: boolean) {
  localStorage.setItem('pasal_low_data', String(enabled));
}

// Compress image file to reduce size
export async function compressImage(
  file: File | Blob,
  options: ImageOptimizationOptions = {},
): Promise<{ blob: Blob; dataUrl: string; originalSize: number; compressedSize: number }> {
  const opts = { ...LOW_DATA_DEFAULTS, ...options };
  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Resize if needed
        const maxW = opts.maxWidth || 600;
        const maxH = opts.maxHeight || 600;
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = opts.format === 'webp' ? 'image/webp' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, opts.quality);

        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error('Compression failed')); return; }
          resolve({
            blob,
            dataUrl,
            originalSize,
            compressedSize: blob.size,
          });
        }, mimeType, opts.quality);
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
};

// Get optimized image URL with size params
export function getOptimizedImageUrl(url: string, width = 400): string {
  // For local images, return as-is (already optimized)
  if (url.startsWith('/images/')) return url;
  // For external URLs, add size params if supported
  if (url.includes('pexels.com')) {
    return url + (url.includes('?') ? '&' : '?') + `auto=compress&cs=tinysrgb&w=${width}`;
  }
  return url;
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Calculate data savings
export function getDataSavings(original: number, compressed: number): { saved: number; percentage: number } {
  const saved = original - compressed;
  const percentage = original > 0 ? Math.round((saved / original) * 100) : 0;
  return { saved, percentage };
}
