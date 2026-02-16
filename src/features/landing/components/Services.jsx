import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, TrendingUp, Users } from 'lucide-react';
import TacticalEvolution from './TacticalEvolution';

const services = [
    {
        icon: Shield,
        title: "SEGURIDAD TOTAL",
        desc: "PROTEGEMOS TU CAPITAL CON ESTRATEGIAS DE GESTIÓN DE RIESGO DE NIVEL INSTITUCIONAL.",
        color: "text-red-600"
    },
    {
        icon: Zap,
        title: "SEÑALES PREMIUM",
        desc: "ACCESO 24/7 A NUESTRAS ALERTAS DE ALTA PRECISIÓN EN TIEMPO REAL.",
        color: "text-red-600"
    },
    {
        icon: TrendingUp,
        title: "RETAIL TRADING",
        desc: "APRENDE LAS METODOLOGÍAS QUE USAN LOS GRANDES FONDOS DE INVERSIÓN.",
        color: "text-red-600"
    },
    {
        icon: Users,
        title: "COMUNIDAD ÉLITE",
        desc: "ÚNETE A MILES DE TRADERS QUE YA ESTÁN DOMINANDO EL MERCADO.",
        color: "text-red-600"
    }
];

const Services = () => {
    return (
        <section id="services" className="px-6 lg:px-20 py-32 relative overflow-hidden bg-white">
            <TacticalEvolution stage={2} />
            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    className="text-center mb-24"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                >
                    <h2 className="text-5xl lg:text-8xl font-black italic tracking-tighter uppercase mb-6 text-black">
                        NUESTROS <span className="text-red-700">SERVICIOS</span>
                    </h2>
                    <div className="w-24 h-2 bg-red-600 mx-auto"></div>
                </motion.div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, i) => (
                        <motion.div
                            key={i}
                            className="group relative p-10 bg-white border border-gray-100 transition-all duration-500 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:border-red-600"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false }}
                            transition={{ delay: i * 0.1 }}
                        >
                            {/* Hover Accent */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                            <div className="relative z-10 mb-10 flex justify-center transform group-hover:-translate-y-2 transition-transform duration-500">
                                <div className="p-6 rounded-none bg-white shadow-xl border border-gray-50 group-hover:bg-red-600 transition-colors duration-500">
                                    <service.icon size={44} className={`${service.color} group-hover:text-white transition-colors duration-500`} />
                                </div>
                            </div>

                            <h3 className="relative z-10 text-xl font-black italic uppercase mb-6 text-gray-900 group-hover:text-red-600 transition-colors tracking-tight">
                                {service.title}
                            </h3>

                            <p className="relative z-10 text-gray-500 font-bold uppercase text-[10px] tracking-[0.15em] leading-loose">
                                {service.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Unified Section Separator (White to Gray Gradient) */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] lg:h-[120px]">
                    <defs>
                        <linearGradient id="serv-unified-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#fcfcfc', stopOpacity: 1 }} />
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
