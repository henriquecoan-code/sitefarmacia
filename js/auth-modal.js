// Torna o script compatível com inclusão tradicional (NÃO módulo)
// Remove os imports e usa window.auth, window.firestore, window.escapeHTML

(function() {
  // Elementos do DOM (verifique se existem antes de usar)
  // O modal é carregado dinamicamente, então sempre busque ao abrir

  // Templates do modal (não usados aqui, pois o HTML já está no partial)

  // Toast visual
  function showModalToast(message, type = 'success') {
    var toast = document.getElementById('modal-toast');
    if (!toast) return;
    toast.textContent = message;
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

  // Foco automático no primeiro campo ao abrir o modal
  function focusFirstField() {
    var nome = document.getElementById('fullNameModal');
    if (nome) nome.focus();
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

  // Validação e envio do formulário
  document.addEventListener('submit', async function(e) {
    var form = e.target;
    if (form && form.id === 'registrationFormModal') {
      e.preventDefault();
      var submitButton = document.getElementById('submitButtonModal');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loader mr-2"></span>Processando...';
      }
      // Coleta os campos
      var nome = document.getElementById('fullNameModal').value.trim();
      var email = document.getElementById('emailModal').value.trim();
      var senha = document.getElementById('passwordModal').value;
      var cpf = document.getElementById('cpfModal').value.trim();
      var telefone = document.getElementById('phoneModal').value.trim();
      var rua = document.getElementById('ruaModal').value.trim();
      var numero = document.getElementById('numeroModal').value.trim();
      var bairro = document.getElementById('bairroModal').value.trim();
      var cidade = document.getElementById('cidadeModal').value.trim();
      var complemento = document.getElementById('complementoModal').value.trim();
      var termos = document.getElementById('termsModal').checked;
      // Validação simples
      if (!nome || !email || senha.length < 6 || !cpf || !telefone || !rua || !numero || !bairro || !cidade || !termos) {
        showModalToast('Preencha todos os campos obrigatórios corretamente.', 'error');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Cadastrar';
        }
        return;
      }
      // Simula cadastro (substitua pelo Firebase se desejar)
      setTimeout(function() {
        showModalToast('Cadastro realizado com sucesso!', 'success');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Cadastrar';
        }
        setTimeout(closeCadastroModal, 1800);
      }, 1200);
    }
  });
})();