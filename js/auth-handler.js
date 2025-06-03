import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

// Função para escapar HTML e evitar XSS
function escapeHTML(str) {
  if (str === null || str === undefined) {
      return '';
  }
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Função para atualizar a área de autenticação do Header Desktop
function updateDesktopAuth(user, authContainerId) {
  const authContainer = document.getElementById(authContainerId);
  if (!authContainer) {
    console.error(`Elemento desktop com ID "${authContainerId}" não encontrado.`);
    return;
  }

  if (user) {
    // Usuário Logado - Desktop
    const safeDisplayName = escapeHTML(user.displayName || user.email?.split('@')[0] || 'Usuário');
    const safeEmail = escapeHTML(user.email || '');
    authContainer.innerHTML = `
      <div class="text-center relative">
        <a href="#" id="userToggle" class="text-gray-700 hover:text-blue-700 flex flex-col items-center">
          <i class="fas fa-user-circle text-xl"></i> <!-- Ícone de usuário logado -->
          <p class="text-xs mt-1">${safeDisplayName}</p>
        </a>
        <div id="userDropdown" class="hidden absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-50 border border-gray-200 text-left">
          <div class="px-4 py-2 border-b">
            <p class="text-sm font-medium text-gray-800 truncate">${safeDisplayName}</p>
            <p class="text-xs text-gray-500 truncate">${safeEmail}</p>
          </div>
          <a href="minha-conta.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Minha Conta</a>
          <a href="#" id="logoutBtnDesktop" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sair</a>
        </div>
      </div>
    `;

    // Adiciona evento de logout para desktop
    const logoutBtnDesktop = document.getElementById('logoutBtnDesktop');
    if (logoutBtnDesktop) {
        logoutBtnDesktop.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
            await auth.signOut();
            // window.location.reload(); // Recarregar pode ser disruptivo, onAuthStateChanged deve cuidar da UI
            } catch (error) {
            console.error('Erro ao sair (desktop):', error);
            }
        });
    }

    // Exibe e oculta o dropdown ao clicar no ícone/nome do usuário
    const userToggle = document.getElementById('userToggle');
    const userDropdown = document.getElementById('userDropdown');

    if (userToggle && userDropdown) {
        userToggle.addEventListener('click', (e) => {
            e.preventDefault();
            userDropdown.classList.toggle('hidden');
        });

        // Fecha o dropdown ao clicar fora dele
        document.addEventListener('click', (e) => {
            if (!authContainer.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        }, true); // Use capturing phase to catch clicks outside reliably
    }

  } else {
    // Usuário Deslogado - Desktop
    authContainer.innerHTML = `
      <div class="flex items-center space-x-4">
        <a href="#" id="loginBtnDesktop" class="text-gray-700 hover:text-blue-700 flex flex-col items-center">
          <i class="fas fa-user text-xl"></i>
          <p class="text-xs mt-1">Entrar</p>
        </a>
        <a href="#" id="registerBtnDesktop" class="text-gray-700 hover:text-blue-700 flex flex-col items-center">
          <i class="fas fa-user-plus text-xl"></i>
          <p class="text-xs mt-1">Cadastrar</p>
        </a>
      </div>
    `;

     // Adiciona listeners para abrir modal de login/cadastro (desktop)
     const loginBtnDesktop = document.getElementById('loginBtnDesktop');
     const registerBtnDesktop = document.getElementById('registerBtnDesktop');

     if (loginBtnDesktop && typeof openAuthModal === 'function') {
         loginBtnDesktop.addEventListener('click', (e) => {
             e.preventDefault();
             openAuthModal('login');
         });
     }
     if (registerBtnDesktop && typeof openAuthModal === 'function') {
         registerBtnDesktop.addEventListener('click', (e) => {
             e.preventDefault();
             openAuthModal('register');
         });
     }
  }
}

// Função para atualizar a área de autenticação do Menu Mobile e Ícone do Header Mobile
function updateMobileAuth(user) {
  const mobileMenuAuthContainer = document.getElementById('authContainerSecondaryMobileMenu');
  const mobileHeaderAuthContainer = document.getElementById('authContainerSecondaryMobile');

  if (!mobileMenuAuthContainer) {
    // console.warn('Elemento authContainerSecondaryMobileMenu não encontrado.');
  }
  if (!mobileHeaderAuthContainer) {
    // console.warn('Elemento authContainerSecondaryMobile não encontrado.');
  }

  if (user) {
    // Usuário Logado - Mobile
    const safeDisplayName = escapeHTML(user.displayName || user.email?.split('@')[0] || 'Usuário');

    // Atualiza Links do Menu Mobile
    if (mobileMenuAuthContainer) {
        mobileMenuAuthContainer.innerHTML = `
          <div class="px-4 py-2 border-b">
             <p class="text-sm font-medium text-gray-800 truncate">Olá, ${safeDisplayName}</p>
          </div>
          <a href="minha-conta.html" class="block py-3 px-6 hover:bg-blue-100 text-blue-900 font-medium"><i class="fas fa-user-cog w-4 mr-2"></i>Minha Conta</a>
          <a href="#" id="logoutBtnMobile" class="block py-3 px-6 hover:bg-blue-100 text-blue-900 font-medium"><i class="fas fa-sign-out-alt w-4 mr-2"></i>Sair</a>
        `;
         // Adiciona evento de logout para mobile menu
        const logoutBtnMobile = document.getElementById('logoutBtnMobile');
        if (logoutBtnMobile) {
            logoutBtnMobile.addEventListener('click', async (e) => {
                e.preventDefault();
                // Fecha o menu mobile antes de deslogar (se Alpine.js está acessível)
                try {
                    const alpineInstance = document.querySelector('[x-data]');
                    if (alpineInstance && alpineInstance.__x) {
                        alpineInstance.__x.$data.mobileMenuOpen = false;
                    }
                } catch (err) { console.warn("Não foi possível fechar o menu mobile via Alpine.js"); }
                
                try {
                    await auth.signOut();
                    // window.location.reload(); // UI deve atualizar via onAuthStateChanged
                } catch (error) {
                    console.error('Erro ao sair (mobile):', error);
                }
            });
        }
    }

    // Atualiza Ícone do Header Mobile
     if (mobileHeaderAuthContainer) {
        mobileHeaderAuthContainer.innerHTML = `
         <a href="minha-conta.html" class="text-blue-900 text-3xl flex items-center">
             <i class="fas fa-user-circle"></i>
         </a>
        `;
     }

  } else {
    // Usuário Deslogado - Mobile
     // Atualiza Links do Menu Mobile
    if (mobileMenuAuthContainer) {
        mobileMenuAuthContainer.innerHTML = `
          <a href="#" id="loginBtnMobileMenu" class="block py-3 px-6 hover:bg-blue-100 text-blue-900 font-medium"><i class="fas fa-sign-in-alt w-4 mr-2"></i>Entrar</a>
          <a href="#" id="registerBtnMobileMenu" class="block py-3 px-6 hover:bg-blue-100 text-blue-900 font-medium"><i class="fas fa-user-plus w-4 mr-2"></i>Cadastrar</a>
        `;
        // Adiciona listeners para abrir modal (mobile menu)
        const loginBtnMobileMenu = document.getElementById('loginBtnMobileMenu');
        const registerBtnMobileMenu = document.getElementById('registerBtnMobileMenu');
        const alpineInstance = document.querySelector('[x-data]');

        if (loginBtnMobileMenu && typeof openAuthModal === 'function') {
            loginBtnMobileMenu.addEventListener('click', (e) => {
                e.preventDefault();
                if (alpineInstance && alpineInstance.__x) alpineInstance.__x.$data.mobileMenuOpen = false; // Fecha menu
                openAuthModal('login');
            });
        }
         if (registerBtnMobileMenu && typeof openAuthModal === 'function') {
            registerBtnMobileMenu.addEventListener('click', (e) => {
                e.preventDefault();
                if (alpineInstance && alpineInstance.__x) alpineInstance.__x.$data.mobileMenuOpen = false; // Fecha menu
                openAuthModal('register');
            });
        }
    }

    // Atualiza Ícone do Header Mobile
     if (mobileHeaderAuthContainer) {
        mobileHeaderAuthContainer.innerHTML = `
          <a href="#" id="loginBtnMobileHeader" class="text-blue-900 text-3xl flex items-center">
             <i class="fas fa-user"></i> <!-- Ícone de usuário genérico -->
          </a>
        `;
         // Adiciona listener para abrir modal (mobile header icon)
         const loginBtnMobileHeader = document.getElementById('loginBtnMobileHeader');
         if (loginBtnMobileHeader && typeof openAuthModal === 'function') {
            loginBtnMobileHeader.addEventListener('click', (e) => {
                e.preventDefault();
                openAuthModal('login');
            });
         }
     }
  }
}

// Função principal para inicializar a UI de autenticação
export function initializeAuthUI(desktopAuthContainerId) {
    // Torna a função de atualização mobile acessível globalmente se necessário
    // O header.html pode tentar chamá-la, embora a chamada principal seja abaixo
    window.renderAuthMobileMenu = updateMobileAuth;

    // Listener principal para mudanças no estado de autenticação
    onAuthStateChanged(auth, (user) => {
        console.log("Auth state changed. User:", user ? user.email : "Logged out");
        updateDesktopAuth(user, desktopAuthContainerId);
        updateMobileAuth(user); // Atualiza tanto o menu mobile quanto o ícone do header mobile

        // Atualiza a visibilidade da barra de aviso de e-mail
        const emailWarningBar = document.getElementById('email-warning-bar');
        const emailWarningBarMobile = document.getElementById('email-warning-bar-mobile');
        const showWarning = user && !user.emailVerified;

        if(emailWarningBar) emailWarningBar.classList.toggle('hidden', !showWarning);
        if(emailWarningBarMobile) emailWarningBarMobile.classList.toggle('hidden', !showWarning);
    });
}

// Para garantir que a função openAuthModal esteja disponível quando este script for executado,
// idealmente, a definição de openAuthModal deveria estar em um script carregado antes,
// ou este script deveria ser carregado com 'defer' e openAuthModal definida antes no HTML.
// Assumindo que openAuthModal está definida globalmente no header.html.

