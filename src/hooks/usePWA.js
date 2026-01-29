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
        if (!window.OneSignal) return alert("Cargando sistema...");
        try {
            if (Notification.permission === 'default') {
                const perm = await Notification.requestPermission();
                if (perm === 'granted') setPushEnabled(true);
            }
            await window.OneSignal.Slidedown.promptPush();
        } catch (err) {
            console.error(err);
        }
    };

    return { isStandalone, pushEnabled, adblockDetected, rePromptPush };
};
