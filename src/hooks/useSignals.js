import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

/**
 * Hook to listen for new signals in real-time
 * Handles reconnection when app comes back from background (Android PWA fix)
 */
export const useSignals = (appLoadTime = Date.now(), isApproved = false) => {
    const [lastSignal, setLastSignal] = useState(null);
    const [signals, setSignals] = useState([]);
    const [reconnectTrigger, setReconnectTrigger] = useState(0);
    const appLoadTimeRef = useRef(appLoadTime);

    // Detect when app comes back from background
    useEffect(() => {
        if (!isApproved) return;
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('🔄 App visible - reconnecting Firebase listeners...');
                // Trigger reconnection by updating state
                setReconnectTrigger(prev => prev + 1);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isApproved]);

    useEffect(() => {
        if (!isApproved) return;

        const q = query(
            collection(db, "signals"),
            orderBy("timestamp", "desc"),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const signalsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSignals(signalsData);

            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const signalData = change.doc.data();
                    const signalTime = signalData.timestamp?.toMillis() || Date.now();

                    // 1. Skip silent signals (historical/silent)
                    if (signalData.silent) return;

                    // 2. Only trigger for ACTIVE signals (don't notify about closed ones)
                    if (signalData.status !== 'ACTIVE') return;

                    // 3. Only trigger for strictly new signals added AFTER app load
                    if (signalTime > appLoadTimeRef.current) {
                        setLastSignal({ ...signalData, id: change.doc.id });
                    }
                }
            });
        }, (error) => {
            console.error('❌ Firebase listener error:', error);
            // Try to reconnect after error
            setTimeout(() => setReconnectTrigger(prev => prev + 1), 2000);
        });

        return () => unsubscribe();
    }, [reconnectTrigger]); // Reconnect when trigger changes

    return { signals, lastSignal };
};
