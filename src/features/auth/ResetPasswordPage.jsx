import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, ShieldAlert, Zap, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';

const ResetPasswordPage = ({ oobCode }) => {
    const [status, setStatus] = useState('verifying'); // verifying, ready, loading, success, error
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const verifyCode = async () => {
            try {
                const email = await verifyPasswordResetCode(auth, oobCode);
                setEmail(email);
                setStatus('ready');
            } catch (err) {
                console.error(err);
                setError('EL CÓDIGO DE RESTABLECIMIENTO ES INVÁLIDO O HA EXPIRADO.');
                setStatus('error');
            }
        };
        verifyCode();
    }, [oobCode]);

    const handleReset = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('LA CONTRASEÑA DEBE TENER AL MENOS 6 CARACTERES.');
            return;
        }

        setStatus('loading');
        try {
            await confirmPasswordReset(auth, oobCode, password);
            setStatus('success');
        } catch (err) {
            console.error(err);
            setError('HA OCURRIDO UN ERROR AL ACTUALIZAR LA CONTRASEÑA. REINTENTA.');
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/5 blur-[120px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-[#0a0a0a] border-2 border-white/5 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
                    {/* Decorative Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-red-glow mb-6">
                            <Lock className="text-white" size={32} />
                        </div>
                        <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter text-center">
                            SECURITY <span className="text-red-600">OVERRIDE</span>
                        </h2>
                        <div className="mt-2 h-1 w-12 bg-red-600 rounded-full"></div>
                    </div>

                    <AnimatePresence mode="wait">
                        {status === 'verifying' && (
                            <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                                <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">VERIFICANDO CÓDIGO DE SEGURIDAD...</p>
                            </motion.div>
                        )}

                        {status === 'ready' || status === 'loading' ? (
                            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <p className="text-[10px] font-bold text-gray-500 text-center uppercase tracking-widest mb-8">
                                    ESTÁS RESTABLECIENDO LA CLAVE PARA:<br />
                                    <span className="text-white font-black">{email}</span>
                                </p>

                                <form onSubmit={handleReset} className="space-y-6">
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-red-600/50 group-focus-within:text-red-600 transition-colors">
                                            <Zap size={20} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="NUEVA CONTRASEÑA"
                                            className="w-full bg-white/5 border-2 border-white/10 p-5 pl-16 rounded-2xl text-white text-sm font-bold tracking-widest focus:border-red-600 outline-none transition-all placeholder:text-gray-800"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-xl flex items-center gap-3">
                                            <ShieldAlert size={18} className="text-red-600 flex-shrink-0" />
                                            <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full py-5 bg-red-600 text-white font-black italic text-xs tracking-[0.3em] uppercase rounded-2xl shadow-red-glow hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {status === 'loading' ? 'ACTUALIZANDO PROTOCOLO...' : 'ESTABLECER NUEVA CLAVE'}
                                        {status !== 'loading' && <ArrowRight size={18} />}
                                    </button>
                                </form>
                            </motion.div>
                        ) : null}

                        {status === 'success' && (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                                <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="text-green-500" size={40} />
                                </div>
                                <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-4">¡ACCESO RESTABLECIDO!</h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-10 leading-relaxed">
                                    TU CONTRASEÑA HA SIDO ACTUALIZADA CON ÉXITO. YA PUEDES INGRESAR A TU TERMINAL.
                                </p>
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="w-full py-5 bg-white text-black font-black italic text-xs tracking-[0.3em] uppercase rounded-2xl hover:bg-red-600 hover:text-white transition-all"
                                >
                                    VOLVER AL LOGIN
                                </button>
                            </motion.div>
                        )}

                        {status === 'error' && status !== 'loading' && status !== 'ready' && (
                            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                                <div className="w-20 h-20 bg-red-600/10 border-2 border-red-600/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ShieldAlert className="text-red-600" size={40} />
                                </div>
                                <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-4">ERROR DE ENLACE</h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-10 leading-relaxed">
                                    {error}
                                </p>
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="w-full py-5 border-2 border-white/10 text-white font-black italic text-xs tracking-[0.3em] uppercase rounded-2xl hover:bg-white hover:text-black transition-all"
                                >
                                    VOLVER AL INICIO
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* HUD Footer */}
                    <div className="mt-12 flex justify-between items-center opacity-20">
                        <div className="flex gap-1">
                            {[...Array(4)].map((_, i) => <div key={i} className="w-4 h-1 bg-white rounded-full"></div>)}
                        </div>
                        <p className="text-[8px] font-black text-white uppercase tracking-[0.3em]">SECURE CHANNEL 04</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
