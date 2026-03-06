import React, { useState, useEffect, useRef } from 'react';
import { Phone, Check, Smartphone, ShieldAlert, ArrowRight, RefreshCw, ChevronLeft, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { RecaptchaVerifier, PhoneAuthProvider, linkWithCredential, updatePhoneNumber } from 'firebase/auth';
import useCountryCodes from '../../hooks/useCountryCodes';

const PhoneCaptureModal = ({ user }) => {
    const { countries, loading: countriesLoading } = useCountryCodes();
    const [isVisible, setIsVisible] = useState(false);
    const [phone, setPhone] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState('phone'); // 'phone' | 'code' | 'success'
    const [verificationId, setVerificationId] = useState(null);
    const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
    const [resendTimer, setResendTimer] = useState(0);

    const recaptchaVerifierRef = useRef(null);
    const otpInputRefs = useRef([]);

    // Set default country once loaded
    useEffect(() => {
        if (countries.length > 0 && !selectedCountry) {
            setSelectedCountry(countries[0]);
        }
    }, [countries]);

    useEffect(() => {
        if (user?.uid && user?.status === 'approved' && !user?.phone) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    // Setup recaptcha ONLY when visible and container is ready
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(setupRecaptcha, 800);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    // Resend countdown timer
    useEffect(() => {
        if (resendTimer > 0) {
            const interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [resendTimer]);

    // Cleanup recaptcha on unmount
    useEffect(() => {
        return () => {
            if (recaptchaVerifierRef.current) {
                try {
                    recaptchaVerifierRef.current.clear();
                    window._fbRecaptchaPhoneInitialized = false;
                } catch (e) { /* ignore */ }
                recaptchaVerifierRef.current = null;
            }
        };
    }, []);

    const setupRecaptcha = () => {
        if (typeof window === 'undefined') return;

        // Prevent double rendering by checking both ref and a global flag
        if (recaptchaVerifierRef.current || window._fbRecaptchaPhoneInitialized) {
            console.log('🛡️ reCAPTCHA already active - bypassing init');
            return;
        }

        const containerId = 'recaptcha-container-phone';
        const container = document.getElementById(containerId);

        if (!container) {
            console.warn('⚠️ Global reCAPTCHA container not found in App.jsx');
            return;
        }

        try {
            console.log('🛡️ Initializing reCAPTCHA Security Protocol...');

            // Wipe container content to prevent "Already rendered"
            container.innerHTML = '';

            recaptchaVerifierRef.current = new RecaptchaVerifier(auth, containerId, {
                size: 'invisible',
                callback: () => {
                    console.log('✅ Security challenge resolved');
                },
                'expired-callback': () => {
                    console.warn('⚠️ reCAPTCHA session expired');
                    if (recaptchaVerifierRef.current) {
                        recaptchaVerifierRef.current.clear();
                        recaptchaVerifierRef.current = null;
                        window._fbRecaptchaPhoneInitialized = false;
                    }
                }
            });

            recaptchaVerifierRef.current.render().then(() => {
                window._fbRecaptchaPhoneInitialized = true;
                console.log('✅ Security layer rendered');
            }).catch(e => {
                console.error("Render fail:", e);
                window._fbRecaptchaPhoneInitialized = false;
            });
        } catch (e) {
            console.error("Recaptcha Setup Exception:", e);
        }
    };

    const sendVerificationCode = async () => {
        let codePrefix = selectedCountry?.code || '+1';
        if (!codePrefix.startsWith('+')) codePrefix = '+' + codePrefix;

        const fullNumber = `${codePrefix}${phone.replace(/\D/g, '')}`;

        // Validate minimum length
        if (phone.replace(/\D/g, '').length < 7) {
            setError('NÚMERO MUY CORTO. INCLUYE TU NÚMERO COMPLETO.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Re-setup if cleared or not present
            if (!recaptchaVerifierRef.current) {
                setupRecaptcha();
            }

            console.log('📱 Attempting SMS delivery to:', fullNumber);

            const phoneProvider = new PhoneAuthProvider(auth);
            const vId = await phoneProvider.verifyPhoneNumber(
                fullNumber,
                recaptchaVerifierRef.current
            );

            setVerificationId(vId);
            setStep('code');
            setResendTimer(60);
            console.log('📱 SMS sent to:', fullNumber);

            // Focus first OTP input after animation
            setTimeout(() => otpInputRefs.current[0]?.focus(), 300);
        } catch (err) {
            console.error('SMS error:', err);

            if (err.code === 'auth/invalid-phone-number') {
                setError('NÚMERO INVÁLIDO. VERIFICA EL FORMATO.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('DEMASIADOS INTENTOS. ESPERA UNOS MINUTOS.');
            } else if (err.code === 'auth/quota-exceeded') {
                setError('LÍMITE DE SMS EXCEDIDO. INTÉNTALO MÁS TARDE.');
            } else if (err.code === 'auth/operation-not-allowed') {
                setError('ERROR: EL SERVICIO DE SMS ESTÁ DESACTIVADO EN EL PANEL DE FIREBASE.');
            } else if (err.code === 'auth/billing-not-enabled') {
                setError('ERROR: DEBES ACTIVAR EL PLAN BLAZE EN FIREBASE PARA ENVIAR SMS.');
            } else {
                setError(`ERROR FIREBASE: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) {
            // Handle paste
            const digits = value.replace(/\D/g, '').split('').slice(0, 6);
            const newOtp = [...otpCode];
            digits.forEach((digit, i) => {
                if (index + i < 6) newOtp[index + i] = digit;
            });
            setOtpCode(newOtp);
            const nextIndex = Math.min(index + digits.length, 5);
            otpInputRefs.current[nextIndex]?.focus();
            return;
        }

        const newOtp = [...otpCode];
        newOtp[index] = value.replace(/\D/g, '');
        setOtpCode(newOtp);

        // Auto-advance to next input
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const verifyOtpCode = async () => {
        const code = otpCode.join('');
        if (code.length !== 6) {
            setError('INGRESA EL CÓDIGO COMPLETO DE 6 DÍGITOS.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const credential = PhoneAuthProvider.credential(verificationId, code);
            const fullNumber = `${selectedCountry?.code || '+1'}${phone.replace(/\D/g, '')}`;

            // Try to link the phone credential to the current user
            try {
                await linkWithCredential(auth.currentUser, credential);
            } catch (linkErr) {
                // If already linked or provider exists, try updatePhoneNumber
                if (linkErr.code === 'auth/provider-already-linked' || linkErr.code === 'auth/credential-already-in-use') {
                    try {
                        await updatePhoneNumber(auth.currentUser, credential);
                    } catch (updateErr) {
                        console.warn('Update phone also failed, but verification succeeded:', updateErr);
                    }
                } else {
                    console.warn('Link failed, but code was verified:', linkErr);
                }
            }

            // Save verified number to Firestore
            await updateDoc(doc(db, "users", user.uid), {
                phone: fullNumber,
                phoneVerified: true,
                phoneUpdated: true
            });

            setStep('success');

            // Close after success animation
            setTimeout(() => setIsVisible(false), 2500);
        } catch (err) {
            console.error('Verification error:', err);

            if (err.code === 'auth/invalid-verification-code') {
                setError('CÓDIGO INCORRECTO. VERIFICA E INTENTA DE NUEVO.');
            } else if (err.code === 'auth/code-expired') {
                setError('CÓDIGO EXPIRADO. SOLICITA UNO NUEVO.');
            } else {
                setError(`ERROR: ${err.message}`);
            }

            setOtpCode(['', '', '', '', '', '']);
            otpInputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    // Auto-submit when all 6 digits are entered
    useEffect(() => {
        if (otpCode.every(d => d !== '') && step === 'code' && !loading) {
            verifyOtpCode();
        }
    }, [otpCode]);

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-black border border-red-600/50 p-8 shadow-[0_0_50px_rgba(220,38,38,0.2)] overflow-hidden"
                    >
                        {/* Industrial Accents */}
                        <div className="absolute top-0 left-0 w-2 h-full bg-red-600 opacity-50"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl -z-10"></div>

                        {/* (Used to have a local recaptcha container here, now global in App.jsx) */}

                        <div className="flex flex-col items-center text-center space-y-6">
                            {/* Icon */}
                            <div className="w-20 h-20 bg-red-600/10 border border-red-600/30 rounded-full flex items-center justify-center relative">
                                {step === 'success' ? (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}>
                                        <Check className="text-green-500" size={40} />
                                    </motion.div>
                                ) : (
                                    <Smartphone className="text-red-600 animate-pulse" size={40} />
                                )}
                                <div className="absolute -top-1 -right-1">
                                    <div className="w-6 h-6 bg-red-600 flex items-center justify-center">
                                        <ShieldAlert size={14} className="text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">
                                    {step === 'phone' && <>VERIFICAR <span className="text-red-600">TELÉFONO</span></>}
                                    {step === 'code' && <>CÓDIGO <span className="text-red-600">SMS</span></>}
                                    {step === 'success' && <>VERIFICADO <span className="text-green-500">✓</span></>}
                                </h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">
                                    {step === 'phone' && 'VERIFICACIÓN POR SMS REQUERIDA'}
                                    {step === 'code' && 'INGRESA EL CÓDIGO ENVIADO'}
                                    {step === 'success' && 'TERMINAL VINCULADA CON ÉXITO'}
                                </p>
                            </div>

                            {/* STEP: Phone Number Entry */}
                            <AnimatePresence mode="wait">
                                {step === 'phone' && (
                                    <motion.div
                                        key="phone-step"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="w-full space-y-4"
                                    >
                                        <p className="text-xs text-gray-400 font-bold uppercase leading-relaxed">
                                            INGRESA TU NÚMERO CON CÓDIGO DE PAÍS. TE ENVIAREMOS UN SMS PARA VERIFICAR QUE SEA REAL.
                                        </p>

                                        {/* Country Code Selector + Phone Input */}
                                        <div className="flex gap-2">
                                            {/* Country Selector */}
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => { setShowCountryPicker(!showCountryPicker); setCountrySearch(''); }}
                                                    className="h-full px-3 bg-white/5 border border-white/10 flex items-center gap-2 hover:border-red-600 transition-colors min-w-[90px]"
                                                >
                                                    <span className="text-lg">{selectedCountry?.flag || '🏳️'}</span>
                                                    <span className="text-[11px] font-black text-white">{selectedCountry?.code || '+1'}</span>
                                                </button>

                                                <AnimatePresence>
                                                    {showCountryPicker && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -5 }}
                                                            className="absolute top-full left-0 mt-1 w-64 bg-black border border-white/10 shadow-2xl z-50 max-h-72 overflow-hidden flex flex-col"
                                                        >
                                                            {/* Search input */}
                                                            <div className="p-2 border-b border-white/10 sticky top-0 bg-black z-10">
                                                                <div className="relative">
                                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                                                                    <input
                                                                        type="text"
                                                                        value={countrySearch}
                                                                        onChange={(e) => setCountrySearch(e.target.value)}
                                                                        placeholder="BUSCAR PAÍS..."
                                                                        className="w-full bg-white/5 border border-white/10 p-2.5 pl-9 text-[10px] font-black text-white outline-none focus:border-red-600 uppercase"
                                                                        autoFocus
                                                                    />
                                                                </div>
                                                            </div>
                                                            {/* Country list */}
                                                            <div className="overflow-y-auto custom-scrollbar flex-1">
                                                                {countriesLoading ? (
                                                                    <div className="p-4 text-center text-[10px] font-black text-gray-500 uppercase">CARGANDO PAÍSES...</div>
                                                                ) : (
                                                                    countries
                                                                        .filter(c => {
                                                                            if (!countrySearch) return true;
                                                                            const term = countrySearch.toLowerCase();
                                                                            return c.name.toLowerCase().includes(term) || c.code.includes(term) || c.iso.toLowerCase().includes(term);
                                                                        })
                                                                        .map((country, i) => (
                                                                            <button
                                                                                key={`${country.iso}-${i}`}
                                                                                onClick={() => {
                                                                                    setSelectedCountry(country);
                                                                                    setShowCountryPicker(false);
                                                                                    setCountrySearch('');
                                                                                }}
                                                                                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-600/10 transition-colors text-left border-b border-white/5 last:border-0 ${selectedCountry?.iso === country.iso ? 'bg-red-600/5' : ''}`}
                                                                            >
                                                                                <span className="text-lg">{country.flag}</span>
                                                                                <span className="text-[10px] font-black text-white uppercase flex-1 truncate">{country.name}</span>
                                                                                <span className="text-[10px] font-mono text-gray-500">{country.code}</span>
                                                                            </button>
                                                                        ))
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Phone Number */}
                                            <div className="relative flex-1">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    placeholder="8290000000"
                                                    className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm font-bold text-white outline-none focus:border-red-600 transition-colors"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        {error && <p className="text-[10px] font-black text-red-600 tracking-widest uppercase">{error}</p>}

                                        <button
                                            type="button"
                                            onClick={sendVerificationCode}
                                            disabled={loading || !phone}
                                            className="w-full py-5 bg-red-600 text-white font-black italic text-sm tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                                        >
                                            {loading ? (
                                                <><RefreshCw size={18} className="animate-spin" /> ENVIANDO SMS...</>
                                            ) : (
                                                <>ENVIAR CÓDIGO SMS <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                                            )}
                                        </button>
                                    </motion.div>
                                )}

                                {/* STEP: OTP Code Entry */}
                                {step === 'code' && (
                                    <motion.div
                                        key="code-step"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="w-full space-y-6"
                                    >
                                        <div className="bg-white/5 border border-white/10 p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Phone size={14} className="text-red-600" />
                                                <span className="text-[11px] font-black text-white">
                                                    {selectedCountry?.code || '+1'} {phone}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => { setStep('phone'); setOtpCode(['', '', '', '', '', '']); setError(''); }}
                                                className="text-[9px] font-black text-gray-500 hover:text-red-600 uppercase tracking-widest flex items-center gap-1"
                                            >
                                                <ChevronLeft size={12} /> CAMBIAR
                                            </button>
                                        </div>

                                        <p className="text-xs text-gray-400 font-bold uppercase leading-relaxed">
                                            INGRESA EL CÓDIGO DE 6 DÍGITOS QUE RECIBISTE POR SMS.
                                        </p>

                                        {/* OTP Input Boxes */}
                                        <div className="flex gap-2 justify-center">
                                            {otpCode.map((digit, i) => (
                                                <input
                                                    key={i}
                                                    ref={el => otpInputRefs.current[i] = el}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={i === 0 ? 6 : 1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                    className={`w-12 h-14 bg-white/5 border text-center text-xl font-black text-white outline-none transition-all ${digit ? 'border-red-600 bg-red-600/5 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'border-white/10 focus:border-red-600'
                                                        }`}
                                                />
                                            ))}
                                        </div>

                                        {error && <p className="text-[10px] font-black text-red-600 tracking-widest uppercase">{error}</p>}

                                        <button
                                            type="button"
                                            onClick={verifyOtpCode}
                                            disabled={loading || otpCode.some(d => d === '')}
                                            className="w-full py-5 bg-red-600 text-white font-black italic text-sm tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                                        >
                                            {loading ? (
                                                <><RefreshCw size={18} className="animate-spin" /> VERIFICANDO...</>
                                            ) : (
                                                <>VERIFICAR CÓDIGO <Check size={20} /></>
                                            )}
                                        </button>

                                        {/* Resend Button */}
                                        <div className="text-center">
                                            {resendTimer > 0 ? (
                                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                                    REENVIAR EN <span className="text-red-600">{resendTimer}s</span>
                                                </p>
                                            ) : (
                                                <button
                                                    onClick={() => { setOtpCode(['', '', '', '', '', '']); setError(''); sendVerificationCode(); }}
                                                    className="text-[10px] font-black text-red-600 hover:text-white uppercase tracking-widest transition-colors"
                                                >
                                                    REENVIAR CÓDIGO SMS
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* STEP: Success */}
                                {step === 'success' && (
                                    <motion.div
                                        key="success-step"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-full space-y-4 py-4"
                                    >
                                        <div className="bg-green-600/10 border border-green-600/30 p-6 space-y-3">
                                            <p className="text-sm font-black text-green-500 uppercase tracking-widest">
                                                ✓ NÚMERO VERIFICADO
                                            </p>
                                            <p className="text-lg font-black text-white">
                                                {selectedCountry?.code || '+1'} {phone}
                                            </p>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                                CERRANDO EN UNOS SEGUNDOS...
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest">
                                {step === 'phone' ? 'SE ENVIARÁ UN SMS DE VERIFICACIÓN A TU NÚMERO.' : step === 'code' ? 'EL CÓDIGO EXPIRA EN 5 MINUTOS.' : 'INTEGRACIÓN COMPLETA.'}
                            </p>
                        </div>

                        {/* Scanline Effect */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-[20]">
                            <div className="w-full h-[1px] bg-red-600 animate-scan"></div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PhoneCaptureModal;
