import { auth } from './firebase-config.js';
import { escapeHTML } from './utils.js';

// Carrega Header se existir
const headerEl = document.getElementById('header-container');
if (headerEl) {
  fetch('partials/header.html')
    .then(response => response.text())
    .then(data => {
      headerEl.innerHTML = data;
      // Ativa scripts do header (como menu mobile)
      const script = document.createElement('script');
      script.textContent = `
        if(document.getElementById('mobile-menu-button')){
          document.getElementById('mobile-menu-button').addEventListener('click', function() {
            const menu = document.getElementById('mobile-menu');
            if(menu) menu.classList.toggle('hidden');
          });
        }
      `;
      document.body.appendChild(script);
    });
}

// Carrega Footer se existir
const footerEl = document.getElementById('footer-container');
if (footerEl) {
  fetch('partials/footer.html')
    .then(response => response.text())
    .then(data => {
      footerEl.innerHTML = data;
    });
}

function updateAuthUI() {
  const user = auth.currentUser;
  const authElements = document.querySelectorAll('.auth-element');
  authElements.forEach(element => {
    if (user) {
      if (element.classList.contains('logged-in')) {
        element.style.display = 'block';
      } else {
        element.style.display = 'none';
      }
    } else {
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
  updateAuthUI();
});