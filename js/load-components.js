import { auth } from './firebase-config.js';
import { escapeHTML } from './utils.js';

// Carrega Header
fetch('partials/header.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header-container').innerHTML = data;
    // Ativa scripts do header (como menu mobile)
    const script = document.createElement('script');
    script.textContent = `
      document.getElementById('mobile-menu-button').addEventListener('click', function() {
        const menu = document.getElementById('mobile-menu');
        menu.classList.toggle('hidden');
      });
    `;
    document.body.appendChild(script);
  });

// Carrega Footer
fetch('partials/footer.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('footer-container').innerHTML = data;
  });
  
  function updateAuthUI() {
  const user = auth.currentUser;
  const authElements = document.querySelectorAll('.auth-element');
  
  authElements.forEach(element => {
    if (user) {
      // Usuário logado - mostra elementos específicos
      if (element.classList.contains('logged-in')) {
        element.style.display = 'block';
      } else {
        element.style.display = 'none';
      }
    } else {
      // Usuário não logado - mostra elementos de login
      if (element.classList.contains('logged-out')) {
        element.style.display = 'block';
      } else {
        element.style.display = 'none';
      }
    }
  });
}

// Carrega quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  loadFooter();
});