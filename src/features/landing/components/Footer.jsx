import React from 'react';
import { Instagram, Youtube, Send, Mail, MapPin, Phone, MessageSquare, Globe, ArrowUpRight } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-100 pt-24 pb-12 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

                    {/* Brand Identity */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <img src="/img/logos/IMG_5208.PNG" alt="Bull Logo" className="w-14 h-14 object-contain shadow-2xl shadow-red-600/10" />
                            <div>
                                <h2 className="text-xl font-black italic tracking-tighter leading-none text-black uppercase">
                                    IndexGenius<br /><span className="text-red-600">ACADEMY</span>
                                </h2>
                            </div>
                        </div>
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-loose">
                            La academia de trading de mayor precisión en Latinoamérica. Elevamos tu nivel operativo con tecnología de punta y educación institucional de alto impacto.
                        </p>
                        <div className="flex items-center gap-4">
                            {[
                                { icon: Instagram, url: '#', label: 'Instagram' },
                                { icon: Youtube, url: '#', label: 'YouTube' },
                                { icon: Send, url: '#', label: 'Telegram' },
                                { icon: MessageSquare, url: '#', label: 'WhatsApp' }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.url}
                                    className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-black hover:scale-110 transition-all duration-300 shadow-lg shadow-red-600/20"
                                    aria-label={social.label}
                                >
                                    <social.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div className="space-y-8">
                        <h4 className="text-xs font-black tracking-[0.3em] text-red-600 uppercase italic">Navegación Táctica</h4>
                        <ul className="space-y-4">
                            {['Servicios', 'Testimonios', 'Nosotros', 'Academy', 'Plantilla'].map((item) => (
                                <li key={item}>
                                    <a href={`#${item.toLowerCase()}`} className="text-[10px] font-black text-gray-400 hover:text-red-600 uppercase tracking-widest flex items-center gap-2 group transition-colors">
                                        <div className="w-1 h-1 bg-gray-200 group-hover:bg-red-600 transition-colors"></div>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <h4 className="text-xs font-black tracking-[0.3em] text-red-600 uppercase italic">Centro de Mando</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4 group">
                                <div className="p-3 bg-red-50 rounded-xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <Mail size={16} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Oficial</p>
                                    <p className="text-[10px] font-bold text-black uppercase">soporte@ingenius.academy</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4 group">
                                <div className="p-3 bg-red-50 rounded-xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <MapPin size={16} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Ubicación</p>
                                    <p className="text-[10px] font-bold text-black uppercase leading-relaxed">República Dominicana<br />Global Digital Hub</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter / CTA */}
                    <div className="space-y-8">
                        <h4 className="text-xs font-black tracking-[0.3em] text-red-600 uppercase italic">Operativa Global</h4>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4">
                            <p className="text-[10px] font-bold text-gray-600 uppercase leading-relaxed tracking-wider">
                                ¿Listo para dominar los mercados? Sigue nuestra operativa en tiempo real.
                            </p>
                            <button className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] italic flex items-center justify-center gap-3 hover:bg-red-600 transition-all group">
                                UNIRSE AL TELEGRAM <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                </div>

                {/* Final Copyright */}
                <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Globe size={14} className="text-red-600" />
                        <span className="text-[9px] font-black text-gray-400 tracking-[0.4em] uppercase">
                            © {currentYear} IndexGenius ACADEMY • TACTICAL NETWORK SYSTEMS
                        </span>
                    </div>
                    <div className="flex gap-8">
                        <a href="#" className="text-[8px] font-black text-gray-400 hover:text-red-600 uppercase tracking-[0.2em]">Términos</a>
                        <a href="#" className="text-[8px] font-black text-gray-400 hover:text-red-600 uppercase tracking-[0.2em]">Privacidad</a>
                        <a href="#" className="text-[8px] font-black text-gray-400 hover:text-red-600 uppercase tracking-[0.2em]">Legal</a>
                    </div>
                </div>
            </div>

            {/* Decorative Vector Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/[0.01] blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-600/[0.01] blur-3xl rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        </footer>
    );
};

export default Footer;
