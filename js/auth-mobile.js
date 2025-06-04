// js/auth-mobile.js
// Este script funciona em deploy estático (GitHub Pages) sem imports ES6
// Requer que firebase-app-compat.js e firebase-auth-compat.js já estejam carregados no <head>

// Inicialização do Firebase (ajuste para o seu projeto, se necessário)
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyDlTtNFfZIVIPJCIuJvnLB89idtAdKaFr8",
    authDomain: "farmaciasaobenedito-bcb2c.firebaseapp.com",
    databaseURL: "https://farmaciasaobenedito-bcb2c-default-rtdb.firebaseio.com",
    projectId: "farmaciasaobenedito-bcb2c",
    storageBucket: "farmaciasaobenedito-bcb2c.appspot.com",
    messagingSenderId: "789057690355",
    appId: "1:789057690355:web:e01ee3616df2679fe2f586",
    measurementId: "G-DHFR7WKVWS"
  });
}
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
  console.log('Preenchendo menu mobile:', user, container); // Log para depuração
  container.classList.remove('hidden');
  container.style.display = 'block'; // Garante exibição correta
  // Mostra um loader enquanto o Firebase decide
  if (window.auth && window.auth.currentUser === undefined) {
    container.innerHTML = '<span>Carregando...</span>';
    return;
  }
  if (user) {
    container.innerHTML =
      '<div class="flex flex-col space-y-1">' +
      '        <a href="./index.html" class="py-3 px-6 hover:bg-blue-100 text-blue-900 font-medium" @click="mobileMenuOpen = false">Teste</a>'+
'</div>' +
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

// Atualiza o menu mobile sempre que o estado de autenticação mudar
function updateMobileMenuAuthOnStateChange(user) {
  // Só renderiza se o aside estiver visível
  var aside = document.querySelector('aside[x-show]');
  if (aside && aside.style.display !== 'none') {
    renderAuthMobileMenu(user);
  }
}

auth.onAuthStateChanged(function (user) {
  renderMobileAuth(user);
  renderAuthMobileMenu(user);
  updateMobileMenuAuthOnStateChange(user);
});

// 1. Fallback no x-effect já está no header.html (garante execução mesmo se a função não existir no primeiro momento)
// 2. Escopo global já garantido abaixo
window.renderMobileAuth = renderMobileAuth;
window.renderAuthMobileMenu = renderAuthMobileMenu;
window.auth = auth;

// 3. Remover MutationObserver duplicado (deixe só o x-effect no HTML)
