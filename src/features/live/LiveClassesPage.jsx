import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Monitor, ShieldCheck, Zap, Globe, Users, Maximize2, ExternalLink } from 'lucide-react';
import { liveService } from '../../services/liveService';

const LiveClassesPage = ({ user }) => {
    const [activeLives, setActiveLives] = useState([]);
    const [selectedLive, setSelectedLive] = useState(null);

    useEffect(() => {
        const unsub = liveService.subscribeToLives((lives) => {
            setActiveLives(lives);
            // Selection logic moved inside
            if (lives.length > 0) {
                if (!selectedLiveRef.current || !lives.find(l => l.id === selectedLiveRef.current.id)) {
                    setSelectedLive(lives[0]);
                }
            } else {
                setSelectedLive(null);
            }
        });
        return () => unsub();
    }, []); // Run only once

    const selectedLiveRef = React.useRef(selectedLive);
    useEffect(() => {
        selectedLiveRef.current = selectedLive;
    }, [selectedLive]);

    if (!selectedLive) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 pb-20">
                <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative">
                    <Video size={40} className="text-gray-600" />
                    <div className="absolute inset-0 bg-red-600/5 blur-2xl"></div>
                </div>
                <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-4">
                    Sin Clases al <span className="text-red-600">Aire</span>
                </h2>
                <p className="text-gray-500 font-bold text-xs lg:text-sm max-w-md uppercase tracking-widest leading-relaxed">
                    No hay transmisiones activas en este momento. Recibirás una notificación push cuando un mentor inicie una sesión en vivo.
                </p>
                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                    <div className="p-6 bg-white/5 border border-white/5 text-left">
                        <Monitor size={16} className="text-red-600 mb-3" />
                        <h4 className="text-[10px] font-black tracking-widest uppercase mb-2">HD Streaming</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase">Calidad ultra clara para ver cada detalle de los gráficos.</p>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/5 text-left">
                        <Globe size={16} className="text-red-600 mb-3" />
                        <h4 className="text-[10px] font-black tracking-widest uppercase mb-2">Baja Latencia</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase">Tecnología P2P para una conexión instantánea con el mentor.</p>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/5 text-left">
                        <Users size={16} className="text-red-600 mb-3" />
                        <h4 className="text-[10px] font-black tracking-widest uppercase mb-2">Chat Interactivo</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase">Resuelve tus dudas en tiempo real durante la sesión.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-600 text-[10px] font-black italic uppercase tracking-widest animate-pulse">
                            <Video size={12} />
                            CLASE EN VIVO
                        </div>
                        <span className="text-gray-500 text-[10px] font-bold tracking-widest uppercase italic">
                            {selectedLive.viewers || 0} ESTUDIANTES CONECTADOS
                        </span>
                    </div>
                    <h1 className="text-2xl lg:text-4xl font-black italic tracking-tighter uppercase leading-none">
                        {selectedLive.title}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.open(selectedLive.roomUrl, '_blank')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        <ExternalLink size={14} />
                        Abrir en Ventana Nueva
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                <div className="relative aspect-video bg-black border border-white/5 shadow-2xl overflow-hidden group">
                    <iframe
                        src={selectedLive.roomUrl}
                        className="w-full h-full border-none"
                        allow="camera; microphone; display-capture; fullscreen; speaker; self; autoplay"
                    />

                    {/* Overlay effects */}
                    <div className="absolute top-4 left-4 p-3 bg-black/60 backdrop-blur-md border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                            <span className="text-[8px] font-black tracking-[0.2em] text-white">CONNECTION: SECURE</span>
                        </div>
                        <p className="text-[7px] font-bold text-gray-400 uppercase">ENCRYPTED P2P FEED v4.2</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 bg-white/5 border border-white/5 space-y-4">
                        <h3 className="text-[12px] font-black tracking-widest uppercase border-b border-white/5 pb-3">Detalles de la Sesión</h3>
                        <p className="text-[11px] text-gray-400 font-bold leading-relaxed uppercase">
                            {selectedLive.description || 'Sin descripción disponible para esta clase.'}
                        </p>

                        <div className="space-y-2 pt-4">
                            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                                <span className="text-gray-500">Instructor:</span>
                                <span className="text-white">{selectedLive.hostEmail?.split('@')[0] || 'INDEX GENIUS'}</span>
                            </div>
                            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                                <span className="text-gray-500">Calidad:</span>
                                <span className="text-green-500">HD 1080P</span>
                            </div>
                            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                                <span className="text-gray-500">Plataforma:</span>
                                <span className="text-blue-500">MiroTalk P2P</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-red-600/5 border border-red-600/20">
                        <div className="flex items-start gap-4 mb-4">
                            <ShieldCheck size={20} className="text-red-600 shrink-0" />
                            <div>
                                <h4 className="text-[10px] font-black tracking-widest uppercase text-white mb-1">PROTOCOLO DE SEGURIDAD</h4>
                                <p className="text-[9px] text-gray-500 font-bold uppercase leading-tight">
                                    Tu micrófono y cámara están desactivados por defecto. Solo el mentor puede habilitar el audio general.
                                </p>
                            </div>
                        </div>
                        <button
                            className="w-full py-3 bg-red-600 hover:bg-white hover:text-red-600 transition-all text-white text-[10px] font-black uppercase tracking-[0.2em] italic"
                        >
                            REPORTAR PROBLEMA TÉCNICO
                        </button>
                    </div>

                    {activeLives.length > 1 && (
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black tracking-widest uppercase text-gray-500">Otras Salas Activas</h3>
                            {activeLives.filter(l => l.id !== selectedLive.id).map(l => (
                                <button
                                    key={l.id}
                                    onClick={() => setSelectedLive(l)}
                                    className="w-full p-4 bg-white/5 border border-white/5 hover:border-red-600/50 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                                        <span className="text-[9px] font-black tracking-widest uppercase text-white">{l.title}</span>
                                    </div>
                                    <p className="text-[8px] text-gray-500 font-bold uppercase truncate">{l.description}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveClassesPage;
