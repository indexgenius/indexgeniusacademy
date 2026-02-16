import React from 'react';

const PaymentMethods = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-[#f4f4f4]">
            <div className="w-full">
                <div className="text-center mb-10 px-6">
                    <h3 className="text-3xl lg:text-5xl font-black italic tracking-tighter uppercase mb-4" style={{ color: 'var(--text-primary)' }}>MÉTODOS DE PAGO</h3>
                    <div className="w-16 h-1 bg-red-600 mx-auto mb-6"></div>
                </div>
                <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--bg-primary), transparent)' }}></div>
                    <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--bg-primary), transparent)' }}></div>
                    <div className="flex gap-8 sm:gap-16 animate-scroll items-center py-8">
                        {[...Array(3)].map((_, i) => (
                            <React.Fragment key={i}>
                                <img src="/img/metodos/logos/Tether_Logo.svg.png" alt="USDT" className="h-10 sm:h-16 object-contain opacity-80 hover:opacity-100 transition-all" />
                                <img src="/img/metodos/logos/Visa_Logo.png" alt="Visa" className="h-8 sm:h-12 object-contain opacity-80" />
                                <img src="/img/metodos/logos/MasterCard_Logo.svg.png" alt="MC" className="h-9 sm:h-14 object-contain opacity-80" />
                                <img src="/img/metodos/logos/Binance-Vertical-Logo.wine.svg" alt="BN" className="h-10 sm:h-16 object-contain opacity-80" />
                                <img src="/img/metodos/logos/nequi-37254.png" alt="NQ" className="h-9 sm:h-14 object-contain opacity-80" />
                                <img src="/img/metodos/logos/Logo_Bancolombia.svg.png" alt="BC" className="h-8 sm:h-12 object-contain opacity-80" />
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Unified Section Separator (Gray to White Gradient) */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] lg:h-[100px]">
                    <defs>
                        <linearGradient id="pay-unified-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#fcfcfc', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,0V120H0Z"
                        fill="url(#pay-unified-grad)"
                    ></path>
                </svg>
            </div>
        </section>
    );
};

export default PaymentMethods;
