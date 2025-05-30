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
    })
    .catch((error) => console.error('Erro ao carregar o header:', error));
}