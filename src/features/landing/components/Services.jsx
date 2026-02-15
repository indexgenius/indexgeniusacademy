import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, GraduationCap, Users, FileCode } from 'lucide-react';
import { TypewriterText } from './Animations';

const Services = () => {
    const services = [
        { title: "SEÑALES INSTITUCIONALES", desc: "Acceso exclusivo a operaciones de alta probabilidad en índices sintéticos, ejecutadas en tiempo real profesionales.", icon: TrendingUp, color: "text-red-600" },
        { title: "FORMACIÓN PRIVADA", desc: "Programa educativo especializado en índices sintéticos, con metodologías propietarias y ejecución avanzada.", icon: GraduationCap, color: "text-blue-500" },
        { title: "COMUNIDAD CERRADA", desc: "Ingreso a una comunidad privada de traders de alto nivel para compartir análisis profundo.", icon: Users, color: "text-green-500" },
        { title: "HERRAMIENTAS EXCLUSIVAS", desc: "Indicadores, plantillas y configuraciones propias, diseñadas para maximizar precisión.", icon: FileCode, color: "text-white" }
    ];

    return (
        <section id="services" className="relative px-6 lg:px-20 py-32 bg-[#080808] text-center overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 scanlines opacity-5 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-80 pointer-events-none"></div>

            <motion.div className="relative z-10 mb-20 text-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }}>
                <div className="inline-block border border-red-600/30 bg-red-600/5 px-4 py-1 mb-4 rounded-full backdrop-blur-sm">
                    <span className="text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">Ecosistema V4.5</span>
                </div>
                <h3 className="text-5xl lg:text-7xl font-bold italic tracking-tighter uppercase mb-6 text-white text-shadow-none">
                    <TypewriterText text="NUESTROS SERVICIOS" delay={80} />
                </h3>
                <div className="w-24 h-1 bg-white mx-auto"></div>
            </motion.div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service, i) => (
                    <motion.div
                        key={i}
                        className="group relative p-8 bg-[#0a0a0a] border border-white/5 hover:border-red-600/50 transition-all duration-300 overflow-hidden"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ delay: i * 0.1 }}
                    >
                        {/* Hover Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-b from-red-600/0 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-white/20 group-hover:border-red-600 transition-colors"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-white/20 group-hover:border-red-600 transition-colors"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-white/20 group-hover:border-red-600 transition-colors"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-white/20 group-hover:border-red-600 transition-colors"></div>

                        <div className="relative z-10 mb-8 flex justify-center transform group-hover:scale-110 transition-transform duration-300">
                            <div className="p-4 rounded-full bg-white/5 group-hover:bg-red-600/10 transition-colors">
                                <service.icon size={40} className={`${service.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]`} />
                            </div>
                        </div>

                        <h4 className="relative z-10 text-xl font-black italic uppercase mb-4 text-white group-hover:text-red-500 transition-colors tracking-tight">
                            {service.title}
                        </h4>

                        <p className="relative z-10 text-gray-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                            {service.desc}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Bottom Curve */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 translate-y-1">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="block w-[calc(100%+1.3px)] h-[60px] lg:h-[100px] fill-current text-[#050505]">
                    <path d="M1200,0H0V120H281.94C572.9,116.24,602.45,3.86,602.45,3.86h0S632,116.24,923,120h277Z" className="shape-fill" opacity=".5"></path>
                </svg>
            </div>
        </section>
    );
};

export default Services;
