import { db } from '../firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

export const liveService = {
    createLive: async (liveData) => {
        try {
            const docRef = await addDoc(collection(db, 'lives'), {
                ...liveData,
                timestamp: serverTimestamp(),
                createdAt: serverTimestamp()
            });
            return docRef;
        } catch (error) {
            console.error('Error creating live:', error);
            throw error;
        }
    },

    updateLive: async (liveId, data) => {
        try {
            const liveRef = doc(db, 'lives', liveId);
            await updateDoc(liveRef, data);
        } catch (error) {
            console.error('Error updating live:', error);
            throw error;
        }
    },

    deleteLive: async (liveId) => {
        try {
            await deleteDoc(doc(db, 'lives', liveId));
        } catch (error) {
            console.error('Error deleting live:', error);
            throw error;
        }
    },

    subscribeToLives: (callback) => {
        const q = query(
            collection(db, "lives"),
            orderBy("timestamp", "desc")
        );

        return onSnapshot(q, (snapshot) => {
            const lives = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(l => l.status === 'live');
            callback(lives);
        }, (error) => {
            console.error('Error subscribing to lives:', error);
        });
    }
};
