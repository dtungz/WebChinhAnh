/**
 * Pixel Art Converter Module
 */

const Pixelator = {
    /**
     * Convert an image to pixel art
     * @param {HTMLImageElement} image 
     * @param {Object} options - { pixelSize: number, format: string }
     * @returns {Promise<{blob: Blob, dataUrl: string, width: number, height: number}>}
     */
    pixelateImage: (image, options = { pixelSize: 8, format: 'image/png' }) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const width = image.width;
            const height = image.height;
            
            canvas.width = width;
            canvas.height = height;
            
            // Calculate downscaled dimensions
            const pSize = options.pixelSize;
            const scaledW = Math.max(1, Math.floor(width / pSize));
            const scaledH = Math.max(1, Math.floor(height / pSize));
            
            // Step 1: Draw downscaled image on an offscreen canvas
            const offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.width = scaledW;
            offscreenCanvas.height = scaledH;
            const offCtx = offscreenCanvas.getContext('2d');
            offCtx.drawImage(image, 0, 0, scaledW, scaledH);
            
            // Step 2: Disable smoothing for nearest-neighbor interpolation
            ctx.imageSmoothingEnabled = false;
            
            // Step 3: Draw it back scaled up
            ctx.drawImage(offscreenCanvas, 0, 0, scaledW, scaledH, 0, 0, width, height);
            
            // Get output
            const dataUrl = canvas.toDataURL(options.format, 1.0);
            
            canvas.toBlob((blob) => {
                resolve({
                    blob,
                    dataUrl,
                    width,
                    height
                });
            }, options.format, 1.0);
        });
    }
};
