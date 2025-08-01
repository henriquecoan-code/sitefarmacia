// Performance optimized initialization script
(function() {
    'use strict';
    
    // Performance timing
    const perfStart = performance.now();
    
    // Intersection Observer for lazy loading images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        delete img.dataset.src;
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });
        
        // Apply to all lazy images
        window.enableLazyLoading = function() {
            document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                if (img.src && img.src !== img.dataset.src) {
                    img.classList.add('loaded');
                } else if (img.dataset.src) {
                    imageObserver.observe(img);
                }
            });
        };
    }
    
    // Optimize scroll performance
    let ticking = false;
    function optimizeScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                // Update any scroll-dependent UI here
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Debounced resize handler
    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Update layout-dependent components
            if (window.updateTopbarVisibility) {
                window.updateTopbarVisibility();
            }
        }, 100);
    }
    
    // Optimized event listeners
    if (window.addEventListener) {
        window.addEventListener('scroll', optimizeScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });
    }
    
    // Preload critical resources
    function preloadCriticalResources() {
        const criticalImages = [
            'img/logo.png',
            'img/medicamento.png'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }
    
    // Initialize when DOM is ready
    function initialize() {
        preloadCriticalResources();
        
        if (window.enableLazyLoading) {
            window.enableLazyLoading();
        }
        
        // Log performance metrics
        const perfEnd = performance.now();
        console.log(`Site optimization initialized in ${(perfEnd - perfStart).toFixed(2)}ms`);
        
        // Report web vitals if available
        if ('web-vitals' in window) {
            web-vitals.getCLS(console.log);
            web-vitals.getFID(console.log);
            web-vitals.getLCP(console.log);
        }
    }
    
    // Initialize based on document state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Export utilities
    window.siteOptimization = {
        enableLazyLoading: window.enableLazyLoading,
        preloadCriticalResources
    };
    
})();