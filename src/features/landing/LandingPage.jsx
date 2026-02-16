import React from 'react';
import Hero from './components/Hero';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import PaymentMethods from './components/PaymentMethods';
import AboutUs from './components/AboutUs';
import Mission from './components/Mission';
import InstallGuide from './components/InstallGuide';



const LandingPage = ({ onShowAuth }) => {
    const [isReferred, setIsReferred] = React.useState(false);

    React.useEffect(() => {
        const ref = localStorage.getItem('referralCode');
        if (ref && ref.length > 5 && ref !== '/') {
            setIsReferred(true);
        }
    }, []);

    return (
        <div className="light-mode min-h-screen selection:bg-red-600 selection:text-white font-space overflow-x-hidden relative transition-colors duration-300 bg-white text-black">
            {/* Background Ambience (Light mode optimization) */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full bg-red-600/[0.03] blur-[120px] pointer-events-none -z-10"></div>

            {/* Noise Texture Overlay for Premium Feel */}
            <div className="fixed inset-0 opacity-[0.015] pointer-events-none -z-5 pr-4 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}></div>

            {/* Floating Navigation Bar */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-[100]">
                <nav className="px-6 py-4 lg:px-10 lg:py-4 flex justify-between items-center bg-white border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-full backdrop-blur-lg">
                    <div className="flex items-center gap-4">
                        <img src="/img/logos/IMG_5208.PNG" alt="Bull Logo" className="w-10 h-10 lg:w-12 lg:h-12 object-contain" />
                        <div>
                            <h1 className="text-lg lg:text-xl font-black italic tracking-tighter leading-none uppercase text-black">
                                IndexGenius<br /><span className="text-red-600">ACADEMY</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-8">
                        <div className="hidden lg:flex items-center gap-2 text-[10px] font-black italic tracking-[0.2em] text-gray-400">
                            <a href="#services" className="px-5 py-2 hover:bg-black hover:text-white transition-all uppercase skew-x-[-12deg]">SERVICIOS</a>
                            <a href="#testimonials" className="px-5 py-2 hover:bg-black hover:text-white transition-all uppercase skew-x-[-12deg]">TESTIMONIOS</a>
                            <a href="#about" className="px-5 py-2 hover:bg-black hover:text-white transition-all uppercase skew-x-[-12deg]">NOSOTROS</a>
                        </div>

                        <button
                            onClick={onShowAuth}
                            className="px-6 py-3 lg:px-8 lg:py-4 font-black text-[10px] lg:text-[11px] bg-red-600 text-white hover:bg-black transition-all skew-x-[-12deg] tracking-[0.2em] uppercase shadow-xl shadow-red-600/20"
                        >
                            ÚNETE AHORA
                        </button>
                    </div>
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
            <footer id="install" className="p-10 border-t border-red-50 text-center text-[10px] font-black text-gray-400 tracking-[0.5em] uppercase bg-white">
                © 2026 IndexGenius ACADEMY • GLOBAL TACTICAL NETWORK
            </footer>
        </div>
    );
};

export default LandingPage;
