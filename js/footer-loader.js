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
    })
    .catch((error) => console.error('Erro ao carregar o footer:', error));
}
