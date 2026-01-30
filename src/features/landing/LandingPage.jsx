import React from 'react';
import Hero from './components/Hero';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import PaymentMethods from './components/PaymentMethods';
import AboutUs from './components/AboutUs';
import Mission from './components/Mission';
import InstallGuide from './components/InstallGuide';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white font-space overflow-x-hidden relative">
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
                <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold tracking-[0.3em] text-gray-400">
                    <a href="#services" className="hover:text-red-600 transition-colors">SERVICIOS</a>
                    <a href="#testimonials" className="hover:text-red-600 transition-colors">TESTIMONIOS</a>
                    <button onClick={() => document.getElementById('install').scrollIntoView({ behavior: 'smooth' })} className="px-6 py-3 bg-white text-black hover:bg-red-600 hover:text-white transition-all skew-x-[-12deg]">ÚNETE AHORA</button>
                </div>
            </nav>

            <Hero />
            <PaymentMethods />
            <AboutUs />
            <Mission />
            <Services />
            <Testimonials />
            <InstallGuide />

            {/* Footer */}
            <footer className="p-10 border-t border-white/5 text-center text-[10px] font-bold text-gray-600 tracking-[0.5em] uppercase">
                © 2026 IndexGenius ACADEMY • GLOBAL TACTICAL NETWORK
            </footer>
        </div>
    );
};

export default LandingPage;
