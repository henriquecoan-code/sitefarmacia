// Carrega dinamicamente o modal de cadastro em todas as páginas
(function() {
  fetch('/partials/cadastro-modal.html') // Caminho absoluto para funcionar em todas as páginas
    .then(function(response) { return response.text(); })
    .then(function(html) {
      var temp = document.createElement('div');
      temp.innerHTML = html;
      // Insere o modal no final do body
      document.body.appendChild(temp.firstElementChild);
    });
})();
