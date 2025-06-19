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
  document.addEventListener('DOMContentLoaded', attachHeaderSearchListener);
  document.addEventListener('headerLoaded', attachHeaderSearchListener);
  setTimeout(attachHeaderSearchListener, 1000);
})();
