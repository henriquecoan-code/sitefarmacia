import { auth, firestore } from './firebase-config.js';
import { escapeHTML } from './utils.js';
import { setDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';

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
      // Criação do documento no Firestore
      await setDoc(doc(firestore, "usuarios", userCredential.user.uid), {
        nome: name,
        email: email,
        telefone: "",
        cpf: "",
        endereco: {
          rua: "",
          numero: "",
          bairro: "",
          cidade: "",
          complemento: ""
        },
        role: "user",
        dataCadastro: new Date().toISOString(),
        emailVerificado: false
      });
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

  // Lógica para abrir/fechar e validar o modal de cadastro em qualquer página
  function loadCadastroModal() {
    if (!document.getElementById('cadastro-modal-overlay')) {
      fetch('partials/cadastro-modal.html')
        .then(r => r.text())
        .then(html => {
          document.body.insertAdjacentHTML('beforeend', html);
          setupCadastroModalEvents();
          setupCadastroModalForm();
        });
    } else {
      setupCadastroModalEvents();
      setupCadastroModalForm();
    }
  }

  function setupCadastroModalEvents() {
    const overlay = document.getElementById('cadastro-modal-overlay');
    const closeBtn = document.getElementById('close-cadastro-modal');
    if (!overlay || !closeBtn) return;
    closeBtn.onclick = closeCadastroModal;
    overlay.onclick = function(e) {
      if (e.target === overlay) closeCadastroModal();
    };
    document.addEventListener('keydown', function escListener(e) {
      if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closeCadastroModal();
    });
  }

  function openCadastroModal() {
    loadCadastroModal();
    setTimeout(() => {
      const overlay = document.getElementById('cadastro-modal-overlay');
      if (overlay) {
        overlay.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
      }
    }, 100);
  }

  function closeCadastroModal() {
    const overlay = document.getElementById('cadastro-modal-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  }

  // Permite abrir o modal via window.openCadastroModal()
  window.openCadastroModal = openCadastroModal;

  // Lógica de validação e envio do formulário de cadastro do modal
  function setupCadastroModalForm() {
    const form = document.getElementById('registrationFormModal');
    if (!form) return;
    const submitButton = document.getElementById('submitButtonModal');
    const fullName = document.getElementById('fullNameModal');
    const email = document.getElementById('emailModal');
    const password = document.getElementById('passwordModal');
    const cpf = document.getElementById('cpfModal');
    const phone = document.getElementById('phoneModal');
    const rua = document.getElementById('ruaModal');
    const numero = document.getElementById('numeroModal');
    const bairro = document.getElementById('bairroModal');
    const cidade = document.getElementById('cidadeModal');
    const complemento = document.getElementById('complementoModal');
    const terms = document.getElementById('termsModal');

    // Funções de formatação (copiadas de cadastro3.html)
    function formatCpfCnpj(value) {
      value = value.replace(/\D/g, '');
      if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      } else {
        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
      }
      return value;
    }
    function formatPhone(phone) {
      return phone.replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }

    cpf.addEventListener('input', function() {
      this.value = formatCpfCnpj(this.value);
    });
    phone.addEventListener('input', function() {
      this.value = formatPhone(this.value);
    });

    // Esconde erro ao digitar
    [fullName, email, password, cpf, phone, rua, numero, bairro, cidade, terms].forEach(el => {
      if (el) {
        el.addEventListener('input', () => {
          const errorEl = document.getElementById(el.id.replace('Modal', 'ErrorModal'));
          if (errorEl) errorEl.classList.add('hidden');
        });
      }
    });

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const fullNameVal = fullName.value.trim();
      const emailVal = email.value.trim();
      const passwordVal = password.value;
      const cpfRaw = cpf.value.replace(/\D/g, '');
      const phoneVal = phone.value.replace(/\D/g, '');
      const ruaVal = rua.value.trim();
      const numeroVal = numero.value.trim();
      const bairroVal = bairro.value.trim();
      const cidadeVal = cidade.value.trim();
      const complementoVal = complemento.value.trim();
      const termsChecked = terms.checked;

      function setFieldErrorModal(id, show) {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', !show);
      }

      setFieldErrorModal('fullNameErrorModal', !fullNameVal);
      setFieldErrorModal('emailErrorModal', !emailVal);
      setFieldErrorModal('passwordErrorModal', passwordVal.length < 6);
      setFieldErrorModal('cpfErrorModal', !(cpfRaw.length === 11 || cpfRaw.length === 14));
      setFieldErrorModal('phoneErrorModal', phoneVal.length < 10);
      setFieldErrorModal('enderecoErrorModal', !(ruaVal && numeroVal && bairroVal && cidadeVal));
      setFieldErrorModal('termsErrorModal', !termsChecked);
      if (!fullNameVal || !emailVal || passwordVal.length < 6 || !(cpfRaw.length === 11 || cpfRaw.length === 14) || phoneVal.length < 10 || !termsChecked || !(ruaVal && numeroVal && bairroVal && cidadeVal)) {
        return;
      }

      // Validação de e-mail
      const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(emailVal)) {
        setFieldErrorModal('emailErrorModal', true);
        email.focus();
        return;
      }
      // Domínios permitidos
      const allowedDomains = [
        'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'bol.com.br', 'uol.com.br', 'live.com'
      ];
      const emailDomain = emailVal.split('@')[1]?.toLowerCase();
      if (!allowedDomains.includes(emailDomain)) {
        setFieldErrorModal('emailErrorModal', true);
        email.focus();
        return;
      }

      // Feedback visual de loading
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="loader mr-2"></span>Processando...';

      try {
        // Firebase Auth
        const { createUserWithEmailAndPassword, updateProfile, signOut } = await import('https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js');
        const { doc, setDoc, collection, addDoc } = await import('https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js');
        const userCredential = await createUserWithEmailAndPassword(auth, emailVal, passwordVal);
        await updateProfile(userCredential.user, { displayName: fullNameVal });
        await setDoc(doc(firestore, 'usuarios', userCredential.user.uid), {
          nome: fullNameVal,
          email: emailVal,
          cpf: cpfRaw,
          telefone: phoneVal,
          role: "user",
          dataCadastro: new Date().toISOString(),
          emailVerificado: false
        });
        // Endereço
        const enderecosCol = collection(firestore, 'usuarios', userCredential.user.uid, 'enderecos');
        await addDoc(enderecosCol, {
          cep: '',
          rua: ruaVal,
          numero: numeroVal,
          bairro: bairroVal,
          cidade: cidadeVal,
          complemento: complementoVal,
          telefone: phoneVal,
          criadoEm: new Date().toISOString()
        });
        // Sucesso visual
        submitButton.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Cadastro realizado!';
        setTimeout(() => {
          closeCadastroModal();
          window.location.href = 'login.html';
        }, 1800);
        await signOut(auth);
      } catch (error) {
        let errorMessage = 'Erro no cadastro: ';
        switch(error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Este e-mail já está cadastrado';
            break;
          case 'auth/weak-password':
            errorMessage = 'A senha deve ter pelo menos 6 caracteres';
            break;
          case 'auth/invalid-email':
            errorMessage = 'E-mail inválido';
            break;
          default:
            errorMessage += error.message;
        }
        setFieldErrorModal('emailErrorModal', true);
        submitButton.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Cadastrar';
        submitButton.disabled = false;
        alert(errorMessage);
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Cadastrar';
      }
    });
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