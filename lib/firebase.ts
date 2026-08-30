import { FirebaseApp, initializeApp, getApps, getApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy_api_key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

// Only initialize Firebase on the client-side to avoid build issues (SSR handling)
// During SSR (e.g. Next.js prerendering), auth will be undefined
if (typeof window !== 'undefined') {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
}

// Para usar con AuthContext / funciones de auth que asumen un estado no opcional en la UI (client only)
// Si está en el servidor, usamos un objeto Auth vacío (mock) para tipados o simplemente null/undefined según necesitemos
export const getClientAuth = () => {
  if (!auth) {
    throw new Error('Firebase Auth no está inicializado en este entorno.');
  }
  return auth;
};

export { app, auth };
