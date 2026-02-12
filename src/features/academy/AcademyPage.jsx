import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import ModuleCard from './components/ModuleCard';
import VideoCard from './components/VideoCard';
import { getEmbedUrl } from '../../utils/mediaUtils';


const AcademyPage = ({ user }) => {
    const [videos, setVideos] = useState([]);
    const [activeVideo, setActiveVideo] = useState(null);
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('BEGINNER');
    const [activeModule, setActiveModule] = useState(null);
    const [subscribedModules, setSubscribedModules] = useState(user?.subscribedModules || []);

    const LEVELS = [
        { id: 'BEGINNER', label: 'PRINCIPIANTE', desc: 'BASIC TRAINING' },
        { id: 'INTERMEDIATE', label: 'INTERMEDIO', desc: 'TACTICAL OPS' },
        { id: 'ADVANCED', label: 'AVANZADO', desc: 'ELITE WARFARE' },
        { id: 'ELITE (VIP)', label: 'EXPERTO', desc: 'TOP SECRET' }
    ];

    useEffect(() => {
        const unsubVideos = onSnapshot(collection(db, "academy_videos"), (snap) => {
            setVideos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        if (user?.uid) {
            const unsubProg = onSnapshot(collection(db, "users", user.uid, "progress"), (snap) => {
                const p = {}; snap.docs.forEach(d => p[d.id] = d.data().completed);
                setProgress(p); setLoading(false);
            });
            return () => { unsubVideos(); unsubProg(); };
        }
        return () => unsubVideos();
    }, [user?.uid]);

    const toggleSubscription = async (mName) => {
        const isSub = subscribedModules.includes(mName);
        setSubscribedModules(isSub ? subscribedModules.filter(m => m !== mName) : [...subscribedModules, mName]);
        await updateDoc(doc(db, "users", user.uid), {
            subscribedModules: isSub ? arrayRemove(mName) : arrayUnion(mName)
        });
    };

    const toggleProgress = async (vidId) => {
        const curr = !!progress[vidId];
        setProgress(p => ({ ...p, [vidId]: !curr }));
        await setDoc(doc(db, "users", user.uid, "progress", vidId), { completed: !curr, updatedAt: serverTimestamp() });
    };

    const currentVideos = videos.filter(v => !v.blocked && v.level === activeTab);
    const modulesMap = currentVideos.reduce((acc, v) => {
        const m = v.module || 'GENERAL DECLASSIFIED';
        if (!acc[m]) acc[m] = []; acc[m].push(v); return acc;
    }, {});

    const levelProgress = currentVideos.length === 0 ? 0 : Math.round((currentVideos.filter(v => progress[v.id]).length / currentVideos.length) * 100);

    return (
        <div className="space-y-8">
            <div className="flex flex-col">
                <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase">ACADEMY <span className="text-red-600">HUB</span></h2>
                <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">CLASSIFIED EDUCATIONAL MATERIAL</p>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-1">
                {LEVELS.map(l => (
                    <button key={l.id} onClick={() => { setActiveTab(l.id); setActiveModule(null); }} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest skew-x-[-10deg] ${activeTab === l.id ? 'bg-red-600 text-white shadow-red-glow' : 'bg-white/5 text-gray-500 hover:text-white'}`}>
                        {l.label}
                    </button>
                ))}
            </div>

            <div className="bg-black border border-white/10 p-6 relative overflow-hidden">
                <div className="flex justify-between items-end mb-2 relative z-10">
                    <h3 className="text-xl font-black italic text-white uppercase">{LEVELS.find(l => l.id === activeTab)?.label} PROGRESS</h3>
                    <div className="text-4xl font-black text-white/10">{levelProgress}%</div>
                </div>
                <div className="w-full h-1 bg-white/5 relative z-10"><div className="h-full bg-red-600 shadow-red-glow transition-all duration-1000" style={{ width: `${levelProgress}%` }} /></div>
            </div>

            {!activeModule ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.keys(modulesMap).sort().map(m => (
                        <ModuleCard key={m} name={m} videoCount={modulesMap[m].length} completedCount={modulesMap[m].filter(v => progress[v.id]).length} isSubscribed={subscribedModules.includes(m)} onToggleSubscription={() => toggleSubscription(m)} onClick={() => setActiveModule(m)} />
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    <button onClick={() => setActiveModule(null)} className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest bg-white/5 px-4 py-2 border-l-2 border-red-600 transition-all"><ArrowLeft size={14} /> BACK TO MODULES</button>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modulesMap[activeModule].map(v => (
                            <VideoCard key={v.id} video={v} isCompleted={!!progress[v.id]} onPlay={() => setActiveVideo(v)} onToggleProgress={() => toggleProgress(v.id)} onShare={() => { }} isSubscribed={false} onToggleSubscription={() => { }} />
                        ))}
                    </div>
                </div>
            )}

            <AnimatePresence>
                {activeVideo && (
                    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-6xl aspect-video bg-black border-2 border-red-600/30 relative overflow-hidden">
                            <button onClick={() => setActiveVideo(null)} className="absolute top-4 right-4 z-50 text-white/40 hover:text-white"><Plus size={32} className="rotate-45" /></button>
                            <iframe src={getEmbedUrl(activeVideo.videoUrl)} title={activeVideo.title} className="w-full h-full" allowFullScreen />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AcademyPage;
