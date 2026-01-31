import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, Smartphone, Landmark, Check, Copy, Phone, ShieldCheck, Clock, Zap, MessageSquare, ExternalLink, ArrowRight } from 'lucide-react';
import { db } from '../../firebase';
import { doc, updateDoc, serverTimestamp, onSnapshot, collection, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentPortal = ({ user, onLogout }) => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [copied, setCopied] = useState(null);
    const [loading, setLoading] = useState(false);
    const [brokerType, setBrokerType] = useState('universal'); // Single generic type
    const [step, setStep] = useState(1); // 1: Broker Selection, 2: Payment

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
    const planName = 'ELITE MEMBERSHIP';

    const confirmPayment = async () => {
        setLoading(true);
        const userEmail = user?.email || "SISTEMA_LOCAL_USER";
        const message = `HOLA STEVEN. ACABO DE REALIZAR EL PAGO DE MI SUSCRIPCIÓN.\n\nVALOR: $${finalPrice} USD\nPLAN: ${planName}\nUSUARIO: ${userEmail}\n\nPOR FAVOR ACTIVA MI CUENTA.`;
        const waUrl = `https://wa.me/18292198071?text=${encodeURIComponent(message)}`;

        // Open WhatsApp FIRST to ensure it triggers before any state change/unmount
        try {
            const newWindow = window.open(waUrl, '_blank');
            if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                // Pop-up blocker might have stopped it, but we continue with the process.
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

            // Small delay to ensure the user perceives the action before the screen switches
            await new Promise(resolve => setTimeout(resolve, 1000));

            await updateDoc(doc(db, "users", user.uid), {
                status: 'pending',
                brokerType: brokerType,
                paymentReported: true,
                paymentReportedAt: serverTimestamp()
            });
            // Component will likely unmount here as App.jsx switches to PendingApproval
        } catch (e) {
            console.error(e);
            alert("Error al procesar el reporte. Intenta de nuevo.");
        } finally {
            if (loading) setLoading(false); // Only if component is still mounted (which it likely won't be)
        }
    };

    const methodsByCat = (cat) => paymentMethods.filter(m => m.category === cat);

    return (
        <div className="min-h-screen bg-black text-white font-space selection:bg-red-600 p-4 lg:p-10 flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/5 blur-[150px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-5xl bg-black border border-white/10 relative z-10 shadow-2xl flex flex-col lg:flex-row min-h-[700px]"
            >
                {/* Left Panel: Info & Steps */}
                <div className="w-full lg:w-[400px] bg-red-600 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 blur-sm pointer-events-none rotate-12">
                        <ShieldCheck size={300} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-10">
                            <img src="/img/logos/red_bull_logo_new.PNG" alt="Logo" className="w-12 h-12 object-contain" />
                            <h1 className="text-2xl font-black italic tracking-tighter leading-none">
                                INDEX GENIUS<br /><span className="text-black">ACADEMY</span>
                            </h1>
                        </div>

                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-4xl lg:text-5xl font-black italic tracking-tighter leading-tight uppercase">
                                    MEMBERSHIP <br />ACTIVATION
                                </h2>
                                <p className="text-[10px] font-black tracking-[0.3em] text-white/60 uppercase">Clearance Level: Tier 1 Access</p>
                            </div>

                            <div className="space-y-6">
                                <div className={`flex items-center gap-4 transition-all ${step === 1 ? 'opacity-100' : 'opacity-40'}`}>
                                    <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-black">1</div>
                                    <span className="text-xs font-black uppercase tracking-widest italic">Membership Plan</span>
                                </div>
                                <div className={`flex items-center gap-4 transition-all ${step === 2 ? 'opacity-100' : 'opacity-40'}`}>
                                    <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-black">2</div>
                                    <span className="text-xs font-black uppercase tracking-widest italic">Payment Injection</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button onClick={onLogout} className="relative z-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors">
                        ABORT SESSION [LOGOUT]
                    </button>
                </div>

                {/* Right Panel: Content Section */}
                <div className="flex-1 p-8 lg:p-12 bg-black flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-2">
                                    <h3 className="text-2xl lg:text-3xl font-black italic tracking-tighter uppercase">SELECT MEMBERSHIP</h3>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">
                                        Access all premium signals and features with our unified elite plan.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Universal Option */}
                                    <button
                                        className="p-8 border-2 border-red-600 bg-red-600/5 transition-all text-left flex flex-col justify-between min-h-[220px] relative overflow-hidden group cursor-default"
                                    >
                                        <div className="relative z-10">
                                            <h4 className="text-xl font-black italic uppercase mb-1">ELITE ACCESS</h4>
                                            <span className="text-[9px] font-black bg-red-600 text-white px-2 py-0.5 tracking-widest">FULL BENEFIT UNLOCKED</span>
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-5xl font-black italic">$25 <span className="text-xs italic text-gray-500">USDT / MO</span></p>
                                        </div>
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <ShieldCheck size={100} />
                                        </div>
                                    </button>
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.4em] italic text-xs hover:bg-red-600 hover:text-white transition-all skew-x-[-12deg] shadow-lg flex items-center justify-center gap-4"
                                >
                                    PROCEED TO PAYMENT <ArrowRight size={18} />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <button onClick={() => setStep(1)} className="text-[9px] font-black text-gray-600 hover:text-white uppercase tracking-widest flex items-center gap-2">← VIEW MEMBERSHIP DETAILS</button>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-end border-b-2 border-white/5 pb-4">
                                        <div>
                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter">PAYMENT PORTAL</h3>
                                            <p className="text-[10px] tracking-[0.3em] font-black text-gray-600 uppercase">SELECT YOUR CHANNEL</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">TOTAL DUE:</span>
                                            <p className="text-4xl font-black italic text-white">${finalPrice}.00<span className="text-xs text-gray-500 ml-1">USDT</span></p>
                                        </div>
                                    </div>

                                    {/* CRIPTO SECTION */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Wallet size={16} className="text-red-600" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CRIPTOMONEDAS (USDT / BINANCE)</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {methodsByCat('CRIPTO').map((pm) => (
                                                <div key={pm.id} className="bg-white/5 border border-white/10 p-4 group hover:border-red-600/40 transition-all flex justify-between items-center">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-black flex items-center justify-center border border-white/5">
                                                            {pm.icon === 'binance' ? <img src="/img/metodos/logos/Binance-Vertical-Logo.wine.svg" className="w-8 h-8 object-contain" /> :
                                                                pm.icon === 'usdt' ? <img src="/img/metodos/logos/Tether_Logo.svg.png" className="w-8 h-8 object-contain" /> :
                                                                    pm.icon === 'bitcoin' ? <img src="/img/metodos/logos/Bitcoin-Logo.png" className="w-8 h-8 object-contain" /> :
                                                                        <CreditCard size={18} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-white uppercase">{pm.name}</p>
                                                            <p className="text-[11px] font-mono font-bold text-red-600 break-all border-l border-red-600/30 pl-3 mt-1">{pm.value}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleCopy(pm.value, pm.id)} className={`p-3 transition-all ${copied === pm.id ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-600 hover:text-white'}`}>
                                                        {copied === pm.id ? <Check size={16} /> : <Copy size={16} />}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* BANK SECTION */}
                                    {methodsByCat('BANCO').length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Landmark size={16} className="text-red-600" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TRANSFERENCIA BANCARIA</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                                {methodsByCat('BANCO').map((pm) => (
                                                    <div key={pm.id} className="bg-white/5 border border-white/10 p-4 group hover:border-red-600/40 transition-all flex justify-between items-center">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-black flex items-center justify-center border border-white/5">
                                                                {pm.icon === 'bancolombia' ? <img src="/img/metodos/logos/Logo_Bancolombia.svg.png" className="w-full h-full object-contain p-2" /> : <Landmark size={18} />}
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-white uppercase">{pm.name}</p>
                                                                <p className="text-[11px] font-mono font-bold text-red-600 pl-3 mt-1 border-l border-red-600/30">{pm.value}</p>
                                                                {pm.owner && <p className="text-[8px] font-black text-gray-500 uppercase mt-0.5 pl-3">{pm.owner}</p>}
                                                            </div>
                                                        </div>
                                                        <button onClick={() => handleCopy(pm.value, pm.id)} className={`p-3 transition-all ${copied === pm.id ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-600 hover:text-white'}`}>
                                                            {copied === pm.id ? <Check size={16} /> : <Copy size={16} />}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* APP SECTION */}
                                    {methodsByCat('APP').length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Smartphone size={16} className="text-red-600" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">APLICACIONES DIGITALES</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                                {methodsByCat('APP').map((pm) => (
                                                    <div key={pm.id} className="bg-white/5 border border-white/10 p-4 group hover:border-red-600/40 transition-all flex justify-between items-center">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-black flex items-center justify-center border border-white/5">
                                                                {pm.icon === 'nequi' ? <img src="/img/metodos/logos/nequi-37254.png" className="w-8 h-8 object-contain" /> : <Smartphone size={18} />}
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-white uppercase">{pm.name}</p>
                                                                <p className="text-[11px] font-mono font-bold text-red-600 pl-3 mt-1 border-l border-red-600/30">{pm.value}</p>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => handleCopy(pm.value, pm.id)} className={`p-3 transition-all ${copied === pm.id ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-600 hover:text-white'}`}>
                                                            {copied === pm.id ? <Check size={16} /> : <Copy size={16} />}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-8 border-t border-white/5 space-y-4">
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center leading-relaxed">
                                            Once payment is injected, send the transmission report to our commander center for manual activation.
                                        </p>
                                        <button
                                            onClick={confirmPayment}
                                            disabled={loading}
                                            className="w-full py-5 bg-[#25D366] text-white font-black italic uppercase tracking-[0.2em] text-xs hover:brightness-110 transition-all flex items-center justify-center gap-4 shadow-xl"
                                        >
                                            {loading ? 'INITIALIZING...' : 'REPORT PAYMENT STATUS'} <Phone size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentPortal;
