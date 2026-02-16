import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import TacticalEvolution from './TacticalEvolution';

const Mission = () => {
    return (
        <section className="px-6 lg:px-20 py-32 relative overflow-hidden bg-white">
            <TacticalEvolution stage={1} />
            <div className="max-w-5xl mx-auto text-center relative z-10">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false }}>
                    <Shield className="mx-auto text-red-600 mb-8" size={72} />
                    <h2 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase mb-6 text-black">NUESTRA <span className="text-red-700">MISIÓN</span></h2>
                    <p className="font-bold uppercase tracking-[0.2em] text-xs lg:text-sm leading-relaxed italic text-gray-800 max-w-4xl mx-auto">
                        "Dominar el mercado de índices sintéticos formando una élite de traders altamente rentables, otorgando acceso exclusivo a señales premium, metodologías propietarias y educación de nivel institucional."
                    </p>
                </motion.div>
            </div>
            {/* Unified Section Separator (Gray to White Gradient) */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] lg:h-[120px]">
                    <defs>
                        <linearGradient id="mission-unified-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#fcfcfc', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,0V120H0Z"
                        fill="url(#mission-unified-grad)"
                    ></path>
                </svg>
            </div>
        </section>
    );
};

export default Mission;
