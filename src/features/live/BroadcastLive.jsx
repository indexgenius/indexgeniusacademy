import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Square, Play, Trash2, ShieldCheck, Monitor, Info, ArrowRight, X } from 'lucide-react';
import { liveService } from '../../services/liveService';
import { auth } from '../../firebase';

const BroadcastLive = ({ user }) => {
    const [isLive, setIsLive] = useState(false);
    const [liveTitle, setLiveTitle] = useState('');
    const [liveDescription, setLiveDescription] = useState('');
    const [currentLiveId, setCurrentLiveId] = useState(null);
    const [roomUrl, setRoomUrl] = useState('');
    const [existingLives, setExistingLives] = useState([]);
    const [showStartForm, setShowStartForm] = useState(false);

    useEffect(() => {
        const unsub = liveService.subscribeToLives((lives) => {
            setExistingLives(lives);
            // Check if we are already live (e.g. if we refresh)
            const myLive = lives.find(l => l.hostEmail === user.email);
            if (myLive && !isLive) {
                setCurrentLiveId(myLive.id);
                setRoomUrl(myLive.roomUrl);
                setLiveTitle(myLive.title);
                setIsLive(true);
            }
        });
        return () => unsub();
    }, [user.email, isLive]);

    const handleStartLive = async () => {
        if (!liveTitle.trim()) {
            alert('Por favor ingresa un título para la clase');
            return;
        }

        try {
            const roomName = `IndexGenius-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const miroUrl = `https://p2p.mirotalk.com/join/${roomName}`;

            const liveData = {
                title: liveTitle,
                description: liveDescription,
                roomUrl: miroUrl,
                status: 'live',
                hostEmail: user.email,
                viewers: 0
            };

            const docRef = await liveService.createLive(liveData);
            setCurrentLiveId(docRef.id);
            setRoomUrl(miroUrl);
            setIsLive(true);
            setShowStartForm(false);
        } catch (error) {
            console.error('Error starting live:', error);
            alert('Error al iniciar la transmisión: ' + error.message);
        }
    };

    const handleStopLive = async () => {
        if (!confirm('¿Seguro que quieres finalizar la clase en vivo?')) return;

        try {
            if (currentLiveId) {
                await liveService.deleteLive(currentLiveId);
            }
            setIsLive(false);
            setCurrentLiveId(null);
            setRoomUrl('');
        } catch (error) {
            console.error('Error stopping live:', error);
            alert('Error al detener la transmisión: ' + error.message);
        }
    };

    const handleCleanAllLives = async () => {
        if (!confirm('¿BORRAR TODAS las sesiones activas? Haz esto solo si hay errores.')) return;
        try {
            for (const live of existingLives) {
                await liveService.deleteLive(live.id);
            }
        } catch (error) {
            console.error('Error cleaning lives:', error);
        }
    };

    if (isLive) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-600/10 border border-red-600/20">
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-red-600 text-[10px] font-black italic uppercase tracking-[0.2em] animate-pulse">🔴 EN VIVO</div>
                        <h3 className="text-[12px] font-black tracking-widest uppercase text-white">{liveTitle}</h3>
                    </div>
                    <button
                        onClick={handleStopLive}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-white hover:text-red-600 transition-all text-white text-[10px] font-black uppercase tracking-widest"
                    >
                        <Square size={14} fill="currentColor" />
                        FINALIZAR TRANSMISIÓN
                    </button>
                </div>

                <div className="relative aspect-video bg-black border border-white/5">
                    <iframe
                        src={roomUrl}
                        className="w-full h-full border-none"
                        allow="camera; microphone; display-capture; fullscreen; speaker; self; autoplay"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-6">
                <div className="p-8 lg:p-12 bg-white/5 border border-white/5 flex flex-col items-center text-center justify-center min-h-[400px]">
                    <div className="w-20 h-20 bg-red-600/10 border border-red-600/20 flex items-center justify-center mb-8 relative">
                        <Video size={40} className="text-red-600" />
                        <div className="absolute inset-0 bg-red-600/10 blur-3xl animate-pulse"></div>
                    </div>

                    <h2 className="text-2xl lg:text-3xl font-black italic tracking-tighter uppercase mb-4">
                        Centro de <span className="text-red-600">Transmisión</span> P2P
                    </h2>
                    <p className="text-gray-500 font-bold text-xs lg:text-sm max-w-md uppercase tracking-[0.2em] leading-relaxed mb-10">
                        Emite tus análisis de mercado en HD sin límites de tiempo. Comparte pantalla, audio y video con toda la comunidad.
                    </p>

                    <button
                        onClick={() => setShowStartForm(true)}
                        className="px-10 py-5 bg-red-600 hover:bg-white hover:text-red-600 transition-all text-white font-black italic text-sm tracking-[0.4em] uppercase flex items-center gap-4 group shadow-red-glow"
                    >
                        INICIAR NUEVA SESIÓN <Play size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="p-6 bg-white/5 border border-white/5 space-y-4">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <ShieldCheck size={20} />
                            <h3 className="text-[11px] font-black tracking-widest uppercase">Protocolo P2P v4.0</h3>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-[9px] font-bold text-gray-500 uppercase">
                                <div className="w-1.5 h-1.5 bg-red-600 shrink-0 mt-1"></div>
                                100% Gratuito y sin límites de tiempo.
                            </li>
                            <li className="flex items-start gap-2 text-[9px] font-bold text-gray-500 uppercase">
                                <div className="w-1.5 h-1.5 bg-red-600 shrink-0 mt-1"></div>
                                Compartir pantalla en HD (Optimizado para charts).
                            </li>
                            <li className="flex items-start gap-2 text-[9px] font-bold text-gray-500 uppercase">
                                <div className="w-1.5 h-1.5 bg-red-600 shrink-0 mt-1"></div>
                                Grabación local disponible en el panel de MiroTalk.
                            </li>
                        </ul>
                    </div>

                    {existingLives.length > 0 && (
                        <div className="p-6 bg-black border border-white/5 space-y-4">
                            <h3 className="text-[10px] font-black tracking-widest uppercase text-gray-600 flex items-center justify-between">
                                SALAS ACTIVAS ({existingLives.length})
                                <button onClick={handleCleanAllLives} className="text-red-600 hover:text-white transition-colors">
                                    <Trash2 size={12} />
                                </button>
                            </h3>
                            {existingLives.map(l => (
                                <div key={l.id} className="p-3 bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                                    <div className="truncate">
                                        <p className="text-[10px] font-black uppercase text-white truncate">{l.title}</p>
                                        <p className="text-[8px] font-bold text-gray-500 uppercase truncate">{l.hostEmail}</p>
                                    </div>
                                    <button
                                        onClick={() => liveService.deleteLive(l.id)}
                                        className="p-2 text-gray-600 hover:text-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showStartForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/90 backdrop-blur-xl"
                            onClick={() => setShowStartForm(false)}
                        ></motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-black border-2 border-red-600 p-8 lg:p-12 w-full max-w-xl z-10 shadow-red-glow relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white mb-2">Lanzar <span className="text-red-600">Sesión</span> de Clase</h2>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-8 pb-4 border-b border-white/10">Configure los detalles del enlace cifrado.</p>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Título de la Sesión</label>
                                    <input
                                        type="text"
                                        value={liveTitle}
                                        onChange={e => setLiveTitle(e.target.value)}
                                        placeholder="EJ: ANÁLISIS PRE-MERCADO NYSE"
                                        className="w-full bg-white/5 border border-white/10 p-4 text-[12px] font-black uppercase tracking-widest outline-none focus:border-red-600 transition-colors placeholder:text-gray-700"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Descripción / Instrucciones</label>
                                    <textarea
                                        rows={3}
                                        value={liveDescription}
                                        onChange={e => setLiveDescription(e.target.value)}
                                        placeholder="¿QUÉ APRENDERÁN LOS ESTUDIANTES HOY?"
                                        className="w-full bg-white/5 border border-white/10 p-4 text-[12px] font-black uppercase tracking-widest outline-none focus:border-red-600 transition-colors placeholder:text-gray-700"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <button
                                        onClick={() => setShowStartForm(false)}
                                        className="py-4 border border-white/10 text-gray-500 font-black italic text-[11px] tracking-widest uppercase hover:text-white transition-colors"
                                    >
                                        CANCELAR
                                    </button>
                                    <button
                                        onClick={handleStartLive}
                                        className="py-4 bg-red-600 text-white font-black italic text-[11px] tracking-widest uppercase hover:bg-white hover:text-red-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        DESPLEGAR SEÑAL <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BroadcastLive;
