// js/auth-mobile.js
// Este script funciona em deploy estático (GitHub Pages) sem imports ES6
// Requer que firebase-app-compat.js e firebase-auth-compat.js já estejam carregados no <head>

// Inicialização do Firebase (ajuste para o seu projeto, se necessário)
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "SUA_API_KEY",
    authDomain: "SUA_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    // ...outros campos se necessário
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
  container.classList.remove('hidden');
  container.style.display = '';
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
