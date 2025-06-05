import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';

// Configuração centralizada do Firebase
export const firebaseConfig = {
  apiKey: "AIzaSyDlTtNFfZIVIPJCIuJvnLB89idtAdKaFr8",
  authDomain: "farmaciasaobenedito-bcb2c.firebaseapp.com",
  databaseURL: "https://farmaciasaobenedito-bcb2c-default-rtdb.firebaseio.com",
  projectId: "farmaciasaobenedito-bcb2c",
  storageBucket: "farmaciasaobenedito-bcb2c.appspot.com",
  messagingSenderId: "789057690355",
  appId: "1:789057690355:web:e01ee3616df2679fe2f586",
  measurementId: "G-DHFR7WKVWS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const firestore = getFirestore(app);

// Removido código de UI e funções duplicadas. Este arquivo serve apenas para configuração e exportação das instâncias Firebase.
