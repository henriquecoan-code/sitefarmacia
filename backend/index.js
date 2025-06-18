const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
const cors = require('cors');
const helmet = require("helmet"); // Adiciona helmet para segurança
const csv = require('csv-parser'); // Adiciona parser de CSV
const nodemailer = require("nodemailer");
require('dotenv').config();
const axios = require('axios');

// CAMINHO PARA A CHAVE DE SERVIÇO DO FIREBASE
// O usuário informou que o arquivo se chama 'firebase-config'
// Assumindo que está na raiz do projeto backend e é .json
const serviceAccountPath = path.join(__dirname, "firebase-config.json");

if (!fs.existsSync(serviceAccountPath)) {
    console.error("ERRO CRÍTICO: Arquivo de chave de serviço do Firebase não encontrado em", serviceAccountPath);
    console.error("Por favor, coloque o arquivo JSON da chave de serviço em /home/ubuntu/farmacia-backend/firebase-config.json");
    process.exit(1); // Encerra a aplicação se a chave não for encontrada
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet()); // Aplica helmet para proteção de cabeçalhos HTTP

// Configuração de validação de arquivos para uploads seguros
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"]; // Ajuste conforme necessário
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Gera nome seguro e único
        const ext = path.extname(file.originalname).toLowerCase();
        const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, "_");
        cb(null, Date.now() + "-" + base + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE, files: 5 },
    fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error("Tipo de arquivo não permitido. Apenas imagens JPEG, PNG ou WEBP."));
        }
        cb(null, true);
    }
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Corrige CORS para uploads e imagens
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition']
}));

// Corrige headers de imagens para evitar bloqueio CORP
app.use("/uploads", (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization');
    next();
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rota para adicionar um novo produto
app.post("/produtos", upload.array("fotos", 5), async (req, res) => {
    const { nome, descricao, precoMaximo, desconto, quantidade, tags } = req.body;

    if (!nome || !descricao || precoMaximo === undefined || desconto === undefined || quantidade === undefined) {
        return res.status(400).json({ error: "Campos obrigatórios ausentes: nome, descricao, precoMaximo, desconto, quantidade." });
    }

    const precoMax = parseFloat(precoMaximo);
    const desc = parseFloat(desconto);
    const qtd = parseInt(quantidade, 10);

    if (isNaN(precoMax) || precoMax <= 0) {
        return res.status(400).json({ error: "precoMaximo deve ser um número positivo." });
    }
    if (isNaN(desc) || desc < 0 || desc > 1) {
        return res.status(400).json({ error: "desconto deve ser um número entre 0 e 1 (ex: 0.1 para 10%)." });
    }
    if (isNaN(qtd) || qtd < 0) {
        return res.status(400).json({ error: "quantidade deve ser um número inteiro não negativo." });
    }

    const valorComDesconto = precoMax * (1 - desc);
    let fotosPaths = [];
    if (req.files && req.files.length > 0) {
        fotosPaths = req.files.map(file => `/uploads/${file.filename}`);
    }

    const novoProduto = {
        nome,
        descricao,
        precoMaximo: precoMax,
        desconto: desc,
        valorComDesconto: parseFloat(valorComDesconto.toFixed(2)),
        quantidade: qtd,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
        fotos: fotosPaths,
        criadoEm: admin.firestore.FieldValue.serverTimestamp() // Adiciona timestamp de criação
    };

    try {
        const docRef = await db.collection("produtos").add(novoProduto);
        console.log("Produto adicionado com ID:", docRef.id);
        res.status(201).json({ id: docRef.id, ...novoProduto });
    } catch (error) {
        console.error("Erro ao adicionar produto no Firebase:", error);
        res.status(500).json({ error: "Erro interno ao salvar o produto." });
    }
});

// Rota para listar todos os produtos
app.get("/produtos", async (req, res) => {
    try {
        const produtosSnapshot = await db.collection("produtos").orderBy("criadoEm", "desc").get();
        const produtosList = [];
        produtosSnapshot.forEach(doc => {
            const data = doc.data();
            // Garante que o campo fotos sempre seja um array com pelo menos a imagem padrão
            if (!Array.isArray(data.fotos) || data.fotos.length === 0) {
                data.fotos = ["/uploads/medicamento.png"];
            }
            produtosList.push({ id: doc.id, ...data });
        });
        res.status(200).json(produtosList);
    } catch (error) {
        console.error("Erro ao listar produtos do Firebase:", error);
        res.status(500).json({ error: "Erro interno ao buscar os produtos." });
    }
});

// Rota para definir papel (role) de admin para um usuário (exemplo seguro, só use internamente!)
app.post("/definir-admin", async (req, res) => {
    const { uid } = req.body;
    if (!uid) {
        return res.status(400).json({ error: "MYJ60yQ2QCak9ybcxr1uVAZ1hgU2" });
    }
    try {
        await admin.auth().setCustomUserClaims(uid, { role: "admin" });
        res.json({ success: true, message: `Usuário ${uid} agora é admin.` });
    } catch (error) {
        console.error("Erro ao definir papel de admin:", error);
        res.status(500).json({ error: "Erro ao definir papel de admin." });
    }
});

// Rota para upload de CSV de produtos
const uploadCsv = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'text/csv' && path.extname(file.originalname).toLowerCase() !== '.csv') {
            return cb(new Error('Apenas arquivos CSV são permitidos.'));
        }
        cb(null, true);
    }
});

app.post('/produtos/upload-csv', uploadCsv.single('csv'), async (req, res) => {
    if (!req.file) {
        console.error('Nenhum arquivo CSV enviado.');
        return res.status(400).json({ error: 'Arquivo CSV não enviado.' });
    }
    const filePath = req.file.path;
    const produtosCSV = [];
    const nomesCSV = new Set();
    console.log('Iniciando leitura do CSV:', filePath);
    fs.createReadStream(filePath)
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
            const nome = row.nome && row.nome.trim();
            let precoMaximo = row.precoMaximo ? parseFloat(row.precoMaximo.toString().replace(',', '.')) : 0;
            if (precoMaximo > 1000) precoMaximo = precoMaximo / 100;
            let desconto = row.desconto ? parseFloat(row.desconto.toString().replace(',', '.')) : 0;
            if (desconto > 1) desconto = desconto / 100;
            let valorComDesconto = precoMaximo > 0 ? precoMaximo * (1 - desconto) : 0;
            if (row.valorComDesconto) {
                valorComDesconto = parseFloat(row.valorComDesconto.toString().replace(',', '.'));
                if (valorComDesconto > 1000) valorComDesconto = valorComDesconto / 100;
            }
            const quantidade = row.quantidade ? parseInt(row.quantidade, 10) : 0;
            let fotos = [];
            if (row.fotos) {
                fotos = row.fotos.split(/[,;]/).map(f => f.trim()).filter(Boolean);
                fotos = fotos.map(f => (f && !f.startsWith('/') && !f.startsWith('http')) ? `/uploads/${f}` : f);
            }
            // Novos campos do modelo
            const ean = row.ean ? row.ean.trim() : '';
            const codRed = row['cod-red'] ? row['cod-red'].trim() : '';
            const tags = row.tags ? row.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
            if (nome && precoMaximo > 0) {
                produtosCSV.push({
                    nome,
                    categoria: row.categoria || '',
                    ean,
                    codRed,
                    precoMaximo,
                    desconto,
                    valorComDesconto: parseFloat(valorComDesconto.toFixed(2)),
                    quantidade,
                    tags,
                    descricao: row.descricao || '',
                    fotos,
                    criadoEm: admin.firestore.FieldValue.serverTimestamp()
                });
                nomesCSV.add(nome);
            }
        })
        .on('end', async () => {
            try {
                console.log('Produtos lidos do CSV:', produtosCSV.length);
                // Busca todos os produtos atuais
                const snapshot = await db.collection('produtos').get();
                const produtosBanco = [];
                const produtosBancoPorNome = {};
                snapshot.forEach(doc => {
                    const data = doc.data();
                    produtosBanco.push({ id: doc.id, ...data });
                    if (data.nome) {
                        produtosBancoPorNome[data.nome] = { id: doc.id, ...data };
                    }
                });
                let inseridos = 0;
                let atualizados = 0;
                for (const prod of produtosCSV) {
                    if (prod.nome in produtosBancoPorNome) {
                        await db.collection('produtos').doc(produtosBancoPorNome[prod.nome].id).update({
                            ...prod,
                            criadoEm: produtosBancoPorNome[prod.nome].criadoEm || admin.firestore.FieldValue.serverTimestamp()
                        });
                        atualizados++;
                    } else {
                        await db.collection('produtos').add(prod);
                        inseridos++;
                    }
                }
                console.log('Produtos inseridos:', inseridos, 'Produtos atualizados:', atualizados);
                const produtosOrfaos = produtosBanco.filter(p => !nomesCSV.has(p.nome));
                fs.unlinkSync(filePath);
                res.json({ success: true, count: produtosCSV.length, inseridos, atualizados, produtosOrfaos });
            } catch (e) {
                console.error('Erro ao importar produtos:', e);
                res.status(500).json({ error: 'Erro ao importar produtos.' });
            }
        })
        .on('error', (err) => {
            console.error('Erro ao processar CSV:', err);
            res.status(500).json({ error: 'Erro ao processar CSV.' });
        });
});

// Rota de contato: recebe POST do formulário e envia e-mail para a farmácia
app.post("/contato", async (req, res) => {
    const { nome, email, mensagem, recaptchaToken } = req.body;
    if (!nome || !email || !mensagem || !recaptchaToken) {
        return res.status(400).json({ error: "Preencha todos os campos obrigatórios e confirme o reCAPTCHA." });
    }
    // Validação do reCAPTCHA v2/v3
    try {
        const recaptchaSecret = process.env.RECAPTCHA_SECRET;
        const recaptchaResp = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: recaptchaSecret,
                response: recaptchaToken
            }
        });
        if (!recaptchaResp.data.success || (recaptchaResp.data.score !== undefined && recaptchaResp.data.score < 0.5)) {
            return res.status(400).json({ error: "Falha na verificação do reCAPTCHA. Tente novamente." });
        }
    } catch (err) {
        return res.status(400).json({ error: "Erro ao validar reCAPTCHA." });
    }
    // Configuração do transporte (exemplo com Gmail, use variáveis de ambiente em produção)
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const mailOptions = {
        from: `Contato Site <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: "Nova mensagem de contato do site",
        text: `Nome: ${nome}\nE-mail: ${email}\nMensagem: ${mensagem}`,
        html: `<b>Nome:</b> ${nome}<br><b>E-mail:</b> ${email}<br><b>Mensagem:</b><br>${mensagem.replace(/\n/g, '<br>')}`
    };
    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true });
    } catch (error) {
        console.error("Erro ao enviar e-mail de contato:", error);
        res.status(500).json({ error: "Erro ao enviar mensagem. Tente novamente mais tarde." });
    }
});

app.post('/produtos/confirmar-acoes', async (req, res) => {
    const { acoes } = req.body;
    if (!Array.isArray(acoes)) {
        return res.status(400).json({ error: 'Ações inválidas.' });
    }
    try {
        const batch = db.batch();
        for (const item of acoes) {
            const { id, acao } = item;
            const ref = db.collection('produtos').doc(id);
            if (acao === 'remover') {
                batch.delete(ref);
            } else if (acao === 'inativar') {
                batch.update(ref, { ativo: false });
            }
            // Se for "manter", não faz nada
        }
        await batch.commit();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao aplicar ações.' });
    }
});

// Middleware global para erros não tratados
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Servidor backend da farmácia rodando em http://0.0.0.0:${port}`);
    console.log("Verifique se o arquivo 'firebase-config.json' está presente e correto no diretório do backend.");
});

