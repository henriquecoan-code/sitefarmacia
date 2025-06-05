// js/footer-loader.js
export function loadFooter(footerContainerId = 'footer-container') {
  return fetch('partials/footer.html')
    .then((response) => response.text())
    .then((html) => {
      const footerContainer = document.getElementById(footerContainerId);
      if (!footerContainer) {
        console.error(`Elemento com ID "${footerContainerId}" não encontrado.`);
        return;
      }
      footerContainer.innerHTML = html;
      // Se precisar carregar scripts do footer, faça aqui
      // Garante que funções de autenticação mobile estejam disponíveis após o footer
      if (window.setupAuthMobile) window.setupAuthMobile();
      if (window.observeMobileMenuAuth) window.observeMobileMenuAuth();
      // Dispara evento customizado para compatibilidade
      document.dispatchEvent(new Event('footerLoaded'));
    })
    .catch((error) => console.error('Erro ao carregar o footer:', error));
}
