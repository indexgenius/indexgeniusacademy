import React, { useState } from 'react';
import { Edit2, Shield, Crown, Zap, Star, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const ProfilePage = ({ user, onUpgradeInitiated }) => {
    const PLANS_INFO = [
        { id: 'index-one', name: 'INDEX ONE', price: 60, icon: <Zap size={20} />, period: '/ mensual', features: ['IndexGenius App', 'Señales en tiempo real', 'Curso Básico'], color: 'from-white/10 to-transparent' },
        { id: 'index-pro', name: 'INDEX PRO', price: 150, icon: <Crown size={24} />, period: '/ mensual', features: ['Curso Completo', 'Plantilla IndexPro', 'Grupo Privado', 'Masterclass'], color: 'from-red-600/20 to-transparent', popular: true },
        { id: 'index-black', name: 'INDEX BLACK', price: 500, icon: <Star size={20} />, period: 'pago único', features: ['Mentoría 1-on-1', 'Plan Escalamiento', 'Grupo BLACK', 'Cupos Limitados'], color: 'from-neutral-800/40 to-black' }
    ];

    const userPlanId = user?.planId || 'index-one';
    const currentPrice = PLANS_INFO.find(p => p.id === userPlanId)?.price || 60;
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);
    const [uploading, setUploading] = useState(false);
    const CLOUDINARY_CLOUD_NAME = "ddfx8syri";
    const CLOUDINARY_UPLOAD_PRESET = "perfil_users";

    const avatars = [
        { id: 'male', url: '/img/avatars/avatar_male.png', label: 'OPERATOR M' },
        { id: 'female', url: '/img/avatars/avatar_female.png', label: 'OPERATOR F' },
        { id: 'admin', url: '/img/avatars/avatar_admin.png', label: 'ELITE COMMANDER', restricted: true },
        { id: 'avatar1', url: '/img/avatars/avatar1.png', label: 'TRADER 1' },
        { id: 'avatar2', url: '/img/avatars/avatar2.png', label: 'TRADER 2' },
        { id: 'avatar3', url: '/img/avatars/avatar3.png', label: 'TRADER 3' },
    ];

    const displayName = user?.displayName || user?.email?.split('@')[0] || 'TRADER';
    const memberId = user?.uid ? user.uid.substring(0, 8).toUpperCase() : 'UNKNOWN';
    const isAdmin = user?.canBroadcast || user?.email?.toLowerCase() === 'admin' || user?.email?.toLowerCase() === 'steven@ingenius.fx' || user?.email?.toLowerCase() === 'jeilin@jeilin.com';
    const currentAvatar = user?.photoURL || (isAdmin ? "/img/avatars/avatar_admin.png" : "/img/avatars/avatar_male.png");

    const updateAvatar = async (url) => {
        try {
            await updateDoc(doc(db, "users", user.uid), { photoURL: url });
            setShowAvatarMenu(false);
        } catch (e) { console.error(e); }
    };

    const handleImageUpload = async (e) => {
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

            if (!res.ok) {
                throw new Error(data.error?.message || "Error en la carga");
            }

            if (data.secure_url) {
                await updateAvatar(data.secure_url);
            }
        } catch (err) {
            console.error("Cloudinary Upload Error:", err);
            alert(`Error de Cloudinary: ${err.message}. \n\nAsegúrate de que el 'Upload Preset' sea UNSIGNED en tu consola de Cloudinary.`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="relative group">
                    <div onClick={() => !uploading && setShowAvatarMenu(!showAvatarMenu)} className="w-56 h-56 bg-red-600/20 p-1 rounded-full cursor-pointer relative overflow-visible border-2 border-red-600 shadow-red-glow">
                        <img src={currentAvatar} alt="Profile" className={`w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all ${uploading ? 'opacity-30' : ''}`} />
                        {uploading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded-full transition-all">
                                <Edit2 size={32} />
                            </div>
                        )}

                        <AnimatePresence>
                            {showAvatarMenu && !uploading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 mt-4 bg-black border border-white/20 p-6 z-50 shadow-2xl min-w-[320px]"
                                >
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">SELECCIONAR AVATAR</p>
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        {avatars.map(av => (
                                            <button key={av.id} onClick={() => updateAvatar(av.url)} className={`aspect-square border-2 rounded-full overflow-hidden transition-all hover:scale-110 ${currentAvatar === av.url ? 'border-red-600 shadow-red-glow' : 'border-white/5'}`}>
                                                <img src={av.url} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>

                                    <div className="border-t border-white/10 pt-4">
                                        <label className="flex items-center justify-center gap-3 px-4 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white hover:text-red-600 transition-all">
                                            <Edit2 size={14} /> SUBIR IMAGEN PROPIA
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-red-600 p-4 border-2 border-black z-10">{isAdmin ? <Crown /> : <Shield />}</div>
                </div>

                <div className="text-center lg:text-left flex-1">
                    <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase">{displayName}</h2>
                    <div className="flex items-center gap-4 mt-4">
                        <span className="text-[10px] font-black tracking-widest text-red-600 uppercase border border-red-600 px-3 py-1">{isAdmin ? 'ELITE COMMANDER' : 'PRIORITY OPERATOR'}</span>
                        <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase">STATUS: <span className="text-green-500">ACTIVE</span> • RANK #{isAdmin ? '1' : memberId.substring(0, 2)}</p>
                    </div>
                </div>
            </div>

            {/* SUBSCRIPTION MANAGEMENT */}
            <div className="space-y-8">
                <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">NIVEL DE <span className="text-red-600">MEMBRESÍA</span></h3>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">GESTIONA TU ACCESO Y MEJORA TU TERMINAL</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLANS_INFO.map(plan => {
                        const isCurrent = userPlanId === plan.id;
                        const canUpgrade = plan.price > currentPrice && !isAdmin;
                        const differential = Math.max(0, plan.price - currentPrice);

                        return (
                            <motion.div
                                key={plan.id}
                                whileHover={{ y: -5 }}
                                className={`relative group p-8 border ${isCurrent ? 'border-red-600 bg-red-600/5' : 'border-white/5 bg-white/[0.02]'} flex flex-col`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-black px-4 py-1 italic uppercase tracking-widest z-10">MÁS POPULAR</div>
                                )}

                                <div className="flex justify-between items-start mb-8">
                                    <div className={`w-12 h-12 flex items-center justify-center ${isCurrent ? 'text-red-600' : 'text-gray-600'}`}>
                                        {plan.icon}
                                    </div>
                                    {isCurrent && (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-600/30">
                                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                                            <span className="text-[9px] font-black text-red-600 uppercase">ACTIVO</span>
                                        </div>
                                    )}
                                </div>

                                <h4 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-2">{plan.name}</h4>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-black italic text-white">${plan.price}</span>
                                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{plan.period}</span>
                                </div>

                                <ul className="space-y-4 mb-10 flex-1">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <CheckCircle2 size={14} className={isCurrent ? 'text-red-600' : 'text-gray-700'} />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                {canUpgrade ? (
                                    <button
                                        onClick={() => onUpgradeInitiated && onUpgradeInitiated(plan.id, differential)}
                                        className="w-full py-4 bg-white/5 border border-white/10 hover:border-red-600 hover:bg-red-600 hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 italic group/btn"
                                    >
                                        MEJORAR POR ${differential} <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className={`w-full py-4 border ${isCurrent ? 'border-red-600/30 text-red-600/50' : 'border-white/5 text-gray-800'} text-[11px] font-black uppercase tracking-[0.3em] italic`}
                                    >
                                        {isCurrent ? 'PLAN ACTUAL' : 'LIMITADO'}
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
