import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Clock, BookOpen, Lock } from 'lucide-react';
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

    const userPlan = user?.planId || 'index-one';
    const isAdmin = user?.email?.toLowerCase() === 'admin' || user?.email?.toLowerCase() === 'steven@ingenius.fx' || user?.canBroadcast;

    const canAccessLevel = (levelId) => {
        if (isAdmin) return true;
        if (levelId === 'BEGINNER') return true;
        // All other levels require index-pro or index-black
        return userPlan === 'index-pro' || userPlan === 'index-black';
    };

    const handleLevelClick = (level) => {
        if (!canAccessLevel(level.id)) {
            alert(`🔒 NIVEL BLOQUEADO: El contenido ${level.label} es exclusivo para miembros con un PLAN PRO o BLACK.\n\nCompleta el nivel principiante y sube de nivel para desbloquear estas estrategias avanzadas.`);
            return;
        }
        setActiveTab(level.id);
        setActiveModule(null);
    };

    const currentVideos = videos.filter(v => !v.blocked && v.level === activeTab);
    const modulesMap = currentVideos.reduce((acc, v) => {
        const m = v.module || 'GENERAL DECLASSIFIED';
        if (!acc[m]) acc[m] = []; acc[m].push(v); return acc;
    }, {});

    const currentModuleVideos = activeModule ? (modulesMap[activeModule] || []) : [];
    const activeVideoIndex = currentModuleVideos.findIndex(v => v.id === activeVideo?.id);
    const prevVideo = activeVideoIndex > 0 ? currentModuleVideos[activeVideoIndex - 1] : null;
    const nextVideo = activeVideoIndex < currentModuleVideos.length - 1 ? currentModuleVideos[activeVideoIndex + 1] : null;

    const levelProgress = currentVideos.length === 0 ? 0 : Math.round((currentVideos.filter(v => progress[v.id]).length / currentVideos.length) * 100);

    return (
        <div className="space-y-8">
            <div className="flex flex-col">
                <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase">ACADEMY <span className="text-red-600">HUB</span></h2>
                <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Contenido educativo clasificado para tu evolución como trader</p>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-1">
                {LEVELS.map(l => {
                    const blocked = !canAccessLevel(l.id);
                    return (
                        <button
                            key={l.id}
                            onClick={() => handleLevelClick(l)}
                            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest skew-x-[-10deg] transition-all relative ${activeTab === l.id
                                ? 'bg-red-600 text-white shadow-red-glow'
                                : blocked ? 'bg-white/5 text-gray-700 opacity-50 cursor-not-allowed' : 'bg-white/5 text-gray-500 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {l.label}
                                {blocked && <Lock size={10} className="text-red-600" />}
                            </div>
                        </button>
                    );
                })}
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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[500] flex items-center justify-center p-4 lg:p-12"
                    >
                        {/* Shadow Glow Background */}
                        <div className="absolute inset-0 bg-red-600/5 mix-blend-overlay pointer-events-none" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none" />

                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-6xl relative group"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setActiveVideo(null)}
                                className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-all hover:rotate-90"
                            >
                                <Plus size={32} className="rotate-45" />
                            </button>

                            {/* Main Player Frame with Click Shields */}
                            <div className="relative aspect-video bg-black ring-1 ring-white/10 shadow-[0_0_100px_rgba(220,38,38,0.15)] overflow-hidden">
                                <iframe
                                    src={getEmbedUrl(activeVideo.videoUrl)}
                                    title={activeVideo.title}
                                    className="absolute inset-0 w-[101%] h-[101%] -left-[0.5%] -top-[0.5%] border-0"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                />

                                {/* SECURITY SHIELDS: Intercept clicks on YouTube branding */}
                                <div className="absolute top-0 right-0 w-32 h-20 z-10 cursor-default" onClick={e => e.stopPropagation()} /> {/* Blocks top-right share/watch later */}
                                <div className="absolute bottom-12 right-0 w-40 h-16 z-10 cursor-default" onClick={e => e.stopPropagation()} /> {/* Blocks "Watch on YouTube" button */}

                                {/* Navigation Arrows */}
                                {prevVideo && (
                                    <button
                                        onClick={() => setActiveVideo(prevVideo)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black/60 backdrop-blur-md border border-white/10 text-white/40 hover:text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 hidden lg:flex"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                )}
                                {nextVideo && (
                                    <button
                                        onClick={() => setActiveVideo(nextVideo)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black/60 backdrop-blur-md border border-white/10 text-white/40 hover:text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 hidden lg:flex"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                )}
                            </div>

                            {/* Video Info Strip */}
                            <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-white/[0.03] border border-white/5 backdrop-blur-sm">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-red-600 text-[10px] font-black px-2 py-0.5 text-white tracking-widest">{activeVideo.level}</span>
                                        <span className="text-[10px] font-bold text-gray-500 tracking-[0.3em] uppercase">{activeModule}</span>
                                    </div>
                                    <h2 className="text-xl lg:text-3xl font-black italic text-white uppercase tracking-tighter">{activeVideo.title}</h2>
                                </div>

                                <div className="flex items-center gap-6 text-gray-400">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">DURATION</span>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-red-600" />
                                            <span className="text-sm font-black text-white">{activeVideo.duration} MIN</span>
                                        </div>
                                    </div>
                                    <div className="w-px h-10 bg-white/10" />
                                    {nextVideo && (
                                        <div onClick={() => setActiveVideo(nextVideo)} className="cursor-pointer group/next">
                                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1 block text-right">UP NEXT</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-white/60 group-hover/next:text-white transition-colors uppercase">{nextVideo.title}</span>
                                                <ChevronRight size={16} className="text-red-600 group-hover/next:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AcademyPage;
