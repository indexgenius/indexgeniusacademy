import React from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Zap, Star, Crown, ArrowRight, Lock } from 'lucide-react';

const PricingSection = ({ onShowAuth }) => {
    const selectPlan = (planId, planName, price, period) => {
        localStorage.setItem('selectedPlan', JSON.stringify({ id: planId, name: planName, price, period }));
        onShowAuth();
    };

    const plans = [
        {
            id: 'index-one',
            name: 'INDEX ONE',
            price: '97',
            period: '/ mensual',
            description: 'Acceso mensual al ecosistema IndexGenius.',
            features: [
                'Acceso a IndexGenius App',
                'Señales de trading en tiempo real',
                'Curso Básico de Trading',
                'Guía de instalación y configuración',
                'Soporte general vía comunidad'
            ],
            icon: <Zap size={24} className="text-gray-400" />,
            popular: false,
            badge: null,
            cta: 'SUSCRIBIRME AHORA',
            cardStyle: 'bg-white text-black border-gray-100 hover:border-red-600/30 shadow-xl shadow-black/[0.01]',
            btnStyle: 'bg-black text-white hover:bg-red-600'
        },
        {
            id: 'index-pro',
            name: 'INDEX PRO',
            price: '297',
            period: '/ mensual',
            description: 'Infraestructura profesional completa.',
            features: [
                'Todo lo incluido en INDEX ONE',
                'Curso Completo de Trading',
                'Plantilla automatizada IndexPro',
                'Grupo privado exclusivo',
                'Masterclass estratégicas',
                'Actualizaciones constantes del sistema',
                'Acceso prioritario a nuevas herramientas'
            ],
            icon: <Crown size={32} className="text-red-600" />,
            popular: true,
            badge: '🔥 MÁS POPULAR',
            cta: 'UNIRME A PRO',
            cardStyle: 'bg-black text-white border-red-600 scale-[1.01] md:scale-105 shadow-[0_0_80px_rgba(220,38,38,0.15)] z-20',
            btnStyle: 'bg-red-600 text-white hover:bg-white hover:text-black shadow-[0_10px_30px_rgba(220,38,38,0.3)]'
        },
        {
            id: 'index-black',
            name: 'INDEX BLACK',
            price: '1,000',
            period: 'pago único',
            description: 'Programa privado de alto rendimiento.',
            features: [
                'Todo lo incluido en INDEX PRO',
                'Mentoría directa 1 a 1 con Steven Castillo',
                'Plan de escalamiento de capital',
                'Seguimiento personalizado',
                'Evaluación estratégica de cuenta',
                'Sesiones privadas de revisión',
                'Grupo BLACK (capital alto)',
                'Cupos limitados'
            ],
            icon: <Star size={24} className="text-gray-400" />,
            popular: false,
            badge: '⚫ ACCESO LIMITADO',
            cta: 'APLICAR AHORA',
            cardStyle: 'bg-[#0a0a0a] text-white border-white/10 hover:border-white/30 shadow-xl shadow-black/20',
            btnStyle: 'bg-white text-black hover:bg-red-600 hover:text-white'
        }
    ];

    const comparisonData = [
        { feature: 'Acceso a IndexGenius App', one: true, pro: true, black: true },
        { feature: 'Señales en tiempo real', one: true, pro: true, black: true },
        { feature: 'Curso Básico de Trading', one: true, pro: true, black: true },
        { feature: 'Curso Completo de Trading', one: false, pro: true, black: true },
        { feature: 'Plantilla Automatizada IndexPro', one: false, pro: true, black: true },
        { feature: 'Grupo Privado Exclusivo', one: false, pro: true, black: true },
        { feature: 'Masterclass Estratégicas', one: false, pro: true, black: true },
        { feature: 'Mentoría Directa 1 a 1', one: false, pro: false, black: true },
        { feature: 'Seguimiento Personalizado', one: false, pro: false, black: true },
        { feature: 'Evaluación Estratégica de Cuenta', one: false, pro: false, black: true },
        { feature: 'Grupo BLACK Capital Alto', one: false, pro: false, black: true },
        { feature: 'Cupos Limitados', one: false, pro: false, black: true },
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
                <h2 className="text-[150px] lg:text-[400px] font-black italic uppercase tracking-tighter text-black leading-none">INDEX</h2>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* ═══ HEADER ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 lg:mb-24"
                >
                    <p className="text-[10px] font-black tracking-[0.4em] text-red-600 uppercase mb-4 italic">Elige tu Nivel de Acceso</p>
                    <h2 className="text-3xl md:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase text-black leading-none mb-6">
                        ELIGE TU NIVEL DENTRO DEL <br /><span className="text-red-700">ECOSISTEMA INDEXGENIUS</span>
                    </h2>
                    <p className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-[0.2em] max-w-xl mx-auto italic">
                        Infraestructura profesional para traders disciplinados.
                    </p>
                    <div className="w-24 h-1.5 bg-red-600 mx-auto mt-6"></div>
                </motion.div>

                {/* ═══ PLAN CARDS ═══ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 items-stretch px-2 md:px-0">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative p-6 lg:p-10 border-2 transition-all duration-500 group flex flex-col ${plan.cardStyle}`}
                        >
                            {plan.badge && (
                                <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] skew-x-[-12deg] shadow-lg whitespace-nowrap ${plan.popular
                                    ? 'bg-red-600 text-white shadow-red-600/20'
                                    : 'bg-black text-white shadow-black/20 border border-white/20'
                                    }`}>
                                    {plan.badge}
                                </div>
                            )}

                            <div className="mb-6 flex justify-between items-start">
                                <div className={`p-3 lg:p-4 ${plan.popular ? 'bg-white/5' : plan.id === 'index-black' ? 'bg-white/5' : 'bg-gray-50'} group-hover:scale-110 transition-transform`}>
                                    {plan.icon}
                                </div>
                                <Shield size={20} className={plan.popular ? 'opacity-20 text-red-500' : plan.id === 'index-black' ? 'opacity-20 text-white' : 'opacity-10'} strokeWidth={3} />
                            </div>

                            <h3 className={`text-2xl lg:text-3xl font-black italic tracking-tighter uppercase mb-2 ${plan.popular || plan.id === 'index-black' ? 'text-white' : 'text-black'}`}>
                                {plan.name}
                            </h3>
                            <p className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest mb-6 lg:mb-8 ${plan.popular || plan.id === 'index-black' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {plan.description}
                            </p>

                            <div className="mb-8 lg:mb-10 flex items-baseline gap-2">
                                <span className={`text-5xl lg:text-7xl font-black italic tracking-tighter ${plan.popular ? 'text-white' : plan.id === 'index-black' ? 'text-white' : 'text-black'}`}>
                                    ${plan.price}
                                </span>
                                <span className={`text-[8px] lg:text-[10px] font-black uppercase tracking-widest ${plan.popular ? 'text-red-500' : plan.id === 'index-black' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {plan.period}
                                </span>
                            </div>

                            <div className="space-y-3 lg:space-y-4 mb-10 lg:mb-12 flex-grow">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className={`w-3 h-[2px] transition-all duration-500 ${plan.popular ? 'bg-red-600'
                                            : plan.id === 'index-black' ? 'bg-white/30 group-hover:bg-white'
                                                : 'bg-gray-200 group-hover:bg-red-600'
                                            }`}></div>
                                        <span className={`text-[9px] lg:text-[11px] font-bold uppercase tracking-tight ${plan.popular || plan.id === 'index-black' ? 'text-gray-300' : 'text-gray-600'
                                            }`}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => selectPlan(plan.id, plan.name, plan.price, plan.period)}
                                className={`w-full py-5 lg:py-6 font-black italic text-[10px] lg:text-sm uppercase tracking-[0.2em] lg:tracking-[0.3em] skew-x-[-12deg] transition-all flex items-center justify-center gap-3 lg:gap-4 group/btn ${plan.btnStyle}`}
                            >
                                {plan.cta}
                                <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
                            </button>

                            {/* Tactical decorative accent corner */}
                            <div className={`absolute top-0 right-0 w-2 h-2 ${plan.popular ? 'bg-red-600' : plan.id === 'index-black' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-red-600/30'} transition-colors`}></div>
                        </motion.div>
                    ))}
                </div>

                {/* ═══ COMPARISON TABLE ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 lg:mt-28"
                >
                    <div className="text-center mb-10 lg:mb-14">
                        <p className="text-[10px] font-black tracking-[0.4em] text-red-600 uppercase mb-4 italic">Comparación Detallada</p>
                        <h3 className="text-2xl md:text-4xl lg:text-5xl font-black italic tracking-tighter uppercase text-black leading-none">
                            ¿QUÉ INCLUYE <span className="text-red-700">CADA PLAN</span>?
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-black">
                                    <th className="text-left py-5 px-4 lg:px-6 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-gray-400 w-[40%]">Características</th>
                                    <th className="text-center py-5 px-3 lg:px-6 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-gray-600">
                                        <span className="text-green-600">🟢</span> Index One
                                    </th>
                                    <th className="text-center py-5 px-3 lg:px-6 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-red-600 relative">
                                        <span>🔴</span> Index Pro
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[120px] h-[3px] bg-red-600"></div>
                                    </th>
                                    <th className="text-center py-5 px-3 lg:px-6 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-gray-600">
                                        <span>⚫</span> Index Black
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Price Row */}
                                <tr className="border-b border-gray-200 bg-gray-50/50">
                                    <td className="py-5 lg:py-6 px-4 lg:px-6 text-[10px] lg:text-xs font-black text-black uppercase tracking-tight italic">
                                        Precio
                                    </td>
                                    <td className="text-center py-5 lg:py-6 px-3 lg:px-6">
                                        <span className="text-lg lg:text-xl font-black italic text-black">$97</span>
                                        <span className="block text-[7px] lg:text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">USD / MES</span>
                                    </td>
                                    <td className="text-center py-5 lg:py-6 px-3 lg:px-6 bg-red-600/[0.04]">
                                        <span className="text-lg lg:text-xl font-black italic text-red-600">$297</span>
                                        <span className="block text-[7px] lg:text-[8px] font-black text-red-500 uppercase tracking-widest mt-1">USD / MES</span>
                                    </td>
                                    <td className="text-center py-5 lg:py-6 px-3 lg:px-6">
                                        <span className="text-lg lg:text-xl font-black italic text-black">$1,000</span>
                                        <span className="block text-[7px] lg:text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">PAGO ÚNICO</span>
                                    </td>
                                </tr>

                                {/* Feature Rows */}
                                {comparisonData.map((row, i) => (
                                    <tr key={i} className={`border-b border-gray-100 transition-colors hover:bg-gray-50/50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                                        <td className="py-4 lg:py-5 px-4 lg:px-6 text-[10px] lg:text-xs font-bold text-gray-700 uppercase tracking-tight italic">
                                            {row.feature}
                                        </td>
                                        <td className="text-center py-4 lg:py-5 px-3 lg:px-6">
                                            {row.one ? (
                                                <span className="inline-flex items-center justify-center w-6 h-6 bg-green-50 rounded-full">
                                                    <Check size={14} className="text-green-600" strokeWidth={3} />
                                                </span>
                                            ) : (
                                                <span className="text-sm font-black text-red-300">✕</span>
                                            )}
                                        </td>
                                        <td className="text-center py-4 lg:py-5 px-3 lg:px-6 bg-red-600/[0.02]">
                                            {row.pro ? (
                                                <span className="inline-flex items-center justify-center w-6 h-6 bg-red-50 rounded-full">
                                                    <Check size={14} className="text-red-600" strokeWidth={3} />
                                                </span>
                                            ) : (
                                                <span className="text-sm font-black text-red-300">✕</span>
                                            )}
                                        </td>
                                        <td className="text-center py-4 lg:py-5 px-3 lg:px-6">
                                            {row.black ? (
                                                <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
                                                    <Check size={14} className="text-black" strokeWidth={3} />
                                                </span>
                                            ) : (
                                                <span className="text-sm font-black text-red-300">✕</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>


                </motion.div>

                {/* ═══ LEGAL DISCLAIMER ═══ */}
                <div className="mt-16 text-center max-w-2xl mx-auto">
                    <p className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] leading-loose italic">
                        Pagos seguros. Suscripciones renovables automáticamente en planes mensuales.
                        El desempeño depende de disciplina, gestión de riesgo y condiciones del mercado.
                    </p>
                </div>

                {/* ═══ PAYMENT LOGOS ═══ */}
                <div className="mt-12 text-center relative">
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
