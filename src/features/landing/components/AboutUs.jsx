import React from 'react';
import { motion } from 'framer-motion';
import { CountUp } from './Animations';

const AboutUs = () => {
    return (
        <section className="px-6 lg:px-20 py-24 bg-black relative border-b border-white/5 overflow-hidden">
            <div className="max-w-6xl mx-auto text-center relative z-10">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} className="mb-16">
                    <h3 className="text-4xl lg:text-7xl font-black italic tracking-tighter uppercase mb-8">QUIENES <span className="text-white">SOMOS</span></h3>
                    <div className="w-24 h-1 bg-red-600 mx-auto mb-10"></div>
                    <p className="text-white font-black uppercase tracking-widest text-sm lg:text-lg leading-loose max-w-4xl mx-auto mb-6">
                        INDEXGENIUS <span className="text-red-600">ACADEMY</span> ES LA ACADEMIA DE TRADING MÁS AVANZADA DE LATINOAMÉRICA PARA OPERAR ÍNDICES SINTÉTICOS.
                    </p>
                    <p className="text-gray-300 font-bold uppercase tracking-widest text-xs lg:text-sm leading-loose max-w-3xl mx-auto">
                        FUNDADA POR STEVEN CASTILLO, TRADER PROFESIONAL CON MÁS DE <span className="text-red-600">3 AÑOS DE EXPERIENCIA</span>.
                    </p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-16">
                    <div className="bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all group">
                        <h4 className="text-4xl lg:text-6xl font-black italic text-red-600 mb-2"><CountUp end={1500} duration={3} suffix="+" enableKFormat={true} /></h4>
                        <p className="text-white font-black uppercase tracking-[0.2em] text-xs">TRADERS ACTIVOS</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all group">
                        <h4 className="text-4xl lg:text-6xl font-black italic text-red-600 mb-2"><CountUp end={80} duration={3} suffix="%" /></h4>
                        <p className="text-white font-black uppercase tracking-[0.2em] text-xs">PRECISIÓN DE SEÑALES</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all group">
                        <h4 className="text-4xl lg:text-6xl font-black italic text-red-600 mb-2">24/7</h4>
                        <p className="text-white font-black uppercase tracking-[0.2em] text-xs">SOPORTE GLOBAL</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
