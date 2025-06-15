import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { escapeHTML } from './utils.js';

export function handleAuthState(authContainerId) {
  const authContainer = document.getElementById(authContainerId);

  if (!authContainer) {
    console.error(`Elemento com ID "${authContainerId}" não encontrado.`);
    return;
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const safeDisplayName = escapeHTML(user.displayName || user.email.split('@')[0] || 'Usuário');
      const safeEmail = escapeHTML(user.email || '');
      authContainer.innerHTML = `
        <div class="text-center relative">
          <a href="#" id="userToggle" class="text-gray-700 hover:text-blue-700">
            <i class="fas fa-user text-xl"></i>
            <p class="text-xs">${safeDisplayName}</p>
          </a>
          <div id="userDropdown" class="hidden absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-50 border border-gray-200">
            <div class="px-4 py-2 border-b">
              <p class="text-sm font-medium text-gray-800">${safeDisplayName}</p>
              <p class="text-xs text-gray-500 truncate">${safeEmail}</p>
            </div>
            <a href="minha-conta.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Minha Conta</a>
            <a href="#" id="logoutBtn" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sair</a>
          </div>
        </div>
      `;

      // Adiciona evento de logout
      document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await auth.signOut();
          window.location.reload();
        } catch (error) {
          console.error('Erro ao sair:', error);
        }
      });

      // Exibe e oculta o dropdown ao clicar no nome do usuário
      const userToggle = document.getElementById('userToggle');
      const userDropdown = document.getElementById('userDropdown');

      userToggle.addEventListener('click', (e) => {
        e.preventDefault();
        userDropdown.classList.toggle('hidden');
      });

      // Fecha o dropdown ao clicar fora dele
      document.addEventListener('click', (e) => {
        if (!authContainer.contains(e.target)) {
          userDropdown.classList.add('hidden');
        }
      });
    } else {
      authContainer.innerHTML = `
        <a href="#" id="loginBtn" class="text-gray-700 hover:text-blue-700">
          <i class="fas fa-user text-xl"></i>
          <p class="text-xs">Entrar</p>
        </a>
        <a href="#" id="registerBtn" class="text-gray-700 hover:text-blue-700">
          <p class="text-xs">Cadastrar</p>
        </a>
      `;
      // Adiciona eventos para abrir os modais corretos
      setTimeout(() => {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        if (loginBtn) {
          loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof window.openLoginModal === 'function') {
              window.openLoginModal();
            }
          });
        }
        if (registerBtn) {
          registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof window.openCadastroModal === 'function') {
              window.openCadastroModal();
            } else {
              // fallback: tenta carregar o script manualmente e abrir depois
              var script = document.createElement('script');
              script.src = './js/auth-modal.js';
              script.onload = function() {
                if (typeof window.openCadastroModal === 'function') window.openCadastroModal();
              };
              document.body.appendChild(script);
            }
          });
        }
      }, 0);
    }
  });
}