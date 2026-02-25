import React from 'react';
import { Instagram, Youtube, Send, Mail, MapPin, Phone, MessageSquare, Globe, ArrowUpRight } from 'lucide-react';

const WhatsAppIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

const Footer = ({ setView, view }) => {
    const currentYear = new Date().getFullYear();
    const isBroker = view === 'broker';

    return (
        <footer className={`pt-24 pb-12 relative overflow-hidden transition-all duration-500 ${isBroker
            ? 'bg-[#090228] border-t border-[#432C8D]/20'
            : 'bg-white border-t border-gray-100'
            }`}>
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">

                    {/* Columna 1 – Identidad */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <img src="/img/logos/IMG_5208.PNG" alt="Bull Logo" className={`w-14 h-14 object-contain transition-all ${isBroker ? 'brightness-125' : 'shadow-2xl shadow-red-600/10'}`} />
                            <div>
                                <h2 className={`text-xl font-black italic tracking-tighter leading-none uppercase transition-colors ${isBroker ? 'text-white' : 'text-black'}`}>
                                    IndexGenius<br /><span className={isBroker ? 'text-[#8158F6]' : 'text-red-600'}>ACADEMY</span>
                                </h2>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className={`text-[10px] font-bold uppercase tracking-widest leading-loose transition-colors ${isBroker ? 'text-white/40' : 'text-gray-500'}`}>
                                Infraestructura educativa especializada en mercados financieros globales.
                            </p>
                            <div className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isBroker ? 'text-white' : 'text-black'}`}>
                                República Dominicana<br />
                                <span className={isBroker ? 'text-[#8158F6]' : 'text-red-600'}>Global Digital Hub</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {[
                                { icon: Instagram, url: 'https://www.instagram.com/stevencastilloreal', label: 'Instagram' },
                                { icon: Youtube, url: 'https://www.youtube.com/@IndexGeniusAcademy', label: 'YouTube' },
                                { icon: Send, url: 'https://t.me/indexgeniusacademy', label: 'Telegram' },
                                { icon: WhatsAppIcon, url: 'https://wa.me/18495771017', label: 'WhatsApp' }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg ${isBroker
                                        ? 'bg-[#8158F6] hover:bg-white hover:text-[#090228] shadow-[#8158F6]/20'
                                        : 'bg-red-600 hover:bg-black shadow-red-600/20'
                                        } hover:scale-110`}
                                    aria-label={social.label}
                                >
                                    <social.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Columna 2 – Navegación */}
                    <div className="space-y-8">
                        <h4 className="text-xs font-black tracking-[0.3em] uppercase italic transition-colors text-red-600">Navegación</h4>
                        <ul className="grid grid-cols-1 gap-4">
                            {[
                                { name: 'Inicio', action: () => setView('home') },
                                { name: 'Academia', url: '#services' },
                                { name: 'Servicios', url: '#services' },
                                { name: 'Ecosistema', url: '#ecosistema' },
                                { name: 'Broker Partner', action: () => setView('broker') },
                                { name: 'Testimonios', url: '#testimonials' },
                                { name: 'Contacto', url: '#contacto' }
                            ].map((item) => (
                                <li key={item.name}>
                                    {item.action ? (
                                        <button onClick={item.action} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group transition-colors text-left text-gray-400 hover:text-red-600">
                                            <div className="w-1 h-1 transition-colors bg-gray-200 group-hover:bg-red-600"></div>
                                            {item.name}
                                        </button>
                                    ) : (
                                        <a href={item.url} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group transition-colors text-gray-400 hover:text-red-600">
                                            <div className="w-1 h-1 transition-colors bg-gray-200 group-hover:bg-red-600"></div>
                                            {item.name}
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Columna 3 – Contacto */}
                    <div className="space-y-8">
                        <h4 className={`text-xs font-black tracking-[0.3em] uppercase italic transition-colors ${isBroker ? 'text-[#8158F6]' : 'text-red-600'}`}>Contacto</h4>
                        <ul className="space-y-6">
                            {[
                                { icon: Mail, label: 'Email oficial', value: 'support@indexgeniusacademy.com' },
                                { icon: Phone, label: 'WhatsApp', value: '+1 (849) 577-1017' }
                            ].map((info, i) => (
                                <li key={i} className="flex items-start gap-4 group">
                                    <div className={`p-3 rounded-xl transition-colors ${isBroker
                                        ? 'bg-[#8158F6]/10 text-[#8158F6] group-hover:bg-[#8158F6] group-hover:text-white'
                                        : 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white'
                                        }`}>
                                        <info.icon size={16} />
                                    </div>
                                    <div>
                                        <p className={`text-[8px] font-black uppercase tracking-widest mb-1 transition-colors ${isBroker ? 'text-white/30' : 'text-gray-400'}`}>{info.label}</p>
                                        <p className={`text-[10px] font-bold uppercase leading-relaxed transition-colors ${isBroker ? 'text-white' : 'text-black'}`}>
                                            {info.value}
                                        </p>
                                    </div>
                                </li>
                            ))}
                            <li className="pt-4">
                                <a
                                    href="https://t.me/indexgeniusacademy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest skew-x-[-12deg] transition-all ${isBroker
                                        ? 'bg-[#8158F6] text-white hover:bg-white hover:text-[#090228]'
                                        : 'bg-red-600 text-white hover:bg-black'
                                        }`}
                                >
                                    <Send size={14} className="skew-x-[12deg]" />
                                    <span className="skew-x-[12deg]">Telegram Oficial</span>
                                </a>
                                <p className={`mt-2 text-[9px] font-bold uppercase transition-colors ${isBroker ? 'text-white/20' : 'text-gray-400'}`}>Unirse a la comunidad</p>
                            </li>
                        </ul>
                    </div>

                    {/* Columna 4 – Aviso Legal */}
                    <div className="space-y-8">
                        <h4 className={`text-xs font-black tracking-[0.3em] uppercase italic transition-colors ${isBroker ? 'text-[#8158F6]' : 'text-red-600'}`}>Aviso de Riesgo</h4>
                        <div className={`p-6 rounded-2xl border transition-all ${isBroker
                            ? 'bg-[#322070]/10 border-[#432C8D]/20'
                            : 'bg-gray-50 border-gray-100'
                            } flex flex-col gap-4`}>
                            <p className={`text-[10px] font-bold uppercase leading-relaxed tracking-wider transition-colors ${isBroker ? 'text-white/40' : 'text-gray-600'} text-justify`}>
                                El trading en mercados financieros implica un alto nivel de riesgo y puede no ser adecuado para todos los inversores. IndexGenius Academy es una entidad educativa y no actúa como broker ni administra fondos de terceros.
                            </p>
                            <p className={`text-[10px] font-black uppercase italic transition-colors ${isBroker ? 'text-[#8158F6]' : 'text-red-600'}`}>
                                Los resultados pasados no garantizan rendimientos futuros.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Final Copyright */}
                <div className={`pt-12 border-t flex flex-col md:flex-row justify-between items-center gap-6 transition-colors ${isBroker ? 'border-[#432C8D]/20' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-2">
                        <Globe size={14} className={isBroker ? 'text-[#8158F6]' : 'text-red-600'} />
                        <span className={`text-[9px] font-black tracking-[0.4em] uppercase transition-colors ${isBroker ? 'text-white/20' : 'text-gray-400'}`}>
                            © 2026 IndexGenius Academy. Todos los derechos reservados.
                        </span>
                    </div>
                    <div className="flex gap-8">
                        {[
                            { name: 'Términos y Condiciones', url: '#' },
                            { name: 'Política de Privacidad', url: '#' },
                            { name: 'Aviso Legal', url: '#' }
                        ].map((item) => (
                            <a key={item.name} href={item.url} className={`text-[8px] font-black uppercase tracking-[0.2em] transition-colors ${isBroker ? 'text-white/20 hover:text-[#8158F6]' : 'text-gray-400 hover:text-red-600'
                                }`}>{item.name}</a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Decorative Vector Elements */}
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none transition-colors ${isBroker ? 'bg-[#8158F6]/[0.05]' : 'bg-red-600/[0.01]'}`}></div>
            <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] blur-3xl rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none transition-colors ${isBroker ? 'bg-[#432C8D]/[0.05]' : 'bg-red-600/[0.01]'}`}></div>
        </footer>
    );
};

export default Footer;
