/**
 * Exemplos práticos de segurança com Firebase usando Cloud Functions e Custom Claims.
 * 
 * Este arquivo é apenas para visualização/estudo. Não é executado no navegador!
 * 
 * 1. Definindo um papel (role) de admin para um usuário no backend (Node.js):
 * 
 *   // No terminal, instale o Firebase Admin SDK:
 *   // npm install firebase-admin
 * 
 *   const admin = require('firebase-admin');
 *   admin.initializeApp();
 * 
 *   // Defina o papel de admin para um usuário específico:
 *   admin.auth().setCustomUserClaims('USER_UID_AQUI', { role: 'admin' })
 *     .then(() => {
 *       console.log('Usuário agora é admin!');
 *     });
 * 
 * 2. Exemplo de regra Firestore para proteger dados:
 * 
 *   // No console do Firebase > Firestore > Regras:
 *   rules_version = '2';
 *   service cloud.firestore {
 *     match /databases/{database}/documents {
 *       // Usuário só pode ler/escrever seus próprios dados
 *       match /usuarios/{userId} {
 *         allow read, write: if request.auth != null && request.auth.uid == userId;
 *       }
 *       // Apenas admin pode ler/escrever todos os pedidos
 *       match /pedidos/{pedidoId} {
 *         allow read, write: if request.auth.token.role == 'admin';
 *       }
 *     }
 *   }
 * 
 * 3. Exemplo de Cloud Function protegida (Node.js):
 * 
 *   // No arquivo index.js das suas Cloud Functions:
 *   const functions = require('firebase-functions');
 *   const admin = require('firebase-admin');
 *   admin.initializeApp();
 * 
 *   exports.addPedido = functions.https.onCall((data, context) => {
 *     if (!context.auth) {
 *       throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
 *     }
 *     // Apenas admin pode criar pedidos para outros usuários
 *     if (context.auth.token.role !== 'admin') {
 *       throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem executar esta ação');
 *     }
 *     // lógica segura aqui
 *     return { status: 'Pedido criado com sucesso!' };
 *   });
 * 
 * 4. No front-end, como ler o papel do usuário:
 * 
 *   import { getAuth } from 'firebase/auth';
 *   const auth = getAuth();
 *   auth.currentUser.getIdTokenResult().then(idTokenResult => {
 *     if (idTokenResult.claims.role === 'admin') {
 *       // Mostra recursos de admin
 *     }
 *   });
 * 
 * 5. Chamada de função protegida no front-end:
 * 
 *   import { getFunctions, httpsCallable } from 'firebase/functions';
 *   const functions = getFunctions();
 *   const addPedido = httpsCallable(functions, 'addPedido');
 *   addPedido({ ...dados }).then(result => {
 *     // sucesso
 *   }).catch(error => {
 *     // erro
 *   });
 */
