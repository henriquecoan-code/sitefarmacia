import { auth } from './firebase-config.js';
import { escapeHTML } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Elementos do DOM (verifique se existem antes de usar)
  const authModal = document.getElementById('authModal');
  const authModalContent = document.getElementById('authModalContent');
  const authModalBtn = document.getElementById('authModalBtn');
  const closeAuthModal = document.getElementById('closeAuthModal');
  const logoutBtn = document.getElementById('logoutBtn');
  const userDropdown = document.getElementById('userDropdown');
  const authContainer = document.getElementById('authContainer');

  // Templates do modal
  const templates = {
    login: `
      <form id="loginForm">
        <input type="email" placeholder="E-mail" required />
        <input type="password" placeholder="Senha" required />
        <button type="submit">Entrar</button>
      </form>
      <a href="#" id="switchToRegister">Cadastrar</a>
    `,
    register: `
      <form id="registerForm">
        <input type="text" placeholder="Nome" required />
        <input type="email" placeholder="E-mail" required />
        <input type="password" placeholder="Senha" required />
        <button type="submit">Cadastrar</button>
      </form>
      <a href="#" id="switchToLogin">Já tem uma conta? Entrar</a>
    `
  };

  // Controle do modal
  const modal = {
    open: (content) => {
      if (!authModal || !authModalContent) return;
      authModalContent.innerHTML = content;
      authModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    },
    close: () => {
      if (!authModal) return;
      authModal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  };

  // Atualiza a UI com base no usuário
  function updateAuthUI(user) {
    if (!authModalBtn) return;

    if (user) {
      authModalBtn.innerHTML = `
        <i class="fas fa-user-circle text-xl"></i>
        <p class="text-xs">Minha Conta</p>
      `;
      const userNameEl = document.getElementById('userName');
      const userEmailEl = document.getElementById('userEmail');
      if (userNameEl) userNameEl.textContent = escapeHTML(user.displayName || 'Usuário');
      if (userEmailEl) userEmailEl.textContent = escapeHTML(user.email);
    } else {
      authModalBtn.innerHTML = `
        <i class="fas fa-user text-xl"></i>
        <p class="text-xs">Entrar/Cadastrar</p>
      `;
    }
  }

  // Manipuladores de eventos
  function setupEventListeners() {
    // Modal
    if (authModalBtn) {
      authModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!auth.currentUser) modal.open(templates.login);
      });
    }

    if (closeAuthModal) {
      closeAuthModal.addEventListener('click', modal.close);
    }

    if (authModal) {
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) modal.close();
      });
    }

    // Troca entre login e cadastro
    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'switchToRegister') {
        e.preventDefault();
        modal.open(templates.register);
      }
      if (e.target && e.target.id === 'switchToLogin') {
        e.preventDefault();
        modal.open(templates.login);
      }
    });

    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut()
          .then(() => {
            window.location.href = 'index.html';
          })
          .catch((error) => {
            console.error('Erro ao sair:', error);
            alert('Erro ao sair. Tente novamente.');
          });
      });
    }

    // Dropdown
    if (authModalBtn && userDropdown) {
      authModalBtn.addEventListener('mouseenter', () => {
        if (auth.currentUser) {
          userDropdown.classList.remove('hidden');
        }
      });
    }

    if (authContainer && userDropdown) {
      authContainer.addEventListener('mouseleave', () => {
        userDropdown.classList.add('hidden');
      });
    }

    // Formulários
    document.addEventListener('submit', async (e) => {
      if (!e.target) return;

      try {
        if (e.target.id === 'loginForm') {
          e.preventDefault();
          const email = e.target[0]?.value;
          const password = e.target[1]?.value;
          if (email && password) await loginUser(email, password);
        }

        if (e.target.id === 'registerForm') {
          e.preventDefault();
          const name = e.target[0]?.value;
          const email = e.target[1]?.value;
          const password = e.target[2]?.value;
          if (name && email && password) await registerUser(name, email, password);
        }
      } catch (error) {
        handleAuthError(error);
      }
    });

    // Recuperação de senha
    document.addEventListener('click', (e) => {
      if (!e.target || e.target.id !== 'forgotPassword') return;
      e.preventDefault();
      modal.open(`
        <form id="resetPasswordForm">
          <input type="email" placeholder="Digite seu e-mail" required />
          <button type="submit">Enviar redefinição</button>
        </form>
      `);

      document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target[0]?.value;
        if (email) {
          try {
            await auth.sendPasswordResetEmail(email);
            showToast('E-mail de redefinição enviado!', 'success');
          } catch (error) {
            handleAuthError(error);
          }
        }
      });
    });
  }

  // Funções de autenticação
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function loginUser(email, password) {
    if (!isValidEmail(email)) {
      showToast('Por favor, insira um e-mail válido.', 'error');
      return;
    }
    try {
      showLoading(true);
      await auth.signInWithEmailAndPassword(email, password);
      modal.close();
      showToast('Login realizado com sucesso!', 'success');
    } catch (error) {
      handleAuthError(error);
    } finally {
      showLoading(false);
    }
  }

  async function registerUser(name, email, password) {
    try {
      showLoading(true);
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      await userCredential.user.updateProfile({ displayName: name });
      modal.close();
      showToast('Cadastro realizado com sucesso!', 'success');
    } catch (error) {
      handleAuthError(error);
    } finally {
      showLoading(false);
    }
  }

  function handleAuthError(error) {
    let message = 'Erro: ';
    switch (error?.code) {
      case 'auth/user-not-found':
        message = 'E-mail não cadastrado';
        break;
      case 'auth/wrong-password':
        message = 'Senha incorreta';
        break;
      case 'auth/email-already-in-use':
        message = 'E-mail já cadastrado';
        break;
      case 'auth/weak-password':
        message = 'Senha muito fraca (mínimo 6 caracteres)';
        break;
      default:
        message += error?.message || 'Erro desconhecido';
    }
    showToast(message, 'error');
  }

  // Funções auxiliares
  function showLoading(show) {
    // Implementação do loader
  }

  function showToast(message, type) {
    console.log(`${type}: ${message}`);
    alert(message);
  }

  // Inicialização
  function init() {
    try {
      setupEventListeners();

      auth.onAuthStateChanged((user) => {
        updateAuthUI(user);
        if (user && window.location.pathname.includes('login.html')) {
          window.location.href = 'index.html';
        }
      });

      auth.onAuthStateChanged((user) => {
//        console.log('Estado de autenticação mudou:', user);
        if (user) {
          console.log('Usuário logado:', user.email);
        } else {
          console.log('Nenhum usuário logado.');
        }
      });
    } catch (error) {
      console.error('Erro na inicialização:', error);
    }
  }

  init();
});