import React, { useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const UpdatePaymentAddresses = () => {
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [details, setDetails] = useState([]);

    const newPaymentMethods = [
        { name: "USDT TRC20", value: "TASF23cMtiw9Cxt9UkP8puy9Fsp5PdfwA9", category: "CRIPTO", icon: "usdt", owner: "STEVEN CASTILLO" },
        { name: "USDT BEP20", value: "0x5cbf47ac13c96d4d2c38b447e51514d08f0d83a7", category: "CRIPTO", icon: "usdt", owner: "STEVEN CASTILLO" },
        { name: "BINANCE ID", value: "1132867046", category: "CRIPTO", icon: "binance", owner: "eltevenfx1" }
    ];

    const handleUpdate = async () => {
        setStatus('loading'); setMessage('UPDATING ADDRESSES...'); setDetails([]);
        const logs = [];
        try {
            const ref = collection(db, "payment_methods");
            const q = query(ref, where("category", "==", "CRIPTO"));
            const snap = await getDocs(q);
            for (const d of snap.docs) { await deleteDoc(doc(db, "payment_methods", d.id)); logs.push(`DELETED: ${d.data().name}`); }
            for (const m of newPaymentMethods) { await addDoc(ref, m); logs.push(`ADDED: ${m.name}`); }
            setStatus('success'); setMessage('COMPLETE'); setDetails(logs);
        } catch (e) { setStatus('error'); setMessage(e.message); }
    };

    return (
        <div className="bg-white/5 border border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><RefreshCw size={20} className="text-red-600" /> UPDATE CRYPTO ADDRESSES</h3>
            <button onClick={handleUpdate} disabled={status === 'loading'} className={`w-full py-4 font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 ${status === 'loading' ? 'bg-gray-600' : 'bg-red-600'}`}>
                {status === 'loading' ? 'PROCESSING...' : 'START UPDATE'}
            </button>
            {message && <p className="mt-4 text-xs font-black text-red-600 uppercase tracking-widest">{message}</p>}
        </div>
    );
};

export default UpdatePaymentAddresses;
