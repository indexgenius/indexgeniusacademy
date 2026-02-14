import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, Smartphone, Landmark, Check, Copy, Phone, ShieldCheck, Zap, ArrowRight, Lock, Key, Unlock, Bell, MessageSquare, Menu, Trophy, TrendingUp, Rocket, Briefcase, Coins, Flame, Target, Crown, Globe, BarChart3, Medal } from 'lucide-react';
import { db } from '../../firebase';
import { doc, updateDoc, serverTimestamp, onSnapshot, collection, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import InstallGuide from '../landing/components/InstallGuide';

const PaymentPortal = ({ user, onLogout }) => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [copied, setCopied] = useState(null);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [brokerType, setBrokerType] = useState('universal');
    const [step, setStep] = useState(1); // 1: Main Vault View, 2: Payment Selection
    const [showWelcome, setShowWelcome] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [accessKey, setAccessKey] = useState('');

    useEffect(() => {
        if (localStorage.getItem('show_onboarding') === 'true') {
            setShowWelcome(true);
            localStorage.removeItem('show_onboarding');
        }
    }, []);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "payment_methods"), (snapshot) => {
            setPaymentMethods(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, []);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const finalPrice = 50;
    const planName = 'ELITEPACK INDEXGENIUS';

    const confirmPayment = async () => {
        setLoading(true);
        const userEmail = user?.email || "SISTEMA_LOCAL_USER";
        const message = `HOLA STEVEN. ACABO DE REALIZAR EL PAGO DE MI SUSCRIPCIÓN.\n\nVALOR: $${finalPrice} USD\nPLAN: ${planName}\nUSUARIO: ${userEmail}\n\nPOR FAVOR ACTIVA MI CUENTA.`;
        const waUrl = `https://wa.me/18292198071?text=${encodeURIComponent(message)}`;

        try {
            const newWindow = window.open(waUrl, '_blank');
            if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                console.warn("Popup blocked or failed");
            }
        } catch (e) {
            console.error("Window open error:", e);
        }

        try {
            await addDoc(collection(db, "notifications"), {
                title: "NUEVO PAGO DE MEMBRESÍA",
                message: `El usuario ${userEmail} reportó un pago de $${finalPrice} (${planName}).`,
                type: 'subscription_payment',
                userId: user.uid,
                userEmail: userEmail,
                read: false,
                timestamp: serverTimestamp()
            });

            await new Promise(resolve => setTimeout(resolve, 1000));

            await updateDoc(doc(db, "users", user.uid), {
                status: 'pending',
                brokerType: brokerType,
                paymentReported: true,
                paymentReportedAt: serverTimestamp()
            });
        } catch (e) {
            console.error(e);
            alert("Error al procesar el reporte. Intenta de nuevo.");
        } finally {
            if (loading) setLoading(false);
        }
    };

    const handleVerifyKey = async () => {
        if (!accessKey.trim()) return;
        setVerifying(true);
        setTimeout(() => {
            alert("Clave inválida o expirada. Por favor contacta a soporte.");
            setVerifying(false);
        }, 1500);
    };

    const methodsByCat = (cat) => paymentMethods.filter(m => m.category === cat);

    return (
        <div className="min-h-screen bg-[#050505] text-white font-space selection:bg-red-600 flex flex-col items-center relative overflow-x-hidden">

            {/* Top Status Bar */}
            <div className="w-full max-w-lg px-6 py-6 flex justify-between items-start z-20">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                            <img src="/img/logos/red_bull_logo_new.PNG" className="w-4 h-4 object-contain" alt="logo" />
                        </div>
                        <p className="text-[10px] font-black text-red-600 tracking-widest uppercase truncate">STATUS: AUTHORIZED (V6.2 - SW FILES)</p>
                    </div>
                    <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-8">{user?.email || 'GUEST_USER'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors">
                        <Bell size={16} className="text-gray-400" />
                    </button>
                    <button onClick={onLogout} className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-black text-xs hover:bg-red-700 transition-colors border-2 border-transparent hover:border-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                        {user?.email?.[0].toUpperCase() || 'U'}
                    </button>
                </div>
            </div>

            <div className="w-full max-w-lg px-4 pb-10 flex-1 flex flex-col space-y-8 z-10 relative">

                {/* Main Title */}
                <div className="text-center space-y-2 mt-2">
                    <div className="flex items-center justify-center gap-3">
                        <Trophy size={32} className="text-red-600 filter drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                            <span className="text-red-600">ElitePack</span> IndexGenius
                        </h1>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Medal size={14} className="text-yellow-500" />
                        <p className="text-[10px] font-bold text-gray-400 tracking-wide">La plantilla #1 utilizada por traders en Latinoamérica</p>
                        <TrendingUp size={14} className="text-green-500" />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* ACQUISITION MODULE CARD */}
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-[30px] p-6 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent opacity-50"></div>

                                {/* Header */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center transform -skew-x-12">
                                        <Zap size={16} className="text-white transform skew-x-12" fill="currentColor" />
                                    </div>
                                    <span className="text-[10px] font-black italic uppercase tracking-widest text-white flex items-center gap-2">
                                        <Zap size={14} className="text-red-500" /> ACCESS MODULE
                                    </span>
                                </div>

                                {/* Title */}
                                <div className="mb-6 relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Unlock size={14} className="text-red-500" />
                                        <p className="text-[11px] font-bold text-gray-400">Desbloquea acceso completo al sistema Elite</p>
                                        <Rocket size={14} className="text-red-500 animate-bounce" />
                                    </div>
                                    <h2 className="text-3xl font-black italic uppercase leading-[0.95] tracking-tight">
                                        ACTIVAR <br />
                                        <span className="text-red-600 text-shadow-red">ACCESO ELITE</span>
                                    </h2>
                                </div>

                                {/* Credit Card Icon BG */}
                                <div className="absolute top-20 right-[-20px] opacity-10 pointer-events-none">
                                    <CreditCard size={180} />
                                </div>

                                {/* Price Container */}
                                <div className="bg-[#111] border border-white/5 rounded-2xl p-5 mb-4 relative z-10">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={12} className="text-gray-500" />
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">MEMBERSHIP TYPE</span>
                                        </div>
                                        <div className="bg-red-600 px-2 py-0.5 rounded text-[8px] font-black uppercase text-white tracking-wider flex items-center gap-1">
                                            <Crown size={10} /> ELITE FULL ACCESS
                                        </div>
                                    </div>

                                    {/* Benefits List */}
                                    <div className="space-y-1.5 mb-4 text-[9px] text-gray-400">
                                        <p className="flex items-start gap-1.5"><span className="text-green-500 mt-0.5">✔</span> Plantillas profesionales listas para operar</p>
                                        <p className="flex items-start gap-1.5"><span className="text-green-500 mt-0.5">✔</span> Estructura institucional y validada</p>
                                        <p className="flex items-start gap-1.5"><span className="text-green-500 mt-0.5">✔</span> Optimizada para índices y sintéticos</p>
                                        <p className="flex items-start gap-1.5"><span className="text-green-500 mt-0.5">✔</span> Uso inmediato – sin configuraciones complejas</p>
                                        <p className="flex items-start gap-1.5"><span className="text-green-500 mt-0.5">✔</span> Actualizaciones incluidas</p>
                                    </div>

                                    <div className="border-t border-white/5 pt-4 mb-3">
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-5xl font-black italic tracking-tighter text-white">${finalPrice}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">USD</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] text-gray-500 font-bold">Pago único • Acceso de por vida</span>
                                            <Coins size={12} className="text-yellow-600 animate-pulse" />
                                            <Flame size={12} className="text-orange-600" />
                                        </div>
                                    </div>

                                    {/* Crypto Icons */}
                                    <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Lock size={12} className="text-red-500" />
                                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">PAYMENT METHODS</p>
                                        </div>
                                        <div className="flex gap-2 items-center flex-wrap">
                                            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/5 hover:border-green-500/30 transition-all group">
                                                <img src="/img/metodos/logos/usdt_hq.svg" className="w-4 h-4 group-hover:scale-110 transition-transform" alt="USDT" />
                                                <span className="text-[8px] font-bold text-gray-400 group-hover:text-green-400 transition-colors">USDT</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/5 hover:border-orange-500/30 transition-all group">
                                                <img src="/img/metodos/logos/btc_hq.svg" className="w-4 h-4 group-hover:scale-110 transition-transform" alt="BTC" />
                                                <span className="text-[8px] font-bold text-gray-400 group-hover:text-orange-400 transition-colors">BTC</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/5 hover:border-yellow-500/30 transition-all group">
                                                <img src="/img/metodos/logos/bnb_hq.svg" className="w-4 h-4 group-hover:scale-110 transition-transform" alt="BNB" />
                                                <span className="text-[8px] font-bold text-gray-400 group-hover:text-yellow-400 transition-colors">BNB</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 mt-2">
                                            <ShieldCheck size={12} className="text-green-500" />
                                            <p className="text-[7px] text-gray-500 text-center uppercase tracking-widest font-bold">Transacción rápida y segura</p>
                                            <Lock size={12} className="text-red-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Extra Premium Line */}
                                <div className="mb-6 flex flex-col items-center gap-1">
                                    <p className="text-[9px] text-gray-500 italic flex items-center gap-2">
                                        <Target size={12} className="text-red-600" /> Diseñado para quienes buscan consistencia, no suerte <Target size={12} className="text-red-600" />
                                    </p>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-black italic uppercase tracking-[0.15em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(220,38,38,0.4)] hover:shadow-[0_0_35px_rgba(220,38,38,0.6)] flex items-center justify-center gap-3"
                                >
                                    <Rocket size={18} /> ACTIVAR ACCESO ELITE
                                </button>
                            </div>

                            {/* VERIFY KEY CARD */}
                            <div className="bg-[#080808] border border-white/5 rounded-[30px] p-8 text-center relative overflow-hidden">
                                <div className="flex justify-center mb-4">
                                    <div className="w-14 h-14 rounded-full border border-red-600/30 flex items-center justify-center bg-red-600/5 text-red-600 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
                                        <Lock size={24} />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-1 flex items-center justify-center gap-2">
                                    <Key size={20} className="text-red-600" /> VERIFY <span className="text-red-600">KEY</span>
                                </h3>
                                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-6">Ingresa tu clave de activación</p>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Key size={14} className="text-red-600" />
                                        </div>
                                        <input
                                            type="text"
                                            value={accessKey}
                                            onChange={(e) => setAccessKey(e.target.value)}
                                            placeholder="XXXX - XXXX - XXXX"
                                            className="w-full bg-[#111] border border-white/10 rounded-xl py-4 pl-10 pr-4 text-center font-mono text-xs text-white placeholder:text-gray-700 focus:outline-none focus:border-red-600 transition-colors uppercase tracking-widest"
                                        />
                                    </div>

                                    <button
                                        onClick={handleVerifyKey}
                                        disabled={verifying}
                                        className="w-full bg-[#330000] border border-red-900/50 text-red-500 py-4 rounded-xl font-black italic uppercase tracking-[0.15em] text-xs hover:bg-red-900/40 hover:text-red-400 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {verifying ? 'DESENCRIPTANDO...' : <><Unlock size={14} className="group-hover:text-red-300 transition-colors" /> DESENCRIPTAR Y DESBLOQUEAR <Flame size={14} className="text-red-600 animate-pulse" /></>}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <button onClick={() => setStep(1)} className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest flex items-center gap-2 pl-2">
                                ← ABORT PROTOCOL
                            </button>

                            <div className="bg-[#0A0A0A] border border-white/10 rounded-[30px] p-6">
                                <div className="flex justify-between items-end mb-8 pb-4 border-b border-white/5">
                                    <div>
                                        <h3 className="text-xl font-black italic uppercase text-white">SELECT CHANNEL</h3>
                                        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">SECURE PAYMENT GATEWAY</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">TOTAL</p>
                                        <p className="text-2xl font-black italic text-white">${finalPrice}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {paymentMethods.map((pm) => (
                                        <div key={pm.id} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:border-red-600/30 hover:bg-white/10 transition-all group">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-black flex items-center justify-center border border-white/10">
                                                        {pm.icon === 'usdt' && <img src="/img/metodos/logos/usdt_hq.svg" className="w-5 h-5" />}
                                                        {pm.icon === 'binance' && <img src="/img/metodos/logos/bnb_hq.svg" className="w-5 h-5" />}
                                                        {pm.icon === 'bitcoin' && <img src="/img/metodos/logos/btc_hq.svg" className="w-5 h-5" />}
                                                        {pm.icon === 'bancolombia' && <img src="/img/metodos/logos/Logo_Bancolombia.svg.png" className="w-5 h-5 object-contain" />}
                                                        {pm.icon === 'nequi' && <img src="/img/metodos/logos/nequi-37254.png" className="w-5 h-5 object-contain" />}
                                                        {!['usdt', 'binance', 'bitcoin', 'bancolombia', 'nequi'].includes(pm.icon) && <CreditCard size={16} />}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase text-white">{pm.name}</span>
                                                </div>
                                                <button onClick={() => handleCopy(pm.value, pm.id)} className="text-gray-500 hover:text-white transition-colors">
                                                    {copied === pm.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                            <div className="bg-black/40 rounded p-2 border border-white/5">
                                                <p className="font-mono text-[10px] text-red-500 break-all">{pm.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={confirmPayment}
                                    disabled={loading}
                                    className="w-full mt-6 bg-[#25D366] text-white py-4 rounded-xl font-black italic uppercase tracking-[0.2em] text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg"
                                >
                                    {loading ? 'TRANSMITTING...' : 'CONFIRM TRANSACTION'} <Phone size={16} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <div className="text-center pt-8 border-t border-white/5">
                    <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mb-2">ENCOUNTERING VALIDATION ISSUES?</p>
                    <button className="text-[9px] font-black text-white hover:text-red-600 uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors mx-auto">
                        <MessageSquare size={10} /> CONTACT COMMAND CENTER
                    </button>
                </div>
            </div>

            {/* Install Guide Modal */}
            <AnimatePresence>
                {showGuide && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black p-4 flex flex-col"
                    >
                        <button onClick={() => setShowGuide(false)} className="self-end p-4 text-white hover:text-red-600">CLOSE [X]</button>
                        <div className="flex-1 overflow-y-auto">
                            <InstallGuide />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default PaymentPortal;
