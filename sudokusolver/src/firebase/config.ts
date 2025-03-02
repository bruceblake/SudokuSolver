import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8I8mc__UEHBRyGWyinyFOrCfK_bvJmaI",
  authDomain: "sudokusolver-506ca.firebaseapp.com",
  projectId: "sudokusolver-506ca",
  storageBucket: "sudokusolver-506ca.firebasestorage.app",
  messagingSenderId: "317012197635",
  appId: "1:317012197635:web:ba6b6c6de3048ef1e92936",
  measurementId: "G-Q7JM34SLE5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, auth, db, googleProvider };