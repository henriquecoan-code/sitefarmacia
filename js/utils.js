// js/utils.js
// Funções utilitárias reutilizáveis

/**
 * Escapa caracteres HTML para evitar XSS
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
//modal cadastro
export function setupCadastroModalBtn() {
  const cadastroBtn = document.getElementById('openCadastroModalBtn');
  if (cadastroBtn) {
    cadastroBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (typeof window.openCadastroModal === 'function') {
        window.openCadastroModal();
      }
    });
  }
}

/**
 * Valida CPF
 */
export function isValidCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;
  let sum = 0, rest;
  for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i-1, i)) * (11 - i);
  rest = (sum * 10) % 11;
  if ((rest === 10) || (rest === 11)) rest = 0;
  if (rest !== parseInt(cpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i-1, i)) * (12 - i);
  rest = (sum * 10) % 11;
  if ((rest === 10) || (rest === 11)) rest = 0;
  return rest === parseInt(cpf.substring(10, 11));
}

/**
 * Valida CNPJ
 */
export function isValidCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g, '');
  if (cnpj.length !== 14) return false;
  if (/^([0-9])\1+$/.test(cnpj)) return false;
  let t = cnpj.length-2, d = cnpj.substring(t), d1 = parseInt(d.charAt(0)), d2 = parseInt(d.charAt(1)), calc = x => {
    let n = 0, y = 0;
    for (let i = t; i > 0; i--) {
      n += cnpj.charAt(t-i) * ((x+i)%8+2);
    }
    return n%11<2?0:11-n%11;
  };
  return calc(0) === d1 && calc(1) === d2;
}

/**
 * Consulta endereço pelo CEP (ViaCEP)
 */
export async function fetchEnderecoPorCEP(cep) {
  cep = cep.replace(/\D/g, '');
  if (cep.length !== 8) return null;
  try {
    const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await resp.json();
    if (data.erro) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Foca no primeiro campo do modal
 */
export function focusFirstCadastroField() {
  const nome = document.getElementById('fullNameModal');
  if (nome) nome.focus();
}

window.isValidCPF = isValidCPF;
window.isValidCNPJ = isValidCNPJ;

// Carrega dinamicamente o modal de cadastro em todas as páginas
(function() {
  fetch('partials/cadastro-modal.html')
    .then(function(response) { return response.text(); })
    .then(function(html) {
      var temp = document.createElement('div');
      temp.innerHTML = html;
      // Insere o modal no final do body
      document.body.appendChild(temp.firstElementChild);
    });
})();
