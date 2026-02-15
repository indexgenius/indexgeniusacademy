import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const Mission = () => {
    return (
        <section className="px-6 lg:px-20 py-24 relative border-b overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5 pointer-events-none"></div>
            <div className="max-w-5xl mx-auto text-center relative z-10">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false }}>
                    <Shield className="mx-auto text-red-600 mb-6" size={64} />
                    <h3 className="text-3xl lg:text-5xl font-black italic tracking-tighter uppercase mb-8" style={{ color: 'var(--text-primary)' }}>NUESTRA <span className="text-red-600">MISIÓN</span></h3>
                    <p className="font-bold uppercase tracking-widest text-sm lg:text-base leading-loose italic" style={{ color: 'var(--text-secondary)' }}>
                        "Dominar el mercado de índices sintéticos formando una élite de traders altamente rentables, otorgando acceso exclusivo a señales premium, metodologías propietarias y educación de nivel institucional."
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default Mission;
