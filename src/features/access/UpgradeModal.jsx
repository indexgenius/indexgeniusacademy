import React from 'react';
import { ShieldAlert, ArrowRight, MessageSquare, Zap, Crown, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UpgradeModal = ({ isOpen, onClose, targetPlan, currentPlan, onUpgrade, user }) => {
    if (!isOpen) return null;

    const PLANS_INFO = {
        'index-one': { name: 'INDEX ONE', price: 60, icon: <Zap size={24} /> },
        'index-pro': { name: 'INDEX PRO', price: 150, icon: <Crown size={24} /> },
        'index-black': { name: 'INDEX BLACK', price: 500, icon: <Star size={24} /> }
    };

    const target = PLANS_INFO[targetPlan] || PLANS_INFO['index-pro'];
    const current = PLANS_INFO[currentPlan] || PLANS_INFO['index-one'];
    const differential = Math.max(0, target.price - current.price);

    const handleSupport = () => {
        const message = `Hola, soy ${user?.email || ''}. Quiero subir de nivel mi plan ${current.name} al plan ${target.name}.`;
        const waUrl = `https://wa.me/18292198071?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-neutral-950 border border-white/10 overflow-hidden rounded-3xl shadow-[0_0_100px_rgba(220,38,38,0.2)]"
                >
                    {/* Header bg decoration */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-red-600/20 to-transparent pointer-events-none" />

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8 md:p-10 pt-12 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(220,38,38,0.4)] rotate-3">
                            <ShieldAlert size={40} className="text-white animate-pulse" />
                        </div>

                        <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-4 leading-none">
                            ACCESO <span className="text-red-600">RESTRINGIDO</span>
                        </h2>

                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed mb-8">
                            Esta sección es exclusiva para usuarios con un<br />
                            <span className="text-white">{target.name}</span> o superior.
                        </p>

                        <div className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-6 mb-8 flex items-center justify-between">
                            <div className="text-left">
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">DIFERENCIAL A PAGAR</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black italic text-white">${differential}</span>
                                    <span className="text-sm font-black text-red-600 uppercase">USD</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-red-600">
                                {target.icon}
                            </div>
                        </div>

                        <div className="w-full space-y-3">
                            <button
                                onClick={() => onUpgrade(targetPlan, differential)}
                                className="w-full py-5 bg-red-600 text-white font-black italic rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group shadow-[0_15px_40px_rgba(220,38,38,0.3)]"
                            >
                                <Zap size={20} />
                                PAGAR DIFERENCIAL
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={handleSupport}
                                className="w-full py-5 bg-white/5 text-gray-400 hover:text-white font-black italic rounded-2xl transition-all flex items-center justify-center gap-4 border border-white/5 hover:border-white/20"
                            >
                                <MessageSquare size={18} />
                                CONTACTAR SOPORTE
                            </button>
                        </div>

                        <p className="mt-8 text-[9px] font-bold text-gray-700 uppercase tracking-widest leading-relaxed">
                            * El pago se procesará de forma inmediata<br />
                            y se activará el acceso a todas las herramientas PRO/BLACK.
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UpgradeModal;
