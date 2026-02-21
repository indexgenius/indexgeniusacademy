import React from 'react';
import { motion } from 'framer-motion';
import { CountUp } from './Animations';
import TacticalEvolution from './TacticalEvolution';
const AboutUs = ({ setView, view }) => {
    const isBroker = view === 'broker';
    return (
        <section className={`px-6 lg:px-20 py-32 relative overflow-hidden transition-colors duration-500 ${isBroker ? 'bg-[#090228]' : 'bg-white'}`}>
            <TacticalEvolution stage={0} view={view} />
            <div className="max-w-6xl mx-auto text-center relative z-10">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} className="mb-16 lg:mb-24 px-4">
                    <h2 className={`text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter uppercase mb-6 transition-colors duration-500 ${isBroker ? 'text-white' : 'text-black'}`}>
                        QUIENES <span className={isBroker ? 'text-[#8158F6]' : 'text-red-700'}>SOMOS</span>
                    </h2>
                    <div className={`w-20 lg:w-24 h-1.5 mx-auto mb-10 transition-colors duration-500 ${isBroker ? 'bg-[#8158F6]' : 'bg-red-600'}`}></div>
                    <p className={`font-black uppercase tracking-[0.15em] text-xs md:text-sm lg:text-xl leading-relaxed max-w-4xl mx-auto mb-8 transition-colors duration-500 ${isBroker ? 'text-white' : 'text-black'}`}>
                        INDEXGENIUS <span className={isBroker ? 'text-[#8158F6]' : 'text-red-600'}>ACADEMY</span> ES LA ACADEMIA DE TRADING MÁS AVANZADA DE LATINOAMÉRICA PARA OPERAR ÍNDICES SINTÉTICOS.
                    </p>
                    <p className={`font-bold uppercase tracking-widest text-[10px] md:text-xs lg:text-sm leading-loose max-w-3xl mx-auto transition-colors duration-500 ${isBroker ? 'text-white/40' : 'text-gray-500'}`}>
                        FUNDADA POR <button onClick={() => setView('ceo')} className={`${isBroker ? 'text-[#8158F6]' : 'text-red-600'} font-black hover:underline transition-all`}>STEVEN CASTILLO</button>, TRADER PROFESIONAL CON MÁS DE <span className={`${isBroker ? 'text-[#8158F6]' : 'text-red-600'} font-black`}>7 AÑOS DE EXPERIENCIA</span> COMPROBADA EN MERCADOS FINANCIEROS.
                    </p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 px-4">
                    <div className={`transition-all group p-6 lg:p-10 border shadow-2xl transition-all duration-500 ${isBroker
                        ? 'bg-[#322070]/10 border-[#432C8D]/20 shadow-[#8158F6]/5'
                        : 'bg-white border-red-50 shadow-gray-100'
                        }`}>
                        <h4 className={`text-4xl md:text-6xl lg:text-7xl font-black italic mb-4 transition-colors duration-500 ${isBroker ? 'text-[#8158F6]' : 'text-red-600'}`}><CountUp end={1500} duration={3} suffix="+" enableKFormat={true} /></h4>
                        <p className={`font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px] transition-colors duration-500 ${isBroker ? 'text-white/40' : 'text-gray-500'}`}>TRADERS ACTIVOS</p>
                    </div>
                    <div className={`transition-all group p-6 lg:p-10 border shadow-2xl transition-all duration-500 ${isBroker
                        ? 'bg-[#322070]/10 border-[#432C8D]/20 shadow-[#8158F6]/5'
                        : 'bg-white border-red-50 shadow-gray-100'
                        }`}>
                        <h4 className={`text-4xl md:text-6xl lg:text-7xl font-black italic mb-4 transition-colors duration-500 ${isBroker ? 'text-[#8158F6]' : 'text-red-600'}`}><CountUp end={80} duration={3} suffix="%" /></h4>
                        <p className={`font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px] transition-colors duration-500 ${isBroker ? 'text-white/40' : 'text-gray-500'}`}>PRECISIÓN DE SEÑALES</p>
                    </div>
                    <div className={`transition-all group p-6 lg:p-10 border shadow-2xl transition-all duration-500 ${isBroker
                        ? 'bg-[#322070]/10 border-[#432C8D]/20 shadow-[#8158F6]/5'
                        : 'bg-white border-red-50 shadow-gray-100'
                        }`}>
                        <h4 className={`text-4xl md:text-6xl lg:text-7xl font-black italic mb-4 transition-colors duration-500 ${isBroker ? 'text-[#8158F6]' : 'text-red-600'}`}>24/7</h4>
                        <p className={`font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px] transition-colors duration-500 ${isBroker ? 'text-white/40' : 'text-gray-500'}`}>SOPORTE GLOBAL</p>
                    </div>
                </div>
            </div>
            {/* Unified Section Separator (White to Gray Gradient) */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] lg:h-[120px]">
                    <defs>
                        <linearGradient id="about-unified-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: isBroker ? '#090228' : '#ffffff', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: isBroker ? '#090228' : '#fcfcfc', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,0V120H0Z"
                        fill="url(#about-unified-grad)"
                    ></path>
                </svg>
            </div>
        </section>
    );
};

export default AboutUs;
