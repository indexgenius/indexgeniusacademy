import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TacticalSelect = ({ label, options, value, onChange, placeholder = "SELECT OPTION" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.flatMap(group => group.options || [group]).find(opt => opt.value === value);

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className="space-y-1.5 w-full" ref={containerRef}>
            {label && <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{label}</label>}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-white/5 border border-white/10 p-4 text-xs font-black uppercase text-white flex justify-between items-center transition-all hover:border-red-600/50 hover:bg-white/10 hover:shadow-red-glow/10"
                >
                    <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180 text-red-600' : ''}`} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 w-full mt-1 bg-[#0f0f0f] border border-white/20 z-[100] shadow-2xl max-h-64 overflow-y-auto custom-scrollbar"
                        >
                            {options.map((item, i) => (
                                <div key={i}>
                                    {item.label && !item.value ? (
                                        <div className="bg-white/5 px-4 py-2 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] sticky top-0 z-10">
                                            {item.label}
                                        </div>
                                    ) : null}
                                    {(item.options || [item]).map((opt, j) => (
                                        <button
                                            key={`${i}-${j}`}
                                            type="button"
                                            onClick={() => handleSelect(opt.value)}
                                            className={`w-full text-left px-6 py-3 text-xs font-black uppercase transition-all flex items-center justify-between group ${value === opt.value ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            {opt.label}
                                            {value === opt.value && <div className="w-1.5 h-1.5 bg-white rotate-45"></div>}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TacticalSelect;
