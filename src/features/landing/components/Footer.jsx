import React from 'react';
import { Instagram, Youtube, Send, Mail, MapPin, Phone, MessageSquare, Globe, ArrowUpRight } from 'lucide-react';

const WhatsAppIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

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
                                { icon: Instagram, url: 'https://www.instagram.com/indexgeniusacademy', label: 'Instagram' },
                                { icon: Youtube, url: 'https://www.youtube.com/@IndexGeniusAcademy', label: 'YouTube' },
                                { icon: Send, url: 'https://t.me/indexgeniusacademy', label: 'Telegram' },
                                { icon: WhatsAppIcon, url: 'https://wa.me/message/2ENFGBP3XTVJL1', label: 'WhatsApp' }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
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
                                    <Phone size={16} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">WhatsApp Oficial</p>
                                    <p className="text-[10px] font-bold text-black uppercase">+1 (829) 219-8071</p>
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
                            <a
                                href="https://t.me/indexgeniusacademy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] italic flex items-center justify-center gap-3 hover:bg-red-600 transition-all group"
                            >
                                UNIRSE AL TELEGRAM <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </a>
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
