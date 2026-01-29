import React, { useState, useEffect } from 'react';
import { ShieldAlert, LogOut, Clock, Smartphone, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const PendingApproval = ({ onLogout, status = 'pending', user }) => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const isRejected = status === 'rejected';

    return (
        <div className="min-h-screen bg-black text-white font-space flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Ambience */}
            <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full ${isRejected ? 'bg-red-600/5' : 'bg-yellow-500/5'} blur-[150px] -z-10`}></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full max-w-2xl bg-black border-2 ${isRejected ? 'border-red-600 shadow-red-glow' : 'border-yellow-500 shadow-yellow-glow'} p-8 lg:p-16 relative z-10 text-center`}
            >
                <div className="flex justify-center mb-10">
                    <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${isRejected ? 'border-red-600 bg-red-600/10' : 'border-yellow-500 bg-yellow-500/10 animate-pulse'}`}>
                        <ShieldAlert size={32} className={isRejected ? 'text-red-600' : 'text-yellow-500'} />
                    </div>
                </div>

                <div className="space-y-4 mb-12">
                    <h1 className="text-4xl lg:text-7xl font-black italic tracking-tighter text-white uppercase leading-none">
                        {isRejected ? 'ACCESS' : 'SYSTEM'} <br />
                        <span className={isRejected ? 'text-red-600' : 'text-yellow-500'}>
                            {isRejected ? 'DENIED' : 'PENDING'}
                        </span>
                    </h1>
                    <p className="text-[10px] lg:text-xs font-black text-gray-400 uppercase tracking-[0.4em]">
                        {isRejected ? 'IDENTITY VERIFICATION FAILED' : `SYNCHRONIZING AUTHORIZATION${dots}`}
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 mb-10 text-left relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${isRejected ? 'text-red-600' : 'text-yellow-500'}`}>
                        <Clock size={80} />
                    </div>
                    <div className="relative z-10">
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-3 ${isRejected ? 'text-red-600' : 'text-yellow-500'}`}>REPORT PROTOCOL:</p>
                        <p className="text-xs lg:text-sm font-bold text-gray-300 leading-relaxed uppercase">
                            {isRejected
                                ? "TU SOLICITUD DE ACCESO HA SIDO RECHAZADA POR EL COMANDO CENTRAL. CONTACTA A SOPORTE SI CREES QUE ES UN ERROR."
                                : "TU REPORTE DE PAGO ESTÁ SIENDO PROCESADO POR NUESTROS ANALISTAS. ESTO SUELE TARDAR ENTRE 10 A 30 MINUTOS."}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => window.open('https://wa.me/18292198071?text=HOLA%20STEVEN.%20YA%20REPORTE%20MI%20PAGO.%20MI%20USUARIO%20ES:%20' + user?.email, '_blank')}
                        className={`flex-1 py-5 font-black italic text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-3 shadow-lg ${isRejected ? 'bg-white text-black hover:bg-red-600 hover:text-white' : 'bg-yellow-500 text-black hover:bg-white'}`}
                    >
                        CONTACT COMMAND <MessageSquare size={16} />
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex-1 py-5 bg-white/5 border border-white/10 text-white font-black italic text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                    >
                        ABORT SESSION <LogOut size={16} />
                    </button>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-6 opacity-30 grayscale">
                    <img src="https://cryptologos.cc/logos/tether-usdt-logo.png?v=026" alt="USDT" className="h-6" />
                    <img src="https://cryptologos.cc/logos/binance-coin-bnb-logo.png?v=026" alt="BNB" className="h-6" />
                    <div className="text-[10px] font-black text-white">SECURE AUTH v2.4</div>
                </div>
            </motion.div>
        </div>
    );
};

export default PendingApproval;
