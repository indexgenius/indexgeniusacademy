import React, { useState, useEffect } from 'react';
import { Check, Copy, ShieldCheck, Zap, ArrowRight, Lock, MessageSquare, Crown, Star, ShieldAlert, Upload, Image, X, Tag, Percent } from 'lucide-react';
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
        icon: <Zap size={24} className="text-white" />,
        style: 'border-white/10 hover:border-white/30',
        accent: 'bg-white/5'
    },
    {
        id: 'index-pro',
        name: 'INDEX PRO',
        price: 297,
        period: '/ mensual',
        description: 'Infraestructura profesional completa',
        features: ['Todo de INDEX ONE', 'Curso Completo', 'Plantilla IndexPro', 'Grupo Privado', 'Masterclass'],
        icon: <Crown size={28} className="text-red-500" />,
        style: 'border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.15)]',
        accent: 'bg-red-600/10',
        popular: true
    },
    {
        id: 'index-black',
        name: 'INDEX BLACK',
        price: 1000,
        period: 'pago único',
        description: 'Programa privado de alto rendimiento',
        features: ['Todo de INDEX PRO', 'Mentoría 1-on-1', 'Plan de escalamiento', 'Grupo BLACK'],
        icon: <Star size={24} className="text-white" />,
        style: 'border-white/20 hover:border-white/40',
        accent: 'bg-white/5'
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

    // Discount code state
    const [discountCode, setDiscountCode] = useState('');
    const [discountApplied, setDiscountApplied] = useState(null); // { type, value, code }
    const [discountLoading, setDiscountLoading] = useState(false);
    const [discountError, setDiscountError] = useState('');

    // Pre-select plan from landing page
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

    useEffect(() => {
        localStorage.removeItem('selectedPlan');
    }, []);

    // Calculate final price
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

    // Validate discount code
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
                setDiscountError('Código inválido o expirado');
                setDiscountApplied(null);
                setDiscountLoading(false);
                return;
            }

            const codeDoc = snapshot.docs[0];
            const codeData = codeDoc.data();

            // Check max uses
            if (codeData.maxUses && codeData.currentUses >= codeData.maxUses) {
                setDiscountError('Este código ya alcanzó su límite de usos');
                setDiscountApplied(null);
                setDiscountLoading(false);
                return;
            }

            // Check expiration
            if (codeData.expiresAt && codeData.expiresAt.toDate() < new Date()) {
                setDiscountError('Este código ha expirado');
                setDiscountApplied(null);
                setDiscountLoading(false);
                return;
            }

            // Check valid plans
            if (codeData.validPlans && codeData.validPlans.length > 0 && !codeData.validPlans.includes(selectedPlan.id)) {
                setDiscountError(`Este código no aplica para ${selectedPlan.name}`);
                setDiscountApplied(null);
                setDiscountLoading(false);
                return;
            }

            setDiscountApplied({
                type: codeData.type,
                value: codeData.value,
                code: codeData.code,
                docId: codeDoc.id
            });
            setDiscountError('');
        } catch (err) {
            console.error("Discount code error:", err);
            setDiscountError('Error al validar el código');
        } finally {
            setDiscountLoading(false);
        }
    };

    const removeDiscount = () => {
        setDiscountApplied(null);
        setDiscountCode('');
        setDiscountError('');
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleReceiptUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        formData.append("folder", "comprobantes");

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.secure_url) {
                setReceiptUrl(data.secure_url);
            } else {
                throw new Error(data.error?.message || "Error en la carga");
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Error al subir el comprobante. Intenta de nuevo.");
        } finally {
            setUploading(false);
        }
    };

    const confirmPayment = async () => {
        if (!receiptUrl) {
            alert("Por favor sube tu comprobante de pago antes de continuar.");
            return;
        }

        setLoading(true);
        const userEmail = user?.email || "SISTEMA_LOCAL_USER";
        const userPhone = user?.phone || "NO REGISTRADO";
        const planName = selectedPlan.name;
        const finalPrice = getFinalPrice();

        const message = `HOLA STEVEN. ACABO DE REALIZAR EL PAGO DE MI ${isExpired ? 'RENOVACIÓN' : 'MEMBRESÍA'}.\n\nVALOR: $${finalPrice} USD\nPLAN: ${planName}${discountApplied ? `\nCÓDIGO: ${discountApplied.code} (${discountApplied.type === 'percentage' ? discountApplied.value + '%' : '$' + discountApplied.value} desc.)` : ''}\nUSUARIO: ${userEmail}\nTELÉFONO: ${userPhone}\nCOMPROBANTE: ${receiptUrl}\n\nPOR FAVOR ACTIVA MI ACCESO.`;
        const waUrl = `https://wa.me/18292198071?text=${encodeURIComponent(message)}`;

        try {
            window.open(waUrl, '_blank');
        } catch (e) {
            console.error("Window open error:", e);
        }

        try {
            await addDoc(collection(db, "notifications"), {
                title: isExpired ? "NUEVA RENOVACIÓN" : `NUEVO PAGO - ${planName}`,
                message: `${userEmail} reportó pago de $${finalPrice} para ${planName}.${discountApplied ? ` Código: ${discountApplied.code}` : ''}`,
                type: 'subscription_payment',
                userId: user.uid,
                userEmail: userEmail,
                receiptUrl: receiptUrl,
                read: false,
                timestamp: serverTimestamp()
            });

            await updateDoc(doc(db, "users", user.uid), {
                status: 'pending',
                paymentReported: true,
                paymentReportedAt: serverTimestamp(),
                selectedPlan: planName,
                selectedPlanId: selectedPlan.id,
                membershipPrice: finalPrice,
                originalPrice: selectedPlan.price,
                discountCode: discountApplied?.code || null,
                receiptUrl: receiptUrl
            });

            // Increment discount code usage
            if (discountApplied?.docId) {
                const codeRef = doc(db, "discount_codes", discountApplied.docId);
                const snapshot = await getDocs(query(collection(db, "discount_codes"), where("code", "==", discountApplied.code)));
                if (!snapshot.empty) {
                    const currentUses = snapshot.docs[0].data().currentUses || 0;
                    await updateDoc(codeRef, { currentUses: currentUses + 1 });
                }
            }
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
                            <h2 className="text-2xl font-black italic uppercase leading-none tracking-tighter shadow-sm text-white">PORTAL</h2>
                            <h2 className="text-2xl font-black italic uppercase leading-none tracking-tighter shadow-sm text-white">DE PAGO</h2>
                        </div>
                    </div>

                    <div className="space-y-1 mb-12">
                        <h1 className="text-4xl md:text-5xl font-black italic uppercase leading-tight tracking-tighter text-white">
                            {isExpired ? 'RENOVAR' : 'ACTIVAR'}<br />MEMBRESÍA
                        </h1>
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.4em]">
                            {isExpired ? 'TU SUSCRIPCIÓN HA EXPIRADO' : 'SELECCIONA TU NIVEL DE ACCESO'}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {[
                            { num: 1, label: 'ELEGIR PLAN' },
                            { num: 2, label: 'MÉTODO DE PAGO' },
                            { num: 3, label: 'SUBIR COMPROBANTE' }
                        ].map(s => (
                            <div key={s.num} className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs transition-all duration-500 ${step === s.num ? 'border-white bg-white text-red-600' : step > s.num ? 'border-white/60 bg-white/20 text-white' : 'border-white/40 text-white/40'}`}>{step > s.num ? '✓' : s.num}</div>
                                <span className={`text-xs font-black italic uppercase tracking-widest transition-all duration-500 ${step === s.num ? 'text-white' : 'text-white/40'}`}>{s.label}</span>
                            </div>
                        ))}
                    </div>

                    <button onClick={onLogout} className="mt-10 text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white transition-colors flex items-center gap-2">
                        CERRAR SESIÓN <span className="text-white/30 text-[8px]">[SALIR]</span>
                    </button>
                </div>
            </div>

            {/* BLACK CONTENT AREA */}
            <div className="w-full flex-1 bg-black px-8 py-12">
                <div className="max-w-xl mx-auto">
                    <AnimatePresence mode="wait">

                        {/* ═══ PASO 1: SELECCIÓN DE PLAN ═══ */}
                        {step === 1 && (
                            <motion.div key="plan-select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">{isExpired ? 'RENOVAR ACCESO' : 'ELIGE TU PLAN'}</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                                        {isExpired ? 'Restablece tu acceso al ecosistema IndexGenius' : 'Selecciona tu nivel para desbloquear la plataforma'}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {PLANS.map((plan) => (
                                        <button
                                            key={plan.id}
                                            onClick={() => { setSelectedPlan(plan); removeDiscount(); }}
                                            className={`w-full relative border-2 p-6 text-left transition-all duration-300 group ${plan.style} ${selectedPlan?.id === plan.id ? 'border-red-600 bg-red-600/5' : ''}`}
                                        >
                                            {plan.popular && (
                                                <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 text-[7px] font-black uppercase tracking-widest">🔥 POPULAR</div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 ${plan.accent} rounded`}>{plan.icon}</div>
                                                    <div>
                                                        <h4 className="text-sm font-black italic uppercase tracking-tighter text-white">{plan.name}</h4>
                                                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{plan.description}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-black italic text-white">${plan.price.toLocaleString()}</span>
                                                    <span className="block text-[7px] font-black text-gray-500 uppercase tracking-widest">{plan.period}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {plan.features.map((f, idx) => (
                                                    <span key={idx} className="text-[7px] font-bold text-gray-600 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">{f}</span>
                                                ))}
                                            </div>

                                            {selectedPlan?.id === plan.id && (
                                                <div className="absolute top-1/2 -left-[1px] -translate-y-1/2 w-1 h-8 bg-red-600 rounded-r"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Discount Code */}
                                <div className="border border-white/10 p-5 space-y-3">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Tag size={12} /> ¿TIENES UN CÓDIGO DE DESCUENTO?
                                    </p>
                                    {discountApplied ? (
                                        <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 p-3 rounded">
                                            <div className="flex items-center gap-2">
                                                <Percent size={14} className="text-green-500" />
                                                <span className="text-xs font-black text-green-500 uppercase">
                                                    {discountApplied.code} — {discountApplied.type === 'percentage' ? `${discountApplied.value}% OFF` : `$${discountApplied.value} OFF`}
                                                </span>
                                            </div>
                                            <button onClick={removeDiscount} className="text-red-500 hover:text-white transition-colors">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={discountCode}
                                                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                                placeholder="INGRESA TU CÓDIGO"
                                                className="flex-1 bg-white/5 border border-white/10 px-4 py-3 text-xs font-bold text-white uppercase tracking-widest outline-none focus:border-red-600 transition-colors placeholder:text-gray-600"
                                            />
                                            <button
                                                onClick={applyDiscountCode}
                                                disabled={discountLoading || !discountCode.trim()}
                                                className="px-5 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-40"
                                            >
                                                {discountLoading ? '...' : 'APLICAR'}
                                            </button>
                                        </div>
                                    )}
                                    {discountError && (
                                        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{discountError}</p>
                                    )}
                                </div>

                                {/* Bottom action */}
                                <div className="fixed bottom-0 left-0 w-full bg-white px-8 py-5 flex justify-center items-center z-50">
                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={!selectedPlan}
                                        className="w-full max-w-xl group flex justify-between items-center disabled:opacity-30"
                                    >
                                        <div className="text-left">
                                            <span className="text-black text-xl font-black italic uppercase tracking-tighter group-active:translate-y-1 transition-transform block">
                                                CONTINUAR AL PAGO
                                            </span>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                {selectedPlan?.name} — ${getFinalPrice().toLocaleString()} USD
                                                {discountApplied && <span className="text-green-600 ml-2">({discountApplied.code})</span>}
                                            </span>
                                        </div>
                                        <ArrowRight className="text-black w-8 h-8 group-hover:translate-x-2 transition-transform duration-500" />
                                    </button>
                                </div>
                                <div className="h-24"></div>
                            </motion.div>
                        )}

                        {/* ═══ PASO 2: MÉTODOS DE PAGO ═══ */}
                        {step === 2 && (
                            <motion.div key="payment-methods" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <button onClick={() => setStep(1)} className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors">
                                    ← VOLVER A PLANES
                                </button>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">MÉTODO DE PAGO</h3>
                                        <div className="text-right">
                                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block">{selectedPlan?.name}</span>
                                            {discountApplied && (
                                                <span className="text-[8px] font-black text-gray-600 line-through block">${selectedPlan?.price.toLocaleString()} USD</span>
                                            )}
                                            <span className="text-lg font-black italic text-red-500">${getFinalPrice().toLocaleString()} USD</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                                        Selecciona un método y envía el monto exacto
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

                                <div className="fixed bottom-0 left-0 w-full bg-white px-8 py-5 flex justify-center items-center z-50">
                                    <button
                                        onClick={() => setStep(3)}
                                        className="w-full max-w-xl group flex justify-between items-center"
                                    >
                                        <span className="text-black text-xl font-black italic uppercase tracking-tighter">
                                            ¿YA PAGASTE? SUBE TU COMPROBANTE
                                        </span>
                                        <ArrowRight className="text-black w-8 h-8 group-hover:translate-x-2 transition-transform duration-500" />
                                    </button>
                                </div>
                                <div className="h-24"></div>
                            </motion.div>
                        )}

                        {/* ═══ PASO 3: SUBIR COMPROBANTE ═══ */}
                        {step === 3 && (
                            <motion.div key="upload-receipt" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <button onClick={() => setStep(2)} className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors">
                                    ← VOLVER AL PAGO
                                </button>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">SUBIR COMPROBANTE</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                                        Sube tu comprobante de pago para verificar y activar tu acceso {selectedPlan?.name}
                                    </p>
                                </div>

                                {/* Plan Summary */}
                                <div className="border border-white/10 p-6 bg-white/[0.02]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-red-600/10 rounded">{selectedPlan?.icon}</div>
                                            <div>
                                                <h4 className="text-sm font-black italic uppercase tracking-tighter text-white">{selectedPlan?.name}</h4>
                                                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{selectedPlan?.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {discountApplied && (
                                                <span className="text-sm font-black italic text-gray-600 line-through block">${selectedPlan?.price.toLocaleString()}</span>
                                            )}
                                            <span className="text-2xl font-black italic text-red-500">${getFinalPrice().toLocaleString()}</span>
                                            <span className="block text-[7px] font-black text-gray-500 uppercase">{selectedPlan?.period}</span>
                                            {discountApplied && (
                                                <span className="text-[7px] font-black text-green-500 uppercase">CÓDIGO: {discountApplied.code}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Upload Area */}
                                <div className="relative">
                                    {receiptUrl ? (
                                        <div className="border-2 border-green-500/50 bg-green-500/5 p-6 text-center relative">
                                            <button
                                                onClick={() => setReceiptUrl('')}
                                                className="absolute top-3 right-3 p-1 bg-white/10 hover:bg-red-600 rounded transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                            <img src={receiptUrl} alt="Comprobante" className="max-h-48 mx-auto rounded mb-4 border border-white/10" />
                                            <div className="flex items-center justify-center gap-2 text-green-500">
                                                <Check size={16} strokeWidth={3} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Comprobante subido correctamente</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className={`border-2 border-dashed border-white/20 hover:border-red-600/50 p-12 text-center cursor-pointer transition-all block ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleReceiptUpload}
                                                disabled={uploading}
                                            />
                                            {uploading ? (
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subiendo comprobante...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="p-4 bg-white/5 rounded-full">
                                                        <Upload size={32} className="text-white/40" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-xs font-black text-white uppercase tracking-widest block">Toca para subir tu comprobante</span>
                                                        <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest block">Captura de pantalla o foto del pago</span>
                                                    </div>
                                                </div>
                                            )}
                                        </label>
                                    )}
                                </div>

                                {/* Confirm Button */}
                                <div className="fixed bottom-0 left-0 w-full bg-red-600 px-8 py-5 flex justify-center items-center z-50">
                                    <button
                                        disabled={loading || !receiptUrl}
                                        onClick={confirmPayment}
                                        className="w-full max-w-xl group flex justify-between items-center disabled:opacity-50"
                                    >
                                        <span className="text-white text-xl font-black italic uppercase tracking-tighter group-active:translate-y-1 transition-transform">
                                            {loading ? 'PROCESANDO...' : 'CONFIRMAR Y ACTIVAR'}
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
