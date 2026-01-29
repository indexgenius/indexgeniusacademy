import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

const PromoModal = () => {
    const [promos, setPromos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "promos"), orderBy("order", "asc"));

        const unsub = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(p => p.active);
            setPromos(list);

            if (list.length > 0) {
                // Show after a small delay on load
                const timer = setTimeout(() => {
                    const hasBeenShown = sessionStorage.getItem('promo_shown');
                    if (!hasBeenShown) {
                        setIsOpen(true);
                    }
                }, 2000);
                return () => clearTimeout(timer);
            }
        });

        return () => unsub();
    }, []);

    const closePromo = () => {
        setIsOpen(false);
        sessionStorage.setItem('promo_shown', 'true');
    };

    const nextPromo = () => {
        setCurrentIndex((prev) => (prev + 1) % promos.length);
    };

    const prevPromo = () => {
        setCurrentIndex((prev) => (prev - 1 + promos.length) % promos.length);
    };

    if (!isOpen || promos.length === 0) return null;

    const currentPromo = promos[currentIndex];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/95 backdrop-blur-sm"
                onClick={closePromo}
            ></motion.div>

            {/* Modal Content */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-lg bg-black border border-white/10 shadow-2xl overflow-hidden group"
            >
                {/* Close Button */}
                <button
                    onClick={closePromo}
                    className="absolute top-4 right-4 z-[60] p-2 bg-black/50 text-white hover:bg-red-600 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Progress Indicators */}
                {promos.length > 1 && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] flex gap-1.5">
                        {promos.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-red-600' : 'w-2 bg-white/20'}`}
                            />
                        ))}
                    </div>
                )}

                {/* Navigation Arrows */}
                {promos.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prevPromo(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-[60] p-3 bg-black/40 text-white hover:bg-red-600 transition-all rounded-full"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextPromo(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-[60] p-3 bg-black/40 text-white hover:bg-red-600 transition-all rounded-full"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPromo.id}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        {/* Promo Image */}
                        <div className="relative aspect-[4/5] w-full overflow-hidden">
                            <img
                                src={currentPromo.imageUrl}
                                alt={currentPromo.title}
                                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                            />

                            {/* Glowing effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 to-transparent pointer-events-none opacity-60"></div>
                        </div>

                        {/* Footer / Action */}
                        <div className="p-6 space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black italic tracking-tighter text-white uppercase transform -skew-x-6">
                                    {currentPromo.title.split(' ')[0]} <span className="text-red-600">{currentPromo.title.split(' ').slice(1).join(' ')}</span>
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                    {currentPromo.description}
                                </p>
                            </div>

                            {currentPromo.link && currentPromo.link !== '#' && (
                                <a
                                    href={currentPromo.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-4 bg-[#6322ad] text-white text-xs font-black tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(99,34,173,0.4)] flex items-center justify-center gap-3 group"
                                >
                                    <span>OBTENER LOS BENEFICIOS</span>
                                    <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </a>
                            )}

                            <button
                                onClick={closePromo}
                                className="w-full text-center text-[9px] font-black text-gray-700 hover:text-white uppercase tracking-widest transition-colors py-2"
                            >
                                [ CONTINUE TO TERMINAL ]
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div className="w-full h-[1px] bg-white animate-scan"></div>
                </div>
            </motion.div>
        </div>
    );
};

export default PromoModal;
