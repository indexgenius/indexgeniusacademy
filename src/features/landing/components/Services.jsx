import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, TrendingUp, Users } from 'lucide-react';
import TacticalEvolution from './TacticalEvolution';

const services = [
    {
        icon: Shield,
        title: "GESTIÓN Y CONTROL DE RIESGO",
        desc: "APLICAMOS PRINCIPIOS ESTRUCTURADOS DE GESTIÓN PARA PROTEGER CAPITAL Y OPTIMIZAR RENDIMIENTO",
        color: "text-red-600"
    },
    {
        icon: Zap,
        title: "SEÑALES ESTRATÉGICAS EN TIEMPO REAL",
        desc: "ALERTAS OPERATIVAS BASADAS EN ANÁLISIS TÉCNICO Y ESTRUCTURA INSTITUCIONAL DEL MERCADO",
        color: "text-red-600"
    },
    {
        icon: TrendingUp,
        title: "FORMACIÓN PROFESIONAL EN TRADING",
        desc: "METODOLOGÍA ESTRUCTURADA PARA OPERAR FOREX E ÍNDICES CON DISCIPLINA Y GESTIÓN AVANZADA",
        color: "text-red-600"
    },
    {
        icon: Users,
        title: "COMUNIDAD PRIVADA DE ALTO RENDIMIENTO",
        desc: "ACCESO A UN ENTORNO EXCLUSIVO DE TRADERS ENFOCADOS EN CONSISTENCIA Y CRECIMIENTO SOSTENIBLE",
        color: "text-red-600"
    }
];

const Services = ({ view }) => {
    const isBroker = view === 'broker';
    return (
        <section id="services" className={`px-6 lg:px-20 py-32 relative overflow-hidden transition-colors duration-500 ${isBroker ? 'bg-[#090228]' : 'bg-white'}`}>
            <TacticalEvolution stage={2} view={view} />
            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    className="text-center mb-16 lg:mb-24 px-4"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                >
                    <h2 className={`text-4xl md:text-6xl lg:text-8xl font-black italic tracking-tighter uppercase mb-6 transition-colors duration-500 ${isBroker ? 'text-white' : 'text-black'}`}>
                        ECOSISTEMA <span className={isBroker ? 'text-[#8158F6]' : 'text-red-700'}>INDEXGENIUS</span>
                    </h2>
                    <div className={`w-20 lg:w-24 h-2 mx-auto transition-colors duration-500 ${isBroker ? 'bg-[#8158F6]' : 'bg-red-600'}`}></div>
                </motion.div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, i) => (
                        <motion.div
                            key={i}
                            className={`group relative p-10 border transition-all duration-500 shadow-xl shadow-gray-100/50 ${isBroker
                                ? 'bg-[#322070]/10 border-[#432C8D]/20 hover:border-[#8158F6] shadow-[#8158F6]/5'
                                : 'bg-white border-gray-100 hover:shadow-2xl hover:border-red-600'
                                }`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false }}
                            transition={{ delay: i * 0.1 }}
                        >
                            {/* Hover Accent */}
                            <div className={`absolute top-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ${isBroker ? 'bg-[#8158F6]' : 'bg-red-600'}`}></div>

                            <div className="relative z-10 mb-10 flex justify-center transform group-hover:-translate-y-2 transition-transform duration-500">
                                <div className={`p-6 rounded-none shadow-xl border border-gray-50 transition-colors duration-500 ${isBroker ? 'bg-[#090228] group-hover:bg-[#8158F6]' : 'bg-white group-hover:bg-red-600'}`}>
                                    <service.icon size={44} className={`${isBroker ? 'text-[#8158F6]' : 'text-red-600'} group-hover:text-white transition-colors duration-500`} />
                                </div>
                            </div>

                            <h3 className={`relative z-10 text-xl font-black italic uppercase mb-6 transition-colors duration-500 tracking-tight ${isBroker ? 'text-white group-hover:text-[#8158F6]' : 'text-gray-900 group-hover:text-red-600'}`}>
                                {service.title}
                            </h3>

                            <p className={`relative z-10 font-bold uppercase text-[10px] tracking-[0.15em] leading-loose transition-colors duration-500 ${isBroker ? 'text-white/40' : 'text-gray-500'}`}>
                                {service.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Connecting line to plans */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false }}
                    className={`text-center mt-14 text-[9px] lg:text-[11px] font-bold uppercase tracking-[0.2em] italic transition-colors duration-500 ${isBroker ? 'text-white/30' : 'text-gray-400'}`}
                >
                    La infraestructura que respalda cada uno de nuestros planes <span className={isBroker ? 'text-[#8158F6] font-black' : 'text-red-600 font-black'}>INDEX ONE</span>, <span className={isBroker ? 'text-[#8158F6] font-black' : 'text-red-600 font-black'}>INDEX PRO</span> e <span className={isBroker ? 'text-[#8158F6] font-black' : 'text-red-600 font-black'}>INDEX BLACK</span>
                </motion.p>
            </div>

            {/* Unified Section Separator (White to Gray Gradient) */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] lg:h-[120px]">
                    <defs>
                        <linearGradient id="serv-unified-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: isBroker ? '#090228' : '#ffffff', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: isBroker ? '#090228' : '#fcfcfc', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,0V120H0Z"
                        fill="url(#serv-unified-grad)"
                    ></path>
                </svg>
            </div>
        </section>
    );
};

export default Services;
