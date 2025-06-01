import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';
    import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDlTtNFfZIVIPJCIuJvnLB89idtAdKaFr8",
    authDomain: "farmaciasaobenedito-bcb2c.firebaseapp.com",
    databaseURL: "https://farmaciasaobenedito-bcb2c-default-rtdb.firebaseio.com",
    projectId: "farmaciasaobenedito-bcb2c",
    storageBucket: "farmaciasaobenedito-bcb2c.appspot.com",
    messagingSenderId: "789057690355",
    appId: "1:789057690355:web:e01ee3616df2679fe2f586",
    measurementId: "G-DHFR7WKVWS"
};
// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase inicializado:', app);
export const auth = getAuth(app);
console.log('Auth inicializado:', auth);
export const database = getDatabase(app);
export { signInWithEmailAndPassword }; // Exporte a função

// Atualiza a interface do usuário
function updateAuthUI() {
    const authContainer = document.getElementById('authContainer');
    if (!authContainer) return;

    auth.onAuthStateChanged((user) => {
        // Função para escapar HTML e evitar XSS
        function escapeHTML(str) {
            return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }
        if (user) {
            const safeName = escapeHTML(user.displayName || 'Usuário');
            const safeEmail = escapeHTML(user.email || 'E-mail não disponível');
            authContainer.innerHTML = `
                <div>Bem-vindo, ${safeName} (${safeEmail})</div>
            `;
        } else {
            authContainer.innerHTML = `
                <a href="login.html">Entrar</a>
                <a href="cadastro.html">Cadastrar</a>
            `;
        }
    });
}

// Inicializa o sistema de autenticação
function initAuth() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateAuthUI);
    } else {
        updateAuthUI();
    }
}
initAuth();
export { firebaseConfig };
