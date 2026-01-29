import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from './Animations';
import InstallModal from './InstallModal';

const InstallGuide = () => {
    const [installModal, setInstallModal] = useState(null);

    return (
        <section id="install" className="px-6 lg:px-20 py-32 bg-black/50 border-y border-white/5">
            <div className="max-w-5xl mx-auto">
                <motion.div className="mb-12 text-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }}>
                    <h3 className="text-4xl lg:text-6xl font-black italic tracking-tighter uppercase mb-4">
                        <TypewriterText text="GUÍA DE INSTALACIÓN" delay={70} />
                    </h3>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs lg:text-sm">Mira cómo instalar la terminal en tu dispositivo en 60 segundos</p>
                </motion.div>

                <motion.div className="relative w-full aspect-video bg-black border-2 border-white/10 overflow-hidden group hover:border-red-600/50 transition-all shadow-2xl mb-12" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false }}>
                    <iframe className="w-full h-full" src="https://www.youtube.com/embed/tPpGDITXpR4?si=p8v_yE4_v_yE_yE&rel=0" title="Guía de Instalación" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                </motion.div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => setInstallModal('ios')} className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black text-[10px] tracking-widest uppercase hover:bg-white hover:text-black transition-all">TERMINAL IOS (SAFARI)</button>
                    <button onClick={() => setInstallModal('android')} className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black text-[10px] tracking-widest uppercase hover:bg-white hover:text-black transition-all">TERMINAL ANDROID (CHROME)</button>
                </div>
            </div>
            <InstallModal type={installModal} onClose={() => setInstallModal(null)} />
        </section>
    );
};

export default InstallGuide;
