import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "missing-api-key",
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "missing-auth-domain",
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "missing-project-id",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "missing-storage-bucket",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "missing-sender-id",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "missing-app-id"
};

// Initialize Firebase only if we have an API key, otherwise it might throw errors immediately
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
