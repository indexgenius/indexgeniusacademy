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
        price: 60,
        period: '/ mensual',
        description: 'Acceso mensual al ecosistema IndexGenius',
        features: ['IndexGenius App', 'Señales en tiempo real', 'Curso Básico', 'Soporte comunidad'],
        icon: <Zap size={20} />,
        accent: 'bg-red-500 text-white',
        bg: 'from-red-600/20 to-transparent'
    },
    {
        id: 'index-pro',
        name: 'INDEX PRO',
        price: 150,
        period: '/ mensual',
        description: 'Infraestructura profesional completa',
        features: ['Todo de INDEX ONE', 'Curso Completo', 'Plantilla IndexPro', 'Grupo Privado', 'Masterclass'],
        icon: <Crown size={24} />,
        accent: 'bg-red-600 text-white',
        popular: true,
        bg: 'from-red-600 to-red-900'
    },
    {
        id: 'index-black',
        name: 'INDEX BLACK',
        price: 500,
        period: 'pago único',
        description: 'Programa privado de alto rendimiento',
        features: ['Todo de INDEX PRO', 'Mentoría 1-on-1', 'Plan de escalamiento', 'Grupo BLACK'],
        icon: <Star size={20} />,
        accent: 'bg-neutral-800 text-white',
        bg: 'from-neutral-900 to-black'
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

            // Filtrar y priorizar USDT, BTC y BNB (Monedas solicitadas)
            const popular = ['usdtbsc', 'btc', 'bnbbsc', 'usdttrc20', 'eth', 'ltc', 'trc20', 'trx'];
            let filtered = data.currencies.filter(c => popular.includes(c.toLowerCase()));

            // Orden específico solicitado: USDT (BSC), BTC, BNB (BSC)
            const order = ['usdtbsc', 'btc', 'bnbbsc'];
            filtered.sort((a, b) => {
                const indexA = order.indexOf(a.toLowerCase());
                const indexB = order.indexOf(b.toLowerCase());

                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return 0;
            });

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
        <div className="fixed inset-0 z-[100] flex flex-col md:items-center md:justify-center bg-black/95 backdrop-blur-2xl font-space overflow-y-auto md:p-4">
            {/* Background Decorative Element */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-600/20 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(220, 38, 38, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-neutral-950/40 w-full max-w-4xl min-h-[100dvh] md:min-h-0 md:h-[min(90vh,800px)] border-0 md:border border-white/10 backdrop-blur-xl overflow-hidden relative flex flex-col md:flex-row shadow-[0_0_100px_rgba(220,38,38,0.1)]"
            >
                {/* Branding Sidebar (Minimalist) */}
                <div className="hidden md:flex w-24 bg-black/40 items-center justify-between flex-col py-10 border-r border-white/5">
                    <img src="/img/logos/IMG_5208.PNG" className="w-10 h-10 object-contain brightness-110" alt="Logo" />
                    <div className="[writing-mode:vertical-lr] rotate-180 flex items-center gap-6">
                        <span className="text-[9px] font-black tracking-[0.6em] text-white/10 uppercase">CRYPTO SECURE NETWORK</span>
                        <div className="h-16 w-[1px] bg-red-600/50"></div>
                        <span className="text-[9px] font-black tracking-[0.6em] text-red-600 uppercase">INDEXGENIUS®</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <Lock size={12} className="text-white/20" />
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 bg-transparent">
                    {/* Header: Clean & Tactical */}
                    <div className="p-8 md:p-10 pb-6">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-4">
                                <div className="h-0.5 w-12 bg-red-600" />
                                <span className="text-[10px] font-black tracking-[0.4em] text-white/30 uppercase italic">OPERACIÓN: {step === 1 ? 'CONFIGURACIÓN DE PLAN' : 'PROTOCOLO DE PAGO'}</span>
                            </div>
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <div key={s} className={`h-1 w-6 transition-all duration-700 ${step >= s ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-white/5'}`} />
                                ))}
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tight leading-none">
                            {step === 1 ? 'ELIGE TU' : step === 2 ? 'CANAL DE' : step === 4 ? 'MONEDA' : step === 5 ? 'ORDEN DE' : 'REPORTE'} <span className="text-red-600">{step === 1 ? 'ESTRATEGIA' : step === 2 ? 'DEPÓSITO' : step === 4 ? 'CRIPTO' : 'PAGO'}</span>
                        </h1>
                    </div>

                    {/* Step Content: Minimalist & High Contrast */}
                    <div className="flex-1 px-8 md:px-10 overflow-y-auto custom-scrollbar-hidden pb-10">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-6">SELECCIONA EL NIVEL DE ACCESO PARA TU CUENTA:</p>
                                    <div className="grid grid-cols-1 gap-4">
                                        {PLANS.map(plan => (
                                            <button
                                                key={plan.id}
                                                onClick={() => setSelectedPlan(plan)}
                                                className={`relative w-full group transition-all duration-500 rounded-2xl border-2 overflow-hidden ${selectedPlan.id === plan.id ? 'border-red-600 bg-white/[0.03] scale-[1.02] shadow-[0_20px_50px_rgba(0,0,0,0.4)]' : 'border-white/5 bg-transparent hover:border-white/10'}`}
                                            >
                                                <div className="p-6 md:p-8 flex items-center justify-between relative z-10">
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:-rotate-6 ${selectedPlan.id === plan.id ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'}`}>
                                                            {plan.icon}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-black italic uppercase text-white tracking-tighter leading-none mb-2">{plan.name}</h3>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-1 h-1 rounded-full ${selectedPlan.id === plan.id ? 'bg-red-600 animate-pulse' : 'bg-white/20'}`} />
                                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{plan.description}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="flex items-baseline justify-end gap-1">
                                                            <span className="text-[10px] font-black text-red-600 uppercase mb-1">$</span>
                                                            <span className="text-3xl font-black italic text-white tabular-nums tracking-tighter">{plan.price}</span>
                                                        </div>
                                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{plan.period}</p>
                                                    </div>
                                                </div>
                                                {selectedPlan.id === plan.id && (
                                                    <div className="absolute top-0 right-0 p-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="pt-8 space-y-4">
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="flex-1 relative group bg-white/5 rounded-2xl border border-white/5 focus-within:border-red-600 transition-all">
                                                <input
                                                    type="text"
                                                    placeholder="CÓDIGO DE DESCUENTO"
                                                    value={discountCode}
                                                    onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                                                    className="w-full bg-transparent border-0 px-6 py-5 text-xs font-black uppercase outline-none text-white placeholder:text-white/20"
                                                />
                                                <button
                                                    onClick={applyDiscountCode}
                                                    className="absolute right-3 top-2.5 bottom-2.5 px-6 bg-white text-black text-[10px] font-black uppercase rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-xl"
                                                >
                                                    {discountLoading ? '...' : 'APLICAR'}
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => setStep(2)}
                                                className="w-full md:w-auto px-10 py-5 bg-red-600 text-white font-black italic rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group shadow-[0_15px_40px_rgba(220,38,38,0.25)]"
                                            >
                                                SIGUIENTE PASO <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-[0.2em] transition-colors mb-6">
                                        <ChevronLeft size={14} /> VOLVER A PLANES
                                    </button>

                                    <div className="grid gap-4">
                                        {/* NowPayments: Minimalist Elite */}
                                        <button
                                            onClick={handleNowPayments}
                                            disabled={loading}
                                            className="group relative w-full p-8 bg-white/[0.03] border border-red-600/30 rounded-[2rem] hover:border-red-600 hover:bg-white/[0.06] transition-all duration-500 text-left overflow-hidden shadow-2xl shadow-red-600/5 focus:outline-none"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity">
                                                <Sparkles size={80} className="text-white" />
                                            </div>
                                            <div className="flex justify-between items-center relative z-10">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.3)] transform group-hover:scale-110 transition-transform">
                                                        <Sparkles size={32} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black italic uppercase text-white tracking-tighter mb-1">Cripto Instantáneo</h4>
                                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">PROCESAMIENTO AUTOMÁTICO</p>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-xl bg-white/5 text-white/20 group-hover:bg-red-600 group-hover:text-white transition-all">
                                                    <ArrowRight size={20} />
                                                </div>
                                            </div>
                                        </button>

                                        <div className="relative py-4">
                                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                                            <div className="relative flex justify-center"><span className="bg-neutral-950 px-4 text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">MÉTODOS MANUALES</span></div>
                                        </div>

                                        <div className="grid gap-3">
                                            {paymentMethods.map(pm => (
                                                <div key={pm.id} className="group p-5 bg-black/40 border border-white/5 rounded-2xl hover:border-white/10 transition-all duration-500 flex items-center justify-between">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center p-3 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all border border-white/5">
                                                            {pm.icon === 'usdt' && <img src="/img/metodos/logos/Tether_Logo.svg.png" className="w-full h-full object-contain filter invert" />}
                                                            {pm.icon === 'binance' && <img src="/img/metodos/logos/Binance_logo.svg.png" className="w-full h-full object-contain filter invert" />}
                                                            {!['usdt', 'binance'].includes(pm.icon) && <Zap className="text-white/40 group-hover:text-red-600" size={24} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black uppercase text-white tracking-tight mb-1">{pm.name}</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{pm.category}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => { navigator.clipboard.writeText(pm.value); setCopied(pm.id); setTimeout(() => setCopied(null), 2000) }}
                                                        className={`p-3.5 rounded-xl transition-all ${copied === pm.id ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-500 hover:bg-white hover:text-black'}`}
                                                    >
                                                        {copied === pm.id ? <Check size={16} /> : <Copy size={16} />}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep(3)}
                                        className="w-full py-6 mt-4 bg-white/5 text-gray-400 hover:bg-white hover:text-black font-black italic rounded-2xl uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 text-xs"
                                    >
                                        VERIFICAR DEPÓSITO MANUAL <ArrowRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <button onClick={() => setStep(2)} className="flex items-center gap-2 text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-[0.2em] transition-colors mb-6">
                                        <ChevronLeft size={14} /> VOLVER A PAGO
                                    </button>

                                    <div className="bg-white/[0.03] p-8 border border-white/5 rounded-[2.5rem] flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
                                        <div className="flex-1 space-y-2">
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">MONTO A TRANSFERIR</p>
                                            <h4 className="text-5xl font-black italic text-white tracking-tighter leading-none">${getFinalPrice()} <span className="text-red-600 text-2xl uppercase">USD</span></h4>
                                        </div>
                                        <div className="w-full md:w-auto h-[1px] md:h-20 md:w-[1px] bg-white/10" />
                                        <div className="flex-1 space-y-2">
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">REFERENCIA</p>
                                            <h4 className="text-lg font-black italic text-white uppercase tracking-tighter leading-none">{selectedPlan.name}</h4>
                                        </div>
                                    </div>

                                    <div className="grid gap-6">
                                        {receiptUrl ? (
                                            <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-red-600 group shadow-[0_0_60px_rgba(220,38,38,0.1)]">
                                                <img src={receiptUrl} className="w-full h-64 object-cover brightness-75 group-hover:brightness-50 transition-all duration-700" />
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                                                    <button onClick={() => setReceiptUrl('')} className="bg-red-600 text-white p-5 rounded-full hover:scale-110 active:scale-90 transition-transform shadow-2xl">
                                                        <X size={28} />
                                                    </button>
                                                    <p className="text-[9px] font-black text-white uppercase tracking-widest">ELIMINAR Y CAMBIAR</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/5 hover:border-red-600 rounded-[2.5rem] bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-all duration-500 group">
                                                <input type="file" className="hidden" onChange={handleReceiptUpload} accept="image/*" />
                                                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:rotate-12 group-hover:scale-110 transition-all">
                                                    {uploading ? <div className="animate-spin text-white"><Zap size={40} /></div> : <Upload size={40} className="text-white/20 group-hover:text-white" />}
                                                </div>
                                                <span className="text-[11px] font-black uppercase text-white/40 group-hover:text-white mb-2 tracking-[0.2em]">CARGAR COMPROBANTE</span>
                                                <span className="text-[9px] font-bold text-gray-700 uppercase tracking-widest italic font-mono">JPG / PNG / CAPTURA</span>
                                            </label>
                                        )}

                                        <button
                                            disabled={!receiptUrl || loading}
                                            onClick={confirmPayment}
                                            className="w-full py-7 bg-red-600 text-white font-black italic text-sm uppercase italic rounded-2xl tracking-[0.4em] shadow-[0_20px_50px_rgba(220,38,38,0.3)] disabled:opacity-20 disabled:grayscale transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-4"
                                        >
                                            {loading ? 'PROCESANDO SERVIDOR...' : 'ENVIAR PARA CONFIRMACIÓN'} <MessageSquare size={20} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div key="step4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <button onClick={() => setStep(2)} className="flex items-center gap-2 text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-[0.2em] transition-colors mb-6">
                                        <ChevronLeft size={14} /> VOLVER A MÉTODOS
                                    </button>

                                    {loading && currencies.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-6">
                                            <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(220,38,38,0.3)]" />
                                            <div className="text-center">
                                                <p className="text-xs font-black text-white uppercase tracking-[0.4em] mb-2">SINCRONIZANDO RED</p>
                                                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em]">OBTENIENDO MONEDAS DISPONIBLES</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar-hidden">
                                            {currencies.map(curr => (
                                                <button
                                                    key={curr}
                                                    onClick={() => handleSelectCurrency(curr)}
                                                    disabled={loading}
                                                    className={`p-6 bg-white/[0.03] border rounded-2xl transition-all text-center group flex flex-col items-center gap-4 ${['usdtbsc', 'btc', 'bnbbsc'].includes(curr.toLowerCase()) ? 'border-red-600/50 bg-red-600/5 shadow-[0_0_20px_rgba(220,38,38,0.1)]' : 'border-white/5 hover:border-red-600 hover:bg-white/5'}`}
                                                >
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-red-600 group-hover:scale-110 transition-all border ${['usdtbsc', 'btc', 'bnbbsc'].includes(curr.toLowerCase()) ? 'bg-red-600 text-white border-red-500' : 'bg-white/5 text-white border-white/5'}`}>
                                                        <span className="text-[10px] font-black group-hover:text-white italic">
                                                            {curr === 'usdtbsc' ? 'USDT' : curr === 'bnbbsc' ? 'BNB' : curr.substring(0, 3).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-black uppercase text-white tracking-widest">
                                                            {curr === 'usdtbsc' ? 'USDT (BEP20)' : curr === 'bnbbsc' ? 'BNB (BSC)' : curr.toUpperCase()}
                                                        </span>
                                                        {['usdtbsc', 'bnbbsc'].includes(curr.toLowerCase()) && (
                                                            <span className="text-[7px] font-black text-red-600 uppercase tracking-tighter">RED: SMART CHAIN</span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {loading && currencies.length > 0 && (
                                        <div className="text-center py-6">
                                            <span className="text-[10px] font-black text-red-600 animate-pulse uppercase tracking-[0.5em]">OPERACIÓN: GENERANDO TERMINAL...</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {step === 5 && paymentDetails && (
                                <motion.div key="step5" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                                    <div className="flex flex-col items-center text-center space-y-8 p-4">
                                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-red-600/10 border border-red-600/20 rounded-full">
                                            <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                                            <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">CANAL DE DEPÓSITO ACTIVO</span>
                                        </div>

                                        <div className="relative group p-4 bg-white rounded-[3rem] shadow-2xl shadow-red-600/10 border-4 border-black transition-transform duration-700 hover:scale-105">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${paymentDetails.pay_address}`}
                                                alt="QR Code"
                                                className="w-48 h-48 md:w-56 md:h-56 mix-blend-multiply"
                                            />
                                            {/* Corner Accents */}
                                            <div className="absolute top-[-5px] left-[-5px] w-6 h-6 border-t-2 border-l-2 border-red-600" />
                                            <div className="absolute top-[-5px] right-[-5px] w-6 h-6 border-t-2 border-r-2 border-red-600" />
                                            <div className="absolute bottom-[-5px] left-[-5px] w-6 h-6 border-b-2 border-l-2 border-red-600" />
                                            <div className="absolute bottom-[-5px] right-[-5px] w-6 h-6 border-b-2 border-r-2 border-red-600" />
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">MONTO EXACTO A ENVIAR</p>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="flex items-center justify-center gap-3">
                                                    <h4 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter tabular-nums">
                                                        {paymentDetails.pay_amount}
                                                    </h4>
                                                    <span className="text-2xl font-black text-red-600 uppercase mt-2">
                                                        {paymentDetails.pay_currency === 'usdtbsc' ? 'USDT' : paymentDetails.pay_currency === 'bnbbsc' ? 'BNB' : paymentDetails.pay_currency.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                                                    <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">
                                                        RED: <span className="text-red-600">
                                                            {paymentDetails.pay_currency === 'usdtbsc' ? 'BINANCE SMART CHAIN (BEP20)' :
                                                                paymentDetails.pay_currency === 'bnbbsc' ? 'BINANCE SMART CHAIN (BSC)' :
                                                                    paymentDetails.pay_currency === 'btc' ? 'BITCOIN NETWORK' :
                                                                        'RED NATIVA'}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full space-y-4 pt-4">
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">DIRECCIÓN DE TERMINAL</p>
                                                <button
                                                    onClick={() => { navigator.clipboard.writeText(paymentDetails.pay_address); setCopied('addr'); setTimeout(() => setCopied(null), 2000) }}
                                                    className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl flex items-center justify-between group/btn hover:border-red-600 hover:bg-red-600/5 transition-all shadow-xl"
                                                >
                                                    <span className="text-[11px] font-mono text-white/70 truncate mr-6 font-bold">{paymentDetails.pay_address}</span>
                                                    <div className={`p-3 rounded-lg transition-all ${copied === 'addr' ? 'bg-green-600 text-white' : 'bg-white/10 text-white/40 group-hover/btn:bg-white group-hover/btn:text-black'}`}>
                                                        {copied === 'addr' ? <Check size={14} /> : <Copy size={14} />}
                                                    </div>
                                                </button>
                                            </div>

                                            <div className="pt-6 border-t border-white/5 space-y-4">
                                                <div className="bg-red-600/10 border border-red-600/30 p-4 rounded-2xl flex items-start gap-4">
                                                    <ShieldAlert size={20} className="text-red-600 shrink-0 mt-1" />
                                                    <div className="text-left">
                                                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">INSTRUCCIÓN DE RED OBLIGATORIA</p>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed">
                                                            {paymentDetails.pay_currency === 'usdtbsc' && "DEBES enviar USDT únicamente a través de la red BINANCE SMART CHAIN (BEP20). El uso de otra red resultará en la pérdida total de fondos."}
                                                            {paymentDetails.pay_currency === 'btc' && "DEBES enviar BITCOIN únicamente a través de su red nativa (BITCOIN NETWORK). No uses redes envueltas o alternativas."}
                                                            {paymentDetails.pay_currency === 'bnbbsc' && "DEBES enviar BNB únicamente a través de la red BINANCE SMART CHAIN (BSC - BEP20)."}
                                                            {!['usdtbsc', 'btc', 'bnbbsc'].includes(paymentDetails.pay_currency) && `Asegúrate de enviar ${paymentDetails.pay_currency.toUpperCase()} por su red correspondiente.`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest leading-relaxed">
                                                    * Esta es una <span className="text-white">Terminal de Pago Segura</span> generada dinámicamente por la red NOWPayments para esta orden específica.
                                                    Los fondos serán procesados y acreditados a tu cuenta automáticamente tras la confirmación.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                                <div className="p-5 bg-black/60 border border-white/5 rounded-2xl flex flex-col items-center gap-1">
                                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">ORDER TRACKING ID</p>
                                                    <p className="text-xs font-black text-white">#{paymentDetails.payment_id.substring(0, 10).toUpperCase()}</p>
                                                </div>
                                                <button
                                                    onClick={checkPaymentStatus}
                                                    className="p-5 bg-red-600 text-white rounded-2xl font-black italic uppercase text-[11px] flex items-center justify-center gap-3 hover:bg-white hover:text-red-600 transition-all shadow-2xl shadow-red-600/20 group"
                                                >
                                                    SINCRONIZAR ESTADO <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </div>

                                        {debugMode && (
                                            <button
                                                onClick={handleMockSuccess}
                                                className="w-full p-4 mt-6 bg-green-600/10 border border-green-600/30 text-green-500 rounded-2xl font-black italic uppercase text-[10px] hover:bg-green-600 hover:text-white transition-all"
                                            >
                                                [DEV] VALIDAR PAGO INSTANTÁNEO
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {step === 6 && (
                                <motion.div key="step6" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="relative mb-10">
                                        <div className="absolute inset-0 bg-red-600 blur-[60px] opacity-20 animate-pulse" />
                                        <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center relative z-10 border-4 border-black">
                                            <CheckCircle size={50} className="text-white" />
                                        </div>
                                    </div>
                                    <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter mb-4 leading-none">REPORTE <span className="text-red-600">ENVIADO</span></h2>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mb-10">SISTEMA EN PROCESO DE VALIDACIÓN</p>
                                    <div className="space-y-4 max-w-sm">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase leading-loose tracking-widest">
                                            ESTAMOS VERIFICANDO TU TRANSACCIÓN EN LA RED. RECIBIRÁS UN CORREO ELECTRÓNICO CON EL PASO A PASO FINAL.
                                        </p>
                                        <div className="pt-10 flex flex-col items-center gap-4">
                                            <button
                                                onClick={() => window.location.reload()}
                                                className="px-10 py-5 bg-white text-black font-black italic text-xs uppercase tracking-[0.4em] rounded-2xl hover:bg-red-600 hover:text-white transition-all active:scale-95"
                                            >
                                                FINALIZAR SESIÓN
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer: Minimalist Dark */}
                    <div className="p-6 md:p-10 border-t border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col md:flex-row justify-between items-center gap-4 relative pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-600/50 via-transparent to-transparent"></div>
                        <button onClick={onLogout} className="text-[10px] font-black text-white/20 hover:text-red-600 transition-colors uppercase tracking-[0.4em] italic">
                            CANCELAR OPERACIÓN
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
                            className="flex items-center gap-3 cursor-pointer group"
                        >
                            <ShieldAlert size={16} className={`${debugMode ? "text-green-500" : "text-red-700"} group-hover:scale-110 transition-transform`} />
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] leading-none group-hover:text-white transition-colors">{debugMode ? 'TERMINAL DEBUG ACTIVO' : 'SISTEMA CIFRADO END-TO-END'}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// Tactical Success Icon
const CheckCircle = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

export default PaymentPortal;
