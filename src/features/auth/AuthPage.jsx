import React, { useState, useEffect, useRef } from 'react';
import { Zap, Lock, User, ArrowRight, Chrome, Mail, Eye, EyeOff, Phone, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, googleProvider, db } from '../../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail, RecaptchaVerifier } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import useCountryCodes from '../../hooks/useCountryCodes';

const AuthPage = ({ onLogin, initialMode = 'login' }) => {
    const { countries, loading: countriesLoading } = useCountryCodes();
    const [email, setEmail] = useState('');
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [isResetMode, setIsResetMode] = useState(false);
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Set default country when loaded
    useEffect(() => {
        if (countries.length > 0 && !selectedCountry) {
            setSelectedCountry(countries[0]);
        }
    }, [countries]);

    const recaptchaVerifierRef = useRef(null);

    useEffect(() => {
        const hasRef = localStorage.getItem('referralCode');
        if (hasRef && hasRef.length > 5 && hasRef !== '/') {
            setIsLogin(false);
        }

        // Cleanup reCAPTCHA on unmount
        return () => {
            if (recaptchaVerifierRef.current) {
                try {
                    recaptchaVerifierRef.current.clear();
                    recaptchaVerifierRef.current = null;
                } catch (e) {
                    console.warn("reCAPTCHA cleanup error:", e);
                }
            }
        };
    }, []);

    const handleResetPassword = async (normalizedEmail) => {
        if (!normalizedEmail) {
            setError('INGRESA TU EMAIL PARA RESTABLECER');
            setLoading(false);
            return;
        }
        try {
            await sendPasswordResetEmail(auth, normalizedEmail);
            setSuccess('EMAIL DE RESTABLECIMIENTO ENVIADO');
            setTimeout(() => {
                setIsResetMode(false);
                setSuccess('');
            }, 3000);
        } catch (err) {
            console.error("Reset Error:", err);
            setError('ERROR AL ENVIAR EL EMAIL');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        let loggedUser = null;
        try {
            const result = await signInWithPopup(auth, googleProvider);
            loggedUser = result.user;
            // No hacemos búsqueda de colección para evitar error de permisos (firestore rules).
            await onLogin(result.user);
        } catch (err) {
            console.error(`❌ Google Login Error (${loggedUser?.email || 'no-session'}):`, err);
            setError('ERROR AL INICIAR CON GOOGLE');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const normalizedEmail = email.trim().toLowerCase();

        if (isResetMode) {
            handleResetPassword(normalizedEmail);
            return;
        }

        let generatedPassword = password;
        if (!isLogin && !isResetMode) {
            generatedPassword = Math.random().toString(36).slice(-10) + "Ig24!";
            setPassword(generatedPassword);
        }

        try {
            let userCredential;
            if (isLogin) {
                userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);

                // Una vez logueado, ya tenemos permisos para leer nuestro propio documento (request.auth.uid == userId)
                // Pero NO para hacer queries de colección (getDocs(q)) a menos que seamos admin.
                // Por lo tanto, evitamos la búsqueda de duplicados aquí para no disparar el error de permisos.
            } else {
                // REGISTRO: Intentamos crear el usuario directamente. 
                // Si el email ya existe en Auth, Firebase lanzará 'auth/email-already-in-use'.
                userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, generatedPassword);

                if (name) await updateProfile(userCredential.user, { displayName: name });

                const referralCode = localStorage.getItem('referralCode');
                const selectedPlanStr = localStorage.getItem('selectedPlan');
                const selectedPlan = selectedPlanStr ? JSON.parse(selectedPlanStr) : null;

                const userData = {
                    email: normalizedEmail,
                    displayName: name,
                    phone: `${selectedCountry?.code || '+1'}${phone.replace(/\D/g, '')}`,
                    status: 'payment_required',
                    role: 'user',
                    createdAt: serverTimestamp(),
                    subscriptionActive: false,
                    tmpPassword: generatedPassword,
                    provider: 'password',
                    planId: selectedPlan?.id || 'index-one',
                    planName: selectedPlan?.name || 'INDEX ONE'
                };

                if (referralCode) {
                    userData.referredBy = referralCode;
                }

                // Esta escritura funcionará porque acabamos de autenticarnos (request.auth.uid == userCredential.user.uid)
                await setDoc(doc(db, "users", userCredential.user.uid), userData);
                localStorage.removeItem('referralCode');
            }
            await onLogin(userCredential.user);
        } catch (err) {
            console.error("Auth Error Details:", err);

            if (err.code === 'auth/email-already-in-use') {
                setError('ESTE EMAIL YA ESTÁ EN USO. INTENTA INICIAR SESIÓN.');
            } else if (err.code === 'permission-denied') {
                setError('ERROR DE PERMISOS (FIRESTORE). CONSULTA AL ADMIN.');
            } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                setError('CREDENCIALES INVÁLIDAS');
            } else if (err.code === 'auth/weak-password') {
                setError('LA CONTRASEÑA ES MUY DÉBIL');
            } else {
                setError(isLogin ? 'ERROR AL INICIAR SESIÓN' : 'ERROR AL REGISTRAR UNIDAD');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-black flex flex-col lg:flex-row font-space relative overflow-y-auto">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-black via-red-950/10 to-black relative items-center justify-center p-12">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-600/5 to-transparent"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative z-10 text-center"
                >
                    <div className="w-64 h-64 mb-8 mx-auto overflow-hidden relative group bg-black rounded-full flex items-center justify-center border border-white/10">
                        <img src="/img/logos/IMG_5208.PNG" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none mb-4">
                        INDEX GENIUS <span className="block text-red-600 text-7xl mt-2">ACADEMY</span>
                    </h1>
                    <p className="text-sm font-black tracking-[0.3em] text-gray-500 uppercase mt-6">SEÑALES DE TRADING DE ÉLITE • INTELIGENCIA TÁCTICA</p>
                </motion.div>
            </div>

            {/* Right Side - Form */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full lg:w-1/2 bg-black flex items-center justify-center p-6 lg:p-12 relative"
            >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px] -z-10"></div>

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <div className="lg:hidden w-32 h-32 mb-8 mx-auto bg-black border border-white/10 rounded-full flex items-center justify-center p-4">
                            <img src="/img/logos/red_bull_logo_new.PNG" alt="Logo" className="w-full h-full object-contain" />
                        </div>

                        <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-2">
                            {isResetMode ? 'RECUPERAR ACCESO' : <>INDEX GENIUS <span className="text-red-600">ACADEMY</span></>}
                        </h2>
                        <p className="text-[10px] font-black tracking-[0.3em] text-gray-500 uppercase">
                            {isResetMode ? 'SISTEMA DE RECUPERACIÓN DE CONTRASEÑA' : (isLogin ? 'SOLO MIEMBROS EXCLUSIVOS' : 'REGISTRO EXCLUSIVO')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode='wait'>
                            {isResetMode ? (
                                <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">EMAIL DE RECUPERACIÓN</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="INGRESA TU EMAIL" className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm font-bold uppercase text-white outline-none" />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="auth" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                    {!isLogin && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">NOMBRE DE USUARIO</label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="INGRESA NOMBRE DE USUARIO" className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm font-bold text-white outline-none" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">NÚMERO DE TELÉFONO</label>
                                                <div className="flex gap-2">
                                                    {/* Country Code Selector */}
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => { setShowCountryPicker(!showCountryPicker); setCountrySearch(''); }}
                                                            className="h-full px-3 bg-white/5 border border-white/10 flex items-center gap-2 hover:border-red-600 transition-colors min-w-[100px]"
                                                        >
                                                            <span className="text-lg">{selectedCountry?.flag || '🏳️'}</span>
                                                            <span className="text-[11px] font-black text-white">{selectedCountry?.code || '+1'}</span>
                                                            <ChevronDown size={12} className="text-gray-500" />
                                                        </button>

                                                        <AnimatePresence>
                                                            {showCountryPicker && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -5 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -5 }}
                                                                    className="absolute top-full left-0 mt-1 w-72 bg-black border border-white/10 shadow-2xl z-50 max-h-64 overflow-hidden flex flex-col"
                                                                >
                                                                    {/* Search */}
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
                                                                    {/* List */}
                                                                    <div className="overflow-y-auto custom-scrollbar flex-1">
                                                                        {countriesLoading ? (
                                                                            <div className="p-4 text-center text-[10px] font-black text-gray-500 uppercase">CARGANDO...</div>
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
                                                                                        type="button"
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
                                                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="NÚMERO SIN CÓDIGO" className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm font-bold text-white outline-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">EMAIL</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="INGRESA TU EMAIL" className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm font-bold text-white outline-none" />
                                        </div>
                                    </div>
                                    {isLogin && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">CONTRASEÑA</label>
                                                <button type="button" onClick={() => setIsResetMode(true)} className="text-[9px] font-black text-red-600/60 uppercase">¿OLVIDASTE TU CONTRASEÑA?</button>
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="INGRESA TU CONTRASEÑA" className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm font-bold text-white outline-none" />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                            </div>
                                        </div>
                                    )}

                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && <p className="text-[10px] font-black text-red-600 tracking-widest text-center uppercase">{error}</p>}
                        {success && <p className="text-[10px] font-black text-green-500 tracking-widest text-center uppercase">{success}</p>}

                        <button type="submit" disabled={loading} className="w-full py-5 bg-red-600 text-white font-black italic text-sm tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4 group disabled:opacity-50">
                            {loading ? 'PROCESANDO...' : (isResetMode ? 'ENVIAR RECUPERACIÓN' : (isLogin ? 'INICIAR SESIÓN' : 'JOIN NOW'))}
                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <button onClick={() => { setIsResetMode(false); setIsLogin(!isLogin); setError(''); setSuccess(''); }} className="text-[10px] font-black text-red-600 hover:text-white uppercase tracking-widest transition-colors border-b border-red-600/30 pb-1">
                            {isResetMode ? 'VOLVER AL INICIO' : (isLogin ? "¿NO TIENES CUENTA? CRÉALA AQUÍ" : '¿YA TIENES CUENTA? INICIA SESIÓN')}
                        </button>
                    </div>

                    {!isResetMode && (
                        <div className="mt-6">
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink-0 mx-4 text-[9px] font-black text-gray-600 uppercase tracking-widest">O ACCEDE CON</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>
                            <button onClick={handleGoogleLogin} disabled={loading} className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 mt-4">
                                <Chrome size={18} /> GOOGLE IDENTITY
                            </button>
                        </div>
                    )}
                    {/* Hidden Recaptcha container to prevent "already rendered" issues */}
                    <div id="recaptcha-container-auth" className="hidden"></div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
