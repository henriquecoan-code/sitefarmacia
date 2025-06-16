// login-modal-loader.js
// Carrega dinamicamente o login-modal em qualquer página
(async function loadLoginModalGlobal() {
  if (!document.getElementById('login-modal-placeholder')) return;
  const resp = await fetch('partials/login-modal.html'); // Caminho relativo para funcionar no GitHub Pages
  const html = await resp.text();
  document.getElementById('login-modal-placeholder').innerHTML = html;
  // Carrega o script do modal após inserir o HTML
  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'js/login-modal.js'; // Caminho relativo para funcionar no GitHub Pages
  document.body.appendChild(script);
})();
