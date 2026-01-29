import React, { useState, useEffect } from 'react';
import { ShieldAlert, LogOut, Clock, Smartphone, MessageSquare, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const SubscriptionExpired = ({ user, onLogout }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (user?.subscriptionEnd) {
            const end = user.subscriptionEnd.toDate ? user.subscriptionEnd.toDate() : new Date(user.subscriptionEnd);
            const updateTime = () => {
                const now = new Date();
                const diff = end - now;
                if (diff <= 0) {
                    setTimeLeft('EXPIRADO');
                    return;
                }
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                setTimeLeft(`${hours}H ${minutes}M`);
            };
            updateTime();
            const interval = setInterval(updateTime, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-black text-white font-space flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glitch Effect */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-red-900/40 via-transparent to-red-900/40"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl bg-black border-2 border-red-600 p-8 lg:p-12 relative z-10 shadow-[0_0_50px_rgba(220,38,38,0.3)] text-center"
            >
                <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center border-2 border-red-600 animate-pulse">
                        <ShieldAlert size={48} className="text-red-600" />
                    </div>
                </div>

                <div className="space-y-4 mb-10">
                    <h1 className="text-4xl lg:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
                        TERMINATED <br /><span className="text-red-600">CONNECTION</span>
                    </h1>
                    <p className="text-[10px] lg:text-xs font-black text-gray-500 uppercase tracking-[0.4em]">
                        Your tactical access period has reached zero
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    <div className="bg-red-600/5 border border-red-600/20 p-6 flex flex-col items-center justify-center">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Time Elapsed</span>
                        <div className="text-3xl font-black italic text-red-600">00:00:00</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 flex flex-col items-center justify-center">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Status</span>
                        <div className="text-3xl font-black italic text-white uppercase text-[16px]">INACTIVE</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => window.open('https://wa.me/18292198071?text=HOLA%20STEVEN.%20MI%20SESION%20HA%20EXPIRADO.%20QUIERO%20RENOVAR%20MI%20ACCESO.', '_blank')}
                        className="w-full py-5 bg-red-600 text-white font-black italic text-xs tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all shadow-red-glow flex items-center justify-center gap-4 group"
                    >
                        REQUEST RENEWAL [SIGNAL OPS]
                        <Smartphone size={18} className="group-hover:rotate-12 transition-transform" />
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={onLogout}
                            className="py-4 border border-white/10 text-gray-500 font-bold text-[10px] tracking-widest uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                        >
                            <LogOut size={14} /> DISCONNECT
                        </button>
                        <a
                            href="https://trading.bridgemarkets.global/register?ref=af2fad19-0a06-4b62-8&branchUuid=759c4fa8-df5b-4cdc-97ae-7"
                            target="_blank"
                            className="py-4 border border-red-600/30 text-red-600 font-bold text-[10px] tracking-widest uppercase hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3"
                        >
                            <ExternalLink size={14} /> BRIDGE ACCOUNT
                        </a>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5">
                    <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.3em]">
                        Warning: All trading signals and academy modules are now locked for this unit.
                    </p>
                </div>
            </motion.div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-[20]">
                <div className="w-full h-[1px] bg-red-600 animate-scan"></div>
            </div>
        </div>
    );
};

export default SubscriptionExpired;
