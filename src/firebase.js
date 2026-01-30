import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

import { getMessaging } from "firebase/messaging";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Safe initialization for Analytics and Messaging
let analytics = null;
let messaging = null;

if (typeof window !== 'undefined') {
    // Analytics
    import("firebase/analytics").then(({ isSupported, getAnalytics }) => {
        isSupported().then(supported => {
            if (supported) analytics = getAnalytics(app);
        });
    }).catch(e => console.warn("Analytics failed:", e));

    // Messaging
    import("firebase/messaging").then(({ isSupported, getMessaging }) => {
        isSupported().then(supported => {
            if (supported) messaging = getMessaging(app);
        });
    }).catch(e => console.warn("Messaging failed:", e));
}

export { app, analytics, db, auth, messaging, googleProvider };
