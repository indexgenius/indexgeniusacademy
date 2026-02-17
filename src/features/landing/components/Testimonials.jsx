import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Check } from 'lucide-react';
import { TypewriterText } from './Animations';

const TestimonialCard = ({ t, index }) => {
    const [expanded, setExpanded] = useState(false);
    const maxLength = 150;
    const shouldTruncate = t.text.length > maxLength;
    const displayText = expanded || !shouldTruncate ? t.text : t.text.slice(0, maxLength) + '...';

    return (
        <motion.div className="p-10 bg-white border border-gray-100 transition-all group flex flex-col justify-between h-full hover:border-[#00b67a] shadow-xl shadow-gray-100/50 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: index * 0.1 }}
        >
            {/* Trustpilot 'Verified' Badge Style */}
            <div className="absolute top-4 right-4 flex items-center gap-1 opacity-40">
                <div className="w-3 h-3 bg-[#00b67a] rounded-full flex items-center justify-center">
                    <Check size={8} className="text-white" />
                </div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Verificado</span>
            </div>

            <div>
                <div className="flex gap-1 mb-6">
                    {[...Array(t.stars)].map((_, s) => (
                        <div key={s} className="bg-[#00b67a] p-1 rounded-sm flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                        </div>
                    ))}
                </div>
                <h4 className="text-sm font-black italic uppercase text-black mb-3 tracking-tighter">{t.title}</h4>
                <p className="font-bold mb-8 italic leading-loose text-xs text-gray-700 tracking-wide">"{displayText}"</p>
                {shouldTruncate && <button onClick={() => setExpanded(!expanded)} className="text-[10px] font-black uppercase tracking-widest text-[#00b67a] hover:text-[#008f5d] mb-6 block transition-colors">{expanded ? 'LEER MENOS' : 'LEER MÁS'}</button>}
            </div>
            <div className="flex items-center gap-4 mt-auto border-t border-gray-50 pt-8">
                <div className="w-14 h-14 rounded-full flex items-center justify-center font-black italic border-2 border-gray-100 bg-gray-50 text-gray-900 shadow-sm">{t.name[0]}</div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-black italic tracking-widest text-black">{t.name}</p>
                        <img src={`https://flagcdn.com/24x18/${t.country}.png`} alt={t.country} className="h-3 w-auto rounded-[2px] grayscale-[0.5]" />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">Cliente Verificado</p>
                </div>
            </div>
        </motion.div>
    );
};

const Testimonials = () => {
    const testimonials = [
        {
            name: "MOISES MENDEZ",
            country: "do",
            title: "CONOCÍ LA ACADEMIA HACE POCO",
            text: "Conocí la academia hace poco, pero en ese poco tiempo he estado aprendiendo la paciencia y a seguir las instrucciones para esperar el desarrollo de las operaciones y en consecuencia mi cuenta ha ido creciendo, muy buena academia",
            stars: 5
        },
        {
            name: "NATALIE ALVARADO",
            country: "cr",
            title: "LA MEJOR DE TODAS LAS ACADEMIAS",
            text: "La mejor de todas las academias, resultados reales y sostenidos en el tiempo, sin vender humo, sin costos exagerados, un lugar en donde se aprende de verdad a hacer trading",
            stars: 5
        },
        {
            name: "ALDO RAMIREZ",
            country: "mx",
            title: "EXCELENTE GESTIÓN",
            text: "Excelente gestión, pocos trades, buenos riesgos/beneficios, ayudan con el tema del psicotrading, muy completa! Recomendado 🫡",
            stars: 5
        },
        {
            name: "FERNANDO FERRUFINO",
            country: "bo",
            title: "CONFÍEN EN ESTA FAMILIA",
            text: "La verdad muy buena academia, Steven es una persona muy sencilla y humilde que siempre responde tus dudas, en estos tiempos eso es muy difícil de encontrar. Hoy 16 de febrero, gracias a sus conocimientos y formación me hizo el día y la pase en familia gracias a el.",
            stars: 5
        },
        {
            name: "FRANCHESCA TELLEZ",
            country: "cr",
            title: "UN ANTES Y UN DESPUÉS",
            text: "Quiero hablarles de Index Genius Academy porque sinceramente ha sido una experiencia que ha marcado un antes y un después en mi camino en el trading. No es solo una academia más, es un espacio donde realmente te enseñan a entender el mercado.",
            stars: 5
        },
        {
            name: "NATALIA",
            country: "co",
            title: "LA MEJOR ACADEMIA DE TRADING",
            text: "La mejor academia de trading, lo importante es tener consistencia y buen manejo de riesgo, la mejor. Y con excelentes resultados 💪",
            stars: 5
        }
    ];

    return (
        <section id="testimonials" className="py-32 relative overflow-hidden bg-[#fcfcfc]">
            <div className="absolute top-0 right-0 w-full h-full bg-[#00b67a]/[0.02] blur-[150px] pointer-events-none -z-10"></div>
            <div className="w-full">
                <div className="text-center mb-24 px-6">
                    <a
                        href="https://www.trustpilot.com/review/indexgeniusacademy.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center group"
                    >
                        <div className="flex items-center justify-center gap-2 mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Star className="text-[#00b67a] fill-[#00b67a]" size={20} />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-[#00b67a] transition-colors">Trustpilot Reviews</span>
                        </div>
                        <h3 className="text-3xl lg:text-7xl font-black italic tracking-tighter uppercase mb-6 text-black leading-tight max-w-5xl mx-auto group-hover:text-gray-800 transition-colors">
                            <TypewriterText text="NUESTROS CLIENTES HABLAN POR NOSOTROS" delay={40} />
                        </h3>
                        <div className="w-32 h-2 bg-[#00b67a] mx-auto rounded-full group-hover:w-48 transition-all duration-500"></div>
                    </a>
                </div>
                <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-8 lg:w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #fcfcfc, transparent)' }}></div>
                    <div className="absolute right-0 top-0 bottom-0 w-8 lg:w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #fcfcfc, transparent)' }}></div>
                    <div className="flex gap-8 animate-scroll hover:pause py-4 w-max">
                        {[...testimonials, ...testimonials].map((t, i) => (
                            <div key={i} className="w-[350px] lg:w-[450px] flex-shrink-0"><TestimonialCard t={t} index={i} /></div>
                        ))}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 text-center"
                >
                    <a
                        href="https://www.trustpilot.com/review/indexgeniusacademy.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-6 py-3 sm:px-10 sm:py-5 bg-[#00b67a] text-white rounded-full font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] italic hover:bg-black hover:scale-105 transition-all duration-300 shadow-xl shadow-[#00b67a]/20 group text-[10px] sm:text-[11px] text-center"
                    >
                        Ver todas las reseñas en Trustpilot
                        <Star className="group-hover:rotate-45 transition-transform hidden sm:block" size={18} fill="white" />
                    </a>
                    <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] opacity-60">
                        Puntuación Excelente de 4.4 basada en testimonios reales
                    </p>
                </motion.div>
            </div>
            {/* Unified Section Separator (Gray to White Gradient) */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] lg:h-[120px]">
                    <defs>
                        <linearGradient id="test-unified-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#fcfcfc', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,0V120H0Z"
                        fill="url(#test-unified-grad)"
                    ></path>
                </svg>
            </div>
        </section>
    );
};

export default Testimonials;
