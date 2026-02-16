import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from './Animations';
import InstallModal from './InstallModal';

const InstallGuide = () => {
    const [installModal, setInstallModal] = useState(null);

    return (
        <section id="install" className="px-6 lg:px-20 py-32 relative overflow-hidden bg-white">
            <div className="max-w-5xl mx-auto">
                <motion.div className="mb-16 text-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }}>
                    <h3 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase mb-6 text-black">
                        GUÍA DE <span className="text-red-700">INSTALACIÓN</span>
                    </h3>
                    <div className="w-24 h-1.5 bg-red-600 mx-auto mb-8"></div>
                    <p className="font-bold uppercase tracking-[0.2em] text-xs lg:text-sm text-gray-500">Mira cómo instalar la terminal en tu dispositivo en 60 segundos</p>
                </motion.div>

                <motion.div className="relative w-full aspect-video border border-gray-100 overflow-hidden group hover:border-red-600 shadow-2xl shadow-gray-100 mb-16 bg-white" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false }}>
                    <iframe className="w-full h-full" src="https://www.youtube.com/embed/tPpGDITXpR4?si=p8v_yE4_v_yE_yE&rel=0" title="Guía de Instalación" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                </motion.div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <button onClick={() => setInstallModal('ios')} className="px-10 py-5 border-2 border-red-600 text-red-600 text-[11px] tracking-[0.3em] uppercase hover:bg-red-600 hover:text-white transition-all font-black skew-x-[-12deg] bg-white">TERMINAL IOS (SAFARI)</button>
                    <button onClick={() => setInstallModal('android')} className="px-10 py-5 border-2 border-red-600 text-red-600 text-[11px] tracking-[0.3em] uppercase hover:bg-red-600 hover:text-white transition-all font-black skew-x-[-12deg] bg-white">TERMINAL ANDROID (CHROME)</button>
                </div>
            </div>
            <InstallModal type={installModal} onClose={() => setInstallModal(null)} />
        </section>
    );
};

export default InstallGuide;
