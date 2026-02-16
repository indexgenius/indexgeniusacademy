import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
const Hero = () => {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-start text-center overflow-hidden pt-32 lg:pt-48 pb-0 bg-white">


            {/* Subtle 3D SVG Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                {/* Floating Cube 1 */}
                <motion.div
                    animate={{
                        y: [0, -40, 0],
                        rotate: [0, 90, 180, 270, 360],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[20%] right-[10%] opacity-[0.05]"
                >
                    <svg width="150" height="150" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="cube-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#ff0000', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                        <path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" fill="none" stroke="url(#cube-grad-1)" strokeWidth="0.5" />
                        <path d="M10 30 L50 50 L90 30 M50 50 L50 90" fill="none" stroke="url(#cube-grad-1)" strokeWidth="0.5" />
                    </svg>
                </motion.div>

                {/* Floating Cube 2 */}
                <motion.div
                    animate={{
                        y: [0, 60, 0],
                        x: [0, 30, 0],
                        rotate: [360, 0]
                    }}
                    transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[10%] left-[5%] opacity-[0.03]"
                >
                    <svg width="250" height="250" viewBox="0 0 100 100">
                        <path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" fill="none" stroke="#000" strokeWidth="0.2" />
                        <path d="M10 30 L50 50 L90 30 M50 50 L50 90" fill="none" stroke="#000" strokeWidth="0.2" />
                    </svg>
                </motion.div>

                {/* Tactical Diamonds */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            opacity: [0.02, 0.1, 0.02],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute w-2 h-2 bg-red-600 rotate-45"
                        style={{
                            top: `${Math.random() * 80 + 10}%`,
                            left: `${Math.random() * 80 + 10}%`,
                        }}
                    />
                ))}

                {/* Subtle Radial Gradient to Focus Content */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,white_70%)] opacity-60"></div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-30 max-w-[1600px] mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-20 items-center mt-4 lg:mt-0"
            >
                {/* FUSED CINEMATIC VIDEO - BLENDS WITH WHITE */}
                <div className="order-2 lg:order-2 flex justify-center lg:justify-start">
                    <div className="relative w-full lg:w-[120%] lg:-ml-[10%] aspect-[16/10] overflow-hidden">
                        {/* Cinematic Bull Video with Blend and Filter to eliminate borders */}
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-contain mix-blend-multiply contrast-[1.1] brightness-[1.05]"
                            style={{
                                maskImage: 'radial-gradient(circle, black 60%, transparent 95%)',
                                WebkitMaskImage: 'radial-gradient(circle, black 60%, transparent 95%)'
                            }}
                        >
                            <source src="/img/toro3d/hero_bull_cinematic.mp4" type="video/mp4" />
                        </video>
                    </div>
                </div>

                {/* Text Content */}
                <div className="order-1 lg:order-1 text-left">
                    <div className="bg-white/90 backdrop-blur-md px-4 py-8 lg:p-14 rounded-none border-l-[12px] border-l-red-600 border-y-0 border-r-0 shadow-2xl shadow-gray-100/50">


                        <h1 className="diseno-futurista mb-6 leading-[0.8] text-left text-black">
                            DOMINA LOS<br />
                            <span className="sinteticos-rojo text-[45px] sm:text-7xl lg:text-[130px] tracking-tighter">SINTÉTICOS</span>
                        </h1>

                        <p className="font-bold uppercase tracking-[0.1em] text-[12px] lg:text-base leading-relaxed mb-12 text-gray-500 max-w-xl">
                            La Academia de trading más avanzada de Latinoamérica. <span className="text-red-600 font-black">SEÑALES EN TIEMPO REAL</span>, formación de alto nivel y tecnología de grado institucional.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                            <button
                                onClick={() => document.getElementById('install').scrollIntoView({ behavior: 'smooth' })}
                                className="px-10 py-5 bg-red-600 text-white font-black italic text-xs lg:text-sm tracking-[0.4em] uppercase hover:bg-black transition-all skew-x-[-12deg] shadow-2xl shadow-red-600/20 flex items-center justify-center gap-4 group"
                            >
                                ACCESO TOTAL <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </button>
                            <button
                                onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
                                className="px-10 py-5 border-2 border-red-600 font-black italic text-xs lg:text-sm tracking-[0.4em] uppercase hover:bg-red-600 hover:text-white transition-all skew-x-[-12deg] flex items-center justify-center gap-4 bg-transparent text-red-600"
                            >
                                EXPLORAR
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Unified Section Separator (White to Gray Gradient) */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[80px] lg:h-[150px]">
                    <defs>
                        <linearGradient id="hero-unified-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#f4f4f4', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,0V120H0Z"
                        fill="url(#hero-unified-grad)"
                    ></path>
                </svg>
            </div>
        </section>
    );
};

export default Hero;
