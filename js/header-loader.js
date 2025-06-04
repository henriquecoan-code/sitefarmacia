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

      // Reinicializa Alpine.js para processar x-data/x-effect do header dinâmico
      if (window.Alpine && window.Alpine.initTree) {
        window.Alpine.initTree(document.body);
      }

      // Atualiza o estado de autenticação no header
      handleAuthState(authContainerId);

      // Garante que o menu mobile funcione após o carregamento dinâmico
      if (window.setupMobileMenu) window.setupMobileMenu();

      // Aguarda o carregamento do footer e do script auth-mobile.js
      function waitForAuthMobile(retries = 10) {
        if (window.auth && window.renderMobileAuth && window.renderAuthMobileMenu) {
          window.auth.onAuthStateChanged(function(user) {
            window.renderMobileAuth(user);
            window.renderAuthMobileMenu(user);
          });
          // Chama manualmente para garantir renderização inicial
          window.renderAuthMobileMenu(window.auth.currentUser);
        } else if (retries > 0) {
          setTimeout(() => waitForAuthMobile(retries - 1), 150);
        } else {
          console.warn('Funções de autenticação mobile não disponíveis após aguardar o footer.');
        }
      }
      waitForAuthMobile();
    })
    .catch((error) => console.error('Erro ao carregar o header:', error));
}