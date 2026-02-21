import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, Smartphone, Landmark, Check, Copy, Phone, ShieldCheck, Zap, ArrowRight, Lock, Key, Unlock, Bell, MessageSquare, Trophy, TrendingUp, Rocket, Briefcase, Coins, Flame, Target, Crown, Globe, BarChart3, Medal, GraduationCap, Users, Star, ShieldAlert } from 'lucide-react';
import { db } from '../../firebase';
import { doc, updateDoc, serverTimestamp, onSnapshot, collection, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentPortal = ({ user, onLogout, isExpired }) => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [copied, setCopied] = useState(null);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [step, setStep] = useState(1); // 1: Membership Plan, 2: Payment Injection
    const [accessKey, setAccessKey] = useState('');

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

    const finalPrice = 25;
    const planName = 'INDEX GENIUS ELITE ACCESS';

    const confirmPayment = async () => {
        setLoading(true);
        const userEmail = user?.email || "SISTEMA_LOCAL_USER";
        const userPhone = user?.phone || "NO REGISTRADO";
        const message = `HOLA STEVEN. ACABO DE REALIZAR EL PAGO DE MI ${isExpired ? 'RENOVACIÓN' : 'MEMBRESÍA'} ELITE.\n\nVALOR: $${finalPrice} USD\nPLAN: ${planName}\nUSUARIO: ${userEmail}\nTELÉFONO: ${userPhone}\n\nPOR FAVOR ACTIVA MI ACCESO.`;
        const waUrl = `https://wa.me/18292198071?text=${encodeURIComponent(message)}`;

        try {
            window.open(waUrl, '_blank');
        } catch (e) {
            console.error("Window open error:", e);
        }

        try {
            await addDoc(collection(db, "notifications"), {
                title: isExpired ? "NUEVA RENOVACIÓN DE MEMBRESÍA" : "NUEVO PAGO DE MEMBRESÍA ELITE",
                message: `El usuario ${userEmail} reportó un pago de $${finalPrice} para ${isExpired ? 'renovación' : 'activación'} (${planName}).`,
                type: 'subscription_payment',
                userId: user.uid,
                userEmail: userEmail,
                read: false,
                timestamp: serverTimestamp()
            });

            await updateDoc(doc(db, "users", user.uid), {
                status: 'pending',
                paymentReported: true,
                paymentReportedAt: serverTimestamp(),
                selectedPlan: planName,
                membershipPrice: finalPrice
            });
        } catch (e) {
            console.error(e);
            alert("Error al procesar el reporte. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-space selection:bg-red-600 flex flex-col items-center">

            {/* RED TERMINAL HEADER */}
            <div className="w-full bg-[#E50914] pt-12 pb-16 px-8 relative overflow-hidden">
                {/* Shield Watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                    <ShieldCheck size={400} strokeWidth={1} />
                </div>

                <div className="max-w-xl mx-auto relative z-10">
                    <div className="flex justify-between items-start mb-12">
                        <div className="flex items-center gap-3">
                            <img src="/img/logos/IMG_5208.PNG" className="w-10 h-10 object-contain" alt="logo" />
                            <div className="h-8 w-[1px] bg-white/30 hidden md:block"></div>
                            <span className="hidden md:block text-[8px] font-black uppercase tracking-[0.3em] leading-tight text-white">INDEX<br />GENIUS</span>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-black italic uppercase leading-none tracking-tighter shadow-sm text-white">SECURE</h2>
                            <h2 className="text-2xl font-black italic uppercase leading-none tracking-tighter shadow-sm text-white">TERMINAL</h2>
                        </div>
                    </div>

                    <div className="space-y-1 mb-12">
                        <h1 className="text-4xl md:text-5xl font-black italic uppercase leading-tight tracking-tighter text-white">
                            MEMBERSHIP<br />{isExpired ? 'RENEWAL' : 'ACTIVATION'}
                        </h1>
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.4em]">
                            {isExpired ? 'SUBSCRIPTION PERIOD EXPIRED' : 'CLEARANCE LEVEL: TIER 1 ACCESS'}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs transition-all duration-500 ${step === 1 ? 'border-white bg-white text-red-600' : 'border-white/40 text-white/40'}`}>1</div>
                            <span className={`text-xs font-black italic uppercase tracking-widest transition-all duration-500 ${step === 1 ? 'text-white' : 'text-white/40'}`}>MEMBERSHIP PLAN</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs transition-all duration-500 ${step === 2 ? 'border-white bg-white text-red-600' : 'border-white/40 text-white/40'}`}>2</div>
                            <span className={`text-xs font-black italic uppercase tracking-widest transition-all duration-500 ${step === 2 ? 'text-white' : 'text-white/40'}`}>PAYMENT INJECTION</span>
                        </div>
                    </div>

                    <button onClick={onLogout} className="mt-10 text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white transition-colors flex items-center gap-2">
                        ABORT SESSION <span className="text-white/30 text-[8px]">[LOGOUT]</span>
                    </button>
                </div>
            </div>

            {/* BLACK SELECTION AREA */}
            <div className="w-full flex-1 bg-black px-8 py-12">
                <div className="max-w-xl mx-auto">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="plan-select"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                {isExpired ? (
                                    /* RENEWAL SPECIFIC UI */
                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-[2px] w-12 bg-red-600"></div>
                                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">RECOVERY PROTOCOL</h3>
                                            </div>
                                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] leading-relaxed max-w-md">
                                                Your access to the Index Genius tactical node has been disconnected.
                                                Follow the steps below to re-establish your cryptographical clearance.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Status Card */}
                                            <div className="bg-white/5 border border-white/10 p-8 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                                                    <ShieldAlert size={40} className="text-red-600" />
                                                </div>
                                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-4 block">Current Status</span>
                                                <div className="text-4xl font-black italic text-red-600 mb-2">TERMINATED</div>
                                                <div className="bg-red-600/20 text-red-500 px-3 py-1 text-[8px] font-black uppercase tracking-widest inline-block skew-x-[-10deg]">
                                                    ACCESS DENIED
                                                </div>
                                            </div>

                                            {/* Action Card */}
                                            <div className="bg-red-600/5 border-2 border-red-600 p-8 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-3 opacity-20">
                                                    <Zap size={40} className="text-white" />
                                                </div>
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Recovery Cost</span>
                                                <div className="text-4xl font-black italic text-white mb-2">$25 <span className="text-sm">USDT</span></div>
                                                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">LIFETIME RE-ACTIVATION</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-white/5 border border-white/10 p-6 flex items-center justify-between group hover:bg-white/10 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center border border-red-600/50">
                                                        <Key size={20} className="text-red-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">GENERATE NEW CLEARANCE</p>
                                                        <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">RE-ENTRY PERMIT</p>
                                                    </div>
                                                </div>
                                                <Check size={16} className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* STANDARD MEMBERSHIP UI */
                                    <>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">SELECT MEMBERSHIP</h3>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                                                ACCESS ALL PREMIUM SIGNALS AND FEATURES WITH OUR UNIFIED ELITE PLAN.
                                            </p>
                                        </div>

                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-red-600/5 blur-2xl group-hover:bg-red-600/10 transition-all duration-700"></div>
                                            <div className="relative border-2 border-red-600/50 rounded-lg p-10 overflow-hidden bg-black/50 backdrop-blur-sm">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="space-y-1">
                                                        <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">ELITE ACCESS</h4>
                                                        <div className="bg-red-600 text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest inline-block skew-x-[-10deg]">
                                                            FULL BENEFIT UNLOCKED
                                                        </div>
                                                    </div>
                                                    <ShieldAlert size={40} className="text-red-600/20" />
                                                </div>

                                                <div className="flex items-baseline gap-2 mb-2">
                                                    <span className="text-7xl font-black italic tracking-tighter text-white">$25</span>
                                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">USDT / LIFETIME</span>
                                                </div>

                                                <div className="mt-8 space-y-3">
                                                    {["Full Signal Feed", "Educational Vault", "Elite Community", "Priority Support"].map((item, i) => (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <div className="w-4 h-[1px] bg-red-600"></div>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <ShieldCheck className="absolute -bottom-10 -right-10 text-white/5 w-48 h-48 pointer-events-none" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* BOTTOM ACTION BAR */}
                                <div className="fixed bottom-0 left-0 w-full bg-white px-8 py-5 flex justify-center items-center z-50">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="w-full max-w-xl group flex justify-between items-center bg-transparent"
                                    >
                                        <span className="text-black text-xl font-black italic uppercase tracking-tighter group-active:translate-y-1 transition-transform">
                                            {isExpired ? 'INITIALIZE RECOVERY' : 'PROCEED TO PAYMENT'}
                                        </span>
                                        <ArrowRight className="text-black w-8 h-8 group-hover:translate-x-2 transition-transform duration-500" />
                                    </button>
                                </div>

                                <div className="h-24"></div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="payment-injection"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <button onClick={() => setStep(1)} className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors">
                                    ← BACK TO SELECTION
                                </button>

                                <div className="space-y-2">
                                    {isExpired && (
                                        <div className="mb-6 p-4 bg-red-600/10 border-2 border-red-600 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-red-600/5 animate-pulse"></div>
                                            <div className="relative z-10 flex items-center gap-4">
                                                <ShieldAlert className="text-red-600 animate-bounce" size={24} />
                                                <div>
                                                    <p className="text-xs font-black italic tracking-widest text-white uppercase">CONNECTION TERMINATED</p>
                                                    <p className="text-[8px] font-bold text-red-600/80 uppercase tracking-widest">Your access period has reached zero. Renewal required.</p>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-red-600 animate-scan"></div>
                                        </div>
                                    )}
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">PAYMENT INJECTION</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                                        SELECT A PROTOCOL AND SECURE YOUR ACCESS TO THE TERMINAL.
                                    </p>
                                </div>

                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar pb-10">
                                    {paymentMethods.map((pm) => (
                                        <div key={pm.id} className="relative group">
                                            <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/5 transition-colors duration-500"></div>
                                            <div className="relative border border-white/10 p-6 rounded-lg bg-black transition-all group-hover:border-red-600/50">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-4 text-white">
                                                        <div className="w-12 h-12 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                                                            {pm.icon === 'usdt' && <img src="/img/metodos/logos/Tether_Logo.svg.png" className="w-6 h-6" />}
                                                            {pm.icon === 'binance' && <img src="/img/metodos/logos/Binance_logo.svg.png" className="w-6 h-6" />}
                                                            {pm.icon === 'bitcoin' && <img src="/img/metodos/logos/Bitcoin_logo.svg.png" className="w-6 h-6" />}
                                                            {pm.icon === 'bancolombia' && <img src="/img/metodos/logos/Logo_Bancolombia.svg.png" className="w-6 h-6 object-contain" />}
                                                            {pm.icon === 'nequi' && <img src="/img/metodos/logos/nequi-37254.png" className="w-6 h-6 object-contain" />}
                                                            {!['usdt', 'binance', 'bitcoin', 'bancolombia', 'nequi'].includes(pm.icon) && <Zap size={20} className="text-red-600" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">{pm.name}</p>
                                                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{pm.category}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleCopy(pm.value, pm.id)} className="p-2 bg-white/5 hover:bg-red-600 transition-colors rounded">
                                                        {copied === pm.id ? <Check size={14} className="text-white" /> : <Copy size={14} className="text-white/40" />}
                                                    </button>
                                                </div>
                                                <div className="bg-black/80 border border-white/5 p-3 rounded font-mono text-[9px] text-red-600 break-all select-all">
                                                    {pm.value}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ACTION FOOTER FOR PAYMENT REPORT */}
                                <div className="fixed bottom-0 left-0 w-full bg-red-600 px-8 py-5 flex justify-center items-center z-50">
                                    <button
                                        disabled={loading}
                                        onClick={confirmPayment}
                                        className="w-full max-w-xl group flex justify-between items-center disabled:opacity-50 bg-transparent"
                                    >
                                        <span className="text-white text-xl font-black italic uppercase tracking-tighter group-active:translate-y-1 transition-transform">
                                            {loading ? 'INITIALIZING...' : 'INJECT PAYMENT REPORT'}
                                        </span>
                                        <MessageSquare className="text-white w-8 h-8 group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                                <div className="h-24"></div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default PaymentPortal;
