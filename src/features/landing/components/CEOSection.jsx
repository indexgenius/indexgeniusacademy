import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, Eye, Star, Check, ArrowRight, Instagram, Youtube, Send, Linkedin, Briefcase, GraduationCap } from 'lucide-react';
import GridNeuralFusion from './GridNeuralFusion';

const CEOSection = ({ onBack, onShowAuth }) => {
    return (
        <section className="min-h-screen bg-white text-black pt-24 pb-32 relative overflow-hidden font-space">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/[0.03] blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gray-200/[0.2] blur-[100px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* 🔴 SECCIÓN 1 — ENCABEZADO / HISTORIA */}
                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-12 lg:py-24">
                    {/* Background Massive Text */}
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none z-0">
                        <motion.h2
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 0.05, scale: 1 }}
                            className="text-[80px] md:text-[250px] lg:text-[450px] font-black italic tracking-tighter text-red-600 leading-none uppercase skew-x-[-12deg]"
                        >
                            STEVEN
                        </motion.h2>
                    </div>

                    {/* Left Column: Story */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="relative z-30 space-y-8 order-2 lg:order-1"
                    >
                        <div className="space-y-2">
                            <p className="text-[10px] font-black tracking-[0.4em] text-red-600 uppercase italic">Nuestra Historia</p>
                            <h2 className="text-3xl md:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase text-black leading-none">
                                DE SECRETARIO A <br /><span className="text-red-700">FUNDADOR</span>
                            </h2>
                        </div>

                        <div className="space-y-6 text-gray-700 font-medium leading-relaxed text-sm lg:text-base max-w-xl h-fit lg:h-[450px] lg:overflow-y-auto pr-6 custom-scrollbar scroll-smooth">
                            <p className="text-xl font-bold text-black italic">La historia detrás de IndexGenius Academy</p>
                            <p>Yo, <span className="font-bold text-black">Steven Castillo</span>, joven dominicano y fundador de <span className="font-bold text-black">IndexGenius Academy</span>, no siempre estuve en los mercados financieros.</p>
                            <p>Antes de dedicarme profesionalmente al trading, trabajé como secretario en un almacén durante jornadas de más de 8 horas diarias. Esa etapa me enseñó disciplina, responsabilidad y compromiso. Pero dentro de mí sabía que quería algo diferente: no solo un salario fijo, sino libertad financiera.</p>
                            <p>Al principio cometí errores, tuve pérdidas y entendí que los mercados financieros no se tratan de suerte ni apuestas. Se tratan de estructura, gestión de riesgo y mentalidad sólida.</p>
                            <p>Decidí prepararme seriamente. Estudié, practicqué y desarrollé un enfoque profesional hasta lograr consistencia. Así nació <span className="font-bold text-black italic">IndexGenius Academy</span>: una comunidad creada para formar traders con disciplina, estrategia y visión a largo plazo.</p>

                            <div className="p-8 bg-gray-50 border-l-[10px] border-red-600 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Star size={60} />
                                </div>
                                <p className="relative z-10 italic font-black text-black text-lg lg:text-xl leading-snug">
                                    "No solo vendemos señales, construimos infraestructuras para traders que buscan resultados reales."
                                </p>
                            </div>
                        </div>

                        {/* Social Connect */}
                        <div className="flex flex-wrap gap-4 pt-6">
                            {[
                                { icon: Instagram, url: 'https://www.instagram.com/stevencastilloreal' },
                                { icon: Youtube, url: 'https://www.youtube.com/@IndexGeniusAcademy' },
                                { icon: Send, url: 'https://t.me/indexgeniusacademy' },
                                { icon: Linkedin, url: 'https://www.linkedin.com/in/stevencastilloreal/' }
                            ].map((social, i) => (
                                <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="w-12 rotate-[-12deg] h-12 border-2 border-gray-100 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all shadow-sm rounded-none">
                                    <social.icon size={18} className="rotate-[12deg]" />
                                </a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Column: Founder Portrait */}
                    <div className="relative h-[300px] sm:h-[400px] lg:h-[750px] flex items-center justify-center order-1 lg:order-2">
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10 h-full w-full flex items-center justify-center"
                        >
                            <img
                                src="/img/logos/CEO/WhatsApp_Image_2026-01-18_at_11.47.18_PM-removebg-preview.png"
                                alt="Steven Castillo"
                                className="h-full w-auto object-contain filter drop-shadow-[0_20px_100px_rgba(220,38,38,0.2)]"
                                style={{
                                    maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                                    WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
                                }}
                            />
                        </motion.div>

                        {/* Outlined Name behind image */}
                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none z-[5]">
                            <motion.h2
                                initial={{ opacity: 0, x: 100 }}
                                whileInView={{ opacity: 0.1, x: 0 }}
                                className="text-[120px] md:text-[250px] lg:text-[450px] font-black italic tracking-tighter text-red-600 leading-none uppercase skew-x-[-12deg]"
                                style={{ WebkitTextStroke: '2px #dc2626', color: 'transparent' }}
                            >
                                STEVEN
                            </motion.h2>
                        </div>
                    </div>
                </div>

                {/* 🔴 SECCIÓN 2, 3, 4 — QUIÉNES, MISIÓN, VISIÓN */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 lg:mt-32">
                    {[
                        {
                            title: 'QUIÉNES SOMOS',
                            label: '¿Qué es IndexGenius Academy?',
                            desc: 'Una academia de trading enfocada en la formación estructurada, señales en tiempo real y herramientas profesionales para operar en Forex, Índices Sintéticos y Binarias.',
                            icon: <GraduationCap className="text-red-600" size={36} />,
                            accent: 'NIVEL EMPRESARIAL'
                        },
                        {
                            title: 'NUESTRA MISIÓN',
                            label: 'Formación Disciplinada',
                            desc: 'Formar traders disciplinados, estructurados y consistentes, brindando educación real, acompañamiento profesional y herramientas estratégicas.',
                            icon: <Target className="text-red-600" size={36} />,
                            accent: 'ESTRATEGIA TOTAL'
                        },
                        {
                            title: 'NUESTRA VISIÓN',
                            label: 'Liderazgo Regional',
                            desc: 'Convertirnos en una de las academias de trading más reconocidas de Latinoamérica por nuestra transparencia, metodología profesional y resultados sostenibles.',
                            icon: <Eye className="text-red-600" size={36} />,
                            accent: 'VISIÓN GLOBAL'
                        }
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group p-10 bg-white border-2 border-gray-100 hover:border-red-600/30 hover:bg-red-600/[0.01] transition-all relative overflow-hidden flex flex-col items-start text-left"
                        >
                            <div className="mb-8 p-4 bg-gray-50 group-hover:bg-red-600/10 group-hover:scale-110 transition-all duration-500">
                                {card.icon}
                            </div>
                            <p className="text-[9px] font-black tracking-[0.4em] text-red-600 uppercase mb-3">{card.title}</p>
                            <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-6 text-black group-hover:translate-x-1 transition-transform">{card.label}</h4>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-tight leading-relaxed flex-grow">{card.desc}</p>

                            <div className="mt-8 bg-black text-white px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] skew-x-[-10deg]">
                                {card.accent}
                            </div>

                            {/* Tactical accent bar */}
                            <div className="absolute right-0 bottom-0 w-0 h-1 bg-red-600 group-hover:w-full transition-all duration-700"></div>
                        </motion.div>
                    ))}
                </div>

                {/* 🔴 SECCIÓN 5 — VALORES */}
                <div className="mt-24 lg:mt-40 bg-white text-black p-12 lg:p-24 relative overflow-hidden group border-2 border-gray-100">
                    <GridNeuralFusion />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600 opacity-[0.03] blur-[150px] pointer-events-none"></div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h3 className="text-4xl lg:text-7xl font-black italic uppercase leading-none tracking-tighter">
                                NUESTROS <br /><span className="text-red-600">VALORES</span>
                            </h3>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs lg:text-sm max-w-sm">
                                Los pilares fundamentales que sostienen nuestra infraestructura académica.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {['Disciplina', 'Transparencia', 'Consistencia', 'Educación real', 'Gestión de riesgo'].map((valor, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ x: 10 }}
                                    className="flex items-center gap-4 border-b border-gray-100 pb-4 group/item"
                                >
                                    <div className="w-2 h-2 bg-red-600 rotate-45 transition-transform group-hover/item:rotate-90"></div>
                                    <span className="text-sm lg:text-lg font-black italic uppercase tracking-tighter text-black">{valor}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 🔴 SECCIÓN 6 — BLOQUE DE AUTORIDAD */}
                <div className="mt-32 lg:mt-48 text-center relative max-w-5xl mx-auto space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-3xl lg:text-6xl font-black italic tracking-tighter uppercase text-black leading-tight">
                            Infraestructura profesional para <br /><span className="text-red-600 shadow-red-600/20">traders independientes</span>
                        </h2>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 lg:gap-12">
                        {[
                            "Señales en tiempo real",
                            "Formación paso a paso",
                            "Comunidad activa",
                            "Soporte directo"
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Check className="text-red-600" size={24} strokeWidth={3} />
                                <span className="text-xs lg:text-sm font-black uppercase tracking-[0.2em] text-gray-800">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8">
                        <button
                            onClick={() => onShowAuth('register')}
                            className="bg-red-600 text-white px-16 py-8 font-black italic text-sm lg:text-lg uppercase tracking-[0.4em] skew-x-[-12deg] shadow-2xl shadow-red-600/30 hover:bg-black hover:scale-110 transition-all flex items-center justify-center gap-6 mx-auto group"
                        >
                            ÚNETE A LA ACADEMIA
                            <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>

                    {/* Massive background watermark */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none select-none opacity-[0.03] z-[-1]">
                        <h2 className="text-[60px] md:text-[120px] lg:text-[300px] font-black italic uppercase tracking-tighter text-black">AUTHORITY</h2>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default CEOSection;
