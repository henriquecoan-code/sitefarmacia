// Torna o script compatível com inclusão tradicional (NÃO módulo)
// Remove os imports e usa window.auth, window.firestore, window.escapeHTML

(function() {
  // Elementos do DOM (verifique se existem antes de usar)
  // O modal é carregado dinamicamente, então sempre busque ao abrir

  // Templates do modal (não usados aqui, pois o HTML já está no partial)

  // Toast visual acessível
  function showModalToast(message, type = 'success') {
    var toast = document.getElementById('modal-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.setAttribute('aria-live', 'polite');
    toast.classList.remove('hidden', 'bg-green-600', 'bg-red-600');
    toast.classList.add(type === 'error' ? 'bg-red-600' : 'bg-green-600');
    toast.style.opacity = '1';
    setTimeout(function() {
      toast.style.opacity = '0';
      setTimeout(function() {
        toast.classList.add('hidden');
        toast.style.opacity = '';
      }, 400);
    }, 2500);
  }

  // Overlay de loading
  function showLoading(show) {
    var overlay = document.getElementById('modal-loading-overlay');
    if (overlay) overlay.classList.toggle('hidden', !show);
  }

  // Foco automático no primeiro campo ao abrir o modal
  function focusFirstField() {
    if (window.focusFirstCadastroField) window.focusFirstCadastroField();
    else {
      var nome = document.getElementById('fullNameModal');
      if (nome) nome.focus();
    }
  }

  // Fecha modal ao pressionar ESC
  function escToClose(e) {
    var overlay = document.getElementById('cadastro-modal-overlay');
    if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) {
      closeCadastroModal();
    }
  }

  // Abre o modal
  window.openCadastroModal = function() {
    var overlay = document.getElementById('cadastro-modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    focusFirstField();
    document.addEventListener('keydown', escToClose);
  };

  // Fecha o modal
  function closeCadastroModal() {
    var overlay = document.getElementById('cadastro-modal-overlay');
    if (!overlay) return;
    overlay.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    document.removeEventListener('keydown', escToClose);
  }
  window.closeCadastroModal = closeCadastroModal;

  // Botão de fechar
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'close-cadastro-modal') {
      closeCadastroModal();
    }
    // Fecha ao clicar fora do modal
    if (e.target && e.target.id === 'cadastro-modal-overlay') {
      closeCadastroModal();
    }
  });

  // Aguarda o carregamento do modal no DOM
  document.addEventListener('DOMContentLoaded', () => {
    // Função para abrir/fechar o modal
    function openCadastroModal() {
      const overlay = document.getElementById('cadastro-modal-overlay');
      if (overlay) overlay.classList.remove('hidden');
    }
    function closeCadastroModal() {
      const overlay = document.getElementById('cadastro-modal-overlay');
      if (overlay) overlay.classList.add('hidden');
    }
    // Botão para abrir modal (ajuste o seletor conforme seu header)
    document.body.addEventListener('click', (e) => {
      if (e.target.matches('[data-cadastro-modal-btn]') || e.target.closest('[data-cadastro-modal-btn]')) {
        e.preventDefault();
        openCadastroModal();
      }
      if (e.target.id === 'close-cadastro-modal' || e.target.closest('#close-cadastro-modal')) {
        closeCadastroModal();
      }
      // Fechar ao clicar fora do modal
      if (e.target.id === 'cadastro-modal-overlay') {
        closeCadastroModal();
      }
    });

    // Cadastro do usuário
    async function handleCadastroModalSubmit(e) {
      e.preventDefault();
      showLoading(true);
      // Importa Firebase modular dinamicamente (garante que está disponível)
      const { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } = await import('https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js');
      const { getFirestore, doc, setDoc, collection, addDoc } = await import('https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js');
      // Usa os objetos globais já inicializados
      const auth = window.auth || getAuth();
      const firestore = window.firestore || getFirestore();

      // Campos do modal
      const fullName = document.getElementById('fullNameModal').value.trim();
      const email = document.getElementById('emailModal').value.trim();
      const password = document.getElementById('passwordModal').value;
      const confirmPassword = document.getElementById('confirmPasswordModal').value;
      const cpfRaw = document.getElementById('cpfModal').value.replace(/\D/g, '');
      const cep = document.getElementById('cepModal').value.replace(/\D/g, '');
      const phone = document.getElementById('phoneModal').value.replace(/\D/g, '');
      const terms = document.getElementById('termsModal').checked;
      const rua = '';
      const numero = '';
      const bairro = '';
      const cidade = '';
      const complemento = '';

      // Validação detalhada
      function setFieldError(id, show) {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', !show);
        const input = document.getElementById(id.replace('ErrorModal', 'Modal'));
        if (input) input.classList.toggle('error', show);
      }
      let hasError = false;
      setFieldError('fullNameErrorModal', !fullName);
      setFieldError('emailErrorModal', !email);
      setFieldError('passwordErrorModal', password.length < 6);
      setFieldError('confirmPasswordErrorModal', password !== confirmPassword);
      // CPF/CNPJ
      let cpfCnpjValido = false;
      if (cpfRaw.length === 11 && window.isValidCPF) {
        cpfCnpjValido = window.isValidCPF(document.getElementById('cpfModal').value.replace(/\D/g, ''));
      } else if (cpfRaw.length === 14 && window.isValidCNPJ) {
        cpfCnpjValido = window.isValidCNPJ(document.getElementById('cpfModal').value.replace(/\D/g, ''));
      }
      setFieldError('cpfErrorModal', !cpfCnpjValido);
      setFieldError('phoneErrorModal', phone.length < 10);
      setFieldError('cepErrorModal', cep.length !== 8);
      setFieldError('enderecoErrorModal', false);
      setFieldError('termsErrorModal', !terms);
      if (!fullName || !email || password.length < 6 || password !== confirmPassword || !cpfCnpjValido || phone.length < 10 || cep.length !== 8 || !terms) {
        showModalToast('Por favor, preencha todos os campos corretamente', 'error');
        showLoading(false);
        return;
      }
      // Validação de e-mail
      const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        setFieldError('emailErrorModal', true);
        showModalToast('Por favor, insira um e-mail válido', 'error');
        showLoading(false);
        return;
      }
      // Domínios permitidos
      const allowedDomains = [
        'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'bol.com.br', 'uol.com.br', 'live.com'
      ];
      const emailDomain = email.split('@')[1]?.toLowerCase();
      if (!allowedDomains.includes(emailDomain)) {
        showModalToast('Apenas e-mails tradicionais são permitidos.', 'error');
        showLoading(false);
        return;
      }
      // Botão e loading
      const submitBtn = document.getElementById('submitButtonModal');
      submitBtn.disabled = true;
      const originalBtn = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="loader mr-2"></span>Processando...';
      try {
        // 1. Cria usuário no Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
        // 2. Salva dados principais do usuário
        await setDoc(doc(firestore, 'usuarios', userCredential.user.uid), {
          nome: fullName,
          email: email,
          cpf: cpfRaw,
          telefone: phone,
          cep: cep,
          role: "user",
          dataCadastro: new Date().toISOString(),
          emailVerificado: false
        });
        showModalToast('Cadastro realizado! Verifique seu e-mail.', 'success');
        await signOut(auth);
        setTimeout(() => {
          closeCadastroModal();
      cadastro-modal
          if (typeof window.openAuthModal === 'function') {
            window.openAuthModal('login');
          } else {
            // fallback: tenta abrir o modal de login pelo header
            const overlay = document.getElementById('auth-modal-overlay');
            if (overlay) {
              overlay.classList.remove('hidden');
              document.body.classList.add('overflow-hidden');
              const content = document.getElementById('auth-modal-content');
              if (content) {
                window.openAuthModal && window.openAuthModal('login');
              }
            }
          }

          window.location.href = 'login.html';
      main
        }, 2000);
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
        showModalToast(errorMessage, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtn;
        showLoading(false);
      }
      cadastro-modal
    }

    // Toast do modal
    // Removed duplicate definition of showModalToast.
   

    // Toast do modal
    function showModalToast(message, type = 'success') {
      const toast = document.getElementById('modal-toast');
      if (!toast) return;
      toast.textContent = message;
      toast.className = 'fixed left-1/2 top-8 z-50 px-4 py-2 rounded shadow-lg text-white text-sm font-medium transform -translate-x-1/2 transition-all ' +
        (type === 'success' ? 'bg-green-600' : 'bg-red-600');
      toast.classList.remove('hidden');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 4000);
    }

    main
    // Máscara dinâmica para CPF/CNPJ
    function maskCpfCnpj(value) {
      value = value.replace(/\D/g, '');
      if (value.length <= 11) {
        // CPF: 000.000.000-00
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      } else {
        // CNPJ: 00.000.000/0000-00
        value = value.replace(/(\d{2})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1/$2');
        value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
      }
      return value;
    }

    document.addEventListener('input', function(e) {
      if (e.target && e.target.id === 'cpfModal') {
        const cursor = e.target.selectionStart;
        const oldLength = e.target.value.length;
        e.target.value = maskCpfCnpj(e.target.value);
        // Ajusta o cursor para não pular
        const newLength = e.target.value.length;
        e.target.setSelectionRange(cursor + (newLength - oldLength), cursor + (newLength - oldLength));
      }
    });

    // Listener do submit do modal (após carregamento dinâmico)
    document.body.addEventListener('submit', function(e) {
      if (e.target && e.target.id === 'registrationFormModal') {
        handleCadastroModalSubmit(e);
      }
    });
  });
})();