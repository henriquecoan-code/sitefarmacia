// Firebase Service - Handles all Firebase operations
export class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.firestore = null;
    this.isInitialized = false;
  }

  async init() {
    try {
      // Use the existing Firebase config from the current site
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

      // Dynamic import Firebase modules
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js');
      const { getAuth } = await import('https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js');
      const { getFirestore } = await import('https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js');

      this.app = initializeApp(firebaseConfig);
      this.auth = getAuth(this.app);
      this.firestore = getFirestore(this.app);
      this.isInitialized = true;

      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  }

  // Authentication methods
  async signIn(email, password) {
    if (!this.isInitialized) throw new Error('Firebase not initialized');
    
    const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js');
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signUp(email, password) {
    if (!this.isInitialized) throw new Error('Firebase not initialized');
    
    const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js');
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async signOut() {
    if (!this.isInitialized) throw new Error('Firebase not initialized');
    
    const { signOut } = await import('https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js');
    return signOut(this.auth);
  }

  // Firestore methods
  async getProducts() {
    if (!this.isInitialized) throw new Error('Firebase not initialized');
    
    try {
      const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js');
      const querySnapshot = await getDocs(collection(this.firestore, 'produtos'));
      
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
      
      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  async getProduct(id) {
    if (!this.isInitialized) throw new Error('Firebase not initialized');
    
    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js');
      const docRef = doc(this.firestore, 'produtos', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting product:', error);
      return null;
    }
  }

  async addProduct(product) {
    if (!this.isInitialized) throw new Error('Firebase not initialized');
    
    try {
      const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js');
      const docRef = await addDoc(collection(this.firestore, 'produtos'), product);
      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  async updateProduct(id, product) {
    if (!this.isInitialized) throw new Error('Firebase not initialized');
    
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js');
      const docRef = doc(this.firestore, 'produtos', id);
      await updateDoc(docRef, product);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id) {
    if (!this.isInitialized) throw new Error('Firebase not initialized');
    
    try {
      const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js');
      const docRef = doc(this.firestore, 'produtos', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Auth state observer
  onAuthStateChanged(callback) {
    if (!this.isInitialized) throw new Error('Firebase not initialized');
    
    import('https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js').then(({ onAuthStateChanged }) => {
      onAuthStateChanged(this.auth, callback);
    });
  }

  // Get current user
  getCurrentUser() {
    if (!this.isInitialized) return null;
    return this.auth.currentUser;
  }
}