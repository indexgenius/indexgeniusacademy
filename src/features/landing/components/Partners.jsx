import React from 'react';
import { motion } from 'framer-motion';

const Partners = () => {
    const partners = [
        { name: 'BRIDGE MARKETS', logo: '/img/partners/bridge.png', description: 'Broker Socio Estratégico' },
        { name: 'METATRADER 5', logo: '/img/partners/mt5.png', description: 'Terminal Profesional' },
        { name: 'TRADINGVIEW', logo: '/img/partners/tradingview.png', description: 'Análisis de Precisión' },
    ];

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Subtle Top Divider */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/10 to-transparent"></div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[10px] font-black tracking-[0.4em] text-red-600 uppercase mb-4 italic"
                    >
                        Ecosistema Global
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl lg:text-6xl font-black italic tracking-tighter uppercase text-black"
                    >
                        NUESTROS <span className="text-red-700">PARTNERS</span>
                    </motion.h2>
                    <div className="w-20 h-1 bg-red-600 mx-auto mt-6"></div>
                </div>

                <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
                    {partners.map((partner, idx) => (
                        <motion.div
                            key={partner.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={`group flex flex-col items-center justify-center p-8 border rounded-2xl transition-all duration-500 w-full sm:w-[calc(50%-1.5rem)] lg:w-[300px] ${partner.name === 'BRIDGE MARKETS'
                                    ? 'bg-[#000033] border-blue-900 shadow-xl shadow-blue-900/10'
                                    : 'bg-white border-gray-50 hover:border-red-600/20 hover:shadow-2xl hover:shadow-red-600/5'
                                }`}
                        >
                            <div className="h-16 flex items-center justify-center mb-6 transition-all duration-500 transform group-hover:scale-110">
                                {partner.name === 'BRIDGE MARKETS' ? (
                                    <img
                                        src="/img/parners/BRIDGEMARKETS.png"
                                        alt="Bridge Markets"
                                        className="h-full w-full object-contain"
                                    />
                                ) : partner.name === 'METATRADER 5' ? (
                                    <img
                                        src="/img/parners/META TRADER 5.png"
                                        alt="MetaTrader 5"
                                        className="h-full w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                                    />
                                ) : (
                                    <span className="text-2xl font-black italic tracking-tighter text-gray-300 group-hover:text-red-700 transition-colors uppercase">
                                        {partner.name}
                                    </span>
                                )}
                            </div>
                            <p className={`text-[10px] font-black tracking-widest uppercase text-center transition-colors ${partner.name === 'BRIDGE MARKETS' ? 'text-white/60 group-hover:text-white' : 'text-gray-400 group-hover:text-black'
                                }`}>
                                {partner.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-red-600/[0.02] rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-red-600/[0.02] rounded-full blur-3xl pointer-events-none"></div>
            </div>
        </section>
    );
};

export default Partners;
