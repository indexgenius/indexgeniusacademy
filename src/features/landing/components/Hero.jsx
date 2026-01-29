import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
    return (
        <section className="px-6 lg:px-10 pt-10 pb-20 relative z-10 flex flex-col items-center text-center overflow-hidden">
            <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden">
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-25 grayscale pointer-events-none">
                    <source src="/videos/trading-background.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mb-8 relative z-10">
                <h1 className="diseno-futurista mb-6">
                    DOMINA LOS<br />
                    <span className="sinteticos-rojo">SINTÉTICOS</span>
                </h1>
                <p className="max-w-2xl mx-auto text-gray-400 font-medium uppercase tracking-widest text-sm lg:text-base leading-relaxed mb-10">
                    La Academia de trading más avanzada de Latinoamérica para índices Sintéticos. Señales en tiempo real, formación de alto nivel y una comunidad global de élite.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mt-10">
                    <button onClick={() => document.getElementById('install').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 sm:px-12 sm:py-5 bg-red-600 text-white font-semibold italic text-sm sm:text-lg tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all skew-x-[-12deg] shadow-red-glow flex items-center justify-center gap-3 sm:gap-4 group">
                        OBTENER ACCESO <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
                    </button>
                    <button onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 sm:px-12 sm:py-5 border-2 border-white/20 text-white font-semibold italic text-sm sm:text-lg tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all skew-x-[-12deg] flex items-center justify-center gap-3 sm:gap-4">
                        SERVICIOS
                    </button>
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
