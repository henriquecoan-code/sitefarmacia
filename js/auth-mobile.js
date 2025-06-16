// js/auth-mobile.js
// Este script deve ser carregado como script tradicional, não como módulo
// Não use import aqui!
// O objeto auth deve ser exposto em window.auth pelo carregador principal

// Garante que window.auth está disponível globalmente
try {
  if (typeof window !== 'undefined' && typeof auth !== 'undefined') {
    window.auth = auth;
  }
} catch(e) {}

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
      e.preventDefault();
      if (typeof window.openLoginModal === 'function') window.openLoginModal();
    };
  }
}

function renderAuthMobileMenu(user) {
  // Aguarda até o elemento existir e estar visível
  function tryRender(attempts = 5) {
    const container = document.getElementById('authContainerSecondaryMobileMenu');
    console.log('Tentando renderizar menu mobile:', container, 'Tentativas restantes:', attempts, 'User:', user);
    if (!container || container.offsetParent === null) {
      if (attempts > 0) setTimeout(() => tryRender(attempts - 1), 500);
      return;
    }
    container.classList.remove('hidden');
    container.style.removeProperty('display');
    // Se user for null, renderiza menu de não autenticado e não faz mais tentativas
    if (!user) {
      const html =
        '<div class="flex flex-col space-y-1">' +
        '<a href="#" id="loginBtnMobileMenu" class="text-blue-900 font-medium hover:underline">Entrar</a>' +
        '<a href="#" id="registerBtnMobileMenu" class="text-blue-900 font-medium hover:underline">Cadastrar</a>' +
        '</div>';
      const clean = s => s.replace(/\s+/g, ' ').trim();
      if (clean(container.innerHTML) !== clean(html)) {
        container.innerHTML = html;
        document.getElementById('loginBtnMobileMenu').onclick = function (e) {
          e.preventDefault();
          if (typeof window.openLoginModal === 'function') {
            window.openLoginModal();
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
      console.log('Conteúdo após render (não autenticado):', container.innerHTML);
      return; // Não faz mais tentativas
    }
    // ...código original para usuário autenticado...
    container.innerHTML =
      '<div class="flex flex-col space-y-1">' +
      '<a href="minha-conta.html" id="mobileMenuMinhaConta" class="text-blue-900 font-medium hover:underline">Minha Conta</a>' +
      '<a href="#" id="logoutBtnMobileMenu" class="text-blue-900 font-medium hover:underline">Sair</a>' +
      '</div>';
    // Adiciona listener para fechar o menu ao clicar em Minha Conta
    var minhaConta = document.getElementById('mobileMenuMinhaConta');
    if (minhaConta) {
      minhaConta.addEventListener('click', function() {
        if (window.Alpine && window.Alpine.store && typeof window.Alpine.store === 'function') {
          try { window.Alpine.store('mobileMenuOpen', false); } catch(e) {}
        }
        var aside = document.querySelector('aside');
        if (aside && aside.__x && aside.__x.$data) {
          aside.__x.$data.mobileMenuOpen = false;
        } else if (aside && aside.parentElement && aside.parentElement.__x && aside.parentElement.__x.$data) {
          aside.parentElement.__x.$data.mobileMenuOpen = false;
        }
      });
    }
    var sair = document.getElementById('logoutBtnMobileMenu');
    if (sair) {
      sair.onclick = function(e) {
        e.preventDefault();
        if (window.auth) {
          window.auth.signOut().then(function () {
            window.location.reload();
          });
        }
      };
    }
    console.log('Conteúdo após render (autenticado):', container.innerHTML);
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

// Remove o setInterval de sincronização automática do menu mobile
// Adiciona listener para evento customizado ao abrir o menu
window.addEventListener('mobileMenuOpened', function() {
  if (window.renderAuthMobileMenu && window.currentAuthUser !== undefined) {
    window.renderAuthMobileMenu(window.currentAuthUser);
  }
});

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
          // Só renderiza se o conteúdo não estiver correto para o usuário atual
          let expectedHtml;
          if (window.currentAuthUser) {
            expectedHtml = '<div class="flex flex-col space-y-1">' +
              '<a href="minha-conta.html" id="mobileMenuMinhaConta" class="text-blue-900 font-medium hover:underline">Minha Conta</a>' +
              '<a href="#" id="logoutBtnMobileMenu" class="text-blue-900 font-medium hover:underline">Sair</a>' +
              '</div>';
          } else {
            expectedHtml = '<div class="flex flex-col space-y-1">' +
              '<a href="#" id="loginBtnMobileMenu" class="text-blue-900 font-medium hover:underline">Entrar</a>' +
              '<a href="#" id="registerBtnMobileMenu" class="text-blue-900 font-medium hover:underline">Cadastrar</a>' +
              '</div>';
          }
          const clean = s => s.replace(/\s+/g, ' ').trim();
          if (clean(container.innerHTML) !== clean(expectedHtml)) {
            if (window.renderAuthMobileMenu && window.currentAuthUser !== undefined) {
              window.renderAuthMobileMenu(window.currentAuthUser);
            }
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
