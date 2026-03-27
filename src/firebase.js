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
import { getToken, onMessage } from "firebase/messaging";

export const activarNotificaciones = async () => {
    try {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            console.log("Permiso denegado");
            return;
        }

        const token = await getToken(messaging, {
            vapidKey: "BD_yaPglTL-4cv6M3xhlbFCDEbfb-mDKQIFDW1PRj4RQRgabJdAwCzUfz4SLQJ6ErVxwEt5yeyvqKTUCFQmn9Ro"
        });

        console.log("TOKEN:", token);

        // 🔥 GUARDAR TOKEN EN FIREBASE
        await fetch("/api/save-token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token })
        });

    } catch (error) {
        console.error("Error:", error);
    }
};


// 👂 ESCUCHAR NOTIFICACIONES EN PRIMER PLANO
export const escucharNotificaciones = () => {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
        console.log("Notificación recibida:", payload);

        new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: "/img/logos/IMG_5208.PNG"
        });
    });
};