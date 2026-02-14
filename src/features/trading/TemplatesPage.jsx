import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Key, ShieldAlert, Zap, MessageSquare, CreditCard, Download, Copy, Wallet, Landmark, Smartphone, LayoutGrid, Check, Phone, ArrowRight, Play, X } from 'lucide-react';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, collection, onSnapshot, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

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
        name: 'V4.5 ELITE',
        size: '84.2 MB'
    });

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

    // Calculate price based on broker
    const isBridge = userBroker === 'bridge';
    const finalPrice = isBridge ? 35 : 75;
    const planName = isBridge ? 'MEMBER ACCESS' : 'EXTERNAL BROKER';
    const isAdmin = user?.canBroadcast || user?.email?.toLowerCase() === 'admin' || user?.email?.toLowerCase() === 'steven@ingenius.fx' || user?.email?.toLowerCase() === 'jeilin@jeilin.com' || user?.email?.toLowerCase() === 'pipoapaza@gmail.com';

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
        // Using the same preset and cloud name as ProfilePage for consistency
        formData.append("upload_preset", "perfil_users");

        try {
            // Determine resource type: images go to /image/upload, others to /raw/upload
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

    const categories = [
        { id: 'CRIPTO', label: 'CRIPTOMONEDAS', icon: Wallet, color: 'text-orange-500' },
        { id: 'BANCO', label: 'TRANSFERENCIA BANCARIA', icon: Landmark, color: 'text-blue-500' },
        { id: 'APP', label: 'APLICACIONES DIGITALES', icon: Smartphone, color: 'text-purple-500' },
    ];

    const getCatMethods = (catId) => paymentMethods.filter(pm => pm.category === catId);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            {!unlocked ? (
                /* --- LOCKED VIEW --- */
                <div className="max-w-6xl w-full flex flex-col gap-6 lg:gap-12">
                    <div className="text-center space-y-2 lg:space-y-4">
                        <h2 className="text-3xl lg:text-7xl font-black italic tracking-tighter text-white uppercase leading-none">
                            TEMPLATES <span className="text-red-600">VAULT</span>
                        </h2>
                        <p className="text-[8px] lg:text-[10px] font-black text-gray-500 tracking-[0.4em] uppercase">SYSTEM CLEARANCE REQUIRED FOR DEPLOYMENT</p>
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
                                        <span className="text-[8px] lg:text-[10px] font-black text-white tracking-widest uppercase italic">ACQUISITION MODULE</span>
                                    </div>
                                    <h3 className="text-2xl lg:text-3xl font-black italic text-white uppercase tracking-tighter">
                                        PURCHASE <br /><span className="text-red-600">FULL ACCESS</span>
                                    </h3>
                                </div>

                                <div className="space-y-4 lg:space-y-6">
                                    <div className="p-4 lg:p-6 bg-white/5 border border-white/5 rounded-xl lg:rounded-2xl">
                                        <div className="flex justify-between items-center mb-2 lg:mb-4">
                                            <span className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest">MEMBERSHIP TYPE</span>
                                            <span className="px-2 py-0.5 lg:px-3 lg:py-1 bg-red-600 text-[6px] lg:text-[8px] font-black text-white uppercase rounded-full">{planName}</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl lg:text-5xl font-black text-white italic">${finalPrice}</span>
                                            <span className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase">USDT • ONE TIME</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 lg:gap-6 opacity-40">
                                        <img src="https://cryptologos.cc/logos/tether-usdt-logo.png?v=026" className="h-4 lg:h-5" alt="USDT" />
                                        <img src="https://cryptologos.cc/logos/binance-coin-bnb-logo.png?v=026" className="h-4 lg:h-5" alt="BNB" />
                                        <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=026" className="h-4 lg:h-5" alt="BTC" />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="relative z-10 w-full py-4 lg:py-6 bg-white text-black font-black uppercase tracking-[0.3em] italic text-[10px] lg:text-xs rounded-xl lg:rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-xl"
                            >
                                INITIATE PAYMENT PROTOCOL
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
                                    <p className="text-[8px] lg:text-[9px] font-bold text-gray-600 tracking-widest uppercase">INPUT CLEARANCE CORE</p>
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
                                        {loading ? 'VALIDATING...' : 'DECRYPT & UNLOCK'}
                                        {!loading && <Unlock size={16} className="lg:w-[18px]" />}
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
                <div className="w-full max-w-5xl animate-in fade-in duration-700">
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
                                    className="text-4xl lg:text-8xl font-black italic tracking-tighter text-white uppercase leading-[0.9]"
                                >
                                    INDEX <span className="text-red-600">GENIUS</span> <br />
                                    <span className="text-transparent border-t-2 border-white/10 pt-2 block">TERMINAL</span>
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-gray-500 font-bold tracking-widest text-[10px] lg:text-xs uppercase max-w-lg leading-relaxed italic"
                                >
                                    "DESCARGA EL ALGORITMO DE ALTA PRECISIÓN C4. DISEÑADO PARA DOMINAR EL MERCADO DE ÍNDICES SINTÉTICOS CON PRECISIÓN INSTITUCIONAL."
                                </motion.p>
                            </div>

                            <div className="grid grid-cols-3 gap-3 lg:gap-4">
                                {[
                                    { label: 'VERSION', val: templateInfo?.name || 'V4.5 ELITE' },
                                    { label: 'FORMAT', val: 'MT5 / .ZIP' },
                                    { label: 'FILE SIZE', val: templateInfo?.size || '84.2 MB' },
                                ].map((stat, i) => (
                                    <div key={i} className="p-3 lg:p-4 bg-white/5 border border-white/5">
                                        <p className="text-[6px] lg:text-[8px] font-black text-gray-600 tracking-widest mb-1 uppercase">{stat.label}</p>
                                        <p className="text-xs lg:text-sm font-black text-white italic">{stat.val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: The Download Trigger */}
                        <div className="lg:col-span-5">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="relative bg-[#0a0a0a] border border-white/10 p-1 rounded-3xl overflow-hidden shadow-2xl"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent pointer-events-none"></div>

                                <div className="p-8 space-y-8 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-red-glow">
                                            <Download className="text-white" size={24} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-red-600 tracking-widest uppercase">STEVEN CASTILLO</p>
                                            <p className="text-[9px] font-bold text-gray-600 tracking-widest uppercase">CHIEF DEVELOPER</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xl font-black italic text-white uppercase tracking-tighter">ELITE PACK READY</h4>
                                        <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase tracking-widest italic">
                                            EL ARCHIVO CONTIENE MANUAL DE INSTALACIÓN, INDICADORES Y PLANTILLAS PRE-CONFIGURADAS.
                                        </p>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleDownload}
                                        className="group relative w-full py-6 bg-red-600 text-white font-black italic tracking-[0.3em] uppercase text-xs overflow-hidden rounded-2xl shadow-red-glow transition-all hover:bg-white hover:text-black"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            ENGAGE DOWNLOAD <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    </motion.button>

                                    {isAdmin && (
                                        <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                                            <div className="space-y-2">
                                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">SUBIR NUEVO ARCHIVO</p>
                                                <label className="flex items-center justify-center gap-2 py-3 border border-white/10 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all group">
                                                    <Download size={14} className="text-red-600" />
                                                    <span className="text-[10px] font-black italic text-gray-400 group-hover:text-white uppercase font-mono">UPLOAD (.ZIP / .MT5)</span>
                                                    <input type="file" className="hidden" onChange={handleFileUpload} />
                                                </label>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">O VINCULAR URL DIRECTA</p>
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
                                                <p className="text-[7px] text-gray-600 leading-none">Presiona ENTER para guardar la URL</p>
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
                            </motion.div>
                        </div>

                    </div>

                    {/* Tutorial Section */}
                    <div className="mt-12 p-8 bg-white/5 border border-white/10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 group">
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
                </div>
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
                                <button onClick={() => { setShowPaymentModal(false); setExpandedCat(null); }} className="text-black font-black text-xs uppercase hover:text-white border border-black/20 px-3 py-1">CLOSE</button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="text-center bg-white/5 p-4 border border-white/10">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 italic">ACCESS CLEARANCE FOR: {planName}</p>
                                    <p className="text-4xl font-black text-[#F3BA2F] font-mono italic">
                                        ${finalPrice}.00 <span className="text-sm text-gray-500 not-italic uppercase tracking-widest">USDT/USD</span>
                                    </p>
                                </div>

                                <AnimatePresence mode="wait">
                                    {!expandedCat ? (
                                        <motion.div
                                            key="cats"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
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
                                                                    {pm.icon === 'binance' ? <img src="/img/metodos/logos/Binance-Vertical-Logo.wine.svg" className="w-8 h-8 object-contain" alt="BIN" /> :
                                                                        pm.icon === 'usdt' ? <img src="/img/metodos/logos/Tether_Logo.svg.png" className="w-8 h-8 object-contain" alt="USD" /> :
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

                                <div className="pt-4 border-t border-white/5 space-y-4">
                                    <button
                                        onClick={confirmAndNotify}
                                        className="w-full py-4 bg-[#25D366] text-white font-black uppercase tracking-widest hover:brightness-110 transition-all text-xs flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <Phone size={16} /> REPORTE / SOPORTE WHATSAPP
                                    </button>
                                    <p className="text-[9px] text-center text-gray-500 leading-relaxed uppercase tracking-widest">
                                        Once payment is sent, send the screenshot to our command center to receive your Access Key.
                                    </p>
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
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h3 className="text-xs font-black italic text-white uppercase tracking-widest">GUÍA DE INSTALACIÓN • INDEX GENIUS</h3>
                                <button
                                    onClick={() => setShowVideoModal(false)}
                                    className="p-2 hover:bg-red-600 transition-colors rounded-lg"
                                >
                                    <X size={20} className="text-white" />
                                </button>
                            </div>
                            <div className="aspect-video w-full bg-black">
                                {/* Placeholder for the video - You can change the URL to your actual tutorial */}
                                <iframe
                                    className="w-full h-full"
                                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                                    title="Tutorial Installation"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TemplatesPage;
