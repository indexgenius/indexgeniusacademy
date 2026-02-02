import { useState, useEffect } from 'react';

export const usePWA = () => {
    const [isStandalone, setIsStandalone] = useState(false);
    const [pushEnabled, setPushEnabled] = useState(false);
    const [adblockDetected, setAdblockDetected] = useState(false);

    useEffect(() => {
        const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        setIsStandalone(isPWA);

        if (window.OS_BLOCKED_BY_ADBLOCK) setAdblockDetected(true);

        const checkPermission = () => {
            if ('Notification' in window) setPushEnabled(Notification.permission === 'granted');
        };
        checkPermission();
        window.addEventListener('focus', checkPermission);
        return () => window.removeEventListener('focus', checkPermission);
    }, []);

    const rePromptPush = async () => {
        if (!window.OneSignal) return alert("Cargando sistema de señales...");

        try {
            const permission = Notification.permission;

            if (permission === 'denied') {
                alert("🔴 SEÑAL BLOQUEADA: Has bloqueado las notificaciones en la configuración de Chrome. Para recibir alertas, toca el candado junto a la URL y activa 'Notificaciones'.");
                return;
            }

            if (permission === 'default') {
                const perm = await Notification.requestPermission();
                if (perm === 'granted') {
                    setPushEnabled(true);
                    return;
                }
            }

            // If prompt fails or they're in a weird state, try slidedown
            await window.OneSignal.Slidedown.promptPush();
        } catch (err) {
            console.error('Push Link Error:', err);
            // Fallback for some browsers
            window.location.reload();
        }
    };

    return { isStandalone, pushEnabled, adblockDetected, rePromptPush };
};
