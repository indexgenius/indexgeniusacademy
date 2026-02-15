import React from 'react';
import Hero from './components/Hero';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import PaymentMethods from './components/PaymentMethods';
import AboutUs from './components/AboutUs';
import Mission from './components/Mission';
import InstallGuide from './components/InstallGuide';

import { Sun, Moon } from 'lucide-react';

const LandingPage = ({ onShowAuth }) => {
    const [isReferred, setIsReferred] = React.useState(false);
    const [isDarkMode, setIsDarkMode] = React.useState(true);

    React.useEffect(() => {
        const ref = localStorage.getItem('referralCode');
        if (ref && ref.length > 5 && ref !== '/') {
            setIsReferred(true);
        }

        // Check system preference or logic here if needed
    }, []);

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
        }
    };

    return (
        <div className={`min-h-screen selection:bg-red-600 selection:text-white font-space overflow-x-hidden relative transition-colors duration-300 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
            {/* Background Ambience */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full bg-red-600/5 blur-[120px] pointer-events-none -z-10"></div>

            {/* Navigation */}
            <nav className="p-6 lg:p-10 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-4">
                    <img src="/img/logos/red_bull_logo_new.PNG" alt="Bull Logo" className="w-12 h-12 object-contain" />
                    <div>
                        <h1 className="text-xl font-bold italic tracking-tighter leading-none uppercase">
                            IndexGenius<br /><span className="text-red-600">ACADEMY</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4 lg:gap-8">
                    <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold tracking-[0.3em] text-gray-400">
                        <a href="#services" className="hover:text-red-600 transition-colors">SERVICIOS</a>
                        <a href="#testimonials" className="hover:text-red-600 transition-colors">TESTIMONIOS</a>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-black'}`}
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <button
                        onClick={onShowAuth}
                        className={`px-5 py-2.5 lg:px-6 lg:py-3 font-black text-[10px] lg:text-[11px] hover:bg-red-600 hover:text-white transition-all skew-x-[-12deg] tracking-widest uppercase shadow-[0_0_20px_rgba(255,255,255,0.1)] ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}
                    >
                        ÚNETE AHORA
                    </button>
                </div>
            </nav>

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
                        <h3 className="text-xl font-black italic tracking-tighter text-white uppercase mb-3 leading-none">PASOS PARA TU ACTIVACIÓN:</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-white/90">
                                <span className="font-black text-xs bg-black/20 w-5 h-5 flex items-center justify-center">1</span>
                                <p className="text-[10px] font-bold uppercase tracking-wider">HAZ CLIC EN <span className="bg-white text-black px-1.5 font-black">ÚNETE AHORA</span></p>
                            </div>
                            <div className="flex items-center gap-3 text-white/90">
                                <span className="font-black text-xs bg-black/20 w-5 h-5 flex items-center justify-center">2</span>
                                <p className="text-[10px] font-bold uppercase tracking-wider">CREA TU CUENTA DE OPERADOR</p>
                            </div>
                            <div className="flex items-center gap-3 text-white/90">
                                <span className="font-black text-xs bg-black/20 w-5 h-5 flex items-center justify-center">3</span>
                                <p className="text-[10px] font-bold uppercase tracking-wider">SIGUE LA GUÍA DE INSTALACIÓN</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Hero />
            <PaymentMethods />
            <AboutUs />
            <Mission />
            <Services />
            <Testimonials />
            <InstallGuide />

            {/* Footer */}
            <footer id="install" className="p-10 border-t border-white/5 text-center text-[10px] font-bold text-gray-600 tracking-[0.5em] uppercase">
                © 2026 IndexGenius ACADEMY • GLOBAL TACTICAL NETWORK
            </footer>
        </div>
    );
};

export default LandingPage;
