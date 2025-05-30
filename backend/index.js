const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
const cors = require('cors');
const helmet = require("helmet"); // Adiciona helmet para segurança
const csv = require('csv-parser'); // Adiciona parser de CSV

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
        return res.status(400).json({ error: 'Arquivo CSV não enviado.' });
    }
    const filePath = req.file.path;
    const produtos = [];
    fs.createReadStream(filePath)
        .pipe(csv({ separator: ';' })) // Corrige para CSV com ponto e vírgula
        .on('data', (row) => {
            // Conversão e validação robusta
            const nome = row.nome && row.nome.trim();
            // Aceita centavos ou reais
            let precoMaximo = row.precoMaximo ? parseFloat(row.precoMaximo.toString().replace(',', '.')) : 0;
            if (precoMaximo > 1000) precoMaximo = precoMaximo / 100;
            let valorComDesconto = row.valorComDesconto ? parseFloat(row.valorComDesconto.toString().replace(',', '.')) : 0;
            if (valorComDesconto > 1000) valorComDesconto = valorComDesconto / 100;
            // Desconto pode vir como inteiro (12) ou decimal (0.12)
            let desconto = row.desconto ? parseFloat(row.desconto.toString().replace(',', '.')) : 0;
            if (desconto > 1) desconto = desconto / 100;
            // Se valorComDesconto não vier, calcula
            if (!valorComDesconto && precoMaximo > 0) {
                valorComDesconto = precoMaximo * (1 - desconto);
            }
            const estoque = parseInt(row.estoque || row.quantidade || '0', 10);
            // Fotos: aceita múltiplos separados por vírgula ou ponto e vírgula
            let fotos = [];
            if (row.fotos) {
                fotos = row.fotos.split(/[,;]/).map(f => f.trim()).filter(Boolean);
                // Corrige caminho para /uploads se não for URL
                fotos = fotos.map(f => (f && !f.startsWith('/') && !f.startsWith('http')) ? `/uploads/${f}` : f);
            }
            // Só importa se nome e preço forem válidos
            if (nome && precoMaximo > 0) {
                produtos.push({
                    nome,
                    descricao: row.descricao || '',
                    precoMaximo,
                    valorComDesconto: parseFloat(valorComDesconto.toFixed(2)),
                    desconto,
                    quantidade: estoque,
                    categoria: row.categoria || '',
                    subcategoria: row.subcategoria || '',
                    fotos,
                    criadoEm: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        })
        .on('end', async () => {
            try {
                // Limpa coleção antes de importar (opcional: pode ser só adicionar/atualizar)
                const snapshot = await db.collection('produtos').get();
                const batch = db.batch();
                snapshot.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
                // Adiciona novos produtos
                for (const prod of produtos) {
                    await db.collection('produtos').add(prod);
                }
                fs.unlinkSync(filePath); // Remove arquivo após uso
                res.json({ success: true, count: produtos.length });
            } catch (e) {
                res.status(500).json({ error: 'Erro ao importar produtos.' });
            }
        })
        .on('error', (err) => {
            res.status(500).json({ error: 'Erro ao processar CSV.' });
        });
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Servidor backend da farmácia rodando em http://0.0.0.0:${port}`);
    console.log("Verifique se o arquivo 'firebase-config.json' está presente e correto no diretório do backend.");
});

