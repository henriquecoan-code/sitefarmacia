// Firebase SDK minimal replacement for basic functionality
window.firebase = {
  initializeApp: function(config) {
    console.log('Firebase initialized with config:', config);
    return {
      name: 'default',
      options: config
    };
  },
  
  auth: function(app) {
    return {
      currentUser: null,
      signInWithEmailAndPassword: function(email, password) {
        return Promise.resolve({
          user: { uid: 'demo-user', email: email }
        });
      },
      createUserWithEmailAndPassword: function(email, password) {
        return Promise.resolve({
          user: { uid: 'demo-user', email: email }
        });
      },
      signOut: function() {
        return Promise.resolve();
      },
      onAuthStateChanged: function(callback) {
        // Simulate no user logged in initially
        setTimeout(() => callback(null), 100);
        return function() {}; // unsubscribe function
      }
    };
  },
  
  firestore: function(app) {
    return {
      collection: function(name) {
        return {
          doc: function(id) {
            return {
              get: function() {
                return Promise.resolve({
                  exists: false,
                  data: function() { return null; }
                });
              },
              set: function(data) {
                return Promise.resolve();
              },
              update: function(data) {
                return Promise.resolve();
              }
            };
          },
          add: function(data) {
            return Promise.resolve({
              id: 'demo-id-' + Date.now()
            });
          },
          get: function() {
            return Promise.resolve({
              empty: true,
              docs: [],
              forEach: function(callback) {}
            });
          },
          where: function(field, operator, value) {
            return this;
          },
          orderBy: function(field, direction) {
            return this;
          },
          limit: function(count) {
            return this;
          }
        };
      }
    };
  },
  
  database: function(app) {
    return {
      ref: function(path) {
        return {
          push: function(data) {
            return Promise.resolve({
              key: 'demo-key-' + Date.now()
            });
          },
          set: function(data) {
            return Promise.resolve();
          },
          once: function(eventType) {
            return Promise.resolve({
              val: function() { return null; }
            });
          },
          on: function(eventType, callback) {
            // Simulate empty data
            setTimeout(() => callback({ val: () => null }), 100);
            return function() {}; // off function
          }
        };
      }
    };
  }
};

// Export functions for ES6 modules compatibility
export function initializeApp(config) { 
  return window.firebase.initializeApp(config); 
}

export function getAuth(app) { 
  return window.firebase.auth(app); 
}

export function getFirestore(app) { 
  return window.firebase.firestore(app); 
}

export function getDatabase(app) { 
  return window.firebase.database(app); 
}

// Additional Firestore exports
export function collection(db, name) {
  return db.collection(name);
}

export function doc(db, collection, id) {
  return db.collection(collection).doc(id);
}

export function getDocs(collectionRef) {
  return collectionRef.get();
}

export function getDoc(docRef) {
  return docRef.get();
}

export function setDoc(docRef, data) {
  return docRef.set(data);
}

export function addDoc(collectionRef, data) {
  return collectionRef.add(data);
}

export function updateDoc(docRef, data) {
  return docRef.update(data);
}

export function deleteDoc(docRef) {
  return Promise.resolve();
}

export function query(collectionRef, ...constraints) {
  return collectionRef;
}

export function where(field, operator, value) {
  return { field, operator, value };
}

export function orderBy(field, direction) {
  return { field, direction };
}

export function limit(count) {
  return { count };
}

export function onSnapshot(ref, callback) {
  setTimeout(() => callback({ empty: true, docs: [] }), 100);
  return function() {}; // unsubscribe
}

// Make Firebase available globally
window.Firebase = window.firebase;
window.initializeApp = initializeApp;
window.getAuth = getAuth;
window.getFirestore = getFirestore;
window.getDatabase = getDatabase;