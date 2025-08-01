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
    
    // Firebase fallback - provide basic structure and demo products
    setTimeout(function() {
        if (!window.firebase && !window.firebaseApp) {
            console.warn('Firebase not loaded - site will run in offline mode');
            // Provide basic Firebase structure
            window.firebase = {
                apps: [],
                initializeApp: function() { return {}; }
            };
            
            // Load demo products for offline mode
            loadDemoProducts();
        } else {
            // Firebase is available, but still load demo products as fallback
            // This ensures demo products are available if Firebase database is empty
            loadDemoProducts();
        }
    }, 1000);
    
    // Function to load demo products when Firebase is unavailable
    function loadDemoProducts() {
        // Demo products based on the CSV data and available images
        window.demoProducts = [
            {
                id: 'demo-1',
                nome: 'Paracetamol 750mg',
                categoria: 'Medicamentos',
                subcategoria: 'Analgésico',
                ean: '7891234567890',
                codRed: '12345',
                laboratorio: 'Farmalab',
                dcb: 'Paracetamol',
                precoMaximo: 22.50,
                desconto: 0.12,
                valorComDesconto: 19.80,
                quantidade: 100,
                tags: 'analgésico, febre',
                descricao: 'Analgésico para dores e febre',
                fotos: ['img/paracetamol750mg.png']
            },
            {
                id: 'demo-2',
                nome: 'Shampoo Anticaspa',
                categoria: 'Perfumaria',
                subcategoria: 'Higiene Pessoal',
                ean: '7891234567001',
                codRed: '54321',
                laboratorio: 'BelezaCo',
                dcb: 'Piroctona Olamina',
                precoMaximo: 18.00,
                desconto: 0.17,
                valorComDesconto: 14.94,
                quantidade: 50,
                tags: 'shampoo, anticaspa',
                descricao: 'Shampoo para controle de caspa',
                fotos: ['img/produtos/produto2.jpg']
            },
            {
                id: 'demo-3',
                nome: 'Vitamina C 1g',
                categoria: 'Suplementos',
                subcategoria: 'Vitaminas',
                ean: '7891234567002',
                codRed: '67890',
                laboratorio: 'NutriLab',
                dcb: 'Ácido Ascórbico',
                precoMaximo: 30.00,
                desconto: 0.17,
                valorComDesconto: 24.90,
                quantidade: 80,
                tags: 'vitamina, suplemento',
                descricao: 'Suplemento de vitamina C',
                fotos: ['img/produtos/produto3.jpg']
            },
            {
                id: 'demo-4',
                nome: 'Dipirona 500mg',
                categoria: 'Genéricos',
                subcategoria: 'Analgésico',
                ean: '7891234567004',
                codRed: '33445',
                laboratorio: 'GenericLab',
                dcb: 'Dipirona',
                precoMaximo: 15.50,
                desconto: 0.10,
                valorComDesconto: 13.95,
                quantidade: 75,
                tags: 'analgésico, antitérmico',
                descricao: 'Analgésico e antitérmico genérico',
                fotos: ['img/produtos/produto4.jpg']
            },
            {
                id: 'demo-5',
                nome: 'Protetor Solar FPS 60',
                categoria: 'Perfumaria',
                subcategoria: 'Proteção Solar',
                ean: '7891234567005',
                codRed: '55667',
                laboratorio: 'SolarCare',
                dcb: 'Octinoxato',
                precoMaximo: 45.00,
                desconto: 0.15,
                valorComDesconto: 38.25,
                quantidade: 30,
                tags: 'protetor solar, fps60',
                descricao: 'Protetor solar com fator de proteção 60',
                fotos: ['img/produtos/produto5.jpg']
            },
            {
                id: 'demo-6',
                nome: 'Multivitamínico Adulto',
                categoria: 'Suplementos',
                subcategoria: 'Vitaminas',
                ean: '7891234567006',
                codRed: '77889',
                laboratorio: 'VitaLab',
                dcb: 'Multivitamínico',
                precoMaximo: 55.00,
                desconto: 0.20,
                valorComDesconto: 44.00,
                quantidade: 60,
                tags: 'multivitamínico, adulto',
                descricao: 'Complexo vitamínico para adultos',
                fotos: ['img/produtos/produto6.webp']
            },
            {
                id: 'demo-7',
                nome: 'Ibuprofeno 600mg',
                categoria: 'Similares',
                subcategoria: 'Anti-inflamatório',
                ean: '7891234567007',
                codRed: '99001',
                laboratorio: 'MediLab',
                dcb: 'Ibuprofeno',
                precoMaximo: 28.50,
                desconto: 0.08,
                valorComDesconto: 26.22,
                quantidade: 45,
                tags: 'anti-inflamatório, analgésico',
                descricao: 'Anti-inflamatório e analgésico',
                fotos: ['img/produtos/produto1.jpg']
            },
            {
                id: 'demo-8',
                nome: 'Soro Fisiológico 500ml',
                categoria: 'Hospitalar',
                subcategoria: 'Soluções',
                ean: '7891234567008',
                codRed: '11223',
                laboratorio: 'HospitalCare',
                dcb: 'Cloreto de Sódio',
                precoMaximo: 12.00,
                desconto: 0.05,
                valorComDesconto: 11.40,
                quantidade: 120,
                tags: 'soro, fisiológico',
                descricao: 'Soro fisiológico para uso hospitalar',
                fotos: ['img/medicamento.png']
            }
        ];
        
        // Trigger products loaded event for the main script
        setTimeout(function() {
            if (typeof window.loadDemoProductsIntoPage === 'function') {
                window.loadDemoProductsIntoPage();
            }
        }, 100);
        
        console.log('Loaded demo products for offline mode');
    }
    
})();