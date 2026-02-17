import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Hero from './components/Hero';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import PaymentMethods from './components/PaymentMethods';
import AboutUs from './components/AboutUs';
import CEOSection from './components/CEOSection';
import BrokerSection from './components/BrokerSection';
import InstallGuide from './components/InstallGuide';
import Footer from './components/Footer';



const LandingPage = ({ onShowAuth }) => {
    const [isReferred, setIsReferred] = React.useState(false);
    const [view, setView] = React.useState('home');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    React.useEffect(() => {
        const ref = localStorage.getItem('referralCode');
        if (ref && ref.length > 5 && ref !== '/') {
            setIsReferred(true);
        }
    }, []);

    const handleViewChange = (newView) => {
        setView(newView);
        setIsMenuOpen(false); // Close menu on view change
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="light-mode min-h-screen selection:bg-red-600 selection:text-white font-space overflow-x-hidden relative transition-colors duration-300 bg-white text-black">
            {/* Background Ambience (Light mode optimization) */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full bg-red-600/[0.03] blur-[120px] pointer-events-none -z-10"></div>

            {/* Noise Texture Overlay for Premium Feel */}
            <div className="fixed inset-0 opacity-[0.015] pointer-events-none -z-5 pr-4 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}></div>

            {/* Floating Navigation Bar */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-[100]">
                <nav className={`px-6 py-4 lg:px-10 lg:py-4 flex justify-between items-center border shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-full backdrop-blur-lg transition-all duration-500 ${view === 'broker'
                    ? 'bg-[#090228]/80 border-[#432C8D]/30 shadow-[#8158F6]/10'
                    : 'bg-white border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)]'
                    }`}>
                    <div className="flex items-center gap-4">
                        <img src="/img/logos/IMG_5208.PNG" alt="Bull Logo" className={`w-10 h-10 lg:w-12 lg:h-12 object-contain ${view === 'broker' ? 'brightness-125' : ''}`} />
                        <div>
                            <h1 className={`text-lg lg:text-xl font-black italic tracking-tighter leading-none uppercase transition-colors ${view === 'broker' ? 'text-white' : 'text-black'}`}>
                                IndexGenius<br /><span className={view === 'broker' ? 'text-[#8158F6]' : 'text-red-600'}>ACADEMY</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-8">
                        {/* Desktop Navigation */}
                        <div className={`hidden lg:flex items-center gap-2 text-[10px] font-black italic tracking-[0.2em] transition-colors ${view === 'broker' ? 'text-white/40' : 'text-gray-400'}`}>
                            {view !== 'home' ? (
                                <button
                                    onClick={() => handleViewChange('home')}
                                    className={`px-5 py-2 transition-all uppercase skew-x-[-12deg] ${view === 'broker'
                                        ? 'hover:bg-[#8158F6] hover:text-white text-white/60'
                                        : 'hover:bg-red-600 hover:text-white'
                                        }`}
                                >
                                    INICIO
                                </button>
                            ) : (
                                <>
                                    <a href="#services" className="px-5 py-2 hover:bg-red-600 hover:text-white transition-all uppercase skew-x-[-12deg]">SERVICIOS</a>
                                    <a href="#testimonials" className="px-5 py-2 hover:bg-red-600 hover:text-white transition-all uppercase skew-x-[-12deg]">TESTIMONIOS</a>
                                    <button onClick={() => handleViewChange('ceo')} className="px-5 py-2 hover:bg-red-600 hover:text-white transition-all uppercase skew-x-[-12deg]">CEO STEVEN</button>
                                    <button onClick={() => handleViewChange('broker')} className="px-5 py-2 hover:bg-red-600 hover:text-white transition-all uppercase skew-x-[-12deg]">BROKER</button>
                                    <a href="#about" className="px-5 py-2 hover:bg-red-600 hover:text-white transition-all uppercase skew-x-[-12deg]">NOSOTROS</a>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className={`lg:hidden p-2 transition-colors ${view === 'broker' ? 'text-white' : 'text-black'}`}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        <button
                            onClick={onShowAuth}
                            className={`hidden lg:block px-6 py-3 lg:px-8 lg:py-4 font-black text-[10px] lg:text-[11px] transition-all skew-x-[-12deg] tracking-[0.2em] uppercase shadow-xl ${view === 'broker'
                                ? 'bg-[#8158F6] text-white hover:bg-white hover:text-[#090228] shadow-[#8158F6]/30'
                                : 'bg-red-600 text-white hover:bg-black shadow-red-600/20'
                                }`}
                        >
                            ÚNETE AHORA
                        </button>
                    </div>

                    {/* Mobile Navigation Menu */}
                    {isMenuOpen && (
                        <div className={`absolute top-full left-0 w-full mt-4 p-6 rounded-2xl border shadow-2xl backdrop-blur-xl flex flex-col gap-4 lg:hidden ${view === 'broker'
                                ? 'bg-[#090228]/95 border-[#432C8D]/30 text-white'
                                : 'bg-white/95 border-gray-100 text-black'
                            }`}>
                            <div className="flex flex-col gap-2 font-black italic tracking-[0.2em] text-xs">
                                {view !== 'home' ? (
                                    <button
                                        onClick={() => handleViewChange('home')}
                                        className={`p-4 text-center rounded-xl transition-all uppercase ${view === 'broker'
                                            ? 'hover:bg-[#8158F6]/20'
                                            : 'hover:bg-red-50 text-gray-600'
                                            }`}
                                    >
                                        INICIO
                                    </button>
                                ) : (
                                    <>
                                        <a href="#services" onClick={() => setIsMenuOpen(false)} className={`p-4 text-center rounded-xl transition-all uppercase ${view === 'broker' ? 'hover:bg-[#8158F6]/20' : 'hover:bg-red-50 text-gray-600'}`}>SERVICIOS</a>
                                        <a href="#testimonials" onClick={() => setIsMenuOpen(false)} className={`p-4 text-center rounded-xl transition-all uppercase ${view === 'broker' ? 'hover:bg-[#8158F6]/20' : 'hover:bg-red-50 text-gray-600'}`}>TESTIMONIOS</a>
                                        <button onClick={() => handleViewChange('ceo')} className={`p-4 text-center rounded-xl transition-all uppercase ${view === 'broker' ? 'hover:bg-[#8158F6]/20' : 'hover:bg-red-50 text-gray-600'}`}>CEO STEVEN</button>
                                        <button onClick={() => handleViewChange('broker')} className={`p-4 text-center rounded-xl transition-all uppercase ${view === 'broker' ? 'hover:bg-[#8158F6]/20' : 'hover:bg-red-50 text-gray-600'}`}>BROKER</button>
                                        <a href="#about" onClick={() => setIsMenuOpen(false)} className={`p-4 text-center rounded-xl transition-all uppercase ${view === 'broker' ? 'hover:bg-[#8158F6]/20' : 'hover:bg-red-50 text-gray-600'}`}>NOSOTROS</a>
                                    </>
                                )}
                                <button
                                    onClick={onShowAuth}
                                    className={`mt-4 w-full px-6 py-4 font-black transition-all skew-x-[-12deg] tracking-[0.2em] uppercase shadow-xl text-center ${view === 'broker'
                                        ? 'bg-[#8158F6] text-white hover:bg-white hover:text-[#090228] shadow-[#8158F6]/30'
                                        : 'bg-red-600 text-white hover:bg-black shadow-red-600/20'
                                        }`}
                                >
                                    ÚNETE AHORA
                                </button>
                            </div>
                        </div>
                    )}
                </nav>
            </div>

            {/* Referral Guide Overlay */}
            {isReferred && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-red-600 p-6 z-50 shadow-2xl skew-x-[-4deg] border-2 border-white/20">
                    <button
                        onClick={() => {
                            localStorage.removeItem('referralCode');
                            setIsReferred(false);
                        }}
                        className="absolute top-2 right-2 p-1 text-white/50 hover:text-white transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                    <div className="skew-x-[4deg]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2 h-2 bg-white animate-ping"></div>
                            <p className="text-[10px] font-black tracking-widest text-white uppercase italic">SISTEMA DE AFILIADOS DETECTADO</p>
                        </div>
                        <h2 className="text-xl font-black italic tracking-tighter text-white uppercase mb-3 leading-none">PASOS PARA TU ACTIVACIÓN:</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-white/90">
                                <span className="font-black text-xs bg-black/20 w-5 h-5 flex items-center justify-center">1</span>
                                <h3 className="text-[10px] font-bold uppercase tracking-wider">HAZ CLIC EN <span className="bg-white text-black px-1.5 font-black">ÚNETE AHORA</span></h3>
                            </div>
                            <div className="flex items-center gap-3 text-white/90">
                                <span className="font-black text-xs bg-black/20 w-5 h-5 flex items-center justify-center">2</span>
                                <h3 className="text-[10px] font-bold uppercase tracking-wider">CREA TU CUENTA DE OPERADOR</h3>
                            </div>
                            <div className="flex items-center gap-3 text-white/90">
                                <span className="font-black text-xs bg-black/20 w-5 h-5 flex items-center justify-center">3</span>
                                <h3 className="text-[10px] font-bold uppercase tracking-wider">SIGUE LA GUÍA DE INSTALACIÓN</h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {view === 'home' ? (
                <>
                    <Hero view={view} />
                    <PaymentMethods view={view} />
                    <AboutUs setView={handleViewChange} view={view} />
                    <Services view={view} />
                    <Testimonials view={view} />
                    <InstallGuide view={view} />
                </>
            ) : view === 'ceo' ? (
                <CEOSection onBack={() => handleViewChange('home')} view={view} />
            ) : (
                <BrokerSection onBack={() => handleViewChange('home')} />
            )}

            <Footer setView={handleViewChange} view={view} />
        </div>
    );
};

export default LandingPage;
