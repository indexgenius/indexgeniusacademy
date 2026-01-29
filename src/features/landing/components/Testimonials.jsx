import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from './Animations';

const TestimonialCard = ({ t, index }) => {
    const [expanded, setExpanded] = useState(false);
    const maxLength = 150;
    const shouldTruncate = t.text.length > maxLength;
    const displayText = expanded || !shouldTruncate ? t.text : t.text.slice(0, maxLength) + '...';

    return (
        <motion.div className="p-10 border border-white/5 bg-black/40 backdrop-blur-md hover:border-red-600/30 transition-all group flex flex-col justify-between h-full" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ delay: index * 0.1 }}>
            <div>
                <div className="flex gap-1 mb-6">{[...Array(t.stars)].map((_, s) => <div key={s} className="text-red-600">★</div>)}</div>
                <p className="text-gray-300 font-medium mb-2 italic leading-relaxed text-sm">"{displayText}"</p>
                {shouldTruncate && <button onClick={() => setExpanded(!expanded)} className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-white mb-6 block">{expanded ? 'LEER MENOS' : 'LEER MÁS'}</button>}
            </div>
            <div className="flex items-center gap-4 mt-auto border-t border-white/5 pt-6">
                {t.image ? <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-white/20" /> : <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-black italic text-white border border-white/20">{t.name[0]}</div>}
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-black italic tracking-widest text-white">{t.name}</p>
                        <img src={`https://flagcdn.com/24x18/${t.country}.png`} alt={t.country} className="h-3 w-auto rounded-[2px]" />
                    </div>
                    <p className="text-[10px] font-bold text-red-600 tracking-wider uppercase">{t.role}</p>
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
        <section id="testimonials" className="py-32 bg-white/[0.02] border-y border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-red-600/5 blur-[150px] pointer-events-none -z-10"></div>
            <div className="w-full">
                <div className="text-center mb-16 px-6">
                    <h3 className="text-4xl lg:text-7xl font-black italic tracking-tighter uppercase mb-6">
                        <TypewriterText text="TESTIMONIOS" delay={80} />
                    </h3>
                    <div className="w-20 h-1 bg-red-600 mx-auto mb-8"></div>
                </div>
                <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-8 lg:w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-8 lg:w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
                    <div className="flex gap-8 animate-scroll hover:pause py-4 w-max">
                        {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                            <div key={i} className="w-[350px] lg:w-[450px] flex-shrink-0"><TestimonialCard t={t} index={i} /></div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
