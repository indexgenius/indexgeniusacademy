import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const useAuth = () => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeProfile = null;
        let unsubscribeSession = null;

        const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            // Clean up previous listeners if user changes
            if (unsubscribeProfile) unsubscribeProfile();
            if (unsubscribeSession) unsubscribeSession();

            if (firebaseUser) {
                // Fetch profile data from Firestore
                unsubscribeProfile = authService.subscribeToUserProfile(firebaseUser.uid, (data) => {
                    const fullUser = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        ...data
                    };
                    setUser(fullUser);
                    localStorage.setItem('user', JSON.stringify(fullUser));
                    setLoading(false);
                });

                // Session check listener
                unsubscribeSession = authService.subscribeToSessionCheck(firebaseUser.uid, () => {
                    alert('⚠️ Se detectó un inicio de sesión en otro dispositivo. Tu sesión ha sido cerrada.');
                    authService.forceLogout('duplicate_session').then(() => {
                        setUser(null);
                        window.location.reload();
                    });
                });
            } else {
                setUser(null);
                localStorage.removeItem('user');
                setLoading(false);
            }
        });

        return () => {
            unsubAuth();
            if (unsubscribeProfile) unsubscribeProfile();
            if (unsubscribeSession) unsubscribeSession();
        };
    }, []);

    const login = async (firebaseUser) => {
        const finalUser = await authService.handleUserSession(firebaseUser);
        setUser(finalUser);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    return { user, login, logout, loading };
};
