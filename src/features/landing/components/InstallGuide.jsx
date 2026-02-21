import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from './Animations';
import InstallModal from './InstallModal';

const InstallGuide = () => {
    const [installModal, setInstallModal] = useState(null);

    return (
        <section id="install" className="px-6 lg:px-20 py-32 relative overflow-hidden bg-white">
            <div className="max-w-5xl mx-auto">
                <motion.div className="mb-12 lg:mb-16 text-center px-4" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }}>
                    <h3 className="text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter uppercase mb-6 text-black">
                        GUÍA DE <span className="text-red-700">INSTALACIÓN</span>
                    </h3>
                    <div className="w-24 h-1.5 bg-red-600 mx-auto mb-8"></div>
                    <p className="font-bold uppercase tracking-[0.2em] text-xs lg:text-sm text-gray-500">Mira cómo instalar la terminal en tu dispositivo en 60 segundos</p>
                </motion.div>

                <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
                    {/* Left Side Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="hidden lg:block space-y-8 max-w-[200px]"
                    >
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Paso 01</p>
                            <p className="text-xs font-bold text-gray-400 uppercase leading-relaxed">Abre el navegador oficial de tu dispositivo.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Paso 02</p>
                            <p className="text-xs font-bold text-gray-400 uppercase leading-relaxed">Sigue las instrucciones tácticas del video.</p>
                        </div>
                    </motion.div>

                    {/* Phone Mockup Container */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        {/* Smartphone Frame */}
                        <div className="relative w-[280px] h-[580px] bg-[#0f0f0f] rounded-[3rem] border-[8px] border-[#1a1a1a] shadow-[0_0_60px_rgba(0,0,0,0.1)] overflow-hidden">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1a1a] rounded-b-2xl z-30 flex items-center justify-center gap-2">
                                <div className="w-8 h-1 bg-white/5 rounded-full"></div>
                                <div className="w-2 h-2 rounded-full bg-white/5"></div>
                            </div>

                            {/* Video Content */}
                            <div className="absolute inset-0 bg-black z-10">
                                <iframe
                                    className="w-full h-full scale-[1.02]"
                                    src="https://www.youtube.com/embed/tPpGDITXpR4?playlist=tPpGDITXpR4&loop=1&autoplay=1&mute=1&controls=0&modestbranding=1"
                                    title="Guía de Instalación"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                ></iframe>
                            </div>

                            {/* Buttons Accent */}
                            <div className="absolute -left-[10px] top-28 w-[4px] h-12 bg-[#222] rounded-l-md"></div>
                            <div className="absolute -left-[10px] top-44 w-[4px] h-16 bg-[#222] rounded-l-md"></div>
                            <div className="absolute -right-[10px] top-36 w-[4px] h-20 bg-[#222] rounded-r-md"></div>
                        </div>

                        {/* Decorative Shadows */}
                        <div className="absolute -inset-10 bg-red-600/[0.02] blur-3xl -z-10 rounded-full"></div>
                    </motion.div>

                    {/* Right Side Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="hidden lg:block space-y-8 max-w-[200px]"
                    >
                        <div className="space-y-2 text-right">
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Paso 03</p>
                            <p className="text-xs font-bold text-gray-400 uppercase leading-relaxed">Añade a la pantalla de inicio para acceso rápido.</p>
                        </div>
                        <div className="space-y-2 text-right">
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Paso 04</p>
                            <p className="text-xs font-bold text-gray-400 uppercase leading-relaxed">Ejecuta la terminal y comienza a operar.</p>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-20 flex flex-col sm:flex-row gap-6 justify-center">
                    <button
                        onClick={() => setInstallModal('ios')}
                        className="group relative px-4 py-3 sm:px-10 sm:py-5 bg-black text-white text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.3em] italic overflow-hidden transition-all hover:scale-105"
                    >
                        <span className="relative z-10">TERMINAL IOS (SAFARI)</span>
                        <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>
                    <button
                        onClick={() => setInstallModal('android')}
                        className="group relative px-4 py-3 sm:px-10 sm:py-5 bg-white border-2 border-black text-black text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.3em] italic overflow-hidden transition-all hover:scale-105"
                    >
                        <span className="relative z-10 group-hover:text-white">TERMINAL ANDROID (CHROME)</span>
                        <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>
                </div>
            </div>
            <InstallModal type={installModal} onClose={() => setInstallModal(null)} />
        </section>
    );
};

export default InstallGuide;
