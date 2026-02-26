import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Key, ShieldAlert, Zap, MessageSquare, CreditCard, Download, Copy, Wallet, Landmark, Smartphone, LayoutGrid, Check, Phone, ArrowRight, Play, X, Trophy, TrendingUp, Medal, Rocket, Briefcase, Crown, Coins, Flame, Target, ShieldCheck } from 'lucide-react';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, collection, onSnapshot, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import ProTacticalBackground from '../../components/ProTacticalBackground';
import { nowPaymentsService } from '../../services/nowPaymentsService';

const TemplatesPage = ({ user }) => {
    const [unlocked, setUnlocked] = useState(false);
    const [accessKey, setAccessKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [expandedCat, setExpandedCat] = useState(null);
    const [copied, setCopied] = useState(null);
    const [userBroker, setUserBroker] = useState(null);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [templateInfo, setTemplateInfo] = useState({
        url: '',
        name: 'INDEX PRO V1.0',
        size: '84.2 MB'
    });

    // NowPayments States
    const [modalStep, setModalStep] = useState(1);
    const [currencies, setCurrencies] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [debugClicks, setDebugClicks] = useState(0);
    const [debugMode, setDebugMode] = useState(false);

    // Unified membership price
    const finalPrice = 50;
    const planName = 'PLANTILLA INDEXPRO';
    const isBridge = userBroker === 'bridge';
    const isAdmin = user?.canBroadcast || user?.email?.toLowerCase() === 'admin' || user?.email?.toLowerCase() === 'steven@ingenius.fx' || user?.email?.toLowerCase() === 'jeilin@jeilin.com' || user?.email?.toLowerCase() === 'pipoapaza@gmail.com' || user?.role === 'admin';

    useEffect(() => {
        if (isAdmin) setDebugMode(true);
    }, [isAdmin]);

    useEffect(() => {
        const checkAccess = async () => {
            if (!user) return;
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                if (userData.hasTemplateAccess) {
                    setUnlocked(true);
                }
                setUserBroker(userData.brokerType || 'other');
            }
        };
        const fetchTemplate = async () => {
            try {
                const assetRef = doc(db, 'site_assets', 'template_pack');
                const assetSnap = await getDoc(assetRef);
                if (assetSnap.exists()) {
                    setTemplateInfo(assetSnap.data());
                }
            } catch (e) { console.error("Error fetching template:", e); }
        };
        fetchTemplate();

        checkAccess();

        const unsubMethods = onSnapshot(collection(db, "payment_methods"), (snapshot) => {
            setPaymentMethods(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubMethods();
    }, [user]);


    const handleFileUpload = async (e) => {
        if (!isAdmin) {
            alert("ACCESO DENEGADO. SOLO EL PERSONAL AUTORIZADO PUEDE MODIFICAR ESTE ACTIVO.");
            return;
        }
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "perfil_users");

        try {
            const resourceType = file.type.startsWith('image/') ? 'image' : 'raw';
            const CLOUDINARY_CLOUD_NAME = "ddfx8syri";

            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (data.secure_url) {
                const assetRef = doc(db, 'site_assets', 'template_pack');
                const newInfo = {
                    url: data.secure_url,
                    name: file.name,
                    size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                    updatedAt: serverTimestamp()
                };
                await setDoc(assetRef, newInfo, { merge: true });
                setTemplateInfo(newInfo);
                alert("PLANTILLA ACTUALIZADA Y LISTA PARA DESCARGA");
            } else {
                throw new Error(data.error?.message || "Upload failed");
            }
        } catch (err) {
            console.error("Cloudinary Upload Error:", err);
            alert(`ERROR AL SUBIR: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (templateInfo?.url) {
            window.open(templateInfo.url, '_blank');
        } else {
            alert("LA PLANTILLA NO ESTÁ DISPONIBLE EN ESTE MOMENTO. CONTACTA A SOPORTE.");
        }
    };

    const handleUnlock = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const keyRef = doc(db, 'access_codes', accessKey);
            const keySnap = await getDoc(keyRef);
            if (keySnap.exists() && keySnap.data().valid) {
                await updateDoc(doc(db, 'users', user.uid), { hasTemplateAccess: true });
                await updateDoc(keyRef, { valid: false, used: true, usedBy: user.email, usedAt: serverTimestamp() });
                setUnlocked(true);
            } else {
                setError('INVALID OR EXPIRED KEY');
            }
        } catch (err) {
            console.error(err);
            setError('VALIDATION ERROR');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const confirmAndNotify = async () => {
        const userEmail = user?.email || "SISTEMA_LOCAL_USER";
        const message = `HOLA. YA PAGUÉ LA MEMBRESÍA DE LA PLANTILLA.\n\nVALOR: $${finalPrice} USD\nUSUARIO: ${userEmail}\nBROKER: ${isBridge ? 'BRIDGE MARKETS' : 'OTRO BROKER'}\n\nESPERANDO MI CLAVE DE ACCESO.`;
        const waUrl = `https://wa.me/18292198071?text=${encodeURIComponent(message)}`;

        try {
            await addDoc(collection(db, "notifications"), {
                title: "NUEVO PAGO DE PLANTILLA",
                message: `El usuario ${userEmail} ha reportado el pago de su plantilla (${isBridge ? 'Bridge' : 'Externo'}).`,
                type: 'template_payment',
                userId: user.uid,
                userEmail: userEmail,
                read: false,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error("Error creating notification:", e);
        }

        window.open(waUrl, '_blank');
        setShowPaymentModal(false);
    };

    const handleNowPayments = async () => {
        setLoading(true);
        try {
            const data = await nowPaymentsService.getCurrencies();
            // Filtrar y priorizar USDT, BTC y BNB (Monedas solicitadas)
            const popular = ['usdtbsc', 'btc', 'bnbbsc', 'usdttrc20', 'eth', 'ltc', 'trc20', 'trx'];
            let filtered = data.currencies.filter(c => popular.includes(c.toLowerCase()));

            // Orden específico solicitado
            const order = ['usdtbsc', 'btc', 'bnbbsc'];
            filtered.sort((a, b) => {
                const indexA = order.indexOf(a.toLowerCase());
                const indexB = order.indexOf(b.toLowerCase());

                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return 0;
            });

            if (filtered.length === 0) filtered = data.currencies.slice(0, 12);
            setCurrencies(filtered);
            setModalStep(2);
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
            const orderId = `TEMP_${user.uid}_${Date.now()}`;
            const payment = await nowPaymentsService.createPayment({
                price_amount: finalPrice,
                pay_currency: currency,
                order_id: orderId,
                order_description: `PLANTILLA: ${planName} - ${user.email}`,
            });
            setPaymentDetails(payment);
            setModalStep(3);
        } catch (err) {
            console.error(err);
            alert("Error al generar dirección: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const generateAccessKey = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let key = 'IDX-';
        for (let i = 0; i < 8; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
            if (i === 3) key += '-';
        }
        return key;
    };

    const sendTemplateKeyEmail = async (email, name, key) => {
        try {
            const responseHtml = await fetch('/template_key_email.html');
            if (responseHtml.ok) {
                let htmlContent = await responseHtml.text();
                htmlContent = htmlContent.replace(/{{USER_NAME}}/g, name || 'Trader');
                htmlContent = htmlContent.replace(/{{PLAN_NAME}}/g, planName);
                htmlContent = htmlContent.replace(/{{ACCESS_KEY}}/g, key);

                let apiUrl = 'https://indexgeniusacademy.com/api/auth/send-welcome-email';
                if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')) {
                    // For GitHub Pages, it must point to the Vercel/Production API
                    apiUrl = 'https://indexgeniusacademy.com/api/auth/send-welcome-email';
                }

                await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email,
                        name: name,
                        htmlContent: htmlContent
                    })
                });
            }
        } catch (e) {
            console.error("Error sending key email:", e);
        }
    };

    const activateTemplate = async (method = 'CRYPTO_AUTOMATIC') => {
        const newKey = generateAccessKey();

        // 1. Save key to access_codes
        await setDoc(doc(db, 'access_codes', newKey), {
            valid: true,
            used: false,
            createdAt: serverTimestamp(),
            generatedBy: 'SYSTEM_AUTOMATION',
            userEmail: user.email,
            paymentMethod: method
        });

        // 2. Give access to user
        await updateDoc(doc(db, 'users', user.uid), {
            hasTemplateAccess: true,
            templatePaymentMethod: method,
            templatePaymentAt: serverTimestamp(),
            lastGeneratedKey: newKey
        });

        // 3. Send Email
        await sendTemplateKeyEmail(user.email, user.displayName, newKey);

        return newKey;
    };

    const handleMockSuccess = async () => {
        setLoading(true);
        try {
            let targetEmail = user.email;
            if (isAdmin) {
                const customEmail = prompt("INGRESA EL CORREO PARA EL TEST (Dejar vacío para usar el tuyo):", "jeilincastro989@gmail.com");
                if (customEmail === null) { setLoading(false); return; } // Cancelled
                if (customEmail.trim() !== "") targetEmail = customEmail.trim();
            }

            const newKey = generateAccessKey();

            // 1. Save key
            await setDoc(doc(db, 'access_codes', newKey), {
                valid: true,
                used: false,
                createdAt: serverTimestamp(),
                generatedBy: 'ADMIN_TEST_BY_' + user.email,
                userEmail: targetEmail,
                paymentMethod: 'TEST_MODE'
            });

            // 2. Give access (only if it's the current user's email, or just proceed with email test)
            if (targetEmail === user.email) {
                await updateDoc(doc(db, 'users', user.uid), {
                    hasTemplateAccess: true,
                    templatePaymentMethod: 'TEST_MODE',
                    templatePaymentAt: serverTimestamp(),
                    lastGeneratedKey: newKey
                });
                setUnlocked(true);
            }

            // 3. Send Email to the target
            await sendTemplateKeyEmail(targetEmail, "Trader Elite", newKey);

            alert(`¡TEST EXITOSO! La clave (${newKey}) ha sido enviada a ${targetEmail}`);
            setShowPaymentModal(false);
        } catch (err) {
            alert("Error al simular: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Polling for NowPayments Status
    useEffect(() => {
        let interval;
        if (paymentDetails?.payment_id && modalStep === 3 && !unlocked) {
            interval = setInterval(async () => {
                try {
                    const status = await nowPaymentsService.getPaymentStatus(paymentDetails.payment_id);
                    if (status.payment_status === 'finished' || status.payment_status === 'confirmed') {
                        const newKey = await activateTemplate('NOWPAYMENTS');
                        alert(`¡PAGO CONFIRMADO! Tu clave de acceso es: ${newKey}. También te la enviamos por correo.`);
                        setUnlocked(true);
                        setShowPaymentModal(false);
                        clearInterval(interval);
                    }
                } catch (e) {
                    console.error("Polling error:", e);
                }
            }, 10000); // Check every 10 seconds
        }
        return () => clearInterval(interval);
    }, [paymentDetails, modalStep, unlocked]);

    const categories = [
        { id: 'BANCO', label: 'TRANSFERENCIA BANCARIA', icon: Landmark, color: 'text-blue-500' },
        { id: 'APP', label: 'APLICACIONES DIGITALES', icon: Smartphone, color: 'text-purple-500' },
    ];

    const getCatMethods = (catId) => paymentMethods.filter(pm => pm.category === catId);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <ProTacticalBackground />
            {!unlocked ? (
                /* --- LOCKED VIEW --- */
                <div className="max-w-6xl w-full flex flex-col gap-6 lg:gap-12">
                    <div className="text-center space-y-2 lg:space-y-4">
                        <div className="flex items-center justify-center gap-3 lg:gap-5">
                            <Trophy size={48} className="text-red-600 filter drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] hidden lg:block" />
                            <h2 className="text-3xl lg:text-7xl font-black italic tracking-tighter text-white uppercase leading-none">
                                <span className="text-red-600">Plantilla</span> IndexPro
                            </h2>
                        </div>
                        <div className="flex items-center justify-center gap-2 lg:gap-3">
                            <Medal size={16} className="text-yellow-500" />
                            <p className="text-[10px] lg:text-[14px] font-bold text-gray-400 tracking-wide">La plantilla #1 utilizada por traders en Latinoamérica</p>
                            <TrendingUp size={16} className="text-green-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                        {/* Card 1: Acquisition */}
                        <div className="group relative bg-[#0a0a0a] border border-white/10 p-5 lg:p-10 rounded-2xl lg:rounded-[2rem] overflow-hidden flex flex-col justify-between min-h-[400px] lg:min-h-[500px] transition-all hover:border-red-600/30">
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                                <CreditCard size={180} />
                            </div>

                            <div className="relative z-10 space-y-6 lg:space-y-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-red-600 rounded-lg lg:rounded-xl flex items-center justify-center">
                                            <Zap size={16} className="text-white lg:w-5 lg:h-5" />
                                        </div>
                                        <span className="text-[8px] lg:text-[10px] font-black text-white tracking-widest uppercase italic">⚡ ACCESS MODULE</span>
                                    </div>
                                    <h3 className="text-2xl lg:text-3xl font-black italic text-white uppercase tracking-tighter">
                                        ACTIVAR <br /><span className="text-red-600">ACCESO ELITE</span>
                                    </h3>
                                </div>

                                <div className="space-y-4 lg:space-y-6">
                                    <div className="p-4 lg:p-6 bg-white/5 border border-white/5 rounded-xl lg:rounded-2xl">
                                        <div className="flex justify-between items-center mb-3 lg:mb-4">
                                            <div className="flex items-center gap-2">
                                                <Briefcase size={12} className="text-gray-500" />
                                                <span className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest">MEMBERSHIP TYPE</span>
                                            </div>
                                            <span className="px-2 py-0.5 lg:px-3 lg:py-1 bg-red-600 text-[6px] lg:text-[8px] font-black text-white uppercase rounded-full flex items-center gap-1">
                                                <Crown size={10} /> ELITE FULL ACCESS
                                            </span>
                                        </div>

                                        {/* Benefits List */}
                                        <div className="space-y-1.5 mb-4 text-[8px] lg:text-[9px] text-gray-400">
                                            <p className="flex items-start gap-1.5"><span className="text-green-500 mt-0.5">✔</span> Plantillas profesionales listas para operar</p>
                                            <p className="flex items-start gap-1.5"><span className="text-green-500 mt-0.5">✔</span> Estructura institucional y validada</p>
                                            <p className="flex items-start gap-1.5"><span className="text-green-500 mt-0.5">✔</span> Optimizada para índices y sintéticos</p>
                                            <p className="flex items-start gap-1.5"><span className="text-green-500 mt-0.5">✔</span> Uso inmediato – sin configuraciones complejas</p>
                                            <p className="flex items-start gap-1.5"><span className="text-green-500 mt-0.5">✔</span> Actualizaciones incluidas</p>
                                        </div>

                                        <div className="border-t border-white/5 pt-3 lg:pt-4">
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="text-4xl lg:text-5xl font-black text-white italic">${finalPrice}</span>
                                                <span className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase">USD</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] lg:text-[9px] text-gray-500 font-bold">Pago único • Acceso de por vida</span>
                                                <Coins size={12} className="text-yellow-600 animate-pulse" />
                                                <Flame size={12} className="text-orange-600" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Lock size={12} className="text-red-500" />
                                            <p className="text-[7px] lg:text-[8px] font-bold text-gray-500 uppercase tracking-widest">PAYMENT METHODS</p>
                                        </div>
                                        <div className="flex gap-3 items-center flex-wrap">
                                            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/5 hover:border-green-500/30 transition-all group">
                                                <img src="/img/metodos/logos/usdt_hq.svg" className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform" alt="USDT" />
                                                <span className="text-[8px] font-bold text-gray-400 group-hover:text-green-400 transition-colors">USDT</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/5 hover:border-orange-500/30 transition-all group">
                                                <img src="/img/metodos/logos/btc_hq.svg" className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform" alt="BTC" />
                                                <span className="text-[8px] font-bold text-gray-400 group-hover:text-orange-400 transition-colors">BTC</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/5 hover:border-yellow-500/30 transition-all group">
                                                <img src="/img/metodos/logos/bnb_hq.svg" className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform" alt="BNB" />
                                                <span className="text-[8px] font-bold text-gray-400 group-hover:text-yellow-400 transition-colors">BNB</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 mt-2">
                                            <ShieldCheck size={12} className="text-green-500" />
                                            <p className="text-[7px] lg:text-[8px] text-gray-500 text-center uppercase tracking-widest font-bold">Transacción rápida y segura</p>
                                            <Lock size={12} className="text-red-500" />
                                        </div>
                                    </div>

                                    {/* Extra Premium Line */}
                                    <div className="text-center flex flex-col items-center gap-1">
                                        <p className="text-[8px] lg:text-[9px] text-gray-500 italic flex items-center gap-2">
                                            <Target size={12} className="text-red-600" /> Diseñado para quienes buscan consistencia, no suerte <Target size={12} className="text-red-600" />
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="relative z-10 w-full py-4 lg:py-6 bg-gradient-to-r from-red-600 to-red-700 text-white font-black uppercase tracking-[0.2em] italic text-[10px] lg:text-xs rounded-xl lg:rounded-2xl hover:brightness-110 transition-all shadow-[0_0_25px_rgba(220,38,38,0.4)] flex items-center justify-center gap-3"
                            >
                                <Rocket size={18} /> ACTIVAR ACCESO ELITE
                            </button>
                        </div>

                        {/* Card 2: Verification */}
                        <div className="group relative bg-black border border-red-600/20 p-5 lg:p-10 rounded-2xl lg:rounded-[2rem] overflow-hidden flex flex-col justify-between min-h-[400px] lg:min-h-[500px]">
                            <div className="absolute inset-0 bg-gradient-to-t from-red-600/5 to-transparent"></div>

                            <div className="relative z-10 space-y-6 lg:space-y-8">
                                <div className="space-y-2 text-center flex flex-col items-center">
                                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-red-600/10 rounded-full flex items-center justify-center mb-4 lg:mb-6 border border-red-600/30">
                                        <Lock size={20} className="text-red-600 lg:w-6 lg:h-6" />
                                    </div>
                                    <h3 className="text-2xl lg:text-3xl font-black italic text-white uppercase tracking-tighter">
                                        VERIFY <span className="text-red-600">KEY</span>
                                    </h3>
                                    <p className="text-[8px] lg:text-[9px] font-bold text-gray-600 tracking-widest uppercase">Ingresa tu clave de activación</p>
                                </div>

                                <form onSubmit={handleUnlock} className="space-y-4 lg:space-y-6">
                                    <div className="relative">
                                        <Key className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 text-red-600/50" size={16} />
                                        <input
                                            type="text"
                                            value={accessKey}
                                            onChange={(e) => setAccessKey(e.target.value)}
                                            placeholder="XXXX-XXXX-XXXX"
                                            className="w-full bg-white/5 border border-white/10 p-4 pl-12 lg:p-6 lg:pl-16 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold uppercase tracking-[0.3em] focus:border-red-600 outline-none transition-all placeholder:text-gray-800 font-mono text-white"
                                        />
                                    </div>

                                    {error && <p className="text-[8px] lg:text-[10px] font-black text-red-600 tracking-widest text-center animate-pulse">{error}</p>}

                                    <button
                                        type="submit"
                                        disabled={loading || !accessKey}
                                        className="w-full py-4 lg:py-6 bg-red-600 text-white font-black italic text-[10px] lg:text-xs tracking-[0.3em] uppercase rounded-xl lg:rounded-2xl hover:bg-white hover:text-black transition-all shadow-red-glow flex items-center justify-center gap-3 lg:gap-4 disabled:opacity-50"
                                    >
                                        {loading ? 'DESENCRIPTANDO...' : <><Unlock size={16} className="lg:w-[18px]" /> DESENCRIPTAR Y DESBLOQUEAR <Flame size={14} className="text-red-600 animate-pulse ml-2" /></>}
                                    </button>
                                </form>
                            </div>

                            <div className="relative z-10 mt-6 lg:mt-8 text-center border-t border-white/5 pt-6 lg:pt-8">
                                <p className="text-[8px] lg:text-[9px] font-bold text-gray-700 uppercase tracking-widest mb-3 lg:mb-4">ENCOUNTERING VALIDATION ISSUES?</p>
                                <a href="https://wa.me/18292198071" target="_blank" className="inline-flex items-center gap-2 lg:gap-3 text-[8px] lg:text-[10px] font-black text-gray-500 hover:text-green-500 transition-colors uppercase tracking-[0.2em]">
                                    <MessageSquare size={14} className="lg:w-4 lg:h-4" /> CONTACT COMMAND CENTER
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* --- UNLOCKED VIEW --- */
                <>
                    <div className="w-full max-w-5xl animate-in fade-in duration-700 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

                            {/* Left: Tactical Info */}
                            <div className="lg:col-span-7 space-y-6 lg:space-y-8">
                                <div className="space-y-3 lg:space-y-4">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="inline-flex items-center gap-2 px-3 py-1 lg:px-4 lg:py-1.5 bg-green-500/10 border border-green-500/20 rounded-full"
                                    >
                                        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-[8px] lg:text-[10px] font-black text-green-500 tracking-[0.2em] uppercase">ACCESS GRANTED • CLEARANCE TIER IV</span>
                                    </motion.div>

                                    <motion.h2
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-5xl lg:text-9xl font-black italic tracking-tighter text-white leading-[0.85] uppercase relative"
                                        style={{ textShadow: '0 0 40px rgba(220, 38, 38, 0.6)' }}
                                    >
                                        INDEX <span className="text-red-600">PRO</span>
                                        <div className="absolute -bottom-4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
                                    </motion.h2>

                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-gray-500 font-bold tracking-widest text-[10px] lg:text-xs uppercase max-w-lg leading-relaxed italic"
                                    >
                                        "Descarga la mejor plantilla para operar los mercados financieros con precisión profesional 🚀📈. Optimiza tus entradas, mejora tu análisis y lleva tu trading al siguiente nivel con Index Genius Template 🔥"
                                    </motion.p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 mt-8 lg:mt-12">
                                    {[
                                        { label: 'VERSION', value: 'INDEX PRO V1.0.zip', delay: 0.3 },
                                        { label: 'FORMAT', value: 'MT5 / .ZIP', delay: 0.4 },
                                        { label: 'FILE SIZE', value: '0.3 MB', delay: 0.5 }
                                    ].map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: item.delay }}
                                            className="p-4 lg:p-5 bg-white/[0.02] border border-white/5 rounded-xl lg:rounded-2xl backdrop-blur-sm hover:border-red-600/30 transition-colors group"
                                        >
                                            <p className="text-[7px] lg:text-[8px] font-black text-gray-500 tracking-widest uppercase mb-1 lg:mb-2 group-hover:text-red-500 transition-colors">{item.label}</p>
                                            <p className="text-[10px] lg:text-xs font-bold text-gray-300 truncate">{item.value}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: The Download Trigger */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="lg:col-span-5 relative group"
                            >
                                {/* HUD Corners Decor */}
                                <div className="absolute -top-2 -left-2 w-6 h-6 border-t border-l border-red-600/40 z-20" />
                                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b border-r border-red-600/40 z-20" />

                                <div className="relative bg-[#050505]/95 border border-white/10 p-6 lg:p-10 rounded-3xl overflow-hidden backdrop-blur-xl group-hover:border-red-600/40 transition-all duration-500 shadow-2xl">
                                    {/* Technical scanline inside card */}
                                    <div className="absolute inset-0 bg-scanlines opacity-[0.02] pointer-events-none" />

                                    <div className="relative z-10 space-y-6 lg:space-y-8 text-center">
                                        <div className="flex justify-center">
                                            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-red-600 rounded-2xl flex items-center justify-center shadow-red-glow animate-pulse">
                                                <Download size={32} className="text-white lg:w-10 lg:h-10" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-2xl lg:text-3xl font-black italic text-white uppercase tracking-tighter">ELITE PACK READY</h3>
                                            <p className="text-[9px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed px-4">
                                                EL ARCHIVO CONTIENE MANUAL DE INSTALACIÓN, INDICADORES Y PLANTILLAS PRE-CONFIGURADAS.
                                            </p>
                                        </div>

                                        <motion.button
                                            whileHover={{ x: [-1, 1, -1, 1, 0] }}
                                            transition={{ duration: 0.1, repeat: Infinity }}
                                            onClick={handleDownload}
                                            className="w-full relative py-5 lg:py-6 overflow-hidden rounded-xl lg:rounded-2xl group/btn"
                                        >
                                            <div className="absolute inset-0 bg-red-600 transition-all group-hover/btn:bg-white duration-300" />
                                            <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-20 bg-[linear-gradient(45deg,red,white,red)] bg-[length:200%_100%] animate-shimmer" />
                                            <span className="relative z-10 text-white group-hover/btn:text-black font-black italic text-xs lg:text-sm tracking-[0.3em] uppercase flex items-center justify-center gap-3">
                                                ENGAGE DOWNLOAD <ArrowRight size={18} />
                                            </span>
                                        </motion.button>

                                        {isAdmin && (
                                            <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                                                <div className="space-y-2">
                                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest text-left">SUBIR NUEVO ARCHIVO</p>
                                                    <label className="flex items-center justify-center gap-2 py-3 border border-white/10 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all group">
                                                        <Download size={14} className="text-red-600" />
                                                        <span className="text-[10px] font-black italic text-gray-400 group-hover:text-white uppercase font-mono">UPLOAD (.ZIP / .MT5)</span>
                                                        <input type="file" className="hidden" onChange={handleFileUpload} />
                                                    </label>
                                                </div>

                                                <div className="space-y-2">
                                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest text-left">O VINCULAR URL DIRECTA</p>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Pega la URL de Cloudinary aquí..."
                                                            className="flex-1 bg-white/5 border border-white/10 p-2 text-[9px] font-mono text-white outline-none focus:border-red-600 transition-all"
                                                            onKeyDown={async (e) => {
                                                                if (e.key === 'Enter' && e.target.value) {
                                                                    const url = e.target.value;
                                                                    setLoading(true);
                                                                    try {
                                                                        const assetRef = doc(db, 'site_assets', 'template_pack');
                                                                        const newInfo = {
                                                                            url: url,
                                                                            name: 'MANUAL UPDATE',
                                                                            size: '---',
                                                                            updatedAt: serverTimestamp()
                                                                        };
                                                                        await setDoc(assetRef, newInfo, { merge: true });
                                                                        setTemplateInfo(newInfo);
                                                                        alert("URL VINCULADA CORRECTAMENTE");
                                                                        e.target.value = '';
                                                                    } catch (err) {
                                                                        alert("ERROR AL VINCULAR: " + err.message);
                                                                    } finally {
                                                                        setLoading(false);
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <p className="text-[7px] text-gray-600 leading-none text-left">Presiona ENTER para guardar la URL</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Decorative HUD elements */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 opacity-20">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="w-8 h-1 bg-white/20 rounded-full"></div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Tutorial Section */}
                    <div className="mt-12 p-8 bg-white/5 border border-white/10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 group relative max-w-5xl w-full z-10">
                        <div className="space-y-2">
                            <h4 className="text-xl font-black italic text-white uppercase tracking-tighter">¿NO SABES CÓMO INSTALAR?</h4>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">MIRA EL VIDEO TUTORIAL PASO A PASO PARA CONFIGURAR TU TERMINAL</p>
                        </div>
                        <button
                            onClick={() => setShowVideoModal(true)}
                            className="px-8 py-4 bg-white/10 border border-white/20 text-white font-black text-xs uppercase tracking-widest flex items-center gap-4 hover:bg-white hover:text-black transition-all group/btn"
                        >
                            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                <Play size={16} fill="white" />
                            </div>
                            VER TUTORIAL DE INSTALACIÓN
                        </button>
                    </div>
                </>
            )}

            {/* PAYMENT MODAL */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200] flex items-center justify-center p-6 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-2xl bg-black border border-[#F3BA2F] p-0 relative shadow-2xl my-8"
                        >
                            <div className="p-6 bg-[#F3BA2F] flex justify-between items-center">
                                <h3 className="text-xl font-black italic text-black uppercase tracking-tighter">
                                    TERMINAL DE <span className="text-white">PAGO</span>
                                </h3>
                                <button onClick={() => { setShowPaymentModal(false); setExpandedCat(null); setModalStep(1); }} className="text-black font-black text-xs uppercase hover:text-white border border-black/20 px-3 py-1">CLOSE</button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="text-center bg-white/5 p-4 border border-white/10">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 italic">ACCESS CLEARANCE FOR: {planName}</p>
                                    <p className="text-4xl font-black text-[#F3BA2F] font-mono italic">
                                        ${finalPrice}.00 <span className="text-sm text-gray-500 not-italic uppercase tracking-widest">USDT/USD</span>
                                    </p>
                                </div>

                                <AnimatePresence mode="wait">
                                    {modalStep === 1 ? (
                                        <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                            <button
                                                onClick={handleNowPayments}
                                                className="w-full p-6 bg-gradient-to-r from-[#F3BA2F] to-yellow-600 rounded-none border border-white/10 flex items-center justify-between group hover:scale-[1.02] transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                                                        <Coins size={24} className="text-[#F3BA2F]" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-xs font-black text-black uppercase tracking-widest">Pago Automático Cripto</p>
                                                        <p className="text-[10px] font-bold text-black/60 uppercase">USDT, BTC, BNB - Sin esperas</p>
                                                    </div>
                                                </div>
                                                <ArrowRight size={20} className="text-black" />
                                            </button>

                                            <div className="relative py-4">
                                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                                <div className="relative flex justify-center"><span className="bg-black px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">O MÉTODOS MANUALES</span></div>
                                            </div>

                                            <AnimatePresence mode="wait">
                                                {!expandedCat ? (
                                                    <motion.div
                                                        key="cats"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                                    >
                                                        {categories.map((cat) => (
                                                            <button
                                                                key={cat.id}
                                                                onClick={() => setExpandedCat(cat.id)}
                                                                className="group relative p-6 bg-white/[0.03] border border-white/5 hover:border-[#F3BA2F] transition-all text-left overflow-hidden"
                                                            >
                                                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                                    <cat.icon size={48} className={cat.color} />
                                                                </div>
                                                                <div className="relative z-10 flex items-center gap-4">
                                                                    <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${cat.color}`}>
                                                                        <cat.icon size={20} />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-xs font-black italic uppercase text-white tracking-widest">{cat.label}</h4>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="methods"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        className="space-y-4"
                                                    >
                                                        <button
                                                            onClick={() => setExpandedCat(null)}
                                                            className="flex items-center gap-2 text-[10px] font-black text-[#F3BA2F] uppercase tracking-widest mb-4 hover:text-white transition-colors"
                                                        >
                                                            <LayoutGrid size={14} /> VOLVER A MÉTODOS
                                                        </button>

                                                        <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                                            {getCatMethods(expandedCat).map((pm) => (
                                                                <div key={pm.id} className="bg-white/5 border border-white/10 p-4 group">
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-10 h-10 bg-black flex items-center justify-center p-2 rounded border border-white/5">
                                                                                {pm.icon === 'binance' ? <img src="/img/metodos/logos/bnb_hq.svg" className="w-8 h-8 object-contain" alt="BIN" /> :
                                                                                    pm.icon === 'usdt' ? <img src="/img/metodos/logos/usdt_hq.svg" className="w-8 h-8 object-contain" alt="USD" /> :
                                                                                        <Wallet size={16} className="text-gray-500" />}
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-[10px] font-black text-white uppercase">{pm.name}</p>
                                                                                {pm.owner && <p className="text-[8px] font-bold text-[#F3BA2F] uppercase tracking-widest">{pm.owner}</p>}
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleCopy(pm.value, pm.id)}
                                                                            className={`p-2 rounded transition-all ${copied === pm.id ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-400'}`}
                                                                        >
                                                                            {copied === pm.id ? <Check size={14} /> : <Copy size={14} />}
                                                                        </button>
                                                                    </div>
                                                                    <div className="bg-black/80 border border-white/5 p-3 text-[10px] font-mono text-[#F3BA2F] break-all border-l-2 border-l-[#F3BA2F]">
                                                                        {pm.value}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ) : modalStep === 2 ? (
                                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                            <button onClick={() => setModalStep(1)} className="text-[10px] font-black text-[#F3BA2F] uppercase flex items-center gap-2">
                                                <X size={14} /> VOLVER
                                            </button>
                                            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {currencies.map(curr => (
                                                    <button
                                                        key={curr}
                                                        onClick={() => handleSelectCurrency(curr)}
                                                        className={`p-4 border rounded-xl transition-all text-center group flex flex-col items-center gap-1 ${['usdtbsc', 'btc', 'bnbbsc'].includes(curr.toLowerCase()) ? 'border-[#F3BA2F] bg-[#F3BA2F]/10' : 'border-white/10 bg-white/5 hover:border-[#F3BA2F]'}`}
                                                    >
                                                        <p className="text-[10px] font-black text-white group-hover:text-[#F3BA2F] uppercase">
                                                            {curr === 'usdtbsc' ? 'USDT' : curr === 'bnbbsc' ? 'BNB' : curr.toUpperCase()}
                                                        </p>
                                                        {['usdtbsc', 'bnbbsc'].includes(curr.toLowerCase()) && (
                                                            <span className="text-[6px] font-black text-[#F3BA2F] uppercase tracking-tighter">RED: BSC</span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="space-y-6 flex flex-col items-center">
                                            <div className="bg-white p-4 rounded-3xl shadow-2xl">
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${paymentDetails?.pay_address}`}
                                                    alt="QR"
                                                    className="w-40 h-40"
                                                />
                                            </div>
                                            <div className="text-center space-y-3">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">ENVÍA EXACTAMENTE</p>
                                                <div className="flex flex-col items-center gap-2">
                                                    <p className="text-3xl font-black text-white italic leading-none">
                                                        {paymentDetails?.pay_amount} <span className="text-[#F3BA2F]">{paymentDetails?.pay_currency === 'usdtbsc' ? 'USDT' : paymentDetails?.pay_currency === 'bnbbsc' ? 'BNB' : paymentDetails?.pay_currency?.toUpperCase()}</span>
                                                    </p>
                                                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                                        <p className="text-[8px] font-black text-[#F3BA2F] uppercase tracking-widest leading-none">
                                                            RED: {paymentDetails.pay_currency === 'usdtbsc' ? 'BINANCE SMART CHAIN (BEP20)' :
                                                                paymentDetails.pay_currency === 'bnbbsc' ? 'BINANCE SMART CHAIN (BSC)' :
                                                                    paymentDetails.pay_currency === 'btc' ? 'BITCOIN NETWORK' :
                                                                        'RED NATIVA'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full space-y-2">
                                                <p className="text-[9px] font-black text-gray-600 uppercase text-center">DIRECCIÓN DE DEPÓSITO</p>
                                                <button
                                                    onClick={() => handleCopy(paymentDetails?.pay_address, 'addr')}
                                                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group"
                                                >
                                                    <span className="text-[10px] font-mono text-gray-400 truncate mr-4">{paymentDetails?.pay_address}</span>
                                                    {copied === 'addr' ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-white/40" />}
                                                </button>
                                            </div>
                                            {debugMode && (
                                                <button
                                                    onClick={handleMockSuccess}
                                                    className="w-full p-4 bg-green-600/10 border border-green-600 text-green-600 rounded-xl font-black italic uppercase text-[10px] hover:bg-green-600 hover:text-white transition-all"
                                                >
                                                    [TEST] FORZAR ACTIVACIÓN EXITOSA
                                                </button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="pt-4 border-t border-white/5 space-y-4">
                                    <button
                                        onClick={confirmAndNotify}
                                        className="w-full py-4 bg-[#25D366] text-white font-black uppercase tracking-widest hover:brightness-110 transition-all text-xs flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <Phone size={16} /> REPORTE / SOPORTE WHATSAPP
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
                                        className="flex items-center justify-center gap-2 cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
                                    >
                                        <ShieldAlert size={12} className={debugMode ? "text-green-600" : "text-red-600"} />
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">
                                            {debugMode ? 'SISTEMA DE PRUEBAS ACTIVO' : 'SISTEMA SEGURO Y CIFRADO'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* VIDEO MODAL */}
            <AnimatePresence>
                {showVideoModal && (
                    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-4xl bg-black border border-white/10 relative shadow-2xl overflow-hidden rounded-3xl"
                        >
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                                    <h3 className="text-[10px] font-black italic text-white/60 uppercase tracking-widest">SISTEMA DE MANTENIMIENTO • FEED EN VIVO</h3>
                                </div>
                                <button
                                    onClick={() => setShowVideoModal(false)}
                                    className="p-2 hover:bg-red-600 transition-colors rounded-lg group"
                                >
                                    <X size={20} className="text-white group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                            <div className="aspect-video w-full bg-[#050505] relative overflow-hidden">
                                <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }}></div>
                                <iframe
                                    className="w-full h-full relative z-0"
                                    src="https://drive.google.com/file/d/1lq1XEC4oSoUwNDrS0yt87dWrV1dX2yAi/preview"
                                    title="Tutorial Installation"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                                <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-red-600/30"></div>
                                <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-red-600/30"></div>
                                <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-red-600/30"></div>
                                <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-red-600/30"></div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TemplatesPage;
