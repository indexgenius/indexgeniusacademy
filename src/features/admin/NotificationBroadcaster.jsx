import React, { useState } from 'react';
import { Bell, Send, RefreshCw, Users, ShieldAlert, Zap } from 'lucide-react';
import { auth } from '../../firebase';
import TacticalSelect from '../../components/TacticalSelect';

const NotificationBroadcaster = () => {
    const [notifForm, setNotifForm] = useState({ title: '', body: '', type: 'ALERT', target: 'EVERYONE' });
    const [loading, setLoading] = useState(false);

    const TYPE_OPTIONS = [
        { value: 'ALERT', label: '🔴 TACTICAL ALERT' },
        { value: 'SIGNAL', label: '🔥 NEW SIGNAL' },
        { value: 'PROMO', label: '💎 PREMIUM OFFER' },
        { value: 'SYSTEM', label: '⚙️ SYSTEM UPDATE' },
    ];

    const handleSend = async (e) => {
        e.preventDefault();
        if (!notifForm.title || !notifForm.body) return;
        setLoading(true);
        try {
            const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
            if (!token) throw new Error("UNAUTHORIZED: COMMANDER TOKEN MISSING");

            const response = await fetch('https://ingenus-fx.vercel.app/api/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: notifForm.title.toUpperCase(),
                    body: notifForm.body,
                    data: {
                        type: notifForm.type,
                        timestamp: Date.now()
                    }
                })
            });

            if (!response.ok) throw new Error("TRANSMISSION FAILED");

            alert("TACTICAL BROADCAST EXECUTED SUCCESSFULLY");
            setNotifForm({ title: '', body: '', type: 'ALERT', target: 'EVERYONE' });
        } catch (err) {
            alert("CRITICAL ERROR: " + err.message);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-xl mx-auto pt-8 space-y-8">
            <div className="flex items-center gap-4 border-b border-red-600/20 pb-6">
                <div className="w-12 h-12 bg-red-600 flex items-center justify-center shadow-red-glow">
                    <Bell className="text-white" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">CUSTOM NOTIFICATION BROADCASTER</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Direct Push Link to Registered Operators</p>
                </div>
            </div>

            <form onSubmit={handleSend} className="bg-black border border-white/5 p-8 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl group-hover:bg-red-600/10 transition-all"></div>

                <div className="space-y-4 relative z-10">
                    <TacticalSelect
                        label="TRANSMISSION TYPE"
                        options={TYPE_OPTIONS}
                        value={notifForm.type}
                        onChange={val => setNotifForm({ ...notifForm, type: val })}
                    />

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">BROADCAST TITLE</label>
                        <input
                            placeholder="e.g. MISSION ACCELERATION"
                            value={notifForm.title}
                            onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 p-4 text-xs font-black text-white uppercase outline-none focus:border-red-600/50 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">MESSAGE BODY</label>
                        <textarea
                            placeholder="Type the tactical details of this broadcast..."
                            value={notifForm.body}
                            onChange={e => setNotifForm({ ...notifForm, body: e.target.value })}
                            className="w-full h-32 bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none focus:border-red-600/50 transition-all resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-red-950/20 border border-red-900/40">
                        <ShieldAlert className="text-red-600 shrink-0" size={20} />
                        <p className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed">
                            <span className="text-white">WARNING:</span> This broadcast will trigger a push notification to <span className="text-red-600 font-black">ALL REGISTERED UNITS</span>. Verify intel before authorization.
                        </p>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-5 bg-red-600 text-white font-black italic text-xs tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 shadow-red-glow"
                    >
                        {loading ? <RefreshCw className="animate-spin" /> : <Send size={16} />}
                        {loading ? 'TRANSMITTING...' : 'AUTHORIZE BROADCAST'}
                    </button>
                </div>

                {/* Tactical grid background elements */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/10"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/10"></div>
            </form>
        </div>
    );
};

export default NotificationBroadcaster;
