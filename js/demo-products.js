// Demo products handler for offline mode
(function() {
    'use strict';
    
    // Global variables that will be used by the main script
    let allProducts = [];
    let currentCategory = '';
    let currentSubcategory = '';
    let currentSearch = '';
    let totalProductsCount = 0;
    let currentPage = 1;
    const PRODUCTS_PER_PAGE = 12;
    let filteredProducts = [];
    
    // Function to normalize strings (minúsculas e sem acentos)
    function normalize(str) {
      if (!str) return '';
      // Trata equivalência entre "Vitaminas" e "Suplementos"
      let s = str.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
      if (s === 'vitaminas') return 'suplementos';
      return s;
    }
    
    // Function to render pagination
    function renderPagination(total, page, perPage) {
      const totalPages = Math.ceil(total / perPage);
      const containerId = 'pagination-container';
      let container = document.getElementById(containerId);
      if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = 'flex justify-center items-center mt-8 mb-4 space-x-2';
        const main = document.querySelector('main section');
        if (main) main.appendChild(container);
      }
      container.innerHTML = '';
      if (totalPages <= 1) {
        container.style.display = 'none';
        return;
      }
      container.style.display = 'flex';
      
      // Botão anterior
      const prevBtn = document.createElement('button');
      prevBtn.textContent = 'Anterior';
      prevBtn.className = 'px-3 py-1 rounded bg-gray-200 hover:bg-blue-200 text-blue-900 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500';
      prevBtn.disabled = page === 1;
      prevBtn.setAttribute('aria-label', 'Página anterior');
      if (page === 1) {
        prevBtn.setAttribute('aria-disabled', 'true');
      }
      prevBtn.onclick = () => {
        if (currentPage > 1) {
          loadPage(currentPage - 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
      container.appendChild(prevBtn);
      
      // Números de página (máx 5 visíveis)
      let start = Math.max(1, page - 2);
      let end = Math.min(totalPages, start + 4);
      if (end - start < 4) start = Math.max(1, end - 4);
      for (let i = start; i <= end; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ' + (i === page ? 'bg-blue-700 text-white font-bold' : 'bg-gray-200 hover:bg-blue-200 text-blue-900');
        btn.disabled = i === page;
        btn.setAttribute('aria-label', `Página ${i}`);
        if (i === page) {
          btn.setAttribute('aria-current', 'page');
        }
        btn.onclick = () => {
          loadPage(i);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        container.appendChild(btn);
      }
      
      // Botão próximo
      const nextBtn = document.createElement('button');
      nextBtn.textContent = 'Próxima';
      nextBtn.className = 'px-3 py-1 rounded bg-gray-200 hover:bg-blue-200 text-blue-900 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500';
      nextBtn.disabled = page === totalPages;
      nextBtn.setAttribute('aria-label', 'Próxima página');
      if (page === totalPages) {
        nextBtn.setAttribute('aria-disabled', 'true');
      }
      nextBtn.onclick = () => {
        if (currentPage < totalPages) {
          loadPage(currentPage + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
      container.appendChild(nextBtn);
    }
    
    // Function to load a specific page
    function loadPage(page) {
      currentPage = page;
      applyFilters();
    }
    
    // Function to apply filters and render products
    function applyFilters() {
      let filtered = allProducts;
      
      if (currentCategory) {
        filtered = filtered.filter(p => normalize(p.categoria) === normalize(currentCategory));
      }
      if (currentSubcategory) {
        filtered = filtered.filter(p => normalize(String(p.subcategoria || '')) === normalize(currentSubcategory));
      }
      if (currentSearch) {
        const searchUpper = currentSearch.toUpperCase();
        filtered = filtered.filter(p =>
          (p.nome && p.nome.toUpperCase().includes(searchUpper)) ||
          (p.dcb && p.dcb.toUpperCase().includes(searchUpper))
        );
      }
      
      filteredProducts = filtered;
      
      const emptyState = document.getElementById('empty-state');
      if (!filtered.length) {
        emptyState.classList.remove('hidden');
        renderPagination(0, 1, PRODUCTS_PER_PAGE);
        document.getElementById('lista-produtos').innerHTML = '';
      } else {
        emptyState.classList.add('hidden');
        renderPagination(filtered.length, currentPage, PRODUCTS_PER_PAGE);
        
        // Show current page
        const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const endIdx = startIdx + PRODUCTS_PER_PAGE;
        renderProducts(filtered.slice(startIdx, endIdx));
      }
    }
    
    // Function to update subcategories dropdown
    function updateSubcategories() {
      const subcatSelect = document.getElementById('filtro-subcategoria');
      if (!subcatSelect) return;
      
      let subcats = new Set();
      allProducts.forEach(p => {
        if (!currentCategory || normalize(String(p.categoria || '')) === normalize(currentCategory)) {
          if (p.subcategoria) subcats.add(String(p.subcategoria));
        }
      });
      subcatSelect.innerHTML = '<option value="">Todas as subcategorias</option>';
      Array.from(subcats).sort().forEach(sub => {
        subcatSelect.innerHTML += `<option value="${normalize(sub)}">${sub}</option>`;
      });
      
      // If the current subcategory doesn't exist anymore, clear it
      if (currentSubcategory && !Array.from(subcats).map(normalize).includes(normalize(currentSubcategory))) {
        currentSubcategory = '';
        subcatSelect.value = '';
      }
    }
    
    // Function to render products
    function renderProducts(produtos) {
      const productsContainer = document.getElementById('lista-produtos');
      if (!productsContainer) return;
      
      productsContainer.innerHTML = '';
      
      produtos.filter(product => product.quantidade === undefined || product.quantidade > 0).forEach(product => {
        let fotoSrc = 'img/medicamento.png';
        if (Array.isArray(product.fotos) && product.fotos.length > 0) {
          fotoSrc = product.fotos[0] || 'img/medicamento.png';
        }
        const temDesconto = product.desconto && product.desconto > 0;
        const precoOriginal = Number(product.precoMaximo).toFixed(2);
        const precoDesconto = Number(product.valorComDesconto).toFixed(2);
        const descontoPercent = temDesconto ? Math.round(product.desconto * 100) : null;
        const productElement = document.createElement('div');
        productElement.className = 'card-produto bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col p-3 transition-transform hover:scale-[1.025] hover:shadow-2xl duration-150';
        productElement.setAttribute('role', 'article');
        productElement.setAttribute('aria-label', `Produto: ${product.nome}`);
        productElement.innerHTML = `
          <div class="relative flex flex-col items-center justify-center bg-gradient-to-t from-gray-50 to-white rounded-xl overflow-hidden pt-3 pb-2">
            ${temDesconto ? `<span class='absolute top-2 right-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm border border-red-200 z-10' aria-label='Desconto de ${descontoPercent}%'>-${descontoPercent}%</span>` : ''}
            <img src="${fotoSrc}" alt="Imagem do produto ${product.nome}" class="w-24 h-24 object-contain bg-white rounded shadow border border-gray-200" onerror="this.onerror=null;this.src='img/medicamento.png';" data-produto-id="${product.id}" loading="lazy" />
          </div>
          <div class="flex flex-col flex-1 justify-between mt-2">
            ${product.codRed ? `<span class='inline-block mb-1 bg-blue-100 text-blue-800 text-[0.70rem] font-semibold px-2 py-0.5 rounded-full self-center' aria-label='Código de referência: ${product.codRed}'>Cod: ${product.codRed}</span>` : ''}
            <h3 class="nome text-blue-900 font-bold text-base leading-tight truncate-2-lines cursor-pointer text-center mb-1" title="${product.nome}" data-produto-id="${product.id}" tabindex="0" role="link" aria-label="Ver detalhes de ${product.nome}">${product.nome}</h3>
            <div class="flex flex-row items-end justify-end gap-2 my-0 w-full" aria-label="Preços do produto">
              ${temDesconto ? `<span class='text-xs text-gray-400 line-through' aria-label='Preço original: R$ ${precoOriginal}'>R$ ${precoOriginal}</span>` : ''}
              <span class="text-lg font-bold text-green-700" aria-label="Preço com desconto: R$ ${precoDesconto}">R$ ${precoDesconto}</span>
            </div>
            <div class="flex items-center justify-center gap-2 my-1">
              <div class="relative flex items-center gap-0 mt-3.5" role="group" aria-label="Selecionar quantidade">
                <button type="button" class="qty-btn decrement flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Diminuir quantidade">-</button>
                <input type="number" min="1" value="1" class="input-qty w-7 h-6 text-center text-base font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none mx-1" style="appearance: textfield;" title="Quantidade" aria-label="Quantidade do produto" />
                <button type="button" class="qty-btn increment flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Aumentar quantidade">+</button>
              </div>
              <button class="btn-carrinho add-cart-btn flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-all duration-150 h-9 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Adicionar ${product.nome} ao carrinho">
                <span class="cart-btn-text flex items-center gap-1 sm:inline hidden"><i class="fas fa-cart-plus" aria-hidden="true"></i>  Adicionar</span>
                <span class="cart-btn-text flex items-center gap-1 sm:hidden"><i class="fas fa-cart-plus" aria-hidden="true"></i></span>
                <span class="cart-btn-loading hidden" aria-hidden="true"><i class='fas fa-spinner fa-spin'></i></span>
                <span class="cart-btn-ok hidden" aria-hidden="true"><i class='fas fa-check text-green-400'></i></span>
              </button>
            </div>
          </div>
        `;
        productsContainer.appendChild(productElement);
        
        // Add click handlers
        const img = productElement.querySelector('img[data-produto-id]');
        const nome = productElement.querySelector('h3[data-produto-id]');
        [img, nome].forEach(el => {
          if (el) {
            el.addEventListener('click', () => {
              window.location.href = `produto_detalhes.html?id=${product.id}`;
            });
            el.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.href = `produto_detalhes.html?id=${product.id}`;
              }
            });
          }
        });
        
        // Quantity controls
        const qtyInput = productElement.querySelector('.input-qty');
        const btnDec = productElement.querySelector('.qty-btn.decrement');
        const btnInc = productElement.querySelector('.qty-btn.increment');
        if (qtyInput && btnDec && btnInc) {
          btnDec.addEventListener('click', () => {
            let val = parseInt(qtyInput.value, 10) || 1;
            if (val > 1) qtyInput.value = val - 1;
          });
          btnInc.addEventListener('click', () => {
            let val = parseInt(qtyInput.value, 10) || 1;
            qtyInput.value = val + 1;
          });
        }
        
        // Add to cart button
        const btn = productElement.querySelector('.add-cart-btn');
        const btnText = btn.querySelector('.cart-btn-text');
        const btnLoading = btn.querySelector('.cart-btn-loading');
        const btnOk = btn.querySelector('.cart-btn-ok');
        const inputQty = productElement.querySelector('.input-qty');
        btn.addEventListener('click', async () => {
          let qty = parseInt(inputQty.value, 10);
          if (isNaN(qty) || qty < 1) qty = 1;
          btnText.classList.add('hidden');
          btnLoading.classList.remove('hidden');
          await new Promise(r => setTimeout(r, 400)); // Simulate loading
          if (window.addToCart) {
            await window.addToCart(product, qty);
          }
          btnLoading.classList.add('hidden');
          btnOk.classList.remove('hidden');
          setTimeout(() => {
            btnOk.classList.add('hidden');
            btnText.classList.remove('hidden');
          }, 900);
        });
      });
    }
    
    // Main function to load demo products
    window.loadDemoProductsIntoPage = function() {
      if (!window.demoProducts) {
        console.warn('No demo products available');
        return;
      }
      
      console.log('Loading demo products into page...');
      
      allProducts = window.demoProducts;
      totalProductsCount = allProducts.length;
      currentPage = 1;
      
      const loadingSkeleton = document.getElementById('loading-skeleton');
      const emptyState = document.getElementById('empty-state');
      
      if (loadingSkeleton) loadingSkeleton.classList.add('hidden');
      if (emptyState) emptyState.classList.add('hidden');
      
      applyFilters();
      updateSubcategories();
      
      console.log('Demo products loaded successfully:', allProducts.length, 'total products');
    };
    
    // Set up event listeners when DOM is ready
    function setupEventListeners() {
      const catSelect = document.getElementById('filtro-categoria');
      const subcatSelect = document.getElementById('filtro-subcategoria');
      
      // Category filter
      if (catSelect) {
        catSelect.addEventListener('change', e => {
          currentCategory = catSelect.value;
          currentSubcategory = '';
          if (subcatSelect) subcatSelect.value = '';
          currentPage = 1;
          applyFilters();
          updateSubcategories();
        });
      }
      
      // Subcategory filter
      if (subcatSelect) {
        subcatSelect.addEventListener('change', e => {
          currentSubcategory = subcatSelect.value;
          currentPage = 1;
          applyFilters();
        });
      }
      
      // Sidebar navigation
      document.querySelectorAll('aside nav a[data-categoria], #aside-todos').forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          
          if (link.id === 'aside-todos') {
            currentCategory = '';
            if (catSelect) catSelect.value = '';
          } else {
            currentCategory = link.getAttribute('data-categoria') || '';
            if (catSelect) catSelect.value = currentCategory;
          }
          
          currentSubcategory = '';
          if (subcatSelect) subcatSelect.value = '';
          currentPage = 1;
          
          applyFilters();
          updateSubcategories();
        });
      });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupEventListeners);
    } else {
      setupEventListeners();
    }
    
})();