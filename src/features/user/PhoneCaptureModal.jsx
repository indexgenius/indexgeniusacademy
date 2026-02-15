import React, { useState, useEffect } from 'react';
import { Phone, Check, Smartphone, ShieldAlert, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const PhoneCaptureModal = ({ user }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Show if user is logged in, approved, and missing phone
        if (user?.uid && user?.status === 'approved' && !user?.phone) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 2000); // 2 seconds delay after enter
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!phone || phone.length < 8) {
            setError('INGRESA UN NÚMERO VÁLIDO');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                phone: phone,
                phoneUpdated: true // Flag to know it was updated via this modal
            });
            setIsVisible(false);
        } catch (err) {
            console.error("Error updating phone:", err);
            setError('ERROR AL GUARDAR. REINTENTA.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-black border border-red-600/50 p-8 shadow-[0_0_50px_rgba(220,38,38,0.2)] overflow-hidden"
                    >
                        {/* Industrial Accents */}
                        <div className="absolute top-0 left-0 w-2 h-full bg-red-600 opacity-50"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl -z-10"></div>

                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 bg-red-600/10 border border-red-600/30 rounded-full flex items-center justify-center relative">
                                <Smartphone className="text-red-600 animate-pulse" size={40} />
                                <div className="absolute -top-1 -right-1">
                                    <div className="w-6 h-6 bg-red-600 flex items-center justify-center">
                                        <ShieldAlert size={14} className="text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">
                                    REGISTER <span className="text-red-600">CONTACT</span>
                                </h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">TACTICAL COMMS REQUIRED</p>
                            </div>

                            <p className="text-xs text-gray-400 font-bold uppercase leading-relaxed">
                                DETECTAMOS QUE TU PERFIL NO TIENE UN TELÉFONO VINCULADO. ES NECESARIO PARA RECIBIR ALERTAS CRÍTICAS Y SOPORTE DIRECTO.
                            </p>

                            <form onSubmit={handleSave} className="w-full space-y-4">
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="EJ: +18290000000"
                                        className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm font-bold text-white outline-none focus:border-red-600 transition-colors uppercase"
                                        required
                                        autoFocus
                                    />
                                </div>

                                {error && <p className="text-[10px] font-black text-red-600 tracking-widest uppercase">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-red-600 text-white font-black italic text-sm tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                                >
                                    {loading ? 'SYNCING...' : 'VINCULAR TERMINAL'}
                                    <Check size={20} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </form>

                            <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest">
                                ESTA ACCIÓN ES REQUERIDA POR ÚNICA VEZ PARA COMPLETAR TU INTEGRACIÓN.
                            </p>
                        </div>

                        {/* Scanline Effect */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-[20]">
                            <div className="w-full h-[1px] bg-red-600 animate-scan"></div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PhoneCaptureModal;
