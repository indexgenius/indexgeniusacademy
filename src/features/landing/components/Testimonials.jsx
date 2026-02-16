import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from './Animations';

const TestimonialCard = ({ t, index }) => {
    const [expanded, setExpanded] = useState(false);
    const maxLength = 150;
    const shouldTruncate = t.text.length > maxLength;
    const displayText = expanded || !shouldTruncate ? t.text : t.text.slice(0, maxLength) + '...';

    return (
        <motion.div className="p-10 bg-white border border-gray-100 transition-all group flex flex-col justify-between h-full hover:border-red-600 shadow-xl shadow-gray-100/50" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ delay: index * 0.1 }}>
            <div>
                <div className="flex gap-1 mb-6">{[...Array(t.stars)].map((_, s) => <div key={s} className="text-red-600 text-lg">★</div>)}</div>
                <p className="font-bold mb-8 italic leading-loose text-sm text-gray-700 tracking-wide">"{displayText}"</p>
                {shouldTruncate && <button onClick={() => setExpanded(!expanded)} className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-800 mb-6 block transition-colors">{expanded ? 'LEER MENOS' : 'LEER MÁS'}</button>}
            </div>
            <div className="flex items-center gap-4 mt-auto border-t border-gray-50 pt-8">
                {t.image ? <img src={t.image} alt={t.name} className="w-14 h-14 rounded-full object-cover border-2 border-red-50" /> : <div className="w-14 h-14 rounded-full flex items-center justify-center font-black italic border-2 border-red-50 bg-gray-50 text-gray-900">{t.name[0]}</div>}
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-black italic tracking-widest text-black">{t.name}</p>
                        <img src={`https://flagcdn.com/24x18/${t.country}.png`} alt={t.country} className="h-3 w-auto rounded-[2px] grayscale-[0.5]" />
                    </div>
                    <p className="text-[10px] font-black text-red-600 tracking-[0.2em] uppercase">{t.role}</p>
                </div>
            </div>
        </motion.div>
    );
};

const Testimonials = () => {
    const testimonials = [
        { name: "YEISSON RUIZ", country: "co", role: "MIEMBRO COMUNIDAD", text: "Steven el trading es de paciencia y aprendizaje, gracias a personas como vos que nos has ayudado a tener ganancias se aprende día a día.", stars: 5, image: "/testimonios/yeissontestimonio.jpeg" },
        { name: "NANCY G.", country: "ni", role: "MIEMBRO COMUNIDAD", text: "Agradezco la oportunidad de haber conocido el trading y por haber llegado a esta comunidad. ❤️", stars: 5, image: null },
        { name: "SHEREZHADE M.", country: "ve", role: "MIEMBRO COMUNIDAD", text: "Logré recuperar la esperanza de invertir y duplicar mi dinero invertido y además las entradas de el son muy buenas. 🙏", stars: 5, image: null },
    ];

    return (
        <section id="testimonials" className="py-32 relative overflow-hidden bg-[#fcfcfc]">
            <div className="absolute top-0 right-0 w-full h-full bg-red-600/[0.02] blur-[150px] pointer-events-none -z-10"></div>
            <div className="w-full">
                <div className="text-center mb-24 px-6">
                    <h3 className="text-5xl lg:text-8xl font-black italic tracking-tighter uppercase mb-6 text-black">
                        <TypewriterText text="TESTIMONIOS" delay={80} />
                    </h3>
                    <div className="w-24 h-2 bg-red-600 mx-auto"></div>
                </div>
                <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-8 lg:w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--bg-primary), transparent)' }}></div>
                    <div className="absolute right-0 top-0 bottom-0 w-8 lg:w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--bg-primary), transparent)' }}></div>
                    <div className="flex gap-8 animate-scroll hover:pause py-4 w-max">
                        {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                            <div key={i} className="w-[350px] lg:w-[450px] flex-shrink-0"><TestimonialCard t={t} index={i} /></div>
                        ))}
                    </div>
                </div>
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
