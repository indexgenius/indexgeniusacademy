import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronUp, ChevronDown, Trash2, Globe, MessageSquare, Plus, Edit2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, updateDoc, doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

const CellManager = () => {
    const [groupName, setGroupName] = useState('');
    const [groupDesc, setGroupDesc] = useState('');
    const [groupLink, setGroupLink] = useState('');
    const [groupStatus, setGroupStatus] = useState('PUBLIC');
    const [groupIcon, setGroupIcon] = useState('trading');
    const [groupsList, setGroupsList] = useState([]);
    const [cellLoading, setCellLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const AVAILABLE_LOGOS = [
        { id: 'whatsapp', label: 'WhatsApp', path: '/img/group-icons/whatsapp.png' },
        { id: 'telegram', label: 'Telegram', path: '/img/group-icons/telegram.png' },
        { id: 'instagram', label: 'Instagram', path: '/img/group-icons/instagram.png' },
        { id: 'youtube', label: 'YouTube', path: '/img/group-icons/youtube.png' },
        { id: 'discord', label: 'Discord', path: '/img/group-icons/discord.png' },
        { id: 'crypto', label: 'Crypto', path: '/img/group-icons/crypto.png' },
        { id: 'forex', label: 'Forex', path: '/img/group-icons/forex.png' },
        { id: 'trading', label: 'Trading', path: '/img/group-icons/trading.png' },
    ];

    useEffect(() => {
        return onSnapshot(collection(db, "groups"), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGroupsList(list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupName) return;
        setCellLoading(true);

        try {
            const data = {
                name: groupName,
                desc: groupDesc,
                link: groupLink,
                status: groupStatus,
                icon: groupIcon,
                updatedAt: serverTimestamp()
            };

            if (editingId) {
                await updateDoc(doc(db, "groups", editingId), data);
                setEditingId(null);
            } else {
                const cellId = groupName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString().slice(-4);
                await setDoc(doc(db, "groups", cellId), {
                    ...data,
                    order: groupsList.length,
                    createdAt: serverTimestamp()
                });
            }

            setGroupName(''); setGroupDesc(''); setGroupLink(''); setGroupIcon('trading'); setGroupStatus('PUBLIC');
        } catch (e) { console.error(e); }
        setCellLoading(false);
    };

    const startEdit = (g) => {
        setEditingId(g.id);
        setGroupName(g.name || '');
        setGroupDesc(g.desc || '');
        setGroupLink(g.link || '');
        setGroupStatus(g.status || 'PUBLIC');
        setGroupIcon(g.icon || 'trading');
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
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pt-8">
            <div className="xl:col-span-4 space-y-6">
                <div className="bg-black/80 border border-white/5 p-6 backdrop-blur-md">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3 italic">
                        <div className="w-2 h-2 bg-red-600"></div>
                        {editingId ? 'EDITAR CÉLULA' : 'CREAR NUEVA CÉLULA'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">NOMBRE DEL GRUPO</label>
                            <input placeholder="EJ: VIP TRADING SYGNALS" value={groupName} onChange={e => setGroupName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 text-xs font-black text-white outline-none focus:border-red-600 transition-colors uppercase" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">LINK DE INVITACIÓN</label>
                            <input placeholder="https://t.me/..." value={groupLink} onChange={e => setGroupLink(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 text-xs font-black text-white outline-none focus:border-red-600 transition-colors" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">ACCESO / PRIVACIDAD</label>
                            <div className="flex gap-1 bg-black/40 p-1 border border-white/10">
                                {['PUBLIC', 'PRIVATE', 'BLACK'].map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setGroupStatus(s)}
                                        className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${groupStatus === s ? 'bg-red-600 text-white shadow-red-glow/20' : 'text-gray-600 hover:text-white'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">SELECCIONAR LOGO</label>
                            <div className="grid grid-cols-4 gap-2 bg-black/40 p-3 border border-white/10">
                                {AVAILABLE_LOGOS.map(logo => (
                                    <button
                                        key={logo.id}
                                        type="button"
                                        onClick={() => setGroupIcon(logo.id)}
                                        className={`aspect-square p-2 border transition-all hover:scale-110 ${groupIcon === logo.id ? 'border-red-600 bg-red-600/5 shadow-red-glow/20' : 'border-white/5 grayscale opacity-50'}`}
                                    >
                                        <img src={logo.path} alt={logo.label} className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">DESCRIPCIÓN CORTA</label>
                            <textarea placeholder="DETALLES DEL GRUPO..." value={groupDesc} onChange={e => setGroupDesc(e.target.value)} className="w-full h-24 bg-white/5 border border-white/10 p-4 text-xs font-black text-white outline-none focus:border-red-600 transition-colors uppercase" />
                        </div>

                        <div className="flex gap-2 pt-2">
                            {editingId && (
                                <button type="button" onClick={() => { setEditingId(null); setGroupName(''); setGroupDesc(''); setGroupLink(''); }} className="px-6 py-4 bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-all uppercase text-[10px] font-black tracking-widest">CANCELAR</button>
                            )}
                            <button disabled={cellLoading} className="flex-1 py-4 bg-red-600 text-white font-black italic text-[10px] tracking-widest uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3">
                                {cellLoading ? 'PROCESANDO...' : (editingId ? 'ACTUALIZAR CAMBIOS' : 'ACTIVAR CÉLULA')}
                                <Plus size={14} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="xl:col-span-8 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest flex items-center gap-2 italic">
                        <Globe size={14} /> CÉLULAS EN RED ({groupsList.length})
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                    {groupsList.map((g, idx) => (
                        <div key={g.id} className="group bg-black/40 border border-white/5 p-5 flex items-center gap-5 hover:border-red-600/30 transition-all relative">
                            <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center p-3 relative shadow-lg">
                                {['whatsapp', 'telegram', 'instagram', 'youtube', 'discord', 'crypto', 'forex', 'trading'].includes(g.icon?.toLowerCase()) ? (
                                    <img src={`/img/group-icons/${g.icon.toLowerCase()}.png`} alt={g.name} className="w-full h-full object-contain" />
                                ) : (
                                    <MessageSquare size={24} className="text-gray-600" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-black italic text-white uppercase truncate">{g.name}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`text-[8px] font-black px-2 py-0.5 uppercase tracking-widest ${g.status === 'PUBLIC' ? 'bg-white text-black' : (g.status === 'BLACK' ? 'bg-neutral-800 text-red-600 border border-red-600/50' : 'bg-red-600 text-white')}`}>
                                        {g.status || 'PUBLIC'}
                                    </span>
                                    <p className="text-[10px] text-gray-600 font-bold uppercase truncate opacity-60 italic">{g.desc || 'SIN DESCRIPCIÓN'}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 opacity-20 group-hover:opacity-100 transition-all pl-4 border-l border-white/5">
                                <button onClick={() => moveGroup(idx, 'up')} className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-colors" title="Subir"><ChevronUp size={14} /></button>
                                <button onClick={() => startEdit(g)} className="p-1.5 bg-white/5 hover:bg-blue-600/20 text-gray-500 hover:text-blue-500 transition-colors" title="Editar"><Edit2 size={14} /></button>
                                <button onClick={() => moveGroup(idx, 'down')} className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-colors" title="Bajar"><ChevronDown size={14} /></button>
                                <button onClick={async () => { if (confirm(`¿ELIMINAR ${g.name}?`)) await deleteDoc(doc(db, "groups", g.id)) }} className="p-1.5 bg-white/5 hover:bg-red-600/20 text-gray-500 hover:text-red-500 transition-colors" title="Eliminar"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                    {groupsList.length === 0 && (
                        <div className="col-span-2 py-20 text-center border-2 border-dashed border-white/5">
                            <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em]">SIN CÉLULAS ACTIVAS EN EL SISTEMA</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CellManager;
