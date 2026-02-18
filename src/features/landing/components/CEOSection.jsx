import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Youtube, Send, Linkedin } from 'lucide-react';

const CEOSection = ({ onBack }) => {
    return (
        <section className="min-h-screen bg-white text-black pt-16 pb-24 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-full h-full bg-red-600/[0.02] blur-[150px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-12 lg:py-24">
                    {/* Background Massive Text (Shared) */}
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none z-0">
                        <motion.h2
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 0.05, scale: 1 }}
                            className="text-[120px] md:text-[250px] lg:text-[450px] font-black italic tracking-tighter text-red-600 leading-none uppercase skew-x-[-12deg]"
                        >
                            STEVEN
                        </motion.h2>
                    </div>

                    {/* Left Column: Text & Socials */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="relative z-30 space-y-10 order-2 lg:order-1 px-4 lg:px-0"
                    >
                        <div>

                            <h3 className="text-3xl lg:text-5xl font-black italic tracking-tighter uppercase text-black leading-none mb-6">
                                DE SECRETARIO A FUNDADOR DE <span className="text-red-700">INDEXGENIUS ACADEMY</span>
                            </h3>
                            <div className="w-24 h-2 bg-red-600 mb-10"></div>
                        </div>

                        <div className="space-y-6 text-gray-700 font-medium leading-relaxed text-sm lg:text-base max-w-xl h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                            <p>Yo, <span className="font-bold text-black">Steven Castillo</span>, joven dominicano de 22 años y fundador de <span className="font-bold text-black">IndexGenius Academy</span>, no siempre estuve en los mercados financieros.</p>
                            <p>Antes de dedicarme profesionalmente al trading, trabajé como secretario en un almacén, cumpliendo jornadas de más de 8 horas diarias. Esa etapa me enseñó disciplina, compromiso y responsabilidad. Pero dentro de mí sabía que quería algo diferente. No solo un salario fijo… sino libertad financiera.</p>
                            <p>Al principio cometí errores, tuve pérdidas y entendí que los mercados financieros no se tratan de suerte ni de apuestas. Se tratan de estructura, gestión de riesgo y mentalidad sólida.</p>
                            <p>Decidí prepararme en serio. Estudié, practiqué y desarrollé un enfoque profesional hasta lograr consistencia. Comprendí que el verdadero éxito en el trading no está en ganar grandes cantidades en un día, sino en proteger el capital y mantener disciplina a largo plazo.</p>
                            <p>Hoy lidero <span className="font-bold text-black">IndexGenius Academy</span>, una academia de trading enfocada en forex, índices sintéticos y otros mercados financieros, formando traders en República Dominicana y Latinoamérica con una visión clara: resultados sostenibles, educación real y mentalidad profesional.</p>
                            <p className="border-l-4 border-red-600 pl-4 py-3 bg-red-50 italic text-gray-900 font-bold my-4">
                                "No vendemos sueños rápidos. Formamos traders con estructura, disciplina y visión. Porque la libertad financiera no se improvisa… se construye."
                            </p>
                        </div>

                        {/* Social Connect */}
                        <div className="flex flex-wrap gap-4 pt-4">
                            {[
                                { icon: Instagram, url: 'https://www.instagram.com/eltevenfx' },
                                { icon: Youtube, url: 'https://www.youtube.com/@IndexGeniusAcademy' },
                                { icon: Send, url: 'https://t.me/indexgeniusacademy' },
                                { icon: Linkedin, url: '#' }
                            ].map((social, i) => (
                                <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="w-14 h-14 border-2 border-gray-100 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all shadow-sm rounded-sm">
                                    <social.icon size={22} />
                                </a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Column: Layered Image Composition */}
                    <div className="relative h-[500px] lg:h-[700px] flex items-center justify-center order-1 lg:order-2">
                        {/* Layer 2: Steven's Portrait */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10 h-full w-full flex items-center justify-center"
                        >
                            <img
                                src="/img/logos/CEO/WhatsApp_Image_2026-01-18_at_11.47.18_PM-removebg-preview.png"
                                alt="Steven Castillo"
                                className="h-[90%] lg:h-full w-auto object-contain filter drop-shadow-[0_20px_80px_rgba(220,38,38,0.25)]"
                                style={{
                                    maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                                    WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
                                }}
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800';
                                }}
                            />
                        </motion.div>

                        {/* Layer 3: Background Text (OUTLINED) - Now behind the portrait */}
                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none z-[5]">
                            <motion.h2
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 0.15, scale: 1 }}
                                className="text-[120px] md:text-[250px] lg:text-[450px] font-black italic tracking-tighter text-red-600 leading-none uppercase skew-x-[-12deg]"
                                style={{ WebkitTextStroke: '2px #dc2626', color: 'transparent' }}
                            >
                                STEVEN
                            </motion.h2>
                        </div>


                    </div>
                </div>
            </div>
        </section>
    );
};

export default CEOSection;
