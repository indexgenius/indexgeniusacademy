import React, { useState, useEffect } from 'react';
import { Key, RefreshCw, Trash2, Clock } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

const AccessKeys = ({ user }) => {
    const [keys, setKeys] = useState([]);
    const [generatedKey, setGeneratedKey] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "access_codes"), orderBy("createdAt", "desc"));
        return onSnapshot(q, (snap) => setKeys(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    }, []);

    const generateNewKey = async () => {
        setLoading(true);
        const k = `ING-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        try {
            await setDoc(doc(db, "access_codes", k), { valid: true, createdAt: serverTimestamp(), createdBy: user.email });
            setGeneratedKey(k);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <div className="space-y-8 pt-8">
            <div className="bg-black border border-white/10 p-8 text-center max-w-xl mx-auto">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">GENERAR LLAVE DE ACCESO</h3>
                <div className="text-4xl font-mono font-bold text-white mb-6 select-all">{generatedKey || '____-____-____'}</div>
                <button onClick={generateNewKey} disabled={loading} className="px-8 py-3 bg-red-600 text-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    {loading ? 'GENERANDO...' : 'GENERAR NUEVA LLAVE'}
                </button>
            </div>

            <div className="bg-black border border-white/10 p-8">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6">LLAVES DE ACCESO ACTIVAS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {keys.map(k => (
                        <div key={k.id} className="p-4 bg-white/5 border border-white/10 flex justify-between items-center group">
                            <div>
                                <p className={`font-mono font-bold ${k.valid ? 'text-green-500' : 'text-gray-600'}`}>{k.id}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[8px] font-black px-2 py-0.5 ${k.valid ? 'bg-green-600/10 text-green-500' : 'bg-red-600/10 text-red-600'}`}>{k.valid ? 'VALÍDA' : 'USADA'}</span>
                                    <span className="text-[8px] text-gray-600 uppercase">{k.createdAt?.toMillis() ? new Date(k.createdAt.toMillis()).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                            <button onClick={() => deleteDoc(doc(db, "access_codes", k.id))} className="p-2 text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AccessKeys;
