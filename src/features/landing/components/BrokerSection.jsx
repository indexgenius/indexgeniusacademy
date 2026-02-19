import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, BarChart3, Clock, Layout, Lock, Headphones, ArrowRight } from 'lucide-react';

const BrokerSection = () => {
    return (
        <section className="min-h-screen bg-[#090228] text-white pt-24 pb-32 relative overflow-hidden font-space">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#8158F6]/[0.1] blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#432C8D]/[0.15] blur-[120px] rounded-full pointer-events-none"></div>

            {/* Tactical Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#8158F6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Hero Composite Section */}
                <div className="relative flex flex-col items-center justify-center py-16 lg:py-24 text-center">

                    {/* Extra Label above logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="mb-8 px-4 py-1 border border-[#8158F6]/30 bg-[#8158F6]/5 backdrop-blur-sm rounded-full"
                    >
                        <p className="text-[9px] font-black tracking-[0.4em] text-[#8158F6] uppercase italic">Aliado Oficial de Infraestructura</p>
                    </motion.div>

                    {/* Premium Partnership Composite */}
                    <div className="flex flex-col items-center justify-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="relative group p-8 lg:p-12 bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-2xl flex flex-col md:flex-row items-center gap-8 lg:gap-16 shadow-[0_0_100px_rgba(129,88,246,0.1)] transition-all hover:bg-white/[0.04] hover:border-[#8158F6]/20"
                        >
                            {/* Glow Effect behind */}
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-[#8158F6]/5 rounded-2xl pointer-events-none"></div>

                            {/* Our Side */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-16 lg:h-24 flex items-center justify-center">
                                    <img
                                        src="/img/logos/IMG_5208.PNG"
                                        alt="IndexGenius Academy"
                                        className="h-full object-contain filter drop-shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                                    />
                                </div>
                                <span className="text-[10px] font-black tracking-[0.3em] text-gray-500 uppercase">The Academy</span>
                            </div>

                            {/* Tactical Cross */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-px h-12 lg:h-16 bg-gradient-to-b from-transparent via-[#8158F6]/50 to-transparent"></div>
                                <div className="text-2xl lg:text-4xl font-black italic text-[#8158F6] drop-shadow-[0_0_15px_rgba(129,88,246,0.8)] skew-x-[-12deg]">
                                    X
                                </div>
                                <div className="w-px h-12 lg:h-16 bg-gradient-to-b from-transparent via-[#8158F6]/50 to-transparent"></div>
                            </div>

                            {/* Partner Side */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-14 lg:h-20 flex items-center justify-center">
                                    <img
                                        src="/img/metodos/logos/logo_bridge_morado.png"
                                        alt="Bridge Markets"
                                        className="h-full object-contain filter drop-shadow-[0_0_40px_rgba(129,88,246,0.3)] brightness-125"
                                    />
                                </div>
                                <span className="text-[10px] font-black tracking-[0.3em] text-gray-500 uppercase">The Infrastructure</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Header & Main Info */}
                    <div className="space-y-8 max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                        >
                            <h2 className="text-4xl lg:text-7xl font-black italic tracking-tighter uppercase leading-[0.9] text-white">
                                Nuestro Aliado <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8158F6] to-white italic pr-4">Estratégico</span>
                            </h2>
                            <p className="text-[11px] lg:text-sm font-black tracking-[0.3em] text-[#8158F6] uppercase">BridgeMarkets x IndexGenius Academy</p>
                        </motion.div>

                        <div className="space-y-6">
                            <p className="text-sm lg:text-lg font-bold text-gray-400 uppercase tracking-tight leading-relaxed italic">
                                Trabajamos junto a un broker internacional que nos permite operar con <span className="text-white underline decoration-[#8158F6] decoration-4 underline-offset-4">infraestructura profesional, ejecución optimizada</span> y acceso a múltiples mercados financieros.
                            </p>
                            <p className="text-[10px] lg:text-sm text-gray-500 font-bold uppercase tracking-widest leading-loose max-w-2xl mx-auto">
                                En IndexGenius Academy recomendamos operar únicamente con aliados que cumplan estándares de tecnología, seguridad y estabilidad operativa.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mt-12">
                    <div className="mb-16 text-center">
                        <h3 className="text-lg lg:text-2xl font-black italic uppercase tracking-[0.2em] text-[#8158F6]">
                            🔹 Beneficios de operar con nuestro Partner Oficial
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {[
                            {
                                label: 'MetaTrader 5',
                                title: 'Infraestructura',
                                desc: 'Infraestructura optimizada con ejecución rápida y latencia reducida para una experiencia de trading eficiente.',
                                icon: <Layout size={32} />
                            },
                            {
                                label: 'Fondos Seguros',
                                title: 'Seguridad',
                                desc: 'Entorno robusto diseñado para operar con mayor tranquilidad y respaldo tecnológico de grado institucional.',
                                icon: <Lock size={32} />
                            },
                            {
                                label: 'Soporte Especializado',
                                title: 'Atención',
                                desc: 'Equipo de atención disponible para resolver incidencias operativas cuando lo necesites, con prioridad absoluta.',
                                icon: <Headphones size={32} />
                            }
                        ].map((benefit, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-10 bg-[#322070]/10 border border-[#432C8D]/20 hover:border-[#8158F6]/50 hover:bg-[#322070]/20 transition-all relative overflow-hidden rounded-sm backdrop-blur-sm"
                            >
                                <div className="mb-8 text-white/90 group-hover:text-[#8158F6] group-hover:scale-110 transition-all duration-500">
                                    {benefit.icon}
                                </div>
                                <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-2 text-white">{benefit.label}</h4>
                                <p className="text-[10px] font-black tracking-[0.4em] text-[#8158F6] uppercase mb-6">{benefit.title}</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-tight leading-relaxed">{benefit.desc}</p>

                                {/* Animated accent bar */}
                                <div className="absolute bottom-0 left-0 w-1 h-0 bg-[#8158F6] group-hover:h-full transition-all duration-500"></div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Main CTA Button - Now below benefits */}
                <div className="mt-20 lg:mt-32 text-center">
                    <a
                        href="https://trading.bridgemarkets.global/register?ref=af2fad19-0a06-4b62-8&branchUuid=759c4fa8-df5b-4cdc-97ae-7"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-6 px-12 py-8 bg-red-600 text-white font-black italic text-sm lg:text-lg uppercase tracking-[0.4em] skew-x-[-12deg] hover:bg-white hover:text-black transition-all shadow-[0_0_40px_rgba(220,38,38,0.3)] group relative overflow-hidden"
                    >
                        <span className="relative z-10">OPERAR CON NUESTRO ALIADO OFICIAL</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </a>

                    {/* Legal Disclaimer directly below button */}
                    <div className="mt-12 max-w-3xl mx-auto">
                        <p className="text-[10px] lg:text-xs text-gray-500 font-bold uppercase tracking-[0.2em] leading-loose italic opacity-60">
                            IndexGenius Academy es una entidad educativa y no actúa como broker ni administra fondos de terceros.
                            Toda operativa se realiza directamente con el broker correspondiente bajo responsabilidad del usuario.
                        </p>
                    </div>
                </div>

                {/* Final Branding Watermark - Massively reduced opacity */}
                <div className="mt-32 opacity-[0.02] text-center">
                    <p className="text-4xl lg:text-[180px] font-black italic text-[#8158F6] uppercase tracking-tighter select-none leading-none">
                        BRIDGE MARKETS
                    </p>
                </div>
            </div>
        </section>
    );
};

export default BrokerSection;
