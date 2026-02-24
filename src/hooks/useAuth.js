import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        const unsubscribe = authService.subscribeToUserProfile(user.uid, (data) => {
            setUser(prev => {
                const updated = { ...prev, ...data };
                localStorage.setItem('user', JSON.stringify(updated));
                return updated;
            });
            setLoading(false);
        });

        // Session enforcement — detect if another device logs in
        const unsubSession = authService.subscribeToSessionCheck(user.uid, () => {
            alert('⚠️ Se detectó un inicio de sesión en otro dispositivo. Tu sesión ha sido cerrada.');
            authService.forceLogout('duplicate_session').then(() => {
                setUser(null);
                window.location.reload();
            });
        });

        return () => {
            unsubscribe();
            unsubSession();
        };
    }, [user?.uid]);

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
