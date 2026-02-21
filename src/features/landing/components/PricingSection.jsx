import React from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Zap, Star, Crown, ArrowRight } from 'lucide-react';

const PricingSection = ({ onShowAuth }) => {
    const plans = [
        {
            name: 'BASICO',
            price: '15',
            period: 'USDT / MENSUAL',
            description: 'Ideal para quienes están comenzando en el mundo del trading.',
            features: [
                'Señales de trading básicas',
                'Acceso a comunidad abierta',
                'Soporte técnico estándar',
                'Guía de instalación básica'
            ],
            icon: <Zap size={24} className="text-gray-400" />,
            popular: false,
            accent: 'bg-gray-100'
        },
        {
            name: 'ELITE ACCESS',
            price: '25',
            period: 'USDT / DE POR VIDA',
            description: 'Nuestro plan más popular. Acceso total a toda la infraestructura.',
            features: [
                'Feed de señales premium 24/7',
                'Bóveda educativa exclusiva',
                'Comunidad Elite privada',
                'Soporte prioritario 1-on-1',
                'Herramientas exclusivas'
            ],
            icon: <Crown size={32} className="text-red-600" />,
            popular: true,
            accent: 'bg-red-600'
        },
        {
            name: 'PRO VIP',
            price: '99',
            period: 'USDT / ANUAL',
            description: 'Para traders que buscan mentoría y herramientas personalizadas.',
            features: [
                'Todo lo del plan ELITE',
                'Mentoría personalizada mensual',
                'Configuración de bots propia',
                'Acceso anticipado a herramientas',
                'Sesiones en vivo exclusivas'
            ],
            icon: <Star size={24} className="text-gray-400" />,
            popular: false,
            accent: 'bg-black'
        }
    ];

    return (
        <section id="pricing" className="py-24 lg:py-32 px-6 lg:px-20 bg-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/[0.03] blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gray-200/[0.2] blur-[100px] pointer-events-none"></div>

            {/* Tactical Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#dc2626 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            {/* Massive Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none select-none opacity-[0.02] z-0 overflow-hidden flex items-center justify-center">
                <h2 className="text-[150px] lg:text-[400px] font-black italic uppercase tracking-tighter text-black leading-none">ELITE</h2>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 lg:mb-24"
                >
                    <p className="text-[10px] font-black tracking-[0.4em] text-red-600 uppercase mb-4 italic">Elige tu Nivel de Acceso</p>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter uppercase text-black leading-none mb-6">
                        PLANES DE <span className="text-red-700">MEMBRESÍA</span>
                    </h2>
                    <div className="w-24 h-1.5 bg-red-600 mx-auto"></div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 items-center px-2 md:px-0">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative p-6 lg:p-10 border-2 transition-all duration-500 group flex flex-col ${plan.popular
                                ? 'bg-black text-white border-red-600 scale-[1.01] md:scale-105 shadow-[0_0_80px_rgba(220,38,38,0.15)] z-20'
                                : 'bg-white text-black border-gray-100 hover:border-red-600/30 shadow-xl shadow-black/[0.01]'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-6 py-2 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] skew-x-[-12deg] shadow-lg shadow-red-600/20 whitespace-nowrap">
                                    LA MEJOR OPCIÓN
                                </div>
                            )}

                            <div className="mb-6 flex justify-between items-start">
                                <div className={`p-3 lg:p-4 ${plan.popular ? 'bg-white/5' : 'bg-gray-50'} group-hover:scale-110 transition-transform`}>
                                    {plan.icon}
                                </div>
                                <Shield size={20} className={plan.popular ? 'opacity-20 text-red-500' : 'opacity-10'} strokeWidth={3} />
                            </div>

                            <h3 className={`text-2xl lg:text-3xl font-black italic tracking-tighter uppercase mb-2 ${plan.popular ? 'text-white' : 'text-black'}`}>
                                {plan.name}
                            </h3>
                            <p className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest mb-6 lg:mb-8 ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>
                                {plan.description}
                            </p>

                            <div className="mb-8 lg:mb-10 flex items-baseline gap-2">
                                <span className={`text-5xl lg:text-7xl font-black italic tracking-tighter ${plan.popular ? 'text-white' : 'text-black'}`}>
                                    ${plan.price}
                                </span>
                                <span className={`text-[8px] lg:text-[10px] font-black uppercase tracking-widest ${plan.popular ? 'text-red-500' : 'text-gray-400'}`}>
                                    {plan.period}
                                </span>
                            </div>

                            <div className="space-y-3 lg:space-y-4 mb-10 lg:mb-12 flex-grow">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className={`w-3 h-[2px] transition-all duration-500 ${plan.popular ? 'bg-red-600' : 'bg-gray-200 group-hover:bg-red-600'}`}></div>
                                        <span className={`text-[9px] lg:text-[11px] font-bold uppercase tracking-tight ${plan.popular ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={onShowAuth}
                                className={`w-full py-5 lg:py-6 font-black italic text-[10px] lg:text-sm uppercase tracking-[0.2em] lg:tracking-[0.3em] skew-x-[-12deg] transition-all flex items-center justify-center gap-3 lg:gap-4 group/btn ${plan.popular
                                    ? 'bg-red-600 text-white hover:bg-white hover:text-black shadow-[0_10px_30px_rgba(220,38,38,0.3)]'
                                    : 'bg-black text-white hover:bg-red-600'
                                    }`}
                            >
                                SELECCIONAR PLAN
                                <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
                            </button>

                            {/* Tactical decorative accent corner */}
                            <div className={`absolute top-0 right-0 w-2 h-2 ${plan.popular ? 'bg-red-600' : 'bg-gray-100 group-hover:bg-red-600/30'} transition-colors`}></div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 text-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-gray-100 -z-10"></div>
                    <p className="bg-white px-8 inline-block text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-6 italic">Secure cryptographic payment processing</p>
                    <div className="flex justify-center gap-6 lg:gap-8 items-center">
                        <img src="/img/metodos/logos/Tether_Logo.svg.png" alt="USDT" className="h-4 lg:h-5 filter grayscale opacity-40 hover:opacity-100 transition-opacity" />
                        <img src="/img/metodos/logos/Binance_logo.svg.png" alt="Binance" className="h-4 lg:h-5 filter grayscale opacity-40 hover:opacity-100 transition-opacity" />
                        <img src="/img/metodos/logos/Bitcoin_logo.svg.png" alt="Bitcoin" className="h-4 lg:h-5 filter grayscale opacity-40 hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
