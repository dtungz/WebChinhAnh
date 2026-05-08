/**
 * Utility functions for PixelForge
 */

export const Utils = {
    // Convert bytes to human readable format
    formatBytes: (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    },

    // Calculate reduction percentage
    calculateReduction: (original, processed) => {
        if (!original || !processed) return 0;
        const reduction = ((original - processed) / original) * 100;
        return reduction.toFixed(1);
    },

    // Check if file size is within limits (20MB)
    isValidFileSize: (file, maxSizeMB = 20) => {
        const maxSize = maxSizeMB * 1024 * 1024;
        return file.size <= maxSize;
    },

    // Load image from File object
    loadImage: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    // Download blob as file
    downloadBlob: (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Get file extension from MIME type
    getExtension: (mimeType) => {
        switch (mimeType) {
            case 'image/jpeg': return 'jpg';
            case 'image/png': return 'png';
            case 'image/webp': return 'webp';
            default: return 'png';
        }
    }
};
