import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

/**
 * Hook to listen for new signals in real-time
 */
export const useSignals = (appLoadTime = Date.now()) => {
    const [lastSignal, setLastSignal] = useState(null);
    const [signals, setSignals] = useState([]);
    const appLoadTimeRef = useRef(appLoadTime);

    useEffect(() => {
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

                    // Only trigger for strictly new signals
                    if (signalTime > appLoadTimeRef.current) {
                        setLastSignal({ ...signalData, id: change.doc.id });
                    }
                }
            });
        });

        return () => unsubscribe();
    }, []);

    return { signals, lastSignal };
};
