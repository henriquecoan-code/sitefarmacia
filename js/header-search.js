// Script para ativar a busca global do header após carregamento dinâmico
function handleHeaderSearch(e) {
  e.preventDefault();
  var input = document.getElementById('header-search-input');
  if (!input) return;
  var search = input.value.trim();
  if (search.length === 0) return;
  window.location.href = './index.html?busca=' + encodeURIComponent(search);
}

function setupHeaderSearch() {
  var headerSearchForm = document.getElementById('header-search-form');
  if (headerSearchForm) {
    headerSearchForm.addEventListener('submit', handleHeaderSearch);
  }
}

// Tenta rodar imediatamente e também exporta para uso após loadHeader
document.addEventListener('DOMContentLoaded', setupHeaderSearch);
window.setupHeaderSearch = setupHeaderSearch;
