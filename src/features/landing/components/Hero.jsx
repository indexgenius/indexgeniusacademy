import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
const Hero = ({ view }) => {
    const isBroker = view === 'broker';
    return (
        <section className={`relative min-h-[85vh] flex flex-col items-center justify-start text-center overflow-hidden pt-28 lg:pt-40 pb-0 transition-colors duration-500 ${isBroker ? 'bg-[#090228]' : 'bg-white'}`}>

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
                className="relative z-30 max-w-7xl mx-auto px-6 lg:px-12 w-full flex flex-col items-center justify-center text-center mt-4 lg:mt-8"
            >
                {/* LARGE BACKGROUND WATERMARK - CENTERED */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none z-0 opacity-[0.03]">
                    <h2 className="text-[80px] md:text-[300px] lg:text-[500px] font-black italic tracking-tighter leading-none uppercase text-black select-none text-center">
                        INDEX<br />GENIUS
                    </h2>
                </div>

                <div className="relative z-10 flex flex-col items-center space-y-10 lg:py-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6 flex flex-col items-center"
                    >

                        <h1 className="diseno-futurista leading-[0.85] text-black text-center text-4xl md:text-6xl lg:text-7xl">
                            INFRAESTRUCTURA <br />
                            <span className="text-red-600">PROFESIONAL</span><br />
                            PARA TRADERS.
                        </h1>

                        <p className="text-base md:text-lg lg:text-xl font-bold text-gray-500 uppercase tracking-tight leading-relaxed max-w-2xl italic mx-auto px-4">
                            Domina los mercados con ejecución de grado institucional y herramientas diseñadas para la <span className="text-black font-black underline decoration-red-600 decoration-4 underline-offset-4">máxima rentabilidad</span>.
                        </p>
                    </motion.div>

                    {/* Features List - Centered */}
                    <div className="flex flex-wrap justify-center gap-6 max-w-4xl">
                        {[
                            { label: "Señales Pro", desc: "Tiempo Real" },
                            { label: "Educación", desc: "Paso a Paso" },
                            { label: "Software", desc: "Exclusivo" },
                            { label: "Soporte", desc: "Élite 24/7" }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="flex items-center gap-4 bg-gray-50/50 p-6 border-l-4 border-red-600 min-w-[200px] group hover:bg-white hover:shadow-xl transition-all"
                            >
                                <div className="space-y-0.5 text-left">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">{feature.label}</h4>
                                    <p className="text-xs font-bold text-black uppercase tracking-widest">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 pt-10">
                        <button
                            onClick={() => document.getElementById('install').scrollIntoView({ behavior: 'smooth' })}
                            className="px-10 py-5 bg-red-600 text-white font-black italic text-xs lg:text-sm uppercase tracking-[0.3em] skew-x-[-12deg] shadow-[0_15px_30px_rgba(220,38,38,0.25)] hover:bg-black hover:scale-105 transition-all group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-4">
                                EMPEZAR AHORA
                                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </button>

                        <button
                            onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 border-2 border-black text-black font-black italic text-[10px] lg:text-xs tracking-[0.2em] uppercase transition-all skew-x-[-12deg] hover:bg-black hover:text-white"
                        >
                            VER SERVICIOS
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Unified Section Separator (White to Gray Gradient) */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[80px] lg:h-[150px]">
                    <defs>
                        <linearGradient id="hero-unified-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: isBroker ? '#090228' : '#ffffff', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: isBroker ? '#090228' : '#f4f4f4', stopOpacity: 1 }} />
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
