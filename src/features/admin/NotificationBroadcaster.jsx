import React, { useState } from 'react';
import { Bell, Send, RefreshCw, Users, ShieldAlert, Zap } from 'lucide-react';
import { auth } from '../../firebase';
import TacticalSelect from '../../components/TacticalSelect';

const NotificationBroadcaster = () => {
    const [notifForm, setNotifForm] = useState({ title: '', body: '', type: 'ALERT', target: 'EVERYONE' });
    const [loading, setLoading] = useState(false);

    const TYPE_OPTIONS = [
        { value: 'ALERT', label: '🔴 ALERTA TÁCTICA' },
        { value: 'SIGNAL', label: '🔥 NUEVA SEÑAL' },
        { value: 'PROMO', label: '💎 OFERTA PREMIUM' },
        { value: 'SYSTEM', label: '⚙️ ACTUALIZACIÓN DE SISTEMA' },
    ];

    const handleSend = async (e) => {
        e.preventDefault();
        if (!notifForm.title || !notifForm.body) return;
        setLoading(true);
        try {
            const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
            if (!token) throw new Error("NO AUTORIZADO: FALTA EL TOKEN DEL COMANDANTE");

            const response = await fetch('https://indexgeniusacademy.com/api/broadcast', {
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

            if (!response.ok) throw new Error("TRANSMISIÓN FALLIDA");

            alert("TRANSMISIÓN TÁCTICA EJECUTADA CON ÉXITO");
            setNotifForm({ title: '', body: '', type: 'ALERT', target: 'EVERYONE' });
        } catch (err) {
            alert("ERROR CRÍTICO: " + err.message);
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
                    <h3 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">DIFUSOR DE NOTIFICACIONES PERSONALIZADAS</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Enlace Directo Push a Operadores Registrados</p>
                </div>
            </div>

            <form onSubmit={handleSend} className="bg-black border border-white/5 p-8 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl group-hover:bg-red-600/10 transition-all"></div>

                <div className="space-y-4 relative z-10">
                    <TacticalSelect
                        label="TIPO DE TRANSMISIÓN"
                        options={TYPE_OPTIONS}
                        value={notifForm.type}
                        onChange={val => setNotifForm({ ...notifForm, type: val })}
                    />

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">TÍTULO DE LA TRANSMISIÓN</label>
                        <input
                            placeholder="ej. ACELERACIÓN DE MISIÓN"
                            value={notifForm.title}
                            onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 p-4 text-xs font-black text-white uppercase outline-none focus:border-red-600/50 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">CUERPO DEL MENSAJE</label>
                        <textarea
                            placeholder="Escribe los detalles tácticos de esta transmisión..."
                            value={notifForm.body}
                            onChange={e => setNotifForm({ ...notifForm, body: e.target.value })}
                            className="w-full h-32 bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none focus:border-red-600/50 transition-all resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-red-950/20 border border-red-900/40">
                        <ShieldAlert className="text-red-600 shrink-0" size={20} />
                        <p className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed">
                            <span className="text-white">ADVERTENCIA:</span> Esta transmisión activará una notificación push a <span className="text-red-600 font-black">TODAS LAS UNIDADES REGISTRADAS</span>. Verifica la información antes de la autorización.
                        </p>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-5 bg-red-600 text-white font-black italic text-xs tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 shadow-red-glow"
                    >
                        {loading ? <RefreshCw className="animate-spin" /> : <Send size={16} />}
                        {loading ? 'TRANSMITIENDO...' : 'AUTORIZAR TRANSMISIÓN'}
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
