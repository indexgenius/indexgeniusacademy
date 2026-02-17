import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, BarChart3, Clock } from 'lucide-react';

const BrokerSection = () => {
    return (
        <section className="min-h-screen bg-[#090228] text-white pt-16 pb-24 relative overflow-hidden">
            {/* Ambient Background Effects using new palette */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#8158F6]/[0.08] blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#432C8D]/[0.1] blur-[100px] rounded-full pointer-events-none"></div>

            {/* Dark Tactical Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#090228]/50 to-transparent pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Hero Composite Section */}
                <div className="relative flex flex-col items-center justify-center py-20 lg:py-32">
                    {/* Background Layer: Massive Gradient Text */}
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none z-0">
                        <motion.h2
                            initial={{ opacity: 0, scale: 1.1 }}
                            whileInView={{ opacity: 0.15, scale: 1 }}
                            className="text-[120px] md:text-[250px] lg:text-[500px] font-black italic tracking-tighter leading-none uppercase text-transparent"
                            style={{
                                backgroundImage: 'linear-gradient(to bottom, #8158F6, transparent)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextStroke: '1px rgba(129, 88, 246, 0.2)'
                            }}
                        >
                            SYNTHETIC
                        </motion.h2>
                    </div>

                    {/* Middle Layer: Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="relative z-10 text-center space-y-10 max-w-4xl"
                    >
                        {/* Integrated Logo & Visual Elements */}
                        <div className="flex flex-col items-center justify-center gap-8 mb-4">
                            <motion.img
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                src="/img/metodos/logos/logo_bridge_morado.png"
                                alt="Bridge Markets"
                                className="h-20 lg:h-28 object-contain drop-shadow-[0_0_40px_rgba(129,88,246,0.5)] brightness-125"
                            />
                        </div>

                        <div className="inline-block px-5 py-2 border border-[#8158F6]/30 bg-[#8158F6]/10 rounded-sm mb-4 backdrop-blur-md">
                            <p className="text-[10px] font-black tracking-[0.4em] text-[#8158F6] uppercase italic">Bridge Markets x IndexGenius</p>
                        </div>

                        <h2 className="text-5xl lg:text-9xl font-black italic tracking-tighter uppercase leading-[0.85] text-white">
                            Opera en un <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8158F6] to-white">Nuevo Universo</span>
                        </h2>

                        <p className="text-lg lg:text-2xl font-bold text-gray-400 italic uppercase tracking-tighter max-w-2xl mx-auto leading-tight">
                            Domina los Índices Sintéticos con la infraestructura más potente del mercado.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
                            <a
                                href="https://bridgemarkets.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-14 py-7 bg-[#8158F6] text-white font-black uppercase italic tracking-widest skew-x-[-12deg] hover:bg-white hover:text-[#060024] transition-all shadow-2xl shadow-[#8158F6]/40 text-sm group"
                            >
                                <span className="flex items-center gap-3">
                                    ABRIR CUENTA REAL
                                    <Zap className="w-4 h-4 fill-current group-hover:scale-125 transition-transform" />
                                </span>
                            </a>
                        </div>
                    </motion.div>

                    {/* Tactical Decorative Lines using palette colors */}
                    <div className="absolute top-0 left-0 w-32 h-[1px] bg-[#8158F6]/40"></div>
                    <div className="absolute top-0 left-0 w-[1px] h-32 bg-[#8158F6]/40"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-[1px] bg-[#432C8D]/40"></div>
                    <div className="absolute bottom-0 right-0 w-[1px] h-32 bg-[#432C8D]/40"></div>
                </div>

                {/* Features Grid - Dark Industrial Glassmorphism */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                    {[
                        {
                            title: 'Tecnología',
                            label: 'MT5 Pro',
                            desc: 'Latencia ultra-baja y ejecución instantánea optimizada para sistemas algorítmicos.',
                            icon: <Zap className="text-[#8158F6]" size={36} />
                        },
                        {
                            title: 'Seguridad',
                            label: 'Fondos Seguros',
                            desc: 'Infraestructura robusta y segura para que operes con total tranquilidad en cualquier mercado.',
                            icon: <Shield className="text-[#8158F6]" size={36} />
                        },
                        {
                            title: 'Soporte',
                            label: 'Experto 24/7',
                            desc: 'Un equipo élite enfocado en tu éxito operativo, disponible en todo momento.',
                            icon: <BarChart3 className="text-[#8158F6]" size={36} />
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group p-12 bg-[#322070]/10 border border-[#432C8D]/20 hover:border-[#8158F6]/50 hover:bg-[#322070]/20 transition-all relative overflow-hidden rounded-sm backdrop-blur-sm"
                        >
                            <div className="mb-10 text-white/90 group-hover:text-[#8158F6] group-hover:scale-110 transition-all duration-500">
                                {feature.icon}
                            </div>
                            <p className="text-[10px] font-black tracking-[0.4em] text-[#8158F6] uppercase mb-3">{feature.title}</p>
                            <h4 className="text-3xl font-black italic tracking-tighter uppercase mb-6 text-white group-hover:translate-x-2 transition-transform">{feature.label}</h4>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-tight leading-relaxed">{feature.desc}</p>

                            {/* Animated accent bar */}
                            <div className="absolute bottom-0 left-0 w-1 h-0 bg-[#8158F6] group-hover:h-full transition-all duration-500"></div>
                        </motion.div>
                    ))}
                </div>

                {/* Closing Background Element */}
                <div className="mt-40 text-center relative">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 0.05 }}
                        className="text-[#8158F6] font-black italic text-5xl lg:text-[140px] uppercase select-none tracking-tighter absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full"
                    >
                        INDEX GENIUS
                    </motion.p>
                    <p className="text-2xl lg:text-4xl font-black italic text-white/30 uppercase tracking-[0.5em] relative z-10">
                        DOMINA LA VOLATILIDAD
                    </p>
                </div>
            </div>
        </section>
    );
};

export default BrokerSection;
