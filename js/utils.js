// js/utils.js
// Funções utilitárias reutilizáveis

/**
 * Escapa caracteres HTML para evitar XSS
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
//modal cadastro
export function setupCadastroModalBtn() {
  const cadastroBtn = document.getElementById('openCadastroModalBtn');
  if (cadastroBtn) {
    cadastroBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (typeof window.openCadastroModal === 'function') {
        window.openCadastroModal();
      }
    });
  }
}