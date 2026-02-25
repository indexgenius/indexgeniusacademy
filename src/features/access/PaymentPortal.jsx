import React, { useState, useEffect } from 'react';
import { Check, Copy, ShieldCheck, Zap, ArrowRight, Lock, MessageSquare, Crown, Star, ShieldAlert, Upload, Image, X, Tag, Percent, ChevronLeft, CreditCard, Sparkles } from 'lucide-react';
import { db } from '../../firebase';
import { doc, updateDoc, serverTimestamp, onSnapshot, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

const PLANS = [
    {
        id: 'index-one',
        name: 'INDEX ONE',
        price: 97,
        period: '/ mensual',
        description: 'Acceso mensual al ecosistema IndexGenius',
        features: ['IndexGenius App', 'Señales en tiempo real', 'Curso Básico', 'Soporte comunidad'],
        icon: <Zap size={20} />,
        accent: 'bg-red-50 text-red-600',
        bg: 'from-white to-red-50/20'
    },
    {
        id: 'index-pro',
        name: 'INDEX PRO',
        price: 297,
        period: '/ mensual',
        description: 'Infraestructura profesional completa',
        features: ['Todo de INDEX ONE', 'Curso Completo', 'Plantilla IndexPro', 'Grupo Privado', 'Masterclass'],
        icon: <Crown size={24} />,
        accent: 'bg-red-600 text-white',
        popular: true,
        bg: 'from-red-600 to-red-800'
    },
    {
        id: 'index-black',
        name: 'INDEX BLACK',
        price: 1000,
        period: 'pago único',
        description: 'Programa privado de alto rendimiento',
        features: ['Todo de INDEX PRO', 'Mentoría 1-on-1', 'Plan de escalamiento', 'Grupo BLACK'],
        icon: <Star size={20} />,
        accent: 'bg-black text-white',
        bg: 'from-black to-[#050505]'
    }
];

const CLOUDINARY_CLOUD_NAME = "ddfx8syri";
const CLOUDINARY_UPLOAD_PRESET = "facturas";

const PaymentPortal = ({ user, onLogout, isExpired }) => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [copied, setCopied] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [receiptUrl, setReceiptUrl] = useState('');
    const [step, setStep] = useState(1);
    const [discountCode, setDiscountCode] = useState('');
    const [discountApplied, setDiscountApplied] = useState(null);
    const [discountLoading, setDiscountLoading] = useState(false);
    const [discountError, setDiscountError] = useState('');

    const [selectedPlan, setSelectedPlan] = useState(() => {
        const saved = localStorage.getItem('selectedPlan');
        if (saved) {
            const parsed = JSON.parse(saved);
            return PLANS.find(p => p.id === parsed.id) || PLANS[1];
        }
        return PLANS[1];
    });

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "payment_methods"), (snapshot) => {
            setPaymentMethods(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, []);

    const getFinalPrice = () => {
        if (!selectedPlan) return 0;
        let price = selectedPlan.price;
        if (discountApplied) {
            if (discountApplied.type === 'percentage') {
                price = price - (price * discountApplied.value / 100);
            } else if (discountApplied.type === 'fixed') {
                price = Math.max(0, price - discountApplied.value);
            }
        }
        return Math.round(price);
    };

    const applyDiscountCode = async () => {
        if (!discountCode.trim()) return;
        setDiscountLoading(true);
        setDiscountError('');
        try {
            const q = query(
                collection(db, "discount_codes"),
                where("code", "==", discountCode.trim().toUpperCase()),
                where("active", "==", true)
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                setDiscountError('Inválido');
                setDiscountApplied(null);
                return;
            }
            const codeDoc = snapshot.docs[0];
            const codeData = codeDoc.data();
            setDiscountApplied({ type: codeData.type, value: codeData.value, code: codeData.code, docId: codeDoc.id });
        } catch (err) {
            setDiscountError('Error');
        } finally {
            setDiscountLoading(false);
        }
    };

    const handleReceiptUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.secure_url) setReceiptUrl(data.secure_url);
        } catch (err) {
            alert("Error al subir.");
        } finally {
            setUploading(false);
        }
    };

    const confirmPayment = async () => {
        if (!receiptUrl) return;
        setLoading(true);
        const userEmail = user?.email || "USER";
        const finalPrice = getFinalPrice();
        const message = `PAGO REPORTE: ${userEmail}\nPLAN: ${selectedPlan.name}\nTOTAL: $${finalPrice}\nCOMPROBANTE: ${receiptUrl}`;
        const waUrl = `https://wa.me/18292198071?text=${encodeURIComponent(message)}`;

        try {
            window.open(waUrl, '_blank');
            await addDoc(collection(db, "notifications"), {
                title: isExpired ? "RENOVACIÓN" : "NUEVO PAGO",
                message: `${userEmail} reportó pago de $${finalPrice}`,
                type: 'subscription_payment',
                userId: user.uid,
                receiptUrl,
                timestamp: serverTimestamp()
            });
            await updateDoc(doc(db, "users", user.uid), {
                status: 'pending',
                paymentReported: true,
                paymentReportedAt: serverTimestamp(),
                selectedPlan: selectedPlan.name,
                receiptUrl
            });
        } catch (e) {
            alert("Error al reportar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl font-space">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white w-full max-w-xl rounded-none md:rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden relative flex flex-col md:flex-row h-full md:h-auto max-h-none md:max-h-[850px] border-none md:border border-white/20"
            >
                {/* Lateral Branding (Desktop Only) */}
                <div className="hidden md:flex w-40 bg-black items-center justify-center flex-col gap-8 p-4 border-r border-white/5">
                    <img src="/img/logos/IMG_5208.PNG" className="w-12 h-12 object-contain" alt="Logo" />
                    <div className="[writing-mode:vertical-lr] rotate-180 flex items-center gap-4">
                        <span className="text-[10px] font-black tracking-[0.5em] text-white/20 uppercase">SECURE PAYMENT PORTAL</span>
                        <div className="h-12 w-[1px] bg-red-600"></div>
                        <span className="text-[10px] font-black tracking-[0.5em] text-red-600 uppercase">INDEXGENIUS</span>
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="p-8 pb-4">
                        <div className="flex justify-between items-center mb-6">
                            <div className="md:hidden">
                                <img src="/img/logos/IMG_5208.PNG" className="w-10 h-10 object-contain" alt="Logo" />
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3].map(s => (
                                    <div key={s} className={`h-1 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-red-600' : 'bg-neutral-100'}`} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-red-600 uppercase tracking-[0.4em]">CHECKOUT INDEXGENIUS</p>
                            <h1 className="text-3xl font-black italic text-neutral-900 uppercase tracking-tighter leading-none">
                                {step === 1 ? 'ELIGE TU' : step === 2 ? 'MÉTODO DE' : 'CONFIRMA'} <span className="text-red-600">{step === 1 ? 'PLAN' : step === 2 ? 'PAGO' : 'DEPÓSITO'}</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 px-8 overflow-y-auto overflow-x-hidden custom-scrollbar pb-8">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 py-4">
                                    {PLANS.map(plan => (
                                        <button
                                            key={plan.id}
                                            onClick={() => setSelectedPlan(plan)}
                                            className={`w-full group rounded-none md:rounded-3xl transition-all duration-500 relative overflow-hidden text-left ${selectedPlan.id === plan.id ? 'scale-100' : 'scale-[0.98] hover:scale-[0.99]'}`}
                                        >
                                            {/* Card Background */}
                                            <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${plan.bg} ${selectedPlan.id === plan.id ? 'opacity-100' : 'opacity-[0.03] group-hover:opacity-10'}`} />

                                            {/* Border Layer */}
                                            <div className={`absolute inset-0 border-2 rounded-none md:rounded-3xl transition-colors duration-500 ${selectedPlan.id === plan.id ? 'border-red-600' : 'border-neutral-100 group-hover:border-neutral-200'}`} />

                                            <div className="relative p-6 flex items-center justify-between">
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${selectedPlan.id === plan.id ? (plan.id === 'index-one' ? 'bg-black/5 text-red-600' : 'bg-white/20 text-white') : 'bg-neutral-50'}`}>
                                                        <div className={`p-3 rounded-xl ${selectedPlan.id === plan.id && plan.id !== 'index-one' ? 'bg-white/20' : plan.accent}`}>
                                                            {plan.icon}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 className={`text-base font-black uppercase italic tracking-tighter leading-none mb-1 transition-colors ${selectedPlan.id === plan.id ? (plan.id === 'index-one' ? 'text-neutral-900' : 'text-white') : 'text-neutral-900'}`}>
                                                            {plan.name}
                                                        </h3>
                                                        <p className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${selectedPlan.id === plan.id ? (plan.id === 'index-one' ? 'text-neutral-500' : 'text-white/60') : 'text-neutral-400'}`}>
                                                            {plan.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className={`flex items-baseline justify-end gap-1 ${selectedPlan.id === plan.id ? (plan.id === 'index-one' ? 'text-neutral-900' : 'text-white') : 'text-neutral-900'}`}>
                                                        <span className="text-[10px] font-black uppercase opacity-50">$</span>
                                                        <span className="text-2xl font-black italic tabular-nums">{plan.price}</span>
                                                    </div>
                                                    <p className={`text-[7px] font-black uppercase tracking-widest transition-colors ${selectedPlan.id === plan.id ? (plan.id === 'index-one' ? 'text-neutral-400' : 'text-white/40') : 'text-neutral-400'}`}>
                                                        {plan.period}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Active Glow */}
                                            {selectedPlan.id === plan.id && (
                                                <motion.div layoutId="glow" className={`absolute -inset-1 blur-xl -z-10 ${plan.id === 'index-one' ? 'bg-red-500/10' : 'bg-red-600/20'}`} />
                                            )}
                                        </button>
                                    ))}

                                    <div className="pt-4 space-y-4">
                                        <div className="relative group p-[1px] rounded-none md:rounded-2xl bg-neutral-200 focus-within:bg-red-600 transition-all">
                                            <input
                                                type="text"
                                                placeholder="CÓDIGO DE DESCUENTO"
                                                value={discountCode}
                                                onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                                                className="w-full bg-white border-0 rounded-none md:rounded-2xl px-6 py-4 text-xs font-black uppercase outline-none transition-all placeholder:text-neutral-400 text-neutral-900"
                                            />
                                            <button
                                                onClick={applyDiscountCode}
                                                className="absolute right-2 top-2 bottom-2 px-6 bg-black text-white text-[9px] font-black uppercase rounded-xl hover:bg-neutral-800 transition-colors"
                                            >
                                                {discountLoading ? '...' : 'APLICAR'}
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => setStep(2)}
                                            className="w-full py-6 bg-red-600 text-white font-black italic rounded-none md:rounded-[1.5rem] shadow-[0_20px_40px_rgba(220,38,38,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                                        >
                                            SIGUIENTE PASO <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 py-4">
                                    <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[9px] font-black text-neutral-400 hover:text-red-600 uppercase tracking-widest transition-colors mb-2">
                                        <ChevronLeft size={14} /> VOLVER A PLANES
                                    </button>

                                    <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {paymentMethods.map(pm => (
                                            <div key={pm.id} className="group p-5 border border-neutral-100 rounded-3xl hover:border-red-600/30 hover:shadow-xl hover:shadow-neutral-100 transition-all duration-500 bg-white">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center p-2.5 group-hover:bg-red-50 transition-colors">
                                                            {pm.icon === 'usdt' && <img src="/img/metodos/logos/Tether_Logo.svg.png" className="w-full h-full object-contain" />}
                                                            {pm.icon === 'binance' && <img src="/img/metodos/logos/Binance_logo.svg.png" className="w-full h-full object-contain" />}
                                                            {pm.icon !== 'usdt' && pm.icon !== 'binance' && <Zap className="text-red-600" size={20} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-black uppercase text-neutral-900 leading-none mb-1 tracking-tight">{pm.name}</p>
                                                            <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-[0.2em]">{pm.category}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => { navigator.clipboard.writeText(pm.value); setCopied(pm.id); setTimeout(() => setCopied(null), 2000) }}
                                                        className={`p-3 rounded-xl transition-all ${copied === pm.id ? 'bg-green-500 text-white' : 'bg-neutral-50 text-neutral-400 hover:bg-black hover:text-white'}`}
                                                    >
                                                        {copied === pm.id ? <Check size={16} /> : <Copy size={16} />}
                                                    </button>
                                                </div>
                                                <div className="bg-neutral-50 p-4 rounded-2xl font-mono text-[10px] text-red-600 break-all border border-neutral-100 group-hover:bg-white transition-colors">
                                                    {pm.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setStep(3)}
                                        className="w-full py-6 bg-black text-white font-black italic rounded-none md:rounded-[1.5rem] hover:bg-red-600 transition-all flex items-center justify-center gap-4 group"
                                    >
                                        VERIFICAR DEPÓSITO <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 py-4">
                                    <button onClick={() => setStep(2)} className="flex items-center gap-2 text-[9px] font-black text-neutral-400 hover:text-red-600 uppercase tracking-widest transition-colors mb-2">
                                        <ChevronLeft size={14} /> VOLVER A PAGO
                                    </button>

                                    <div className="space-y-6">
                                        <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-neutral-400 uppercase mb-1">TOTAL A PAGAR</p>
                                                <h4 className="text-3xl font-black italic text-neutral-900 tracking-tighter">${getFinalPrice()} USD</h4>
                                            </div>
                                            <div className="h-12 w-[1px] bg-neutral-200" />
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-neutral-400 uppercase mb-1">PLAN</p>
                                                <h4 className="text-sm font-black italic text-red-600 uppercase tracking-tight">{selectedPlan.name}</h4>
                                            </div>
                                        </div>

                                        {receiptUrl ? (
                                            <div className="relative rounded-3xl overflow-hidden border-2 border-green-500 group shadow-2xl shadow-green-500/10">
                                                <img src={receiptUrl} className="w-full h-56 object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button onClick={() => setReceiptUrl('')} className="bg-red-600 text-white p-4 rounded-full hover:scale-110 transition-transform">
                                                        <X size={24} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-neutral-200 rounded-[2.5rem] hover:border-red-600 hover:bg-red-50/10 cursor-pointer transition-all duration-500 group">
                                                <input type="file" className="hidden" onChange={handleReceiptUpload} accept="image/*" />
                                                <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white group-hover:scale-110 transition-all">
                                                    {uploading ? <div className="animate-spin text-red-600"><Zap size={32} /></div> : <Upload size={32} className="text-neutral-300 group-hover:text-red-600" />}
                                                </div>
                                                <span className="text-[11px] font-black uppercase text-neutral-600 mb-1">TOCA PARA SUBIR COMPROBANTE</span>
                                                <span className="text-[9px] font-bold text-neutral-300 uppercase">JPG, PNG O CAPTURA DE PANTALLA</span>
                                            </label>
                                        )}

                                        <button
                                            disabled={!receiptUrl || loading}
                                            onClick={confirmPayment}
                                            className="w-full py-6 bg-red-600 text-white font-black italic rounded-none md:rounded-[1.5rem] shadow-[0_20px_40px_rgba(220,38,38,0.2)] disabled:opacity-50 transition-all flex items-center justify-center gap-4 active:scale-95"
                                        >
                                            {loading ? 'PROCESANDO...' : 'CONFIRMAR Y ACTIVAR'} <MessageSquare size={20} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 border-t border-neutral-50 bg-neutral-50/30 flex justify-between items-center">
                        <button onClick={onLogout} className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-black transition-colors">
                            CANCELAR SESIÓN
                        </button>
                        <div className="flex items-center gap-2">
                            <ShieldAlert size={12} className="text-red-600" />
                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">TRANSMISIÓN ENCRIPTADA</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentPortal;
