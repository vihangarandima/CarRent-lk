import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// On the live site, Google sign-in runs through our own domain (proxied to Firebase by
// vercel.json), so the Google popup says "yamucarrentals.lk" instead of the raw
// "...firebaseapp.com" project address. Everywhere else (localhost, previews) uses the default.
const BRANDED_HOSTS = ["yamucarrentals.lk", "www.yamucarrentals.lk"];
const host = typeof window !== "undefined" ? window.location.hostname : "";
const authDomain = BRANDED_HOSTS.includes(host) ? host : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Always let people pick which Google account to use
googleProvider.setCustomParameters({ prompt: "select_account" });
