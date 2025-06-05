// js/auth-mobile.js
// Este script funciona em deploy estático (GitHub Pages) sem imports ES6
// Requer que firebase-app-compat.js e firebase-auth-compat.js já estejam carregados no <head>

// Inicialização do Firebase (ajuste para o seu projeto, se necessário)
const firebaseConfig = {
    apiKey: "AIzaSyDlTtNFfZIVIPJCIuJvnLB89idtAdKaFr8",
    authDomain: "farmaciasaobenedito-bcb2c.firebaseapp.com",
    databaseURL: "https://farmaciasaobenedito-bcb2c-default-rtdb.firebaseio.com",
    projectId: "farmaciasaobenedito-bcb2c",
    storageBucket: "farmaciasaobenedito-bcb2c.appspot.com",
    messagingSenderId: "789057690355",
    appId: "1:789057690355:web:e01ee3616df2679fe2f586",
    measurementId: "G-DHFR7WKVWS"
};
const auth = firebase.auth();

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
      if (typeof openAuthModal === 'function') openAuthModal('login');
    };
  }
}

function renderAuthMobileMenu(user) {
  var container = document.getElementById('authContainerSecondaryMobileMenu');
  if (!container) return;
  // Garante que o container sempre aparece quando o menu está aberto
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
      auth.signOut().then(function () {
        window.location.reload();
      });
    };
  } else {
    container.innerHTML =
      '<div class="flex flex-col space-y-1">' +
      '<a href="#" id="loginBtnMobileMenu" class="text-blue-900 font-medium hover:underline">Entrar</a>' +
      '<a href="#" id="registerBtnMobileMenu" class="text-blue-900 font-medium hover:underline">Cadastrar</a>' +
      '</div>';
    document.getElementById('loginBtnMobileMenu').onclick = function (e) {
      e.preventDefault();
      if (typeof openAuthModal === 'function') openAuthModal('login');
    };
    document.getElementById('registerBtnMobileMenu').onclick = function (e) {
      e.preventDefault();
      if (typeof openAuthModal === 'function') openAuthModal('register');
    };
  }
}

auth.onAuthStateChanged(function (user) {
  renderMobileAuth(user);
  renderAuthMobileMenu(user);
});

// Expor funções e auth no escopo global
window.renderAuthMobileMenu = renderAuthMobileMenu;
window.renderMobileAuth = renderMobileAuth;
window.auth = auth;

// Garante atualização do menu mobile sempre que ele abrir
(function ensureMobileMenuAuthSync() {
  function trySync() {
    var aside = document.querySelector('aside');
    if (!aside) return;
    var lastOpen = false;
    setInterval(function() {
      var isOpen = aside.style.display !== 'none' && aside.offsetParent !== null;
      if (isOpen && !lastOpen) {
        // Menu acabou de abrir
        var container = document.getElementById('authContainerSecondaryMobileMenu');
        if (container) {
          container.classList.remove('hidden');
          container.style.removeProperty('display');
        }
        if (window.renderAuthMobileMenu && window.auth) {
          window.renderAuthMobileMenu(window.auth.currentUser);
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
