// Fallback script for external dependencies
(function() {
    'use strict';
    
    // Function to check if a script loaded successfully
    function isScriptLoaded(scriptId) {
        const script = document.getElementById(scriptId);
        return script && script.dataset.loaded === 'true';
    }
    
    // Function to load fallback CSS
    function loadFallbackCSS() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/tailwind-fallback.css';
        link.id = 'tailwind-fallback';
        document.head.appendChild(link);
        console.log('Loaded Tailwind CSS fallback');
    }
    
    // Function to provide Font Awesome icon fallbacks
    function loadFontAwesomeFallback() {
        // Add basic icon styles
        const style = document.createElement('style');
        style.id = 'fa-fallback';
        style.textContent = `
            .fas, .fa {
                font-family: Arial, sans-serif;
                font-style: normal;
                font-weight: normal;
                display: inline-block;
                text-decoration: inherit;
            }
            .fa-cart-plus:before { content: "🛒"; }
            .fa-search:before { content: "🔍"; }
            .fa-chevron-down:before { content: "▼"; }
            .fa-spinner:before { content: "⟳"; }
            .fa-check:before { content: "✓"; }
            .fa-spin { animation: fa-spin 1s infinite linear; }
            @keyframes fa-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        console.log('Loaded Font Awesome fallback');
    }
    
    // Function to provide Alpine.js fallback functionality
    function loadAlpineFallback() {
        // Basic Alpine.js substitute for simple data binding
        window.Alpine = {
            data: function(fn) {
                return fn();
            },
            store: function(name, data) {
                window._alpineStores = window._alpineStores || {};
                window._alpineStores[name] = data;
                return data;
            },
            initTree: function(element) {
                // Basic initialization for dynamic content
                if (element && typeof element.querySelector === 'function') {
                    const elements = element.querySelectorAll('[x-data], [x-show], [x-text]');
                    elements.forEach(el => {
                        // Basic x-show handling
                        if (el.hasAttribute('x-show')) {
                            const expr = el.getAttribute('x-show');
                            if (expr === 'false' || expr === '!true') {
                                el.style.display = 'none';
                            }
                        }
                    });
                }
            }
        };
        console.log('Loaded Alpine.js fallback');
    }
    
    // Check for Tailwind CSS and load fallback if needed
    setTimeout(function() {
        const tailwindLoaded = document.querySelector('script[src*="tailwindcss"]');
        if (!tailwindLoaded || window.getComputedStyle(document.body).backgroundColor !== 'rgb(249, 250, 251)') {
            loadFallbackCSS();
        }
    }, 1000);
    
    // Check for Font Awesome and load fallback if needed
    setTimeout(function() {
        const faLoaded = document.querySelector('link[href*="font-awesome"]');
        if (!faLoaded) {
            loadFontAwesomeFallback();
        }
    }, 500);
    
    // Check for Alpine.js and load fallback if needed
    setTimeout(function() {
        if (!window.Alpine) {
            loadAlpineFallback();
        }
    }, 1500);
    
    // Firebase fallback - provide basic structure
    setTimeout(function() {
        if (!window.firebase && !window.firebaseApp) {
            console.warn('Firebase not loaded - site will run in offline mode');
            // Provide basic Firebase structure
            window.firebase = {
                apps: [],
                initializeApp: function() { return {}; }
            };
        }
    }, 2000);
    
})();