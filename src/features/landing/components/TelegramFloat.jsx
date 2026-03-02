import React, { useState, useEffect } from 'react';
import { Send, X, MessageCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TelegramFloat = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [hasBeenClosed, setHasBeenClosed] = useState(false);

    useEffect(() => {
        // Show after 3 seconds
        const timer = setTimeout(() => {
            if (!localStorage.getItem('telegram_float_closed')) {
                setIsVisible(true);
            }
        }, 3000);

        // Auto collapse after 10 seconds if not interacted
        const collapseTimer = setTimeout(() => {
            setIsExpanded(false);
        }, 13000);

        return () => {
            clearTimeout(timer);
            clearTimeout(collapseTimer);
        };
    }, []);

    const handleClose = (e) => {
        e.stopPropagation();
        setIsVisible(false);
        setHasBeenClosed(true);
        localStorage.setItem('telegram_float_closed', 'true');
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    if (!isVisible || hasBeenClosed) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: 20 }}
                        className="pointer-events-auto flex flex-col items-end gap-2"
                    >
                        <div className="relative flex items-center">
                            {/* Close button always visible when hovered or expanded */}
                            <button
                                onClick={handleClose}
                                className="absolute -top-3 -left-3 w-6 h-6 bg-black border border-white/20 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-red-600 transition-all z-20 shadow-xl"
                            >
                                <X size={12} />
                            </button>

                            <motion.div
                                layout
                                onClick={() => !isExpanded && setIsExpanded(true)}
                                className={`
                                    flex items-center gap-3 p-2 rounded-full cursor-pointer overflow-hidden
                                    bg-[#0088cc] shadow-[0_0_50px_rgba(0,136,204,0.4)] 
                                    border border-white/20 group transition-all duration-300
                                    ${isExpanded ? 'pr-6' : 'w-14 h-14 justify-center'}
                                `}
                            >
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 relative z-10">
                                        <Send size={22} className="text-white fill-white -rotate-12 translate-x-[-1px] group-hover:scale-110 transition-transform" />
                                    </div>
                                    {!isExpanded && (
                                        <div className="absolute inset-0 bg-white/30 rounded-full animate-ping pointer-events-none opacity-50" />
                                    )}
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="flex flex-col min-w-[140px]"
                                        >
                                            <p className="text-[10px] font-black italic text-white/70 leading-none uppercase tracking-tighter">ÚNETE A NUESTRO</p>
                                            <p className="text-sm font-black italic text-white leading-none uppercase tracking-tighter">CANAL TELEGRAM</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {isExpanded && (
                                    <a
                                        href="https://t.me/indexgeniusacademy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 w-10 h-10 rounded-full bg-white text-[#0088cc] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <ChevronRight size={20} strokeWidth={3} />
                                    </a>
                                )}
                            </motion.div>

                            {isExpanded && (
                                <button
                                    onClick={toggleExpand}
                                    className="ml-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all outline-none"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TelegramFloat;
