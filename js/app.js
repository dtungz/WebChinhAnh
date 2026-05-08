/**
 * Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    const state = {
        mode: 'compress', // 'compress' or 'pixelate'
        originalImage: null,
        originalFile: null,
        processedBlob: null,
        isProcessing: false
    };

    // --- DOM Elements ---
    const els = {
        // Theme
        themeToggle: document.getElementById('themeToggle'),
        sunIcon: document.querySelector('.sun-icon'),
        moonIcon: document.querySelector('.moon-icon'),
        
        // Tabs
        tabBtns: document.querySelectorAll('.tab-btn'),
        compressControls: document.getElementById('compressControls'),
        pixelateControls: document.getElementById('pixelateControls'),
        
        // Upload
        uploadZone: document.getElementById('uploadZone'),
        fileInput: document.getElementById('fileInput'),
        errorBox: document.getElementById('errorBox'),
        errorText: document.getElementById('errorText'),
        
        // Controls
        qualitySlider: document.getElementById('qualitySlider'),
        qualityValue: document.getElementById('qualityValue'),
        formatSelect: document.getElementById('formatSelect'),
        pixelSizeSlider: document.getElementById('pixelSizeSlider'),
        pixelSizeValue: document.getElementById('pixelSizeValue'),
        downloadBtn: document.getElementById('downloadBtn'),
        
        // Info
        fileInfo: document.getElementById('fileInfo'),
        originalSize: document.getElementById('originalSize'),
        processedSize: document.getElementById('processedSize'),
        reductionValue: document.getElementById('reductionValue'),
        
        // Preview
        emptyState: document.getElementById('emptyState'),
        previewState: document.getElementById('previewState'),
        originalCanvas: document.getElementById('originalCanvas'),
        processedCanvas: document.getElementById('processedCanvas'),
        imageLayerBefore: document.querySelector('.image-layer.before'),
        sliderHandle: document.getElementById('sliderHandle'),
        comparisonSlider: document.querySelector('.comparison-slider')
    };

    // --- Initialization ---
    initTheme();
    bindEvents();

    // --- Event Bindings ---
    function bindEvents() {
        // Theme
        els.themeToggle.addEventListener('click', toggleTheme);
        
        // Tabs
        els.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });
        
        // Upload
        els.uploadZone.addEventListener('click', () => els.fileInput.click());
        els.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            els.uploadZone.classList.add('dragover');
        });
        els.uploadZone.addEventListener('dragleave', () => {
            els.uploadZone.classList.remove('dragover');
        });
        els.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            els.uploadZone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileSelect(e.dataTransfer.files[0]);
            }
        });
        els.fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });
        
        // Controls
        els.qualitySlider.addEventListener('input', (e) => {
            els.qualityValue.textContent = `${e.target.value}%`;
        });
        els.qualitySlider.addEventListener('change', processImage);
        
        els.formatSelect.addEventListener('change', processImage);
        
        els.pixelSizeSlider.addEventListener('input', (e) => {
            els.pixelSizeValue.textContent = `${e.target.value}px`;
        });
        els.pixelSizeSlider.addEventListener('change', processImage);
        
        // Download
        els.downloadBtn.addEventListener('click', handleDownload);
        
        // Comparison Slider
        setupComparisonSlider();
    }

    // --- Theme Management ---
    function initTheme() {
        // Default to dark per plan, but allow toggle
        const isLight = localStorage.getItem('theme') === 'light';
        if (isLight) {
            document.documentElement.classList.replace('dark', 'light');
            els.sunIcon.classList.remove('hidden');
            els.moonIcon.classList.add('hidden');
        }
    }

    function toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            document.documentElement.classList.replace('dark', 'light');
            localStorage.setItem('theme', 'light');
            els.sunIcon.classList.remove('hidden');
            els.moonIcon.classList.add('hidden');
        } else {
            document.documentElement.classList.replace('light', 'dark');
            localStorage.setItem('theme', 'dark');
            els.sunIcon.classList.add('hidden');
            els.moonIcon.classList.remove('hidden');
        }
    }

    // --- Tab Management ---
    function switchTab(mode) {
        state.mode = mode;
        
        els.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === mode);
        });
        
        if (mode === 'compress') {
            els.compressControls.classList.remove('hidden');
            els.pixelateControls.classList.add('hidden');
            els.processedCanvas.classList.remove('pixelated');
        } else {
            els.compressControls.classList.add('hidden');
            els.pixelateControls.classList.remove('hidden');
            els.processedCanvas.classList.add('pixelated');
        }
        
        if (state.originalImage) {
            processImage();
        }
    }

    // --- File Handling ---
    function showError(message) {
        els.errorText.textContent = message;
        els.errorBox.classList.remove('hidden');
        setTimeout(() => els.errorBox.classList.add('hidden'), 5000);
    }

    async function handleFileSelect(file) {
        if (!file.type.startsWith('image/')) {
            showError('Please select a valid image file.');
            return;
        }
        
        if (!Utils.isValidFileSize(file, 20)) {
            showError('File is too large. Maximum size is 20MB.');
            return;
        }
        
        try {
            state.originalFile = file;
            state.originalImage = await Utils.loadImage(file);
            
            // Show preview area
            els.emptyState.classList.add('hidden');
            els.previewState.classList.remove('hidden');
            els.fileInfo.classList.remove('hidden');
            els.downloadBtn.disabled = false;
            
            // Draw original
            drawOriginalCanvas();
            
            // Process
            await processImage();
        } catch (err) {
            showError('Failed to load image.');
            console.error(err);
        }
    }

    // --- Processing ---
    async function processImage() {
        if (!state.originalImage || state.isProcessing) return;
        
        state.isProcessing = true;
        els.uploadZone.style.opacity = '0.5';
        
        try {
            let result;
            if (state.mode === 'compress') {
                result = await Compressor.compressImage(state.originalImage, {
                    quality: els.qualitySlider.value / 100,
                    format: els.formatSelect.value
                });
            } else {
                result = await Pixelator.pixelateImage(state.originalImage, {
                    pixelSize: parseInt(els.pixelSizeSlider.value),
                    format: 'image/png' // Always PNG for pixel art to prevent artifacts
                });
            }
            
            state.processedBlob = result.blob;
            drawProcessedCanvas(result.dataUrl, result.width, result.height);
            updateFileInfo();
            
        } catch (err) {
            showError('Processing failed.');
            console.error(err);
        } finally {
            state.isProcessing = false;
            els.uploadZone.style.opacity = '1';
        }
    }

    // --- Canvas Drawing ---
    function drawOriginalCanvas() {
        const ctx = els.originalCanvas.getContext('2d');
        els.originalCanvas.width = state.originalImage.width;
        els.originalCanvas.height = state.originalImage.height;
        ctx.drawImage(state.originalImage, 0, 0);
    }

    function drawProcessedCanvas(dataUrl, width, height) {
        const img = new Image();
        img.onload = () => {
            const ctx = els.processedCanvas.getContext('2d');
            els.processedCanvas.width = width;
            els.processedCanvas.height = height;
            
            if (state.mode === 'pixelate') {
                ctx.imageSmoothingEnabled = false;
            }
            
            ctx.drawImage(img, 0, 0);
        };
        img.src = dataUrl;
    }

    // --- UI Updates ---
    function updateFileInfo() {
        if (!state.originalFile || !state.processedBlob) return;
        
        const origSize = state.originalFile.size;
        const newSize = state.processedBlob.size;
        
        els.originalSize.textContent = Utils.formatBytes(origSize);
        els.processedSize.textContent = Utils.formatBytes(newSize);
        
        const reduction = Utils.calculateReduction(origSize, newSize);
        
        if (reduction > 0) {
            els.reductionValue.textContent = `-${reduction}%`;
            els.reductionValue.className = 'info-value success';
        } else if (reduction < 0) {
            els.reductionValue.textContent = `+${Math.abs(reduction).toFixed(1)}%`;
            els.reductionValue.className = 'info-value error';
        } else {
            els.reductionValue.textContent = '0%';
            els.reductionValue.className = 'info-value';
        }
    }

    function handleDownload() {
        if (!state.processedBlob || !state.originalFile) return;
        
        let format = els.formatSelect.value;
        if (state.mode === 'pixelate') format = 'image/png';
        
        const ext = Utils.getExtension(format);
        const originalName = state.originalFile.name.split('.')[0];
        const suffix = state.mode === 'compress' ? 'compressed' : 'pixelart';
        
        Utils.downloadBlob(state.processedBlob, `${originalName}-${suffix}.${ext}`);
    }

    // --- Comparison Slider Logic ---
    function setupComparisonSlider() {
        let isSliding = false;
        
        const startSlide = (e) => {
            isSliding = true;
            els.sliderHandle.classList.add('active');
        };
        
        const stopSlide = () => {
            isSliding = false;
            els.sliderHandle.classList.remove('active');
        };
        
        const slide = (e) => {
            if (!isSliding) return;
            
            let clientX;
            if (e.type.includes('mouse')) {
                clientX = e.clientX;
            } else {
                clientX = e.touches[0].clientX;
            }
            
            const rect = els.comparisonSlider.getBoundingClientRect();
            let position = ((clientX - rect.left) / rect.width) * 100;
            
            // Clamp
            position = Math.max(0, Math.min(100, position));
            
            els.imageLayerBefore.style.width = `${position}%`;
            els.sliderHandle.style.left = `${position}%`;
        };
        
        els.sliderHandle.addEventListener('mousedown', startSlide);
        els.sliderHandle.addEventListener('touchstart', startSlide, { passive: true });
        
        window.addEventListener('mouseup', stopSlide);
        window.addEventListener('touchend', stopSlide);
        
        window.addEventListener('mousemove', slide);
        window.addEventListener('touchmove', slide, { passive: true });
    }
});
