import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBNZjJC1tc0LtT3y4DouPVkSZbCusW2w2I",
    authDomain: "ingenius-f33a6.firebaseapp.com",
    projectId: "ingenius-f33a6",
    storageBucket: "ingenius-f33a6.firebasestorage.app",
    messagingSenderId: "174110254614",
    appId: "1:174110254614:web:26446b0790fc9fcf723737",
    measurementId: "G-5LWJ345KWS"
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
