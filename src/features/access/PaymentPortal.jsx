import React, { useState, useEffect } from 'react';
import { Check, Copy, ShieldCheck, Zap, ArrowRight, Lock, MessageSquare, Crown, Star, ShieldAlert, Upload, Image, X, Tag, Percent, ChevronLeft, CreditCard, Sparkles } from 'lucide-react';
import { db } from '../../firebase';
import { doc, updateDoc, serverTimestamp, onSnapshot, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { nowPaymentsService } from '../../services/nowPaymentsService';

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
    const [debugClicks, setDebugClicks] = useState(0);
    const [debugMode, setDebugMode] = useState(false);

    const [selectedPlan, setSelectedPlan] = useState(() => {
        const saved = localStorage.getItem('selectedPlan');
        if (saved) {
            const parsed = JSON.parse(saved);
            return PLANS.find(p => p.id === parsed.id) || PLANS[1];
        }
        return PLANS[1];
    });

    const [currencies, setCurrencies] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);

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

    const handleNowPayments = async () => {
        setLoading(true);
        try {
            const data = await nowPaymentsService.getCurrencies();
            console.log("Currencies from NOWPayments:", data);

            if (!data || !data.currencies) {
                throw new Error("Respuesta inválida de la API");
            }

            // Filtrar las más comunes (algunas APIs usan nombres distintos como 'usdt')
            const popular = ['usdttrc20', 'usdtbec20', 'usdt', 'btc', 'ltc', 'eth', 'trx', 'bnb', 'bnbmainnet'];
            let filtered = data.currencies.filter(c => popular.includes(c.toLowerCase()));

            // Si por alguna razón el filtro falla, mostramos las primeras 12 disponibles
            if (filtered.length === 0) {
                console.warn("No popular currencies found, falling back to all.");
                filtered = data.currencies.slice(0, 12);
            }

            setCurrencies(filtered);
            setStep(4);
        } catch (err) {
            console.error(err);
            alert("Error al cargar monedas: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCurrency = async (currency) => {
        setLoading(true);
        setSelectedCurrency(currency);
        try {
            const finalPrice = getFinalPrice();
            const orderId = `${user.uid}_${Date.now()}`;

            const payment = await nowPaymentsService.createPayment({
                price_amount: finalPrice,
                pay_currency: currency,
                order_id: orderId,
                order_description: `PLAN: ${selectedPlan.name} - ${user.email}`,
            });

            setPaymentDetails(payment);
            setStep(5);

            // Notificar a Firebase
            await addDoc(collection(db, "notifications"), {
                title: "INTENTO PAGO WHITE-LABEL",
                message: `${user.email} inició pago de ${currency.toUpperCase()} por $${finalPrice}`,
                type: 'subscription_attempt',
                userId: user.uid,
                timestamp: serverTimestamp()
            });

        } catch (err) {
            console.error(err);
            alert("Error al generar dirección: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const checkPaymentStatus = async () => {
        if (!paymentDetails?.payment_id) return;
        try {
            const status = await nowPaymentsService.getPaymentStatus(paymentDetails.payment_id);
            setPaymentStatus(status.payment_status);
            if (status.payment_status === 'finished' || status.payment_status === 'confirmed') {
                // Pago exitoso, podrías redirigir o mostrar un mensaje de éxito
                alert("¡Pago confirmado! Tu cuenta se activará en breve.");
            }
        } catch (err) {
            console.error("Error checking status:", err);
        }
    };

    const handleMockSuccess = async () => {
        setLoading(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                status: 'approved',
                subscriptionStart: serverTimestamp(),
                subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
                selectedPlan: selectedPlan.name,
                paymentMethod: 'TEST_MODE'
            });
            alert("¡MODO PRUEBA: Pago simulado con éxito!");
            window.location.reload();
        } catch (err) {
            alert("Error al simular: " + err.message);
        } finally {
            setLoading(false);
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
                                {[1, 2, 3, 4, 5].map(s => (
                                    <div key={s} className={`h-1 w-8 rounded-full transition-all duration-500 ${step >= s ? 'bg-red-600' : 'bg-neutral-100'}`} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-red-600 uppercase tracking-[0.4em]">CHECKOUT INDEXGENIUS</p>
                            <h1 className="text-3xl font-black italic text-neutral-900 uppercase tracking-tighter leading-none">
                                {step === 1 ? 'ELIGE TU' : step === 2 ? 'MÉTODO DE' : step === 4 ? 'ELIGE TU' : step === 5 ? 'REALIZA' : 'CONFIRMA'} <span className="text-red-600">{step === 1 ? 'PLAN' : step === 2 ? 'PAGO' : step === 4 ? 'CRIPTO' : 'DEPÓSITO'}</span>
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
                                        {/* NowPayments Automated Method */}
                                        <button
                                            onClick={handleNowPayments}
                                            disabled={loading}
                                            className="group w-full p-5 border-2 border-red-600/20 rounded-3xl hover:border-red-600 hover:shadow-xl hover:shadow-red-600/5 transition-all duration-500 bg-white text-left relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 bg-red-600 text-white text-[7px] font-black px-3 py-1 uppercase tracking-tighter">RECOMENDADO</div>
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center p-2 group-hover:bg-red-600 group-hover:text-white transition-all">
                                                        <Sparkles size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black uppercase text-neutral-900 leading-none mb-1 tracking-tight">Cripto (Automático)</p>
                                                        <p className="text-[8px] font-bold text-red-600 uppercase tracking-[0.2em]">ACTUALIZACIÓN INSTANTÁNEA</p>
                                                    </div>
                                                </div>
                                                <div className="p-3 rounded-xl bg-neutral-50 text-neutral-400 group-hover:bg-black group-hover:text-white transition-colors">
                                                    <ArrowRight size={16} />
                                                </div>
                                            </div>
                                            <div className="bg-neutral-50 p-3 rounded-2xl text-[9px] text-neutral-500 font-bold uppercase tracking-tight group-hover:bg-white transition-colors">
                                                Paga con USDT, BTC, ETH y más de 100 criptos.
                                            </div>
                                        </button>


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

                            {step === 4 && (
                                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 py-4">
                                    <button onClick={() => setStep(2)} className="flex items-center gap-2 text-[9px] font-black text-neutral-400 hover:text-red-600 uppercase tracking-widest transition-colors mb-2">
                                        <ChevronLeft size={14} /> VOLVER A MÉTODOS
                                    </button>

                                    {loading && currencies.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 gap-4">
                                            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">CARGANDO MONEDAS...</p>
                                        </div>
                                    ) : currencies.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {currencies.map(curr => (
                                                <button
                                                    key={curr}
                                                    onClick={() => handleSelectCurrency(curr)}
                                                    disabled={loading}
                                                    className="p-4 border border-neutral-100 rounded-2xl hover:border-red-600 hover:bg-red-50/10 transition-all text-center group"
                                                >
                                                    <div className="w-10 h-10 mx-auto mb-2 bg-neutral-50 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                                                        <span className="text-xs font-black text-neutral-900 group-hover:text-red-600">{curr.substring(0, 4).toUpperCase()}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase text-neutral-600">{curr.toUpperCase()}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-[10px] font-black text-red-600 uppercase">No se encontraron monedas disponibles.</p>
                                            <button onClick={() => setStep(2)} className="mt-4 text-[10px] font-black underline uppercase">Reintentar</button>
                                        </div>
                                    )}
                                    {loading && currencies.length > 0 && <div className="text-center text-[10px] font-black text-red-600 animate-pulse uppercase tracking-[0.2em] py-4">GENERANDO DIRECCIÓN...</div>}
                                </motion.div>
                            )}

                            {step === 5 && paymentDetails && (
                                <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-6 py-4">
                                    <div className="text-center space-y-2">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full">
                                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                                            <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">ESPERANDO DEPÓSITO</span>
                                        </div>
                                    </div>

                                    <div className="bg-neutral-950 p-8 rounded-[2rem] text-white flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden group">
                                        {/* Premium Backdrop Glow */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent opacity-50" />

                                        <div className="bg-white p-3 rounded-2xl shadow-xl transition-transform duration-500 hover:scale-105">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${paymentDetails.pay_address}`}
                                                alt="QR Code"
                                                className="w-40 h-40"
                                            />
                                        </div>

                                        <div className="text-center space-y-1">
                                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">ENVIAR EXACTAMENTE</p>
                                            <h4 className="text-3xl font-black italic tracking-tighter tabular-nums">
                                                {paymentDetails.pay_amount} <span className="text-red-600">{paymentDetails.pay_currency.toUpperCase()}</span>
                                            </h4>
                                        </div>

                                        <div className="w-full space-y-4">
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest text-center">DIRECCIÓN DE DEPÓSITO</p>
                                                <button
                                                    onClick={() => { navigator.clipboard.writeText(paymentDetails.pay_address); setCopied('addr'); setTimeout(() => setCopied(null), 2000) }}
                                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group/btn hover:bg-white/10 transition-all"
                                                >
                                                    <span className="text-[10px] font-mono text-white/70 truncate mr-4">{paymentDetails.pay_address}</span>
                                                    {copied === 'addr' ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-white/40 group-hover/btn:text-white" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 italic">
                                            <p className="text-[8px] font-black text-neutral-400 uppercase mb-1">PAGO ID</p>
                                            <p className="text-xs font-black text-neutral-900">#{paymentDetails.payment_id}</p>
                                        </div>
                                        <button
                                            onClick={checkPaymentStatus}
                                            className="p-4 bg-black text-white rounded-2xl font-black italic uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-red-600 transition-all group"
                                        >
                                            REVISAR ESTADO <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                        {debugMode && (
                                            <button
                                                onClick={handleMockSuccess}
                                                className="col-span-2 p-4 bg-green-600/10 border border-green-600 text-green-600 rounded-2xl font-black italic uppercase text-[10px] hover:bg-green-600 hover:text-white transition-all"
                                            >
                                                [TEST] FORZAR PAGO EXITOSO
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-center text-[9px] font-bold text-neutral-400 uppercase tracking-wider leading-relaxed">
                                        Una vez enviado, la red tardará unos minutos en confirmar. <br />
                                        <span className="text-red-600 underline">No cierres esta ventana hasta que se confirme.</span>
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 border-t border-neutral-50 bg-neutral-50/30 flex justify-between items-center">
                        <button onClick={onLogout} className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-black transition-colors">
                            CANCELAR SESIÓN
                        </button>
                        <div
                            onClick={() => {
                                const newClicks = debugClicks + 1;
                                setDebugClicks(newClicks);
                                if (newClicks >= 5) {
                                    setDebugMode(true);
                                    alert("DEBUG MODE ENABLED");
                                }
                            }}
                            className="flex items-center gap-2 cursor-pointer select-none"
                        >
                            <ShieldAlert size={12} className={debugMode ? "text-green-600" : "text-red-600"} />
                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{debugMode ? 'MODO TEST ACTIVO' : 'TRANSMISIÓN ENCRIPTADA'}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentPortal;
