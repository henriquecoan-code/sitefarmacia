// Importar Firebase usando a versão compat para garantir compatibilidade com o resto do projeto
import firebase from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js';
import 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore-compat.js';
import { auth, firestore } from './firebase-config.js';
import { escapeHTML } from './utils.js';

/**
 * Gerencia os dados da conta do usuário
 * Responsável por carregar, exibir e atualizar os dados pessoais e endereço
 */
export class AccountManager {
  constructor() {
    this.auth = auth;
    this.db = firestore;
    
    // Elementos do DOM
    this.loadingElement = document.getElementById('loading');
    this.errorElement = document.getElementById('error-message');
    this.userDataElement = document.getElementById('user-data');
    this.noAddressElement = document.getElementById('no-address');
    this.addressFormElement = document.getElementById('address-form');
    
    console.log("AccountManager construído");
    console.log("Elementos encontrados:", {
      loading: this.loadingElement,
      error: this.errorElement,
      userData: this.userDataElement,
      noAddress: this.noAddressElement,
      addressForm: this.addressFormElement
    });
    
    // Inicializar os eventos após o carregamento do DOM
    this.updateCartCount();
  }

  /**
   * Inicializa o gerenciador de conta
   */
  init() {
    console.log("Inicializando AccountManager");
    
    // Verificar estado de autenticação
    this.auth.onAuthStateChanged(user => {
      console.log("Estado de autenticação alterado:", user ? "Usuário logado" : "Usuário não logado");
      
      if (!user) {
        this.showLoginRequired();
        return;
      }
      
      this.loadUserData(user);
    });
  }
  
  /**
   * Exibe mensagem de login obrigatório
   */
  showLoginRequired() {
    console.log("Mostrando mensagem de login obrigatório");
    if (this.loadingElement) this.loadingElement.classList.add('hidden');
    if (this.errorElement) this.errorElement.classList.remove('hidden');
    if (this.userDataElement) this.userDataElement.classList.add('hidden');
  }
  
  /**
   * Carrega os dados do usuário do Firestore
   * @param {Object} user - Objeto do usuário autenticado
   */
  loadUserData(user) {
    console.log("Carregando dados do usuário:", user.uid);
    
    const userDocRef = this.db.collection('usuarios').doc(user.uid);
    
    userDocRef.get()
      .then(docSnap => {
        if (this.loadingElement) this.loadingElement.classList.add('hidden');
        if (this.userDataElement) this.userDataElement.classList.remove('hidden');
        
        let userData;
        
        if (docSnap.exists) {
          // Documento existe, usar dados existentes
          userData = docSnap.data();
          console.log("Dados do usuário encontrados:", userData);
        } else {
          // Documento não existe, criar um novo
          userData = {
            nome: user.displayName || '',
            email: user.email || '',
            telefone: '',
            endereco: {
              cep: '',
              rua: '',
              numero: '',
              bairro: '',
              complemento: ''
            }
          };
          console.log("Criando novo documento para o usuário:", userData);
          
          userDocRef.set(userData)
            .catch(error => console.error("Erro ao criar documento do usuário:", error));
        }
        
        // Preencher os campos de dados pessoais
        this.fillPersonalData(userData, user);
        
        // Verificar se o usuário tem endereço cadastrado
        this.fillAddressData(userData.endereco);
        
        // Configurar os botões de edição
        this.setupEditButtons();
        
        // Configurar os formulários
        this.setupForms(userDocRef);
      })
      .catch(error => {
        console.error("Erro ao buscar dados do usuário:", error);
        if (this.loadingElement) this.loadingElement.classList.add('hidden');
        
        // Mostrar mensagem de erro genérica
        if (this.errorElement) {
          const errorMsg = this.errorElement.querySelector('p');
          if (errorMsg) errorMsg.textContent = 'Ocorreu um erro ao carregar seus dados. Por favor, tente novamente.';
          this.errorElement.classList.remove('hidden');
        }
      });
  }
  
  /**
   * Preenche os campos de dados pessoais
   * @param {Object} userData - Dados do usuário
   * @param {Object} user - Objeto do usuário autenticado
   */
  fillPersonalData(userData, user) {
    const nomeDisplay = document.getElementById('nome-display');
    const emailDisplay = document.getElementById('email-display');
    const telefoneDisplay = document.getElementById('telefone-display');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const telefoneInput = document.getElementById('telefone');

    if (nomeDisplay) nomeDisplay.textContent = escapeHTML(userData.nome || '');
    if (emailDisplay) emailDisplay.textContent = escapeHTML(userData.email || user.email || '');
    if (telefoneDisplay) telefoneDisplay.textContent = escapeHTML(userData.telefone || '');

    if (nomeInput) nomeInput.value = userData.nome || '';
    if (emailInput) emailInput.value = userData.email || user.email || '';
    if (telefoneInput) telefoneInput.value = userData.telefone || '';
  }
  
  /**
   * Preenche os campos de endereço
   * @param {Object} endereco - Dados de endereço do usuário
   */
  fillAddressData(endereco) {
    if (!this.noAddressElement || !this.addressFormElement) {
      console.error("Elementos de endereço não encontrados");
      return;
    }
    
    if (endereco && endereco.rua && endereco.numero && endereco.bairro) {
      // Usuário tem endereço, preencher os campos
      this.noAddressElement.classList.add('hidden');
      this.addressFormElement.classList.remove('hidden');
      
      const cepDisplay = document.getElementById('cep-display');
      const ruaDisplay = document.getElementById('rua-display');
      const numeroDisplay = document.getElementById('numero-display');
      const bairroDisplay = document.getElementById('bairro-display');
      const complementoDisplay = document.getElementById('complemento-display');
      
      const cepInput = document.getElementById('cep');
      const ruaInput = document.getElementById('rua');
      const numeroInput = document.getElementById('numero');
      const bairroInput = document.getElementById('bairro');
      const complementoInput = document.getElementById('complemento');
      
      if (cepDisplay) cepDisplay.textContent = escapeHTML(endereco.cep || '');
      if (ruaDisplay) ruaDisplay.textContent = escapeHTML(endereco.rua || '');
      if (numeroDisplay) numeroDisplay.textContent = escapeHTML(endereco.numero || '');
      if (bairroDisplay) bairroDisplay.textContent = escapeHTML(endereco.bairro || '');
      if (complementoDisplay) complementoDisplay.textContent = escapeHTML(endereco.complemento || '');
      
      if (cepInput) cepInput.value = endereco.cep || '';
      if (ruaInput) ruaInput.value = endereco.rua || '';
      if (numeroInput) numeroInput.value = endereco.numero || '';
      if (bairroInput) bairroInput.value = endereco.bairro || '';
      if (complementoInput) complementoInput.value = endereco.complemento || '';
    } else {
      // Usuário não tem endereço cadastrado
      this.noAddressElement.classList.remove('hidden');
      this.addressFormElement.classList.add('hidden');
    }
  }
  
  /**
   * Configura os botões de edição
   */
  setupEditButtons() {
    // Configurar botões de edição para dados pessoais
    const personalEditButtons = document.querySelectorAll('#personal-form [id^="edit-"]');
    const cancelPersonalButton = document.getElementById('cancel-personal-button');
    const savePersonalButton = document.getElementById('save-personal-button');
    
    personalEditButtons.forEach(button => {
      button.addEventListener('click', () => {
        const field = button.id.replace('edit-', '');
        const displayElement = document.getElementById(`${field}-display`);
        const editElement = document.getElementById(`${field}-edit`);
        
        if (displayElement) displayElement.classList.add('hidden');
        if (editElement) editElement.classList.remove('hidden');
        
        if (cancelPersonalButton) cancelPersonalButton.classList.remove('hidden');
        if (savePersonalButton) savePersonalButton.classList.remove('hidden');
      });
    });
    
    if (cancelPersonalButton) {
      cancelPersonalButton.addEventListener('click', () => {
        this.resetFormToDisplayMode('personal');
      });
    }
    
    // Configurar botões de edição para endereço
    const addressEditButtons = document.querySelectorAll('#address-form [id^="edit-"]');
    const cancelAddressButton = document.getElementById('cancel-address-button');
    const saveAddressButton = document.getElementById('save-address-button');
    
    addressEditButtons.forEach(button => {
      button.addEventListener('click', () => {
        const field = button.id.replace('edit-', '');
        const displayElement = document.getElementById(`${field}-display`);
        const editElement = document.getElementById(`${field}-edit`);
        
        if (displayElement) displayElement.classList.add('hidden');
        if (editElement) editElement.classList.remove('hidden');
        
        if (cancelAddressButton) cancelAddressButton.classList.remove('hidden');
        if (saveAddressButton) saveAddressButton.classList.remove('hidden');
      });
    });
    
    if (cancelAddressButton) {
      cancelAddressButton.addEventListener('click', () => {
        this.resetFormToDisplayMode('address');
      });
    }
    
    // Adicionar máscara para o CEP
    const cepInput = document.getElementById('cep');
    if (cepInput) {
      cepInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
          value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        e.target.value = value;
      });
    }
  }
  
  /**
   * Configura os formulários
   * @param {Object} userDocRef - Referência do documento do usuário no Firestore
   */
  setupForms(userDocRef) {
    // Configurar formulário de dados pessoais
    const personalForm = document.getElementById('personal-form');
    
    if (personalForm) {
      personalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const userData = {
          nome: document.getElementById('nome')?.value || '',
          email: document.getElementById('email')?.value || '',
          telefone: document.getElementById('telefone')?.value || ''
        };
        
        // Atualizar dados no Firestore
        userDocRef.update(userData)
          .then(() => {
            // Atualizar os campos de exibição
            const nomeDisplay = document.getElementById('nome-display');
            const emailDisplay = document.getElementById('email-display');
            const telefoneDisplay = document.getElementById('telefone-display');
            
            if (nomeDisplay) nomeDisplay.textContent = userData.nome;
            if (emailDisplay) emailDisplay.textContent = userData.email;
            if (telefoneDisplay) telefoneDisplay.textContent = userData.telefone;
            
            // Voltar para o modo de exibição
            this.resetFormToDisplayMode('personal');
            
            // Mostrar mensagem de sucesso
            this.showToast('Dados pessoais atualizados com sucesso!', 'success');
          })
          .catch(error => {
            console.error("Erro ao atualizar dados pessoais:", error);
            this.showToast('Erro ao atualizar dados. Por favor, tente novamente.', 'error');
          });
      });
    }
    
    // Configurar formulário de endereço
    const addressForm = document.getElementById('address-form');
    
    if (addressForm) {
      addressForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const endereco = {
          cep: document.getElementById('cep')?.value || '',
          rua: document.getElementById('rua')?.value || '',
          numero: document.getElementById('numero')?.value || '',
          bairro: document.getElementById('bairro')?.value || '',
          complemento: document.getElementById('complemento')?.value || ''
        };
        
        // Atualizar endereço no Firestore
        userDocRef.update({ endereco })
          .then(() => {
            // Atualizar os campos de exibição
            const cepDisplay = document.getElementById('cep-display');
            const ruaDisplay = document.getElementById('rua-display');
            const numeroDisplay = document.getElementById('numero-display');
            const bairroDisplay = document.getElementById('bairro-display');
            const complementoDisplay = document.getElementById('complemento-display');
            
            if (cepDisplay) cepDisplay.textContent = endereco.cep;
            if (ruaDisplay) ruaDisplay.textContent = endereco.rua;
            if (numeroDisplay) numeroDisplay.textContent = endereco.numero;
            if (bairroDisplay) bairroDisplay.textContent = endereco.bairro;
            if (complementoDisplay) complementoDisplay.textContent = endereco.complemento;
            
            // Voltar para o modo de exibição
            this.resetFormToDisplayMode('address');
            
            // Mostrar mensagem de sucesso
            this.showToast('Endereço atualizado com sucesso!', 'success');
          })
          .catch(error => {
            console.error("Erro ao atualizar endereço:", error);
            this.showToast('Erro ao atualizar endereço. Por favor, tente novamente.', 'error');
          });
      });
    }
  }
  
  /**
   * Reseta o formulário para o modo de exibição
   * @param {string} formType - Tipo de formulário ('personal' ou 'address')
   */
  resetFormToDisplayMode(formType) {
    if (formType === 'personal') {
      const displayElements = document.querySelectorAll('#personal-form [id$="-display"]');
      const editElements = document.querySelectorAll('#personal-form [id$="-edit"]');
      const cancelButton = document.getElementById('cancel-personal-button');
      const saveButton = document.getElementById('save-personal-button');
      
      displayElements.forEach(el => el.classList.remove('hidden'));
      editElements.forEach(el => el.classList.add('hidden'));
      
      if (cancelButton) cancelButton.classList.add('hidden');
      if (saveButton) saveButton.classList.add('hidden');
    } else if (formType === 'address') {
      const displayElements = document.querySelectorAll('#address-form [id$="-display"]');
      const editElements = document.querySelectorAll('#address-form [id$="-edit"]');
      const cancelButton = document.getElementById('cancel-address-button');
      const saveButton = document.getElementById('save-address-button');
      
      displayElements.forEach(el => el.classList.remove('hidden'));
      editElements.forEach(el => el.classList.add('hidden'));
      
      if (cancelButton) cancelButton.classList.add('hidden');
      if (saveButton) saveButton.classList.add('hidden');
    }
  }
  
  /**
   * Atualiza o contador do carrinho
   */
  updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const total = cart.reduce((sum, item) => sum + (item.quantidade || 1), 0);
      cartCount.textContent = total;
    }
  }
  
  /**
   * Mostra uma notificação toast
   * @param {string} message - Mensagem a ser exibida
   * @param {string} type - Tipo de notificação ('success' ou 'error')
   */
  showToast(message, type) {
    // Criar elemento toast
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'success' : 'error'}`;
    toast.textContent = message;
    
    // Adicionar ao DOM
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}

/**
 * Inicializa o gerenciador de conta quando o DOM estiver pronto
 */
export function initAccountManager() {
  console.log("Função initAccountManager chamada");
  
  // Garantir que o DOM esteja completamente carregado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log("DOM carregado, inicializando AccountManager");
      const accountManager = new AccountManager();
      accountManager.init();
    });
  } else {
    console.log("DOM já carregado, inicializando AccountManager imediatamente");
    const accountManager = new AccountManager();
    accountManager.init();
  }
}
