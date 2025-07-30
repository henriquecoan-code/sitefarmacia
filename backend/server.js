
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
app.use(cors());
app.use(express.json());

// Substitua pelo seu token de testes da NFE.io
const NFEIO_TOKEN = 'q4nmqLV4gnrxRfxeRbicItVMG0uX5fVH15NiVVEVS5fhboIuOgUq6463hd03mymHpGs';

app.post('/emitir-nfe', (req, res) => {
  const nfeData = req.body;
  // Resposta simulada para teste
  res.json({
    status: 'sucesso',
    mensagem: 'NF-e emitida em modo de homologação',
    dadosRecebidos: nfeData
  });
});

app.listen(3000, () => {
  console.log('Servidor de emissão de NF-e rodando na porta 3000');
});