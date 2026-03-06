import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

// Generate a unique session token
const generateSessionToken = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

// Get user's public IP
const getUserIP = async () => {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        return data.ip;
    } catch {
        return 'unknown';
    }
};

// Get basic device info
const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let device = 'Desktop';
    if (/Mobi|Android/i.test(ua)) device = 'Mobile';
    else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';

    let browser = 'Unknown';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Edge';

    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return { device, browser, os };
};

// Session token key in localStorage
const SESSION_KEY = 'ig_session_token';

export const authService = {
    /**
     * Standardizes user data and saves it to Firestore
     */
    async handleUserSession(firebaseUser) {
        const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email?.toLowerCase(),
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            photoURL: firebaseUser.photoURL || null,
            provider: firebaseUser.providerData[0]?.providerId || 'password',
            lastLogin: new Date().toISOString()
        };

        console.log('🔍 Starting handleUserSession for UID:', userData.uid);
        const userRef = doc(db, "users", userData.uid);
        let userSnap;
        try {
            userSnap = await getDoc(userRef);
            console.log('✅ getDoc success, exists:', userSnap.exists());
        } catch (e) {
            console.error('❌ getDoc FAILED:', e);
            throw e;
        }

        if (!userSnap.exists()) {
            userData.status = 'payment_required';
            userData.role = 'user';
            userData.createdAt = serverTimestamp();
            userData.subscriptionActive = false;

            // Affiliate Attribution
            const referralCode = localStorage.getItem('referralCode');
            if (referralCode) {
                userData.referredBy = referralCode;
                console.log('✅ User attributed to affiliate:', referralCode);
            }
        } else {
            const existingData = userSnap.data();
            if (existingData.status) userData.status = existingData.status;
        }

        // Session tracking — create unique session and record IP
        const sessionToken = generateSessionToken();
        const ip = await getUserIP();
        const deviceInfo = getDeviceInfo();

        userData.activeSession = {
            token: sessionToken,
            ip: ip,
            device: deviceInfo.device,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            startedAt: new Date().toISOString()
        };
        userData.lastIP = ip;

        // Save session token locally
        localStorage.setItem(SESSION_KEY, sessionToken);

        try {
            console.log('📝 Attempting setDoc (merge) for UID:', userData.uid);
            await setDoc(userRef, userData, { merge: true });
            console.log('✅ setDoc success');
        } catch (e) {
            console.error('❌ setDoc FAILED:', e);
            throw e;
        }

        localStorage.removeItem('referralCode');
        const finalUser = { ...userData, ...(userSnap.exists() ? userSnap.data() : {}) };

        // Side effects
        localStorage.setItem('user', JSON.stringify(finalUser));
        localStorage.setItem('dn_academy_email', userData.email);
        window.dispatchEvent(new Event('storage'));

        return finalUser;
    },

    /**
     * Check if current session is still the active one
     * Returns false if another device logged in (session was overwritten)
     */
    async checkSessionValid(uid) {
        try {
            const localToken = localStorage.getItem(SESSION_KEY);
            if (!localToken || !uid) return true; // No session to check

            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) return true;

            const data = userSnap.data();
            const remoteToken = data.activeSession?.token;

            // If remote token differs from local, another device logged in
            if (remoteToken && remoteToken !== localToken) {
                return false; // Session hijacked by another device
            }
            return true;
        } catch {
            return true; // On error, don't force logout
        }
    },

    /**
     * Force logout with session cleanup
     */
    async forceLogout(reason) {
        console.warn('🔒 Forced logout:', reason);
        localStorage.removeItem('user');
        localStorage.removeItem(SESSION_KEY);
        return signOut(auth);
    },

    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem(SESSION_KEY);
        return signOut(auth);
    },

    subscribeToUserProfile(uid, callback) {
        return onSnapshot(doc(db, "users", uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                callback(data);
            }
        });
    },

    /**
     * Subscribe to session changes — detects if another device logs in
     */
    subscribeToSessionCheck(uid, onSessionInvalid) {
        const localToken = localStorage.getItem(SESSION_KEY);
        if (!localToken || !uid) return () => { };

        return onSnapshot(doc(db, "users", uid), (docSnap) => {
            if (!docSnap.exists()) return;
            const data = docSnap.data();
            const remoteToken = data.activeSession?.token;

            if (remoteToken && remoteToken !== localToken) {
                console.warn("🚫 Session conflict detected. Local:", localToken, "Remote:", remoteToken);
                onSessionInvalid();
            }
        }, (error) => {
            console.error("❌ Session check listener error:", error);
            // Don't trigger logout on permission error, only on actual data mismatch
        });
    }
};
