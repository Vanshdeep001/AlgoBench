// Firebase v9+ modular imports — only import what you use (tree-shaking)
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// These keys are SAFE to expose in client-side code — they are project identifiers,
// not secret credentials. Security is enforced server-side via Firebase Admin SDK.
const firebaseConfig = {
  apiKey: "AIzaSyBSO5rkxp2JlLWRNaXmoUm9nsUTg51VIQ4",
  authDomain: "algobench-4fca6.firebaseapp.com",
  projectId: "algobench-4fca6",
  storageBucket: "algobench-4fca6.firebasestorage.app",
  messagingSenderId: "499336776010",
  appId: "1:499336776010:web:e9009b3af57802c4a719b3",
  measurementId: "G-7964G1M092"
};

// Initialize Firebase app (singleton — safe to call once)
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Force account selection every time (prevents auto-sign-in on shared computers)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider };
export default app;
