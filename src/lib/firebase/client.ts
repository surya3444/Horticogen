import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
} from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize when we actually have a config. This keeps `next build`
// from crashing when prerendering pages if the env vars aren't present in the
// build environment — the services are only ever USED in the browser (inside
// effects / event handlers), where the env vars are inlined by Next.
const hasConfig = !!firebaseConfig.apiKey;

const app: FirebaseApp | undefined = hasConfig
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : undefined;

if (!hasConfig && typeof window !== "undefined") {
  // Surfaced in the browser console if the deploy is missing its config.
  console.error(
    "[Firebase] Missing NEXT_PUBLIC_FIREBASE_* env vars — set them in your hosting provider's environment settings."
  );
}

// Initialize Firestore with `ignoreUndefinedProperties` so writes that contain
// optional/undefined fields (e.g. homepage section configs) don't get rejected.
function makeDb(a: FirebaseApp): Firestore {
  try {
    return initializeFirestore(a, { ignoreUndefinedProperties: true });
  } catch {
    // Already initialized (e.g. via HMR) — reuse the existing instance.
    return getFirestore(a);
  }
}

export const auth = (app ? getAuth(app) : undefined) as Auth;
export const db = (app ? makeDb(app) : undefined) as Firestore;
export const storage = (app ? getStorage(app) : undefined) as FirebaseStorage;
export default app;
