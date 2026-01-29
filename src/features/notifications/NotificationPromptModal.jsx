import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationPromptModal = ({ pushEnabled, onEnable }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // If not enabled, show after 5 seconds
        if (!pushEnabled) {
            const timer = setTimeout(() => {
                const hasBeenShown = localStorage.getItem('notif_prompt_shown');
                if (!hasBeenShown) {
                    setIsVisible(true);
                }
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [pushEnabled]);

    const handleEnable = () => {
        onEnable();
        setIsVisible(false);
        localStorage.setItem('notif_prompt_shown', 'true');
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('notif_prompt_shown', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        onClick={handleClose}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-black border border-red-600/30 p-8 shadow-red-glow overflow-hidden"
                    >
                        {/* Tactical Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl -z-10"></div>

                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="relative">
                                <div className="w-20 h-20 bg-red-600 flex items-center justify-center shadow-red-glow rounded-none">
                                    <Bell className="text-white animate-bounce" size={40} />
                                </div>
                                <div className="absolute -inset-4 bg-red-600/20 blur-2xl rounded-full animate-pulse"></div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">
                                    ESTABLISH <span className="text-red-600">LINK</span>
                                </h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">REAL-TIME TELEMETRY SYSTEMS</p>
                            </div>

                            <p className="text-xs text-gray-400 font-bold uppercase leading-relaxed max-w-xs">
                                Sin el enlace de notificaciones activado, no recibirás las señales tácticas ni alertas críticas cuando la terminal esté cerrada.
                            </p>

                            <div className="w-full grid grid-cols-1 gap-3">
                                <button
                                    onClick={handleEnable}
                                    className="w-full py-4 bg-red-600 text-white font-black italic text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 shadow-red-glow"
                                >
                                    <span>ACTIVAR ENLACE TÁCTICO</span>
                                    <Zap size={16} />
                                </button>

                                <button
                                    onClick={handleClose}
                                    className="w-full py-2 text-[9px] font-black text-gray-700 hover:text-white uppercase tracking-widest transition-colors"
                                >
                                    [ IGNORAR ADVERTENCIA ]
                                </button>
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-red-950/20 border border-red-900/40 w-full">
                                <ShieldCheck className="text-red-600 shrink-0" size={16} />
                                <p className="text-[8px] font-bold text-gray-500 uppercase text-left leading-tight">
                                    Sitema de baja latencia certificado. Cifrado de punto a punto activo.
                                </p>
                            </div>
                        </div>

                        {/* Scanline Effect */}
                        <div className="absolute inset-0 pointer-events-none opacity-5">
                            <div className="w-full h-[1px] bg-white animate-scan"></div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default NotificationPromptModal;
