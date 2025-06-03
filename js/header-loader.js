import { handleAuthState } from './auth-handler.js';

export function loadHeader(headerContainerId, authContainerId) {
  return fetch('partials/header.html')
    .then((response) => response.text())
    .then((html) => {
      const headerContainer = document.getElementById(headerContainerId);
      if (!headerContainer) {
        console.error(`Elemento com ID "${headerContainerId}" não encontrado.`);
        return;
      }
      headerContainer.innerHTML = html;

      // Atualiza o estado de autenticação no header
      handleAuthState(authContainerId);

      // Garante que o menu mobile funcione após o carregamento dinâmico
      if (window.setupMobileMenu) window.setupMobileMenu();

      // Garante que a autenticação mobile seja renderizada após o header ser inserido
      if (window.auth && window.renderMobileAuth && window.renderAuthMobileMenu) {
        window.auth.onAuthStateChanged(function(user) {
          window.renderMobileAuth(user);
          window.renderAuthMobileMenu(user);
        });
      }
    })
    .catch((error) => console.error('Erro ao carregar o header:', error));
}