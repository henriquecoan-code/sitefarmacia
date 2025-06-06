document.addEventListener('DOMContentLoaded', () => {
  const authModal = document.getElementById('authModal');
  const authModalBtn = document.getElementById('authModalBtn');
  const closeAuthModal = document.getElementById('closeAuthModal');
  const userDropdown = document.getElementById('userDropdown');
  const authContainer = document.getElementById('authContainer');
  const logoutBtn = document.getElementById('logoutBtn');
  const authModalContent = document.getElementById('authModalContent');

  const templates = {
    login: `
      <form id="loginForm" class="space-y-4">
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Senha" required />
        <button type="submit">Entrar</button>
        <p><a href="#" id="switchToRegister">Criar conta</a> | <a href="#" id="forgotPassword">Esqueci minha senha</a></p>
      </form>
    `,
    register: `
      <form id="registerForm" class="space-y-4">
        <input type="text" placeholder="Nome completo" required />
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Senha" required />
        <button type="submit">Cadastrar</button>
        <p><a href="#" id="switchToLogin">Já tenho conta</a></p>
      </form>
    `
  };

  const modal = {
    open(content) {
      if (!authModal || !authModalContent) return;
      authModalContent.innerHTML = content;
      authModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    },
    close() {
      authModal?.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  };

  function updateAuthUI(user) {
    if (!authModalBtn) return;

    if (user) {
      authModalBtn.innerHTML = `<i class="fas fa-user-circle text-xl"></i><p class="text-xs">Minha Conta</p>`;
      document.getElementById('userName')?.textContent = user.displayName || 'Usuário';
      document.getElementById('userEmail')?.textContent = user.email;
    } else {
      authModalBtn.innerHTML = `<i class="fas fa-user text-xl"></i><p class="text-xs">Entrar/Cadastrar</p>`;
    }
  }

  function showToast(message, type = 'info') {
    console.log(`[${type}] ${message}`);
  }

  function showLoading(show) {
    console.log(show ? '🔄 Loading...' : '✅ Done.');
  }

  async function loginUser(email, password) {
    try {
      showLoading(true);
      console.log('Tentando login com:', email);
      await firebase.auth().signInWithEmailAndPassword(email, password);
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
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
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
      case 'auth/user-not-found': message = 'E-mail não cadastrado'; break;
      case 'auth/wrong-password': message = 'Senha incorreta'; break;
      case 'auth/email-already-in-use': message = 'E-mail já cadastrado'; break;
      case 'auth/weak-password': message = 'Senha muito fraca (mínimo 6 caracteres)'; break;
      default: message += error?.message || 'Erro desconhecido';
    }
    showToast(message, 'error');
  }

  function setupEventListeners() {
    authModalBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      if (!firebase.auth().currentUser) modal.open(templates.login);
    });

    closeAuthModal?.addEventListener('click', modal.close);

    authModal?.addEventListener('click', (e) => {
      if (e.target === authModal) modal.close();
    });

    authContainer?.addEventListener('mouseleave', () => {
      userDropdown?.classList.add('hidden');
    });

    authModalBtn?.addEventListener('mouseenter', () => {
      if (firebase.auth().currentUser) {
        userDropdown?.classList.remove('hidden');
      }
    });

    logoutBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      firebase.auth().signOut()
        .then(() => location.href = 'index.html')
        .catch(handleAuthError);
    });

    // Troca de formulários
    document.addEventListener('click', (e) => {
      const targetId = e.target?.id;
      if (targetId === 'switchToRegister') {
        e.preventDefault();
        modal.open(templates.register);
      } else if (targetId === 'switchToLogin') {
        e.preventDefault();
        modal.open(templates.login);
      } else if (targetId === 'forgotPassword') {
        e.preventDefault();
        const email = prompt('Digite seu e-mail para redefinir a senha:');
        if (email) {
          firebase.auth().sendPasswordResetEmail(email)
            .then(() => showToast('E-mail de redefinição enviado!', 'success'))
            .catch(handleAuthError);
        }
      }
    });

    // Formulários
    document.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;

      if (!firebase.auth) return;

      if (form.id === 'loginForm') {
        const email = form.querySelector('input[type="email"]')?.value;
        const password = form.querySelector('input[type="password"]')?.value;
        if (email && password) await loginUser(email, password);
      }

      if (form.id === 'registerForm') {
        const name = form.querySelector('input[type="text"]')?.value;
        const email = form.querySelector('input[type="email"]')?.value;
        const password = form.querySelector('input[type="password"]')?.value;
        if (name && email && password) await registerUser(name, email, password);
      }
    });
  }

  function init() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
      console.error('Firebase não está disponível');
      return;
    }

    try {
      setupEventListeners();
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

      firebase.auth().onAuthStateChanged((user) => {
        updateAuthUI(user);
        if (user && location.pathname.includes('login.html')) {
          location.href = 'index.html';
        }
      });
    } catch (error) {
      console.error('Erro na inicialização do auth-modal.js:', error);
    }
  }

  init();
});
