import { handleAuthState } from './auth-handler.js';
import { firestore, auth } from './firebase-config.js';
import { doc, setDoc, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';
import './auth-modal.js';

export function loadHeader(headerContainerId, authContainerId) {
  return fetch('partials/header.html')
    .then((response) => response.text())
    .then((html) => {
      const headerContainer = document.getElementById(headerContainerId);
      if (!headerContainer) {
        console.error(`Elemento com ID "${headerContainerId}" não encontrado.`);
        return;
      }
      headerContainer.innerHTML = html;

      // Dispara evento customizado para sinalizar que o header foi carregado
      document.dispatchEvent(new Event('headerLoaded'));

      // Carrega o script auth-mobile.js dinamicamente após inserir o header
      const script = document.createElement('script');
      script.src = './js/auth-mobile.js';
      script.onload = () => {
        // Reinicializa Alpine.js para processar x-data/x-effect do header dinâmico
        if (window.Alpine && window.Alpine.initTree) {
          window.Alpine.initTree(document.body);
        }
        // Atualiza o estado de autenticação no header SOMENTE se o ID for definido e o elemento existir
        if (authContainerId && document.getElementById(authContainerId)) {
          handleAuthState(authContainerId);
        }
        // Garante que o menu mobile funcione após o carregamento dinâmico
        if (window.setupMobileMenu) window.setupMobileMenu();
        // Aguarda o carregamento do footer e do script auth-mobile.js
        function waitForAuthMobile(retries = 20) { // aumenta tentativas
          if (window.auth && window.renderMobileAuth && window.renderAuthMobileMenu) {
            window.auth.onAuthStateChanged(function(user) {
              window.renderMobileAuth(user);
            });
            window.renderAuthMobileMenu(window.auth.currentUser);
          } else if (retries > 0) {
            setTimeout(() => waitForAuthMobile(retries - 1), 200); // aumenta tempo
          } else {
            // Só mostra o aviso se o usuário estiver em tela mobile
            if (window.innerWidth < 768) {
              console.warn('Funções de autenticação mobile não disponíveis após aguardar o footer.');
            }
          }
        }
        waitForAuthMobile();
      };
      document.body.appendChild(script);
      // ...não executa mais o restante aqui, pois está dentro do onload do script
      return;
    })
    .catch((error) => console.error('Erro ao carregar o header:', error));
}

// Função para obter o ID do usuário logado (ou null)
function getUserId() {
  if (window.auth && window.auth.currentUser) {
    return window.auth.currentUser.uid;
  }
  return null;
}
window.getUserId = getUserId;

// Função para salvar o carrinho no Firestore
async function saveCartToFirestore(cart) {
  const userId = getUserId();
  if (!userId) return;
  const cartRef = doc(firestore, 'carrinhos', userId);
  await setDoc(cartRef, { itens: cart }, { merge: true });
}

// Função para ler o carrinho do Firestore
async function getCartFromFirestore() {
  const userId = getUserId();
  if (!userId) return null;
  const cartRef = doc(firestore, 'carrinhos', userId);
  const snap = await getDoc(cartRef);
  if (snap.exists()) return snap.data().itens || [];
  return [];
}

// Atualiza o contador do carrinho em tempo real para desktop e mobile
function listenCartCount(uidOrCallback, callback, returnArray) {
  // Se chamado como listenCartCount(callback), listenCartCount(uid, callback, returnArray) ou listenCartCount()
  let uid = null;
  let cb = null;
  let retArr = false;
  if (typeof uidOrCallback === 'function') {
    cb = uidOrCallback;
  } else if (typeof uidOrCallback === 'string') {
    uid = uidOrCallback;
    cb = callback;
    retArr = !!returnArray;
  }
  // Se não passar callback, só atualiza o contador do header normalmente
  if (!cb) {
    const userId = window.getUserId ? window.getUserId() : (window.auth && window.auth.currentUser ? window.auth.currentUser.uid : null);
    const cartCount = document.getElementById('cart-count');
    const cartCountMobile = document.getElementById('cart-count-mobile');
    if (!cartCount && !cartCountMobile) return;
    // Função para atualizar o contador na tela
    function setCount(total) {
      if (cartCount) cartCount.textContent = total;
      if (cartCountMobile) cartCountMobile.textContent = total;
    }
    // Se usuário logado, escuta Firestore
    if (userId && window.firestore) {
      const { doc, onSnapshot } = window;
      const cartRef = doc(window.firestore, 'carrinhos', userId);
      onSnapshot(cartRef, (snap) => {
        const itens = snap.exists() ? (snap.data().itens || []) : [];
        const total = itens.reduce((sum, item) => sum + (item.quantidade || 1), 0);
        setCount(total);
      });
      return;
    }
    // Se não logado, tenta localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = cart.reduce((sum, item) => sum + (item.quantidade || 1), 0);
    setCount(total);
    return;
  }
  // Se passar callback, escuta o documento do carrinho e retorna os itens
  if (uid && window.firestore) {
    const { doc, onSnapshot } = window;
    const cartRef = doc(window.firestore, 'carrinhos', uid);
    return onSnapshot(cartRef, (snap) => {
      const itens = snap.exists() ? (snap.data().itens || []) : [];
      if (retArr) {
        cb(itens);
      } else {
        const total = itens.reduce((sum, item) => sum + (item.quantidade || 1), 0);
        cb(total);
      }
    });
  } else {
    // Não logado: localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (retArr) {
      cb(cart);
    } else {
      const total = cart.reduce((sum, item) => sum + (item.quantidade || 1), 0);
      cb(total);
    }
    return () => {};
  }
}
window.listenCartCount = listenCartCount;

// Função utilitária para garantir que só campos serializáveis e definidos vão para o Firestore
function sanitizeProduct(prod) {
  const allowed = [
    'id', 'nome', 'fotos', 'descricao', 'valorComDesconto', 'precoMaximo', 'preco', 'quantidade',
    'desconto', 'codRed', 'ean', 'laboratorio', 'categoria', 'subcategoria', 'dcb'
  ];
  const clean = {};
  for (const key of allowed) {
    if (prod[key] !== undefined) clean[key] = prod[key];
  }
  return clean;
}

// Adiciona ao carrinho: sempre salva no Firestore se logado, senão localStorage
async function addToCart(product, quantidade = 1) {
  let cart = [];
  const userId = getUserId();
  if (userId) {
    cart = await getCartFromFirestore();
    if (!Array.isArray(cart)) cart = [];
    const index = cart.findIndex(item => item.id === product.id);
    if (index > -1) {
      cart[index].quantidade += quantidade;
    } else {
      cart.push({ ...sanitizeProduct(product), quantidade });
    }
    // Sanitiza todos os itens antes de salvar
    const cartSanitized = cart.map(sanitizeProduct);
    await saveCartToFirestore(cartSanitized);
  } else {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    const index = cart.findIndex(item => item.id === product.id);
    if (index > -1) {
      cart[index].quantidade += quantidade;
    } else {
      cart.push({ ...sanitizeProduct(product), quantidade });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  listenCartCount();
}
window.addToCart = addToCart;

// Garante atualização ao carregar header e ao mudar de página
window.listenCartCount = listenCartCount;
document.addEventListener('headerLoaded', () => listenCartCount());
window.addEventListener('DOMContentLoaded', () => listenCartCount());
window.addEventListener('pageshow', () => listenCartCount());
document.addEventListener('DOMContentLoaded', () => listenCartCount());
window.listenCartCount = listenCartCount;
window.saveCartToFirestore = saveCartToFirestore;
window.getCartFromFirestore = getCartFromFirestore;