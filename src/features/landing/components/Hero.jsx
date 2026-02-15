import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden pt-20 pb-0">
            {/* Background Layers */}
            <div className="absolute inset-0 w-full h-full -z-20 overflow-hidden bg-black">
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none mix-blend-screen">
                    <source src="/videos/trading-background.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-90"></div>

                {/* Tactical Overlays */}
                <div className="absolute inset-0 scanlines opacity-20 pointer-events-none z-10"></div>
                <div className="absolute inset-0 vignette z-10 pointer-events-none"></div>
            </div>

            {/* Tactical Decorators */}
            <div className="absolute top-24 left-4 lg:left-10 z-20 hidden lg:block">
                <div className="tactical-border-left pl-4 opacity-70">
                    <div className="text-[10px] font-bold tracking-[0.2em] text-red-600">SYSTEM STATUS: OPTIMAL</div>
                    <div className="text-[10px] font-bold tracking-[0.2em] text-white/50">CLEARANCE: LEVEL IV</div>
                </div>
            </div>

            <div className="absolute bottom-10 right-4 lg:right-10 z-20 hidden lg:block text-right opacity-50">
                <div className="text-[10px] font-bold tracking-[0.2em] text-white">TERMINAL ID: IG-BULL-IMAGE-REF</div>
                <div className="text-[10px] font-bold tracking-[0.2em] text-red-600">© 2026 INDEX GENIUS ACADEMY</div>
            </div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-30 max-w-7xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
            >
                {/* 3D Cinematic Bull Animation */}
                <div className="order-2 lg:order-2 flex justify-center lg:justify-end perspective-1000">
                    <div className="relative w-full max-w-[600px] aspect-video flex items-center justify-center">
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-contain pointer-events-none mask-radial-faded"
                        >
                            <source src="/img/toro3d/hero_bull_cinematic.mp4" type="video/mp4" />
                        </video>
                    </div>
                </div>

                {/* Text Content */}
                <div className="order-1 lg:order-1 text-left">
                    <div className="glass p-8 lg:p-14 rounded-none border-l-4 border-l-red-600 border-y-0 border-r-0 backdrop-blur-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                            <span className="text-red-600 font-bold tracking-widest text-xs uppercase">Elite Trading Systems v4.5</span>
                        </div>

                        <h1 className="diseno-futurista mb-2 leading-[0.85] text-left">
                            DOMINA LOS<br />
                            <span className="sinteticos-rojo text-6xl lg:text-8xl">SINTÉTICOS</span>
                        </h1>

                        <p className="font-bold uppercase tracking-widest text-sm lg:text-base leading-relaxed mb-10 text-gray-300 max-w-xl">
                            La Academia de trading más avanzada de Latinoamérica. <span className="text-red-500">Señales en tiempo real</span>, formación de alto nivel y tecnología propietaria.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5">
                            <button onClick={() => document.getElementById('install').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-red-600 text-white font-black italic text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all skew-x-[-12deg] shadow-red-glow flex items-center justify-center gap-3 group">
                                OBTENER ACCESO <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </button>
                            <button onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 border border-white/20 font-black italic text-sm tracking-[0.2em] uppercase hover:bg-white/10 hover:border-red-600 hover:text-red-600 transition-all skew-x-[-12deg] flex items-center justify-center gap-3 bg-black/50 backdrop-blur-sm text-white">
                                EXPLORAR SERVICIOS
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Bottom Curved Divider */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 translate-y-1">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="block w-[calc(100%+1.3px)] h-[60px] lg:h-[100px] fill-current text-[#050505]">
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="shape-fill"></path>
                    <path d="M0,0V15.81C13,36.92,46,62.34,98,47.38c114.52-32.93,178.58-18.73,222.84-2.8,24.3,8.74,58.85,26.79,139.73,50,90.41,25.93,224.52,14.65,296.84-33.72C836.21,15.68,911,26.72,1001.29,78.29,1112.55,142,1200,90.79,1200,48.27V0Z" className="shape-fill"></path>
                </svg>
            </div>
            {/* Gradient Fade to Next Section */}
            <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-10"></div>
        </section>
    );
};

export default Hero;
