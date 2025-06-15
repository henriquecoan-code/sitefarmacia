// js/auth-mobile.js
// Este script deve ser carregado como script tradicional, não como módulo
// Não use import aqui!
// O objeto auth deve ser exposto em window.auth pelo carregador principal

function renderMobileAuth(user) {
  var container = document.getElementById('authContainerSecondaryMobile');
  if (!container) return;
  if (user) {
    container.innerHTML =
      '<button id="mobileUserBtn" class="text-blue-900 hover:text-blue-700 focus:outline-none flex flex-col items-center">' +
      '<i class="fas fa-user-circle text-3xl"></i>' +
      '<span class="text-xs">' + (user.displayName || user.email.split('@')[0]) + '</span>' +
      '</button>';
    document.getElementById('mobileUserBtn').onclick = function () {
      window.location.href = 'minha-conta.html';
    };
  } else {
    container.innerHTML =
      '<button id="mobileLoginBtn" class="text-blue-900 hover:text-blue-700 focus:outline-none flex flex-col items-center">' +
      '<i class="fas fa-user-circle text-3xl"></i>' +
      '<span class="text-xs">Entrar</span>' +
      '</button>';
    document.getElementById('mobileLoginBtn').onclick = function (e) {
      window.location.href = 'login.html';
      e.preventDefault();
      if (typeof openAuthModal === 'function') openAuthModal('login');
    };
  }
}

function renderAuthMobileMenu(user) {
  // Aguarda até o elemento existir e estar visível
  function tryRender(attempts = 10) {
    const container = document.getElementById('authContainerSecondaryMobileMenu');
    console.log('Tentando renderizar menu mobile:', container, 'Tentativas restantes:', attempts, 'User:', user);
    if (!container || container.offsetParent === null) {
      if (attempts > 0) setTimeout(() => tryRender(attempts - 1), 100);
      return;
    }
    container.classList.remove('hidden');
    container.style.removeProperty('display');
    if (user) {
      container.innerHTML =
        '<div class="flex flex-col space-y-1">' +
        '<a href="minha-conta.html" class="text-blue-900 font-medium hover:underline">Minha Conta</a>' +
        '<a href="#" id="logoutBtnMobileMenu" class="text-blue-900 font-medium hover:underline">Sair</a>' +
        '</div>';
      document.getElementById('logoutBtnMobileMenu').onclick = function (e) {
        e.preventDefault();
        if (window.auth) {
          window.auth.signOut().then(function () {
            window.location.reload();
          });
        }
      };
    } else {
      // Só renderiza se o conteúdo for diferente do atual para evitar loop infinito
      const html =
        '<div class="flex flex-col space-y-1">' +
        '<a href="#" id="loginBtnMobileMenu" class="text-blue-900 font-medium hover:underline">Entrar</a>' +
        '<a href="#" id="registerBtnMobileMenu" class="text-blue-900 font-medium hover:underline">Cadastrar</a>' +
        '</div>';
      // Corrige: remove espaços e quebras para comparação robusta
      const clean = s => s.replace(/\s+/g, ' ').trim();
      if (clean(container.innerHTML) !== clean(html)) {
        container.innerHTML = html;
        document.getElementById('loginBtnMobileMenu').onclick = function (e) {
          e.preventDefault();
          if (typeof window.openAuthModal === 'function') {
            window.openAuthModal('login');
          }
          // Fecha o menu mobile
          if (window.Alpine && window.Alpine.store && typeof window.Alpine.store === 'function') {
            try { window.Alpine.store('mobileMenuOpen', false); } catch(e) {}
          }
          var aside = document.querySelector('aside');
          if (aside && aside.__x && aside.__x.$data) {
            aside.__x.$data.mobileMenuOpen = false;
          } else if (aside && aside.parentElement && aside.parentElement.__x && aside.parentElement.__x.$data) {
            aside.parentElement.__x.$data.mobileMenuOpen = false;
          }
        };
        document.getElementById('registerBtnMobileMenu').onclick = function (e) {
          e.preventDefault();
          loadAuthModalAndOpen();
          // Fecha o menu mobile
          if (window.Alpine && window.Alpine.store && typeof window.Alpine.store === 'function') {
            try { window.Alpine.store('mobileMenuOpen', false); } catch(e) {}
          }
          var aside = document.querySelector('aside');
          if (aside && aside.__x && aside.__x.$data) {
            aside.__x.$data.mobileMenuOpen = false;
          } else if (aside && aside.parentElement && aside.parentElement.__x && aside.parentElement.__x.$data) {
            aside.parentElement.__x.$data.mobileMenuOpen = false;
          }
        };
      }
    }
    console.log('Conteúdo após render:', container.innerHTML);
  }
  tryRender();
}

function setupAuthMobile() {
  if (!window.auth) {
    setTimeout(setupAuthMobile, 100);
    return;
  }
  window.auth.onAuthStateChanged(function (user) {
    window.currentAuthUser = user;
    renderMobileAuth(user);
    // Não chama renderAuthMobileMenu aqui, só quando o menu abrir
  });
}

// Expor funções no escopo global
window.renderMobileAuth = renderMobileAuth;
window.renderAuthMobileMenu = renderAuthMobileMenu;
window.setupAuthMobile = setupAuthMobile;
window.observeMobileMenuAuth = observeMobileMenuAuth;

setupAuthMobile();

(function ensureMobileMenuAuthSync() {
  function trySync() {
    var aside = document.querySelector('aside');
    if (!aside) return;
    var lastOpen = false;
    setInterval(function() {
      var isOpen = aside.style.display !== 'none' && aside.offsetParent !== null;
      if (isOpen && !lastOpen) {
        var container = document.getElementById('authContainerSecondaryMobileMenu');
        if (container) {
          container.classList.remove('hidden');
          container.style.removeProperty('display');
        }
        if (window.renderAuthMobileMenu && window.currentAuthUser !== undefined) {
          window.renderAuthMobileMenu(window.currentAuthUser);
        }
      }
      lastOpen = isOpen;
    }, 200);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trySync);
  } else {
    trySync();
  }
})();

// --- MutationObserver para garantir renderização após Alpine.js, sempre por último ---
function observeMobileMenuAuth() {
  var observer = null;
  var debounceTimer = null;
  function setupObserver() {
    var aside = document.querySelector('aside');
    if (!aside) {
      setTimeout(setupObserver, 200);
      return;
    }
    var container = document.getElementById('authContainerSecondaryMobileMenu');
    if (!container) {
      setTimeout(setupObserver, 200);
      return;
    }
    if (observer) observer.disconnect();
    observer = new MutationObserver(function(mutationsList) {
      // Debounce: espera 50ms após a última mutação para renderizar
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function() {
        if (container.offsetParent !== null && !container.classList.contains('hidden')) {
          if (window.renderAuthMobileMenu && window.currentAuthUser !== undefined) {
            window.renderAuthMobileMenu(window.currentAuthUser);
          }
        }
      }, 50);
    });
    observer.observe(container, { attributes: true, childList: true, subtree: false });
    observer.observe(aside, { attributes: true, childList: false, subtree: false });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupObserver);
  } else {
    setupObserver();
  }
}

observeMobileMenuAuth();

// --- Re-executa setupAuthMobile e observer após header/footer dinâmicos ---
(function ensureAuthMobileAfterDynamicLoad() {
  function reinitAuthMobile() {
    if (typeof setupAuthMobile === 'function') setupAuthMobile();
    if (typeof observeMobileMenuAuth === 'function') observeMobileMenuAuth();
  }
  // Suporte para header/footer dinâmicos
  document.addEventListener('headerLoaded', reinitAuthMobile);
  document.addEventListener('footerLoaded', reinitAuthMobile);
  // Fallback: tenta rodar após 2s caso eventos não disparem
  setTimeout(reinitAuthMobile, 2000);
})();

function loadAuthModalAndOpen() {
  if (typeof window.openCadastroModal === 'function') {
    window.openCadastroModal();
  } else {
    // fallback: tenta carregar o script manualmente e abrir depois
    var script = document.createElement('script');
    script.src = '/js/auth-modal.js';
    script.onload = function() {
      if (typeof window.openCadastroModal === 'function') window.openCadastroModal();
    };
    document.body.appendChild(script);
  }
}
