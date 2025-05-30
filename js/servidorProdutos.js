const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Rota para salvar o carrinho como .txt
app.post('/enviar-carrinho', (req, res) => {
  const {
    cliente,
    telefone,
    endereco = {},
    observacoes,
    pagamento,
    produtos = [],
    total
  } = req.body;

  const numeroPedido = uuidv4().slice(0, 8).toUpperCase();
  const data = new Date().toLocaleString('pt-BR');

  const conteudo = `
Nº Pedido: ${numeroPedido}
Data: ${data}
Nome: ${cliente}
Telefone: ${telefone}
Endereço:
  Rua: ${endereco.rua || ''}
  Nº: ${endereco.numero || ''}
  Bairro: ${endereco.bairro || ''}
  Cidade: ${endereco.cidade || ''}
Observações:
${observacoes || 'Nenhuma'}

Qnt | Produto | Vlr un | Vlr total
${produtos.map(p => `${p.quantidade} | ${p.nome} | R$ ${p.valor} | R$ ${p.subtotal}`).join('\n')}

Total: R$ ${total}
Forma de pagamento: ${pagamento}
`.trim();

  const nomeArquivo = `pedido-${numeroPedido}.txt`;
  const caminho = path.join(__dirname, 'pedidos', nomeArquivo);

  fs.mkdirSync(path.dirname(caminho), { recursive: true });
  fs.writeFileSync(caminho, conteudo);

  res.status(201).json({ sucesso: true, numeroPedido, nomeArquivo });
});

app.listen(3000, () => {
  console.log('🟢 Servidor rodando na porta 3000');
});
