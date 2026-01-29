import React, { useState } from 'react';
import { Edit2, Shield, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const ProfilePage = ({ user }) => {
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);
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
    const isAdmin = user?.canBroadcast || user?.email?.toLowerCase() === 'admin' || user?.email?.toLowerCase() === 'steven@ingenius.fx';
    const currentAvatar = user?.photoURL || (isAdmin ? "/img/avatars/avatar_admin.png" : "/img/avatars/avatar_male.png");

    const updateAvatar = async (url) => {
        try {
            await updateDoc(doc(db, "users", user.uid), { photoURL: url });
            setShowAvatarMenu(false);
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="relative group">
                    <div onClick={() => setShowAvatarMenu(!showAvatarMenu)} className="w-56 h-56 bg-red-600/20 p-1 rounded-full cursor-pointer relative overflow-visible border-2 border-red-600 shadow-red-glow">
                        <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded-full transition-all"><Edit2 size={32} /></div>
                        {showAvatarMenu && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 mt-4 bg-black border border-white/20 p-4 z-50 grid grid-cols-3 gap-2 shadow-2xl min-w-[300px]">
                                {avatars.map(av => (
                                    <button key={av.id} onClick={() => updateAvatar(av.url)} className={`aspect-square border-2 rounded-full overflow-hidden ${currentAvatar === av.url ? 'border-red-600' : 'border-white/5'}`}>
                                        <img src={av.url} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </motion.div>
                        )}
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
        </div>
    );
};

export default ProfilePage;
