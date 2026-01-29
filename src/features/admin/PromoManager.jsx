import React, { useState, useEffect } from 'react';
import { Image, Save, Trash2, Power, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

const PromoManager = () => {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(false);

    const SLOTS = [
        { id: 'bridge', title: 'BRIDGE MARKETS', img: '/img/promos/bridge_markets_promo_v2.jpg', defaultDesc: 'EXCLUSIVO: OPERA SINTÉTICOS CON BONOS DEL 100% HASTA EL 200%', link: 'https://trading.bridgemarkets.global/register?ref=af2fad19-0a06-4b62-8&branchUuid=759c4fa8-df5b-4cdc-97ae-7' },
        { id: 'weltrade', title: 'WELTRADE INTEG', img: '/img/promos/weltrade.jpg', defaultDesc: 'PRÓXIMAS ALERTAS DE LA PLATAFORMA' },
        { id: 'affiliate', title: 'AFFILIATE -25%', img: '/img/promos/discount.jpg', defaultDesc: 'RECOMPENSAS POR REFERIR ACTIVAS' },
    ];

    useEffect(() => {
        const q = query(collection(db, "promos"), orderBy("order", "asc"));
        return onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPromos(list);
        });
    }, []);

    const toggleStatus = async (slot) => {
        setLoading(true);
        try {
            const existing = promos.find(p => p.slotId === slot.id);
            if (existing) {
                await updateDoc(doc(db, "promos", existing.id), {
                    active: !existing.active,
                    title: slot.title,
                    imageUrl: slot.img,
                    description: slot.defaultDesc,
                    link: slot.link || '#'
                });
            } else {
                await addDoc(collection(db, "promos"), {
                    slotId: slot.id,
                    title: slot.title,
                    imageUrl: slot.img,
                    description: slot.defaultDesc,
                    link: slot.link || '#',
                    active: true,
                    order: SLOTS.findIndex(s => s.id === slot.id),
                    createdAt: new Date()
                });
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const purgeOldData = async () => {
        if (!confirm("THIS WILL RESET ALL PROMO SETTINGS. CONTINUE?")) return;
        setLoading(true);
        try {
            for (const p of promos) {
                await deleteDoc(doc(db, "promos", p.id));
            }
            alert("DATABASE PURGED. YOU CAN NOW RE-ACTIVATE SLOTS.");
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const isSlotActive = (slotId) => {
        const p = promos.find(p => p.slotId === slotId);
        return p ? p.active : false;
    };

    return (
        <div className="max-w-4xl mx-auto pt-8 space-y-8">
            <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
                <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">TACTICAL ADVERTISING SLOTS</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Control the visibility of marketing intelligence on entry</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SLOTS.map((slot) => {
                    const active = isSlotActive(slot.id);
                    return (
                        <div key={slot.id} className={`bg-black border transition-all p-6 space-y-4 relative group ${active ? 'border-red-600 shadow-red-glow/20' : 'border-white/5 opacity-40'}`}>
                            <div className="aspect-[4/5] bg-white/5 border border-white/10 overflow-hidden relative">
                                <img src={slot.img} alt={slot.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                {!active && <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] -rotate-45 border border-white/20 px-4 py-2">OFLINE</span>
                                </div>}
                            </div>

                            <div className="space-y-1 text-center">
                                <h4 className="text-xs font-black text-white uppercase">{slot.title}</h4>
                                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter">{slot.id.toUpperCase()} MODULE</p>
                            </div>

                            <button
                                onClick={() => toggleStatus(slot)}
                                className={`w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${active ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}
                            >
                                <Power size={14} />
                                {active ? 'DEACTIVATE' : 'ACTIVATE'}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 italic">
                <div className="w-2 h-2 bg-red-600 animate-pulse"></div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    SYSTEM INFO: Active slots will be displayed to users in a rotational stack upon platform entry.
                </p>
                <button
                    onClick={purgeOldData}
                    className="ml-auto text-[9px] text-gray-600 hover:text-red-500 underline uppercase tracking-tighter"
                >
                    [ RESET PROMO DATABASE ]
                </button>
            </div>
        </div>
    );
};

export default PromoManager;
