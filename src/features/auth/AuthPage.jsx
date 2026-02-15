import React, { useState, useEffect } from 'react';
import { Zap, Lock, User, ArrowRight, Chrome, Mail, Eye, EyeOff, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, googleProvider, db } from '../../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthPage = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [isResetMode, setIsResetMode] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const hasRef = localStorage.getItem('referralCode');
        if (hasRef && hasRef.length > 5 && hasRef !== '/') {
            setIsLogin(false);
        }
    }, []);

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

        if (!isLogin && password !== confirmPassword) {
            setError('LAS CONTRASEÑAS NO COINCIDEN');
            setLoading(false);
            return;
        }

        try {
            let userCredential;
            if (isLogin) {
                userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
            } else {
                userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
                if (name) await updateProfile(userCredential.user, { displayName: name });

                const referralCode = localStorage.getItem('referralCode');
                const userData = {
                    email: normalizedEmail,
                    displayName: name,
                    phone: phone,
                    status: 'payment_required',
                    role: 'user',
                    createdAt: serverTimestamp(),
                    subscriptionActive: false
                };

                if (referralCode) {
                    userData.referredBy = referralCode;
                }

                await setDoc(doc(db, "users", userCredential.user.uid), userData);
                localStorage.removeItem('referralCode');
            }
            await onLogin(userCredential.user);
        } catch (err) {
            console.error("Auth Error:", err);
            setError(isLogin ? 'CREDENCIALES INVÁLIDAS' : 'ERROR AL REGISTRAR (EMAIL EN USO?)');
        } finally {
            setLoading(false);
        }
    };

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
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await onLogin(result.user);
        } catch (err) {
            console.error("Google Login Error:", err);
            setError('ERROR AL INICIAR CON GOOGLE');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen h-screen bg-black flex font-space relative overflow-hidden">
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
                        <img src="/img/logos/red_bull_logo_new.PNG" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none mb-4">
                        INDEX GENIUS <span className="block text-red-600 text-7xl mt-2">ACADEMY</span>
                    </h1>
                    <p className="text-sm font-black tracking-[0.3em] text-gray-500 uppercase mt-6">ELITE TRADING SIGNALS • TACTICAL INTELLIGENCE</p>
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
                            {isResetMode ? 'RECOVER ACCESS' : <>INDEX GENIUS <span className="text-red-600">ACADEMY</span></>}
                        </h2>
                        <p className="text-[10px] font-black tracking-[0.3em] text-gray-500 uppercase">
                            {isResetMode ? 'PASSWORD RECOVERY SYSTEM' : (isLogin ? 'EXCLUSIVE MEMBERS ONLY' : 'EXCLUSIVE REGISTRATION')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode='wait'>
                            {isResetMode ? (
                                <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">RECOVERY EMAIL</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ENTER YOUR EMAIL" className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm font-bold uppercase text-white outline-none" />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="auth" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                    {!isLogin && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">USERNAME</label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ENTER USERNAME" className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm font-bold text-white outline-none" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">PHONE NUMBER</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="ENTER PHONE NUMBER" className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm font-bold text-white outline-none" />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">EMAIL</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ENTER EMAIL" className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm font-bold text-white outline-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">PASSWORD</label>
                                            {isLogin && <button type="button" onClick={() => setIsResetMode(true)} className="text-[9px] font-black text-red-600/60 uppercase">FORGOT YOUR PASSWORD?</button>}
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="ENTER PASSWORD" className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm font-bold text-white outline-none" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                        </div>
                                    </div>
                                    {!isLogin && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">CONFIRM PASSWORD</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                                <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="CONFIRM PASSWORD" className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm font-bold text-white outline-none" />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && <p className="text-[10px] font-black text-red-600 tracking-widest text-center uppercase">{error}</p>}
                        {success && <p className="text-[10px] font-black text-green-500 tracking-widest text-center uppercase">{success}</p>}

                        <button type="submit" disabled={loading} className="w-full py-5 bg-red-600 text-white font-black italic text-sm tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4 group disabled:opacity-50">
                            {loading ? 'PROCESSING...' : (isResetMode ? 'SEND RECOVERY' : (isLogin ? 'LOGIN' : 'REGISTER'))}
                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <button onClick={() => { setIsResetMode(false); setIsLogin(!isLogin); setError(''); setSuccess(''); }} className="text-[10px] font-black text-red-600 hover:text-white uppercase tracking-widest transition-colors border-b border-red-600/30 pb-1">
                            {isResetMode ? 'BACK TO LOGIN' : (isLogin ? "DON'T HAVE AN ACCOUNT? CREATE IT HERE" : 'ALREADY AUTHORIZED? LOGIN')}
                        </button>
                    </div>

                    {!isResetMode && (
                        <div className="mt-6">
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink-0 mx-4 text-[9px] font-black text-gray-600 uppercase tracking-widest">OR ACCESS WITH</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>
                            <button onClick={handleGoogleLogin} disabled={loading} className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 mt-4">
                                <Chrome size={18} /> GOOGLE IDENTITY
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
