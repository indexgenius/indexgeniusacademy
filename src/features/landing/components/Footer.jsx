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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

                    {/* Brand Identity */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <img src="/img/logos/IMG_5208.PNG" alt="Bull Logo" className={`w-14 h-14 object-contain transition-all ${isBroker ? 'brightness-125' : 'shadow-2xl shadow-red-600/10'}`} />
                            <div>
                                <h2 className={`text-xl font-black italic tracking-tighter leading-none uppercase transition-colors ${isBroker ? 'text-white' : 'text-black'}`}>
                                    IndexGenius<br /><span className={isBroker ? 'text-[#8158F6]' : 'text-red-600'}>ACADEMY</span>
                                </h2>
                            </div>
                        </div>
                        <p className={`text-[11px] font-bold uppercase tracking-widest leading-loose transition-colors ${isBroker ? 'text-white/40' : 'text-gray-500'}`}>
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

                    {/* Quick Access */}
                    <div className="space-y-8">
                        <h4 className={`text-xs font-black tracking-[0.3em] uppercase italic transition-colors ${isBroker ? 'text-[#8158F6]' : 'text-red-600'}`}>Navegación Táctica</h4>
                        <ul className="space-y-4">
                            {['Servicios', 'Testimonios', 'Nosotros'].map((item) => (
                                <li key={item}>
                                    <a href={`#${item.toLowerCase()}`} className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group transition-colors ${isBroker ? 'text-white/60 hover:text-[#8158F6]' : 'text-gray-400 hover:text-red-600'
                                        }`}>
                                        <div className={`w-1 h-1 transition-colors ${isBroker ? 'bg-[#432C8D] group-hover:bg-[#8158F6]' : 'bg-gray-200 group-hover:bg-red-600'
                                            }`}></div>
                                        {item}
                                    </a>
                                </li>
                            ))}
                            <li>
                                <button onClick={() => setView('ceo')} className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group transition-colors text-left ${isBroker ? 'text-white/60 hover:text-[#8158F6]' : 'text-gray-400 hover:text-red-600'
                                    }`}>
                                    <div className={`w-1 h-1 transition-colors ${isBroker ? 'bg-[#432C8D] group-hover:bg-[#8158F6]' : 'bg-gray-200 group-hover:bg-red-600'
                                        }`}></div>
                                    CEO Steven Castillo
                                </button>
                            </li>
                            <li>
                                <button onClick={() => setView('broker')} className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group transition-colors text-left ${isBroker ? 'text-white/60 hover:text-[#8158F6]' : 'text-gray-400 hover:text-red-600'
                                    }`}>
                                    <div className={`w-1 h-1 transition-colors ${isBroker ? 'bg-[#432C8D] group-hover:bg-[#8158F6]' : 'bg-gray-200 group-hover:bg-red-600'
                                        }`}></div>
                                    Broker Aliado
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <h4 className={`text-xs font-black tracking-[0.3em] uppercase italic transition-colors ${isBroker ? 'text-[#8158F6]' : 'text-red-600'}`}>Centro de Mando</h4>
                        <ul className="space-y-6">
                            {[
                                { icon: Mail, label: 'Email Oficial', value: 'soporte@ingenius.academy' },
                                { icon: Phone, label: 'WhatsApp Oficial', value: '+1 (829) 219-8071' },
                                { icon: MapPin, label: 'Ubicación', value: 'República Dominicana Global Digital Hub', multiline: true }
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
                                            {info.multiline ? (
                                                <>{info.value.split(' ')[0]} {info.value.split(' ')[1]}<br />{info.value.split(' ').slice(2).join(' ')}</>
                                            ) : info.value}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter / CTA */}
                    <div className="space-y-8">
                        <h4 className={`text-xs font-black tracking-[0.3em] uppercase italic transition-colors ${isBroker ? 'text-[#8158F6]' : 'text-red-600'}`}>Operativa Global</h4>
                        <div className={`p-6 rounded-2xl border transition-all ${isBroker
                            ? 'bg-[#322070]/10 border-[#432C8D]/20'
                            : 'bg-gray-50 border-gray-100'
                            } flex flex-col gap-4`}>
                            <p className={`text-[10px] font-bold uppercase leading-relaxed tracking-wider transition-colors ${isBroker ? 'text-white/60' : 'text-gray-600'}`}>
                                ¿Listo para dominar los mercados? Sigue nuestra operativa en tiempo real.
                            </p>
                            <a
                                href="https://t.me/indexgeniusacademy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] italic flex items-center justify-center gap-3 transition-all group ${isBroker
                                    ? 'bg-[#8158F6] text-white hover:bg-white hover:text-[#090228]'
                                    : 'bg-black text-white hover:bg-red-600'
                                    }`}
                            >
                                UNIRSE AL TELEGRAM <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </a>
                        </div>
                    </div>

                </div>

                {/* Final Copyright */}
                <div className={`pt-12 border-t flex flex-col md:flex-row justify-between items-center gap-6 transition-colors ${isBroker ? 'border-[#432C8D]/20' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-2">
                        <Globe size={14} className={isBroker ? 'text-[#8158F6]' : 'text-red-600'} />
                        <span className={`text-[9px] font-black tracking-[0.4em] uppercase transition-colors ${isBroker ? 'text-white/20' : 'text-gray-400'}`}>
                            © {currentYear} IndexGenius ACADEMY • TACTICAL NETWORK SYSTEMS
                        </span>
                    </div>
                    <div className="flex gap-8">
                        {['Términos', 'Privacidad', 'Legal'].map((item) => (
                            <a key={item} href="#" className={`text-[8px] font-black uppercase tracking-[0.2em] transition-colors ${isBroker ? 'text-white/20 hover:text-[#8158F6]' : 'text-gray-400 hover:text-red-600'
                                }`}>{item}</a>
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
