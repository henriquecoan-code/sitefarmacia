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
    })
    .catch((error) => console.error('Erro ao carregar o header:', error));
}