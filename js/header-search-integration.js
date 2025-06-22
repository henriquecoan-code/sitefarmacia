// js/header-search-integration.js
// Integra o campo de busca do header dinâmico com o filtro de produtos sem recarregar a página
(function() {
  function handleHeaderSearchSubmit(e) {
    e.preventDefault();
    var input = this.querySelector('#header-search-input');
    if (input) {
      // Se não estiver na index.html, redireciona para lá com o termo de busca
      if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
        window.location.href = 'index.html?busca=' + encodeURIComponent(input.value.trim());
        return;
      }
      window.dispatchEvent(new CustomEvent('headerSearch', { detail: input.value.trim() }));
    }
  }
  function attachHeaderSearchListener() {
    var forms = document.querySelectorAll('#header-search-form');
    forms.forEach(function(form) {
      form.addEventListener('submit', handleHeaderSearchSubmit);
    });
  }
  // Removido disparo automático de busca em branco ao carregar a página
  document.addEventListener('DOMContentLoaded', attachHeaderSearchListener);
  document.addEventListener('headerLoaded', attachHeaderSearchListener);
  setTimeout(attachHeaderSearchListener, 1000);
})();

// No menu mobile, ao clicar em links de categoria, redireciona para index.html se não estiver nela
(function() {
  function handleMobileMenuLink(e) {
    // Só executa em telas mobile
    if (window.innerWidth >= 768) return;
    var categoria = this.getAttribute('data-categoria');
    if (categoria && !window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
      e.preventDefault();
      window.location.href = 'index.html';
    }
  }
  function attachMobileMenuListeners() {
    var mobileAsideLinks = document.querySelectorAll('#topbar-fixed aside nav a[data-categoria]');
    mobileAsideLinks.forEach(function(link) {
      link.removeEventListener('click', handleMobileMenuLink);
      link.addEventListener('click', handleMobileMenuLink);
    });
  }
  document.addEventListener('DOMContentLoaded', attachMobileMenuListeners);
  document.addEventListener('headerLoaded', attachMobileMenuListeners);
  setTimeout(attachMobileMenuListeners, 1000);
})();
