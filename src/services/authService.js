import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

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

        const userRef = doc(db, "users", userData.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            userData.status = 'payment_required';
            userData.role = 'user';
            userData.createdAt = serverTimestamp();
            userData.subscriptionActive = false;
        } else {
            const existingData = userSnap.data();
            if (existingData.status) userData.status = existingData.status;
        }

        await setDoc(userRef, userData, { merge: true });
        const finalUser = { ...userData, ...(userSnap.exists() ? userSnap.data() : {}) };

        // Side effects
        localStorage.setItem('user', JSON.stringify(finalUser));
        localStorage.setItem('dn_academy_email', userData.email);
        window.dispatchEvent(new Event('storage'));

        return finalUser;
    },

    logout() {
        localStorage.removeItem('user');
        return signOut(auth);
    },

    subscribeToUserProfile(uid, callback) {
        return onSnapshot(doc(db, "users", uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                callback(data);
            }
        });
    }
};
