// login-modal.js
// Script para integrar o login-modal.html ao Firebase Auth e atualizar o header após login
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';

window.setupLoginModal = function() {
  const overlay = document.getElementById('login-modal-overlay');
  const form = document.getElementById('loginFormModal');
  const emailInput = document.getElementById('emailLoginModal');
  const passwordInput = document.getElementById('passwordLoginModal');
  const emailError = document.getElementById('emailLoginErrorModal');
  const passwordError = document.getElementById('passwordLoginErrorModal');
  const toast = document.getElementById('login-modal-toast');
  const submitBtn = document.getElementById('submitLoginButtonModal');

  if (!form) return;

  form.onsubmit = async function(e) {
    e.preventDefault();
    emailError.classList.add('hidden');
    passwordError.classList.add('hidden');
    toast.classList.add('hidden');
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let hasError = false;
    if (!email || !email.includes('@')) {
      emailError.classList.remove('hidden');
      hasError = true;
    }
    if (!password || password.length < 6) {
      passwordError.classList.remove('hidden');
      hasError = true;
    }
    if (hasError) return;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loader mr-2"></span>Entrando...';
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.textContent = 'Login realizado com sucesso!';
      toast.classList.remove('hidden');
      setTimeout(() => {
        toast.classList.add('hidden');
        overlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Entrar';
        // Atualiza o header (caso use função global)
        if (window.handleAuthState) window.handleAuthState('authContainerSecondary');
        if (window.renderMobileAuth) window.renderMobileAuth(auth.currentUser);
        if (window.renderAuthMobileMenu) window.renderAuthMobileMenu(auth.currentUser);
      }, 1200);
    } catch (error) {
      let msg = 'Erro ao fazer login';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        msg = 'E-mail ou senha inválidos';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Muitas tentativas. Tente novamente mais tarde.';
      }
      toast.textContent = msg;
      toast.classList.remove('hidden');
      toast.style.background = '#e53e3e';
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Entrar';
    }
  };
};

// Função global para abrir o modal de login
window.openLoginModal = function() {
  var overlay = document.getElementById('login-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  setTimeout(function() {
    var emailInput = document.getElementById('emailLoginModal');
    if (emailInput) emailInput.focus();
  }, 100);
};

// Inicializa ao carregar o modal
if (document.getElementById('login-modal-overlay')) {
  window.setupLoginModal();

  // Fechar ao clicar no X
  const closeBtn = document.getElementById('close-login-modal');
  if (closeBtn) {
    closeBtn.onclick = function() {
      document.getElementById('login-modal-overlay').classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    };
  }
  // Fechar ao clicar fora do modal
  const overlay = document.getElementById('login-modal-overlay');
  if (overlay) {
    overlay.onclick = function(e) {
      if (e.target === overlay) {
        overlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    };
  }
  // Fechar ao pressionar ESC
  document.addEventListener('keydown', function escToClose(e) {
    if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) {
      overlay.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  });
  // Criar conta: fecha login-modal e abre cadastro-modal suavemente
  const criarContaBtn = document.getElementById('open-cadastro-modal-from-login');
  if (criarContaBtn) {
    criarContaBtn.onclick = function(e) {
      e.preventDefault();
      overlay.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      setTimeout(function() {
        if (typeof window.openCadastroModal === 'function') {
          window.openCadastroModal();
        }
      }, 200);
    };
  }
  // Recuperação de senha: abrir modal
  const forgotBtn = document.querySelector('#login-modal-overlay a.text-blue-400');
  if (forgotBtn) {
    forgotBtn.onclick = function(e) {
      e.preventDefault();
      document.getElementById('reset-password-modal-overlay').classList.remove('hidden');
      setTimeout(() => {
        const input = document.getElementById('resetEmail');
        if (input) input.focus();
      }, 100);
    };
  }
  // Fechar modal de recuperação
  const closeResetBtn = document.getElementById('close-reset-password-modal');
  const resetOverlay = document.getElementById('reset-password-modal-overlay');
  if (closeResetBtn && resetOverlay) {
    closeResetBtn.onclick = function() {
      resetOverlay.classList.add('hidden');
    };
    resetOverlay.onclick = function(e) {
      if (e.target === resetOverlay) resetOverlay.classList.add('hidden');
    };
    document.addEventListener('keydown', function escToCloseReset(e) {
      if (e.key === 'Escape' && !resetOverlay.classList.contains('hidden')) {
        resetOverlay.classList.add('hidden');
      }
    });
  }
  // Envio do formulário de recuperação
  const resetForm = document.getElementById('resetPasswordForm');
  if (resetForm) {
    resetForm.onsubmit = async function(e) {
      e.preventDefault();
      const email = document.getElementById('resetEmail').value.trim();
      const errorMsg = document.getElementById('resetEmailError');
      const toast = document.getElementById('reset-password-toast');
      errorMsg.classList.add('hidden');
      toast.classList.add('hidden');
      if (!email || !email.includes('@')) {
        errorMsg.classList.remove('hidden');
        return;
      }
      document.getElementById('submitResetPasswordBtn').disabled = true;
      document.getElementById('submitResetPasswordBtn').innerHTML = '<span class="loader mr-2"></span>Enviando...';
      try {
        await sendPasswordResetEmail(auth, email);
        toast.textContent = 'E-mail de redefinição enviado!';
        toast.classList.remove('hidden');
        toast.style.background = '#16a34a';
        setTimeout(() => {
          toast.classList.add('hidden');
          resetOverlay.classList.add('hidden');
        }, 1800);
      } catch (err) {
        toast.textContent = 'Erro ao enviar e-mail. Verifique o e-mail informado.';
        toast.classList.remove('hidden');
        toast.style.background = '#e53e3e';
      }
      document.getElementById('submitResetPasswordBtn').disabled = false;
      document.getElementById('submitResetPasswordBtn').innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Enviar link';
    };
  }
}
