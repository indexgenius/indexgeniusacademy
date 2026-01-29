import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, PlusSquare, MoreVertical } from 'lucide-react';

const InstallModal = ({ type, onClose }) => {
    return (
        <AnimatePresence>
            {type && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-lg w-full bg-black border-2 border-white/10 p-10 relative shadow-2xl">
                        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-2">{type === 'ios' ? 'IOS INSTALLATION' : 'ANDROID INSTALLATION'}</h3>
                        <p className="text-[10px] font-black tracking-widest text-red-600 uppercase mb-8">Follow these steps carefully</p>
                        <div className="space-y-6">
                            {type === 'ios' ? (
                                <>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-[11px] font-black shrink-0">01</div>
                                        <p className="text-xs font-bold uppercase mt-1 text-gray-300">Open this link in <span className="text-white">Safari Browser</span>.</p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-[11px] font-black shrink-0">02</div>
                                        <p className="text-xs font-bold uppercase mt-1 text-gray-300">Tap the <span className="text-blue-500">Share Icon</span> <Share size={16} className="inline mx-1" />.</p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-[11px] font-black shrink-0">03</div>
                                        <p className="text-xs font-bold uppercase mt-1 text-gray-300">Select <span className="text-white">"Add to Home Screen"</span> <PlusSquare size={16} className="inline mx-1" />.</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-[11px] font-black shrink-0">01</div>
                                        <p className="text-xs font-bold uppercase mt-1 text-gray-300">Open the <span className="text-white">Chrome Menu</span> <MoreVertical size={16} className="inline mx-1" />.</p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-[11px] font-black shrink-0">02</div>
                                        <p className="text-xs font-bold uppercase mt-1 text-gray-300">Select <span className="text-white">"Install App"</span> from the list.</p>
                                    </div>
                                </>
                            )}
                        </div>
                        <button onClick={onClose} className="w-full py-4 bg-white/5 border border-white/20 text-white font-black text-xs tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all mt-10">I UNDERSTAND</button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InstallModal;
