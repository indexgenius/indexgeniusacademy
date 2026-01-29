import React, { useState, useEffect } from 'react';
import { Megaphone, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const AnnouncementsPage = ({ user }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [readIds, setReadIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem(`read_announcements_${user?.uid}`);
        if (saved) setReadIds(new Set(JSON.parse(saved)));
        const q = query(collection(db, "announcements"), orderBy("timestamp", "desc"));
        return onSnapshot(q, (snap) => {
            setAnnouncements(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
    }, [user?.uid]);

    const markAsRead = (id) => {
        if (readIds.has(id)) return;
        const n = new Set(readIds); n.add(id); setReadIds(n);
        localStorage.setItem(`read_announcements_${user?.uid}`, JSON.stringify([...n]));
        window.dispatchEvent(new Event('storage'));
    };

    const sel = announcements.find(a => a.id === selectedId);

    if (loading) return <div className="p-20 text-center animate-pulse text-red-600 font-black tracking-widest uppercase">SYNCING INTEL...</div>;

    return (
        <div className="space-y-8 h-full">
            <AnimatePresence mode="wait">
                {!selectedId ? (
                    <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 lg:space-y-8">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl lg:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">INDEX <span className="text-red-600">NEWS</span></h2>
                                <p className="text-[8px] lg:text-[10px] font-black tracking-widest text-gray-500 uppercase mt-2 lg:mt-4">OFFICIAL NETWORK UPDATES</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {announcements.map((a, i) => (
                                <div key={a.id} onClick={() => { setSelectedId(a.id); markAsRead(a.id); }} className={`flex items-center gap-3 lg:gap-4 p-3 lg:p-4 border-b border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors ${!readIds.has(a.id) ? 'bg-red-600/[0.02]' : 'opacity-60'}`}>
                                    <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${!readIds.has(a.id) ? 'bg-red-600 shadow-red-glow' : 'bg-transparent'}`} />
                                    <h3 className={`text-sm lg:text-base font-black italic uppercase truncate flex-1 ${!readIds.has(a.id) ? 'text-white' : 'text-gray-400'}`}>{a.title}</h3>
                                    <span className="text-[8px] lg:text-[10px] font-black text-gray-700 uppercase">{a.timestamp?.toMillis() ? new Date(a.timestamp.toMillis()).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 lg:space-y-8">
                        <div className="flex items-center gap-4 lg:gap-6">
                            <button onClick={() => setSelectedId(null)} className="p-3 lg:p-4 border border-white/10 text-white hover:bg-white hover:text-black transition-all"><ArrowLeft size={16} className="lg:w-5 lg:h-5" /></button>
                            <h1 className="text-2xl lg:text-4xl font-black italic text-white uppercase leading-none">{sel?.title}</h1>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 lg:p-8 min-h-[400px] space-y-6">
                            {sel?.imageUrl && (
                                <div className="w-full max-w-2xl mx-auto border border-white/10 shadow-2xl">
                                    <img src={sel.imageUrl} alt={sel.title} className="w-full h-auto object-contain" />
                                </div>
                            )}
                            <p className="text-base lg:text-lg text-gray-300 italic whitespace-pre-wrap leading-relaxed">{sel?.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AnnouncementsPage;
