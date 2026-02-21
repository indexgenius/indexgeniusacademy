import React from 'react';
import { motion } from 'framer-motion';

const PaymentMethods = ({ view }) => {
    const isBroker = view === 'broker';
    return (
        <section className={`py-24 relative overflow-hidden transition-colors duration-500 ${isBroker ? 'bg-[#090228]' : 'bg-[#f4f4f4]'}`}>

            <div className="w-full">
                <div className="text-center mb-16 px-6">
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`text-3xl md:text-5xl lg:text-6xl font-black italic tracking-tighter uppercase mb-6 transition-colors duration-500 ${isBroker ? 'text-white' : 'text-black'}`}
                    >
                        ECOSISTEMA <span className={isBroker ? 'text-[#8158F6]' : 'text-red-600'}>INDEXGENIUS</span>
                    </motion.h3>
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        className={`w-24 h-1 mx-auto mb-8 origin-center transition-colors duration-500 ${isBroker ? 'bg-[#8158F6]' : 'bg-red-600'}`}
                    ></motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className={`text-sm lg:text-base font-bold max-w-3xl mx-auto uppercase tracking-[0.2em] italic leading-relaxed transition-colors duration-500 ${isBroker ? 'text-white/40' : 'text-gray-400'}`}
                    >
                        Infraestructura, plataformas y métodos que respaldan nuestra operación.
                    </motion.p>
                </div>
                <div className="relative mt-12 mb-20">
                    {/* Glassmorphism gradient edges for smooth fade */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: `linear-gradient(to right, ${isBroker ? '#090228' : '#f4f4f4'}, transparent)` }}></div>
                    <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: `linear-gradient(to left, ${isBroker ? '#090228' : '#f4f4f4'}, transparent)` }}></div>

                    <div className="flex gap-12 sm:gap-20 animate-scroll items-center py-10">
                        {[...Array(4)].map((_, i) => (
                            <React.Fragment key={i}>
                                <img src="/img/metodos/logos/logo_bridge_morado.png" alt="Bridge" className="h-10 sm:h-14 object-contain opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-500" />
                                <img src="/img/metodos/logos/mt5-logo.png" alt="MT5" className="h-10 sm:h-14 object-contain opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-500" />
                                <img src="/img/metodos/logos/Trustpilot-Logo.png" alt="Trustpilot" className="h-10 sm:h-14 object-contain opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-500" />
                                <img src="/img/metodos/logos/Cloudflare-logo.png" alt="Cloudflare" className="h-8 sm:h-12 object-contain opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-500" />
                                <img src="/img/metodos/logos/Binance_logo.svg.png" alt="Binance" className="h-10 sm:h-14 object-contain opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-500" />
                                <img src="/img/metodos/logos/Tether_Logo.svg.png" alt="Tether" className="h-10 sm:h-14 object-contain opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-500" />
                                <img src="/img/metodos/logos/Bitcoin_logo.svg.png" alt="Bitcoin" className="h-10 sm:h-14 object-contain opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-500" />
                                <img src="/img/metodos/logos/Logo_Bancolombia2.png" alt="Bancolombia" className="h-10 sm:h-14 object-contain opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-500" />
                                <img src="/img/metodos/logos/nequi-37254.png" alt="Nequi" className="h-10 sm:h-14 object-contain opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-500" />
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Unified Section Separator (Gray to White Gradient) */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] lg:h-[100px]">
                    <defs>
                        <linearGradient id="pay-unified-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: isBroker ? '#090228' : '#fcfcfc', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: isBroker ? '#090228' : '#ffffff', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,0V120H0Z"
                        fill="url(#pay-unified-grad)"
                    ></path>
                </svg>
            </div>
        </section>
    );
};

export default PaymentMethods;
