import React from 'react';
import { motion } from 'framer-motion';
import { CountUp } from './Animations';

const AboutUs = () => {
    return (
        <section className="px-6 lg:px-20 py-24 relative border-b overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <div className="max-w-6xl mx-auto text-center relative z-10">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} className="mb-16">
                    <h3 className="text-4xl lg:text-7xl font-black italic tracking-tighter uppercase mb-8" style={{ color: 'var(--text-primary)' }}>QUIENES <span className="text-red-600">SOMOS</span></h3>
                    <div className="w-24 h-1 bg-red-600 mx-auto mb-10"></div>
                    <p className="font-black uppercase tracking-widest text-sm lg:text-lg leading-loose max-w-4xl mx-auto mb-6" style={{ color: 'var(--text-primary)' }}>
                        INDEXGENIUS <span className="text-red-600">ACADEMY</span> ES LA ACADEMIA DE TRADING MÁS AVANZADA DE LATINOAMÉRICA PARA OPERAR ÍNDICES SINTÉTICOS.
                    </p>
                    <p className="font-bold uppercase tracking-widest text-xs lg:text-sm leading-loose max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        FUNDADA POR STEVEN CASTILLO, TRADER PROFESIONAL CON MÁS DE <span className="text-red-600">3 AÑOS DE EXPERIENCIA</span>.
                    </p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t pt-16" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="transition-all group p-8 border hover:bg-white/10" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                        <h4 className="text-4xl lg:text-6xl font-black italic text-red-600 mb-2"><CountUp end={1500} duration={3} suffix="+" enableKFormat={true} /></h4>
                        <p className="font-black uppercase tracking-[0.2em] text-xs" style={{ color: 'var(--text-primary)' }}>TRADERS ACTIVOS</p>
                    </div>
                    <div className="transition-all group p-8 border hover:bg-white/10" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                        <h4 className="text-4xl lg:text-6xl font-black italic text-red-600 mb-2"><CountUp end={80} duration={3} suffix="%" /></h4>
                        <p className="font-black uppercase tracking-[0.2em] text-xs" style={{ color: 'var(--text-primary)' }}>PRECISIÓN DE SEÑALES</p>
                    </div>
                    <div className="transition-all group p-8 border hover:bg-white/10" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                        <h4 className="text-4xl lg:text-6xl font-black italic text-red-600 mb-2">24/7</h4>
                        <p className="font-black uppercase tracking-[0.2em] text-xs" style={{ color: 'var(--text-primary)' }}>SOPORTE GLOBAL</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
