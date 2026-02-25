import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronUp, ChevronDown, Trash2, Globe, MessageSquare } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, updateDoc, doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

const CellManager = () => {
    const [groupName, setGroupName] = useState('');
    const [groupDesc, setGroupDesc] = useState('');
    const [groupLink, setGroupLink] = useState('');
    const [groupStatus, setGroupStatus] = useState('PUBLIC');
    const [groupIcon, setGroupIcon] = useState('ShieldCheck');
    const [groupColor, setGroupColor] = useState('text-white');
    const [groupsList, setGroupsList] = useState([]);
    const [cellLoading, setCellLoading] = useState(false);

    useEffect(() => {
        return onSnapshot(collection(db, "groups"), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGroupsList(list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        });
    }, []);

    const createCell = async (e) => {
        e.preventDefault();
        if (!groupName) return;
        setCellLoading(true);
        const cellId = groupName.toLowerCase().replace(/\s+/g, '_');
        try {
            await setDoc(doc(db, "groups", cellId), {
                name: groupName,
                desc: groupDesc,
                link: groupLink,
                status: groupStatus,
                icon: groupIcon,
                color: groupColor,
                order: groupsList.length,
                createdAt: serverTimestamp()
            });
            setGroupName(''); setGroupDesc(''); setGroupLink('');
        } catch (e) { console.error(e); }
        setCellLoading(false);
    };

    const moveGroup = async (index, direction) => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= groupsList.length) return;
        const current = groupsList[index];
        const other = groupsList[newIndex];
        await updateDoc(doc(db, "groups", current.id), { order: other.order ?? newIndex });
        await updateDoc(doc(db, "groups", other.id), { order: current.order ?? index });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
            <form onSubmit={createCell} className="space-y-4 bg-black border border-white/5 p-6">
                <input placeholder="NOMBRE DE LA CÉLULA" value={groupName} onChange={e => setGroupName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none" />
                <input placeholder="ENLACE" value={groupLink} onChange={e => setGroupLink(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none" />
                <textarea placeholder="DESCRIPCIÓN" value={groupDesc} onChange={e => setGroupDesc(e.target.value)} className="w-full h-24 bg-white/5 border border-white/10 p-3 text-white outline-none" />
                <button className="w-full py-3 bg-red-600 text-white font-black uppercase text-xs">ACTIVAR CÉLULA</button>
            </form>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupsList.map((g, idx) => (
                    <div key={g.id} className="p-4 bg-white/5 border border-white/10 flex justify-between">
                        <div>
                            <p className={`font-black ${g.color || 'text-white'}`}>{g.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase">{g.status}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => moveGroup(idx, 'up')} className="p-1 bg-white/5"><ChevronUp size={14} /></button>
                            <button onClick={() => moveGroup(idx, 'down')} className="p-1 bg-white/5"><ChevronDown size={14} /></button>
                            <button onClick={async () => { if (confirm('¿ELIMINAR?')) await deleteDoc(doc(db, "groups", g.id)) }} className="p-1 text-red-600"><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CellManager;
