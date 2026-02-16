import React from 'react';
import { motion } from 'framer-motion';

const TacticalRibbons = () => {
    return (
        <section className="relative h-[400px] lg:h-[600px] flex items-center justify-center overflow-hidden bg-white">
            {/* Silk Background Base */}
            <div className="absolute inset-0 silk-bg opacity-50"></div>

            {/* Crossing Ribbons (Tiras) */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Red Tactical Ribbon */}
                <motion.div
                    initial={{ x: '-100%', rotate: -8 }}
                    whileInView={{ x: '0%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute w-[150%] h-32 lg:h-48 bg-red-600 shadow-[0_20px_50px_rgba(229,9,20,0.3)] flex items-center justify-center"
                    style={{ zIndex: 10 }}
                >
                    <div className="flex gap-12 lg:gap-24 animate-marquee whitespace-nowrap">
                        {[...Array(6)].map((_, i) => (
                            <span key={i} className="text-white text-3xl lg:text-6xl font-black italic tracking-tighter uppercase">
                                SEÑALES EN TIEMPO REAL • INDEX GENIUS • SEÑALES EN TIEMPO REAL •
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* Black Tactical Ribbon */}
                <motion.div
                    initial={{ x: '100%', rotate: 12 }}
                    whileInView={{ x: '0%' }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    className="absolute w-[150%] h-32 lg:h-48 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center"
                    style={{ zIndex: 11 }}
                >
                    <div className="flex gap-12 lg:gap-24 animate-marquee-reverse whitespace-nowrap">
                        {[...Array(6)].map((_, i) => (
                            <span key={i} className="text-red-600 text-3xl lg:text-6xl font-black italic tracking-tighter uppercase">
                                ESTRATEGIA ÉLITE • TECNOLOGÍA TÁCTICA • ESTRATEGIA ÉLITE •
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default TacticalRibbons;
