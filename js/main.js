import { auth } from './firebase-config.js';
import { escapeHTML } from './utils.js';

// Gerenciamento do Carrinho
class Carrinho {
  constructor() {
    this.itens = JSON.parse(localStorage.getItem('cart')) || [];
  }

  adicionarItem(produto) {
    this.itens.push(produto);
    this.salvar();
  }

  removerItem(id) {
    this.itens = this.itens.filter(item => item.id !== id);
    this.salvar();
  }

  salvar() {
    localStorage.setItem('cart', JSON.stringify(this.itens));
    this.atualizarContador();
  }

  atualizarContador() {
    const contador = document.getElementById('contador-carrinho');
    if (contador) contador.textContent = this.itens.length;
  }
}

const carrinho = new Carrinho();

// Exemplo de uso ao clicar em "Adicionar ao Carrinho":
document.querySelectorAll('.botao-adicionar').forEach(botao => {
  botao.addEventListener('click', () => {
    const produto = {
      id: botao.dataset.id,
      nome: botao.dataset.nome,
      preco: parseFloat(botao.dataset.preco)
    };
    carrinho.adicionarItem(produto);
    alert(`${produto.nome} adicionado ao carrinho!`);
  });
});