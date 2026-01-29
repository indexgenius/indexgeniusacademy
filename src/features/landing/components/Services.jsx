import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, GraduationCap, Users, FileCode } from 'lucide-react';
import { TypewriterText } from './Animations';

const Services = () => {
    const services = [
        { title: "SEÑALES INSTITUCIONALES", desc: "Acceso exclusivo a operaciones de alta probabilidad en índices sintéticos, ejecutadas en tiempo real profesionales.", icon: TrendingUp, color: "text-red-600" },
        { title: "FORMACIÓN PRIVADA", desc: "Programa educativo especializado en índices sintéticos, con metodologías propietarias y ejecución avanzada.", icon: GraduationCap, color: "text-blue-500" },
        { title: "COMUNIDAD CERRADA", desc: "Ingreso a una comunidad privada de traders de alto nivel para compartir análisis profundo.", icon: Users, color: "text-green-500" },
        { title: "HERRAMIENTAS EXCLUSIVAS", desc: "Indicadores, plantillas y configuraciones propias, diseñadas para maximizar precisión.", icon: FileCode, color: "text-white" }
    ];

    return (
        <section id="services" className="px-6 lg:px-20 py-20 bg-white/[0.02] border-y border-white/5">
            <motion.div className="mb-20 text-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }}>
                <h3 className="text-5xl lg:text-7xl font-bold italic tracking-tighter uppercase mb-6">
                    <TypewriterText text="NUESTROS SERVICIOS" delay={80} />
                </h3>
                <div className="w-20 h-1 bg-red-600 mx-auto"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service, i) => (
                    <motion.div key={i} className="p-8 border border-white/5 bg-white/5 hover:border-red-600/30 hover:bg-red-600/5 transition-all text-center group" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ delay: i * 0.1 }}>
                        <div className="mb-6 flex justify-center"><service.icon size={48} className={`${service.color} group-hover:scale-110 transition-transform`} /></div>
                        <h4 className="text-xl font-bold italic uppercase mb-4 text-white group-hover:text-red-600 transition-colors">{service.title}</h4>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed">{service.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Services;
