/**
 * Image Compressor Module
 */

export const Compressor = {
    /**
     * Compress an image
     * @param {HTMLImageElement} image 
     * @param {Object} options - { quality: number, format: string }
     * @returns {Promise<{blob: Blob, dataUrl: string, width: number, height: number}>}
     */
    compressImage: (image, options = { quality: 0.8, format: 'image/jpeg' }) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Keep original dimensions
            canvas.width = image.width;
            canvas.height = image.height;
            
            // Draw image on canvas
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            
            // Convert to dataUrl for preview
            const dataUrl = canvas.toDataURL(options.format, options.quality);
            
            // Convert to Blob for download and size calculation
            canvas.toBlob((blob) => {
                resolve({
                    blob,
                    dataUrl,
                    width: canvas.width,
                    height: canvas.height
                });
            }, options.format, options.quality);
        });
    }
};
