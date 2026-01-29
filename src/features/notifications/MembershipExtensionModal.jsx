import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ShieldCheck, X } from 'lucide-react';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../../firebase';

const MembershipExtensionModal = ({ user, onClose }) => {
    if (!user || !user.extensionAlert || user.extensionAlert.seen) return null;

    const { daysAdded, message } = user.extensionAlert;

    const handleConfirm = async () => {
        try {
            const userRef = doc(db, "users", user.uid);
            // Mark as seen or remove the alert completely so it doesn't show again
            await updateDoc(userRef, {
                "extensionAlert.seen": true,
                "extensionAlert": deleteField() // Remove it to be clean
            });
            if (onClose) onClose();
        } catch (error) {
            console.error("Error confirming alert:", error);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            >
                <div className="absolute inset-0 bg-[url('/img/grid.png')] opacity-10 pointer-events-none"></div>

                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="w-full max-w-lg bg-black border border-green-500/30 p-1 relative overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.1)]"
                >
                    {/* Decorative Scan Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>

                    <div className="bg-black border border-white/5 p-8 relative">
                        {/* Header Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-green-900/10 rounded-full flex items-center justify-center border border-green-500/30 relative">
                                <div className="absolute inset-0 rounded-full border border-green-500/20 w-full h-full animate-ping opacity-20"></div>
                                <ShieldCheck size={40} className="text-green-500" />
                            </div>
                        </div>

                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                                ACTUALIZACIÓN DE <span className="text-green-500">SISTEMA</span>
                            </h2>

                            <div className="bg-white/5 border border-white/5 p-4 my-6">
                                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">ATENCIÓN OPERADOR:</p>
                                <p className="text-sm font-bold text-white uppercase tracking-wider mb-1">{user.displayName || 'TRADER'}</p>
                                <p className="text-[10px] text-gray-500 font-mono">{user.email}</p>
                            </div>

                            <p className="text-gray-300 text-sm font-medium leading-relaxed uppercase tracking-wide">
                                {message || `NOS COMPLACE INFORMARTE QUE SE HAN AGREGADO ${daysAdded} DÍAS EXTRA A TU MEMBRESÍA COMO COMPENSACIÓN POR EL MANTENIMIENTO RECIENTE.`}
                            </p>

                            <div className="py-4">
                                <span className="inline-block bg-green-500/10 text-green-500 border border-green-500/30 px-6 py-2 text-xl font-black italic tracking-tighter uppercase">
                                    +{daysAdded} DÍAS EXTENDIDOS
                                </span>
                            </div>

                            <p className="text-[10px] text-gray-600 font-black tracking-widest uppercase mt-4">
                                INDEX GENIUS GOLD • COMANDO ADMINISTRATIVO
                            </p>
                        </div>

                        <button
                            onClick={handleConfirm}
                            className="w-full mt-8 bg-white text-black hover:bg-green-500 hover:text-white transition-all py-4 font-black italic uppercase tracking-widest text-sm skew-x-[-12deg]"
                        >
                            CONFIRMAR RECEPCIÓN
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MembershipExtensionModal;
