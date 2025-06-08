import { handleAuthState } from './auth-handler.js';
import { firestore, auth } from './firebase-config.js';
import { doc, setDoc, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';

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

      // Carrega o script auth-mobile.js dinamicamente após inserir o header
      const script = document.createElement('script');
      script.src = './js/auth-mobile.js';
      script.onload = () => {
        // Reinicializa Alpine.js para processar x-data/x-effect do header dinâmico
        if (window.Alpine && window.Alpine.initTree) {
          window.Alpine.initTree(document.body);
        }
        // Atualiza o estado de autenticação no header
        handleAuthState(authContainerId);
        // Garante que o menu mobile funcione após o carregamento dinâmico
        if (window.setupMobileMenu) window.setupMobileMenu();
        // Aguarda o carregamento do footer e do script auth-mobile.js
        function waitForAuthMobile(retries = 10) {
          if (window.auth && window.renderMobileAuth && window.renderAuthMobileMenu) {
            window.auth.onAuthStateChanged(function(user) {
              window.renderMobileAuth(user);
              window.renderAuthMobileMenu(user);
            });
            // Chama manualmente para garantir renderização inicial
            window.renderAuthMobileMenu(window.auth.currentUser);
          } else if (retries > 0) {
            setTimeout(() => waitForAuthMobile(retries - 1), 150);
          } else {
            console.warn('Funções de autenticação mobile não disponíveis após aguardar o footer.');
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
  return auth.currentUser ? auth.currentUser.uid : null;
}

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

// Atualiza o contador do carrinho em tempo real
function listenCartCount() {
  const userId = getUserId();
  const cartCount = document.getElementById('cart-count');
  if (!cartCount) return;
  if (!userId) {
    // Fallback: localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = cart.reduce((sum, item) => sum + (item.quantidade || 1), 0);
    cartCount.textContent = total;
    return;
  }
  const cartRef = doc(firestore, 'carrinhos', userId);
  onSnapshot(cartRef, (snap) => {
    const itens = snap.exists() ? (snap.data().itens || []) : [];
    const total = itens.reduce((sum, item) => sum + (item.quantidade || 1), 0);
    cartCount.textContent = total;
  });
}

// Exponibiliza para uso global após carregar o header
document.addEventListener('headerLoaded', () => {
  listenCartCount();
});
window.listenCartCount = listenCartCount;
window.saveCartToFirestore = saveCartToFirestore;
window.getCartFromFirestore = getCartFromFirestore;