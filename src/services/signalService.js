import { db } from '../firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { broadcast } from './api';

/**
 * Service to handle all signal-related database and broadcast operations
 */
export const signalService = {
    /**
     * Saves a signal to Firestore and broadcasts it to all users
     */
    async broadcastSignal(signalObj, userEmail) {
        if (!signalObj) return;

        const payload = typeof signalObj === 'string'
            ? { message: signalObj, timestamp: serverTimestamp(), sender: userEmail }
            : { ...signalObj, timestamp: serverTimestamp(), sender: userEmail };

        // Ensure we don't save a null 'id' field inside the document
        if (payload.id === null) delete payload.id;

        // 1. Save to Firestore for live feed
        let signalId = signalObj.id;
        if (!signalObj.skipSave) {
            if (signalId) {
                await setDoc(doc(db, "signals", signalId), payload, { merge: true });
            } else {
                const docRef = await addDoc(collection(db, "signals"), payload);
                signalId = docRef.id;
            }
        }

        // 2. Prepare Push Notification
        const notifyBody = typeof signalObj === 'string'
            ? signalObj
            : `${signalObj.message}${signalObj.entry && signalObj.entry !== '---' ? ` [PE: ${signalObj.entry}]` : ''}`;

        const notifyTitle = typeof signalObj === 'object' && signalObj.title
            ? signalObj.title
            : "IndexGenius ACADEMY - SIGNAL";

        // 3. Broadcast via Backend API (Skip if silent)
        if (signalObj.silent) {
            return { success: true, silent: true, id: signalId };
        }

        return await broadcast({
            title: notifyTitle,
            body: notifyBody,
            data: { ...payload, id: signalId }
        });
    },

    /**
     * Deletes a signal from Firestore
     */
    async deleteSignal(id) {
        return await deleteDoc(doc(db, "signals", id));
    }
};
