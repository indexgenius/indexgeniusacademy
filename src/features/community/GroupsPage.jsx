import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Globe, MessageSquare, Send, MessageCircle, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const GroupsPage = ({ user }) => {
    const [groups, setGroups] = useState([]);
    const [subscriptions, setSubscriptions] = useState({});
    const [loading, setLoading] = useState(true);

    const IconMap = { ShieldCheck, Globe, MessageSquare, Users, MessageCircle, Send, Facebook, Instagram, Twitter, Youtube };

    useEffect(() => {
        const unsubG = onSnapshot(collection(db, "groups"), (snap) => {
            setGroups(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
            setLoading(false);
        });
        if (user?.uid) {
            const unsubS = onSnapshot(collection(db, "users", user.uid, "subscriptions"), (snap) => {
                const s = {}; snap.docs.forEach(d => s[d.id] = true); setSubscriptions(s);
            });
            return () => { unsubG(); unsubS(); };
        }
        return () => unsubG();
    }, [user?.uid]);

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col">
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase">EXCLUSIVE <span className="text-red-600">GROUPS</span></h2>
                <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase mt-4">CONNECT WITH TACTICAL SIGNAL NETWORKS</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:gap-6">
                {groups.map((g, i) => (
                    <motion.div key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex flex-col md:flex-row items-center justify-between p-6 md:p-8 bg-black/40 border-2 border-white/5 hover:border-red-600/30 transition-all relative overflow-hidden group">
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full md:w-auto text-center sm:text-left">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-white/5 border border-white/10 rounded-full flex items-center justify-center group-hover:scale-105 transition-all overflow-hidden relative shadow-lg bg-black">
                                {['whatsapp', 'telegram', 'instagram', 'facebook', 'twitter', 'youtube', 'discord', 'crypto', 'forex', 'trading'].includes(g.icon?.toLowerCase()) || g.image ? (
                                    <img
                                        src={g.image || `/img/group-icons/${g.icon?.toLowerCase()}.png`}
                                        alt={g.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-gray-400 group-hover:text-white transition-colors">
                                        {IconMap[g.icon] ? React.createElement(IconMap[g.icon], { size: window.innerWidth < 640 ? 24 : 32 }) : <Users size={window.innerWidth < 640 ? 24 : 32} />}
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xl sm:text-3xl font-black italic text-white uppercase truncate max-w-[250px] sm:max-w-none">{g.name}</h3>
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2 sm:mt-1">
                                    <span className="bg-red-600 text-[8px] font-black px-2 py-1">{g.status}</span>
                                    {subscriptions[g.id] && <span className="bg-green-600 text-[8px] font-black px-2 py-1">SUBSCRIBED</span>}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => g.link && window.open(g.link, '_blank')} className="w-full md:w-auto mt-6 md:mt-0 px-8 md:px-12 py-4 bg-white text-black font-black text-[10px] tracking-widest uppercase hover:bg-red-600 hover:text-white transition-all transform skew-x-0 md:skew-x-[-10deg]">JOIN COMMAND</button>
                    </motion.div>
                ))}
            </div>
        </div >
    );
};

export default GroupsPage;
