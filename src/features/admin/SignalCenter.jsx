import React, { useState, useEffect } from 'react';
import { Radio, RefreshCw, Rocket, StopCircle, TrendingDown, ChevronDown, Clock, Trash2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { fetchPrice } from '../../utils/deriv';
import TacticalSelect from '../../components/TacticalSelect';

const SignalCenter = ({ broadcastSignal }) => {
    const [broker, setBroker] = useState('DERIV');
    const [signalForm, setSignalForm] = useState({ pair: 'BOOM 1000', type: 'BUY', entry: '', tp: '', sl: '', exitPrice: '', pips: '' });
    const [broadcasting, setBroadcasting] = useState(false);
    const [recentSignals, setRecentSignals] = useState([]);
    const [editingSignalId, setEditingSignalId] = useState(null);
    const [isHistorical, setIsHistorical] = useState(false);
    const [historicalStatus, setHistoricalStatus] = useState('WON');

    const PAIR_OPTIONS = broker === 'DERIV' ? [
        {
            label: "BOOM SERIES",
            options: [
                { value: "BOOM 1000", label: "BOOM 1000" },
                { value: "BOOM 900", label: "BOOM 900" },
                { value: "BOOM 600", label: "BOOM 600" },
                { value: "BOOM 500", label: "BOOM 500" },
                { value: "BOOM 300", label: "BOOM 300" },
            ]
        },
        {
            label: "CRASH SERIES",
            options: [
                { value: "CRASH 1000", label: "CRASH 1000" },
                { value: "CRASH 900", label: "CRASH 900" },
                { value: "CRASH 600", label: "CRASH 600" },
                { value: "CRASH 500", label: "CRASH 500" },
                { value: "CRASH 300", label: "CRASH 300" },
            ]
        }
    ] : [
        {
            label: "GAINX SERIES (VOLATILE/BULLISH)",
            options: [
                { value: "GainX 400", label: "GainX 400" },
                { value: "GainX 600", label: "GainX 600" },
                { value: "GainX 800", label: "GainX 800" },
                { value: "GainX 999", label: "GainX 999" },
                { value: "GainX 1200", label: "GainX 1200" },
            ]
        },
        {
            label: "BULLX SERIES (BOOM TYPE)",
            options: [
                { value: "BullX 1000", label: "BullX 1000" },
                { value: "BullX 900", label: "BullX 900" },
                { value: "BullX 777", label: "BullX 777" },
                { value: "BullX 500", label: "BullX 500" },
                { value: "BullX 400", label: "BullX 400" },
            ]
        },
        {
            label: "PAINX SERIES (VOLATILE/BEARISH)",
            options: [
                { value: "PainX 400", label: "PainX 400" },
                { value: "PainX 600", label: "PainX 600" },
                { value: "PainX 800", label: "PainX 800" },
                { value: "PainX 999", label: "PainX 999" },
                { value: "PainX 1200", label: "PainX 1200" },
            ]
        },
        {
            label: "BEARX SERIES (CRASH TYPE)",
            options: [
                { value: "BearX 1000", label: "BearX 1000" },
                { value: "BearX 900", label: "BearX 900" },
                { value: "BearX 777", label: "BearX 777" },
                { value: "BearX 500", label: "BearX 500" },
                { value: "BearX 400", label: "BearX 400" },
            ]
        }
    ];

    useEffect(() => {
        const unsubSignals = onSnapshot(query(collection(db, "signals"), orderBy("timestamp", "desc")), (snapshot) => {
            setRecentSignals(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).slice(0, 15));
        });
        return () => unsubSignals();
    }, []);

    // Price sync logic
    useEffect(() => {
        if (!signalForm.pair || broker !== 'DERIV') return;
        let isMounted = true;
        const symbol = signalForm.pair.replace(/\s+/g, '');
        const updatePrice = async () => {
            try {
                const price = await fetchPrice(symbol);
                if (isMounted) setSignalForm(prev => ({ ...prev, entry: price.toString() }));
            } catch (err) { console.error("Price sync error:", err); }
        };
        updatePrice();
        const interval = setInterval(updatePrice, 5000);
        return () => { isMounted = false; clearInterval(interval); };
    }, [signalForm.pair, broker]);

    const sendSignal = async (e) => {
        e.preventDefault();
        setBroadcasting(true);
        const msg = signalForm.type === 'BUY' ? `🔥 COMPRA ${signalForm.pair}` : `❄️ VENTA ${signalForm.pair}`;
        await broadcastSignal({
            id: editingSignalId,
            title: 'IndexGenius ACADEMY - SIGNAL',
            message: `${msg} @ ${signalForm.entry}`,
            pair: signalForm.pair,
            symbol: signalForm.pair.replace(/\s+/g, ''),
            type: signalForm.type === 'BUY' ? (broker === 'DERIV' ? 'BOOM' : 'BUY') : (broker === 'DERIV' ? 'CRASH' : 'SELL'),
            status: isHistorical ? historicalStatus : 'ACTIVE',
            entry: signalForm.entry.toString(),
            tp: signalForm.tp || '---',
            sl: signalForm.sl || '---',
            exitPrice: isHistorical ? signalForm.exitPrice.toString() : null,
            pips: isHistorical ? (signalForm.pips || null) : null,
            closedAt: isHistorical ? serverTimestamp() : null,
            broker: broker,
            silent: isHistorical
        });
        setSignalForm({ pair: broker === 'DERIV' ? 'BOOM 1000' : 'GainX 1200', type: 'BUY', entry: '', tp: '', sl: '', exitPrice: '', pips: '' });
        setEditingSignalId(null);
        setIsHistorical(false);
        setBroadcasting(false);
    };

    const quickSignal = async (pair, type) => {
        setBroadcasting(true);
        const isBuy = type === 'BUY';
        const msgPrefix = isBuy ? `🔥 COMPRA ${pair}` : `❄️ VENTA ${pair}`;
        const symbol = pair.replace(/\s+/g, '');
        let realPrice = 'MARKET';
        if (broker === 'DERIV') {
            try { realPrice = await fetchPrice(symbol); } catch (err) { console.error(err); }
        }
        await broadcastSignal({
            title: 'IndexGenius ACADEMY - SIGNAL',
            message: `${msgPrefix} @ ${realPrice} - ACCIÓN INMEDIATA!`,
            pair: pair,
            symbol: symbol,
            type: isBuy ? (broker === 'DERIV' ? 'BOOM' : 'BUY') : (broker === 'DERIV' ? 'CRASH' : 'SELL'),
            status: 'ACTIVE',
            entry: realPrice.toString(),
            tp: 'OPEN',
            sl: 'OPEN',
            broker: broker
        });
        setBroadcasting(false);
    };

    const deleteSignal = async (id) => {
        if (!confirm('¿ESTÁS SEGURO DE ELIMINAR ESTA SEÑAL?')) return;
        try {
            await deleteDoc(doc(db, "signals", id));
            // No alert needed if successful, the UI will update via snapshot
        } catch (error) {
            console.error("Error deleting signal:", error);
            alert("Error al eliminar la señal: " + error.message);
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pt-6">
            <div className="xl:col-span-8 space-y-8">
                {/* Broker Selector */}
                <div className="flex gap-4 p-1 bg-black/40 border border-white/10 max-w-sm">
                    <button
                        onClick={() => { setBroker('DERIV'); setSignalForm(prev => ({ ...prev, pair: 'BOOM 1000' })); }}
                        className={`flex-1 py-4 lg:py-3 text-[11px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${broker === 'DERIV' ? 'bg-red-600 text-white shadow-red-glow/40' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        PLATAFORMA DERIV
                    </button>
                    <button
                        onClick={() => { setBroker('WELTRADE'); setSignalForm(prev => ({ ...prev, pair: 'GainX 1200' })); }}
                        className={`flex-1 py-4 lg:py-3 text-[11px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${broker === 'WELTRADE' ? 'bg-blue-600 text-white shadow-blue-glow/40' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        WELTRADE GLOBAL
                    </button>
                </div>

                <div className="bg-black/80 border border-white/5 p-6 backdrop-blur-md relative overflow-hidden">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3 italic">
                        <div className="w-2 h-2 bg-red-600 animate-pulse"></div>
                        {editingSignalId ? 'ACTUALIZAR CONFIGURACIÓN DE SEÑAL' : `CONSTRUCTOR DE SEÑALES ${broker}`}
                    </h3>
                    <form onSubmit={sendSignal} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5 order-1 md:order-none">
                                <TacticalSelect
                                    label="ACTIVO OBJETIVO"
                                    options={PAIR_OPTIONS}
                                    value={signalForm.pair}
                                    onChange={val => setSignalForm({ ...signalForm, pair: val })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">OPERACIÓN</label>
                                <div className="flex gap-1 bg-black/40 p-1 border border-white/10">
                                    <button type="button" onClick={() => setSignalForm({ ...signalForm, type: 'BUY' })} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${signalForm.type === 'BUY' ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-white'}`}>{broker === 'DERIV' ? 'COMPRA (BOOM)' : 'COMPRA (LONG)'}</button>
                                    <button type="button" onClick={() => setSignalForm({ ...signalForm, type: 'SELL' })} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${signalForm.type === 'SELL' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-white'}`}>{broker === 'DERIV' ? 'VENTA (CRASH)' : 'VENTA (SHORT)'}</button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">PRECIO DE ENTRADA</label>
                                <input type="text" value={signalForm.entry} onChange={e => setSignalForm({ ...signalForm, entry: e.target.value })} className="w-full bg-white/5 border border-white/10 p-3 text-xs font-black text-white outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="TAKE PROFIT" value={signalForm.tp} onChange={e => setSignalForm({ ...signalForm, tp: e.target.value })} className="w-full bg-white/5 border border-white/10 p-3 text-xs font-black text-white outline-none" />
                            <input placeholder="STOP LOSS" value={signalForm.sl} onChange={e => setSignalForm({ ...signalForm, sl: e.target.value })} className="w-full bg-white/5 border border-white/10 p-3 text-xs font-black text-white outline-none" />
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 items-center bg-white/5 border border-white/10 p-4">
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isHistorical}
                                        onChange={(e) => setIsHistorical(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                                    <span className="ml-3 text-[10px] font-black text-white uppercase tracking-widest">MODO HISTORIAL (SILENCIOSO)</span>
                                </label>
                            </div>

                            {isHistorical && (
                                <div className="flex gap-2 w-full md:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => setHistoricalStatus('WON')}
                                        className={`flex-1 md:flex-none px-6 py-4 lg:py-2 text-[10px] lg:text-[9px] font-black uppercase tracking-widest transition-all border-2 ${historicalStatus === 'WON' ? 'bg-green-600 text-white border-green-400' : 'bg-black/60 text-gray-400 border-white/10'}`}
                                    >
                                        GANADA (WON)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setHistoricalStatus('LOST')}
                                        className={`flex-1 md:flex-none px-6 py-4 lg:py-2 text-[10px] lg:text-[9px] font-black uppercase tracking-widest transition-all border-2 ${historicalStatus === 'LOST' ? 'bg-red-600 text-white border-red-400' : 'bg-black/60 text-gray-400 border-white/10'}`}
                                    >
                                        PERDIDA (LOSS)
                                    </button>
                                </div>
                            )}

                            {isHistorical && (
                                <p className="text-[9px] font-bold text-yellow-500 italic opacity-80 flex-1 text-right">
                                    * ESTA SEÑAL NO ENVIARÁ NOTIFICACIONES PUSH
                                </p>
                            )}
                        </div>

                        {isHistorical && (
                            <div className="bg-yellow-600/10 border border-yellow-600/20 p-4 space-y-3">
                                <label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest ml-1">DATOS DE CIERRE (MANDATORIO PARA PIPS)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">PRECIO DE CIERRE (EXIT PRICE)</label>
                                        <input
                                            placeholder="EJ: 15828.62"
                                            value={signalForm.exitPrice}
                                            onChange={e => setSignalForm({ ...signalForm, exitPrice: e.target.value })}
                                            className="w-full bg-black/40 border border-yellow-600/30 p-3 text-xs font-black text-white outline-none focus:border-yellow-600"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">PIPS MANUALES (OPCIONAL)</label>
                                        <input
                                            placeholder="EJ: 45"
                                            value={signalForm.pips}
                                            onChange={e => setSignalForm({ ...signalForm, pips: e.target.value })}
                                            className="w-full bg-black/40 border border-yellow-600/30 p-3 text-xs font-black text-white outline-none focus:border-yellow-600"
                                        />
                                    </div>
                                </div>
                                <p className="text-[9px] text-gray-400 italic">
                                    * Deja PIPS en blanco si quieres que el sistema los calcule usando el Precio de Entrada y el Precio de Cierre.
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button disabled={broadcasting} className={`flex-1 py-5 text-white font-black italic text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4 ${broker === 'DERIV' ? 'bg-red-600' : 'bg-blue-600'}`}>
                                {broadcasting ? 'TRANSMITIENDO...' : (editingSignalId ? 'ACTUALIZAR SEÑAL' : 'EJECUTAR TRANSMISIÓN')}
                                {!broadcasting && <Rocket size={18} />}
                            </button>
                            {editingSignalId && (
                                <button onClick={() => { setEditingSignalId(null); setSignalForm({ pair: broker === 'DERIV' ? 'BOOM 1000' : 'GainX 1200', type: 'BUY', entry: '', tp: '', sl: '', exitPrice: '', pips: '' }); }} className="px-6 py-5 bg-white/5 border border-white/10 text-gray-500"><StopCircle /></button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {broker === 'DERIV' ? (
                        <>
                            <div className="bg-red-950/20 border border-red-900/40 p-5">
                                <p className="text-[10px] font-black text-red-600 uppercase mb-4 italic">ZONA TÁCTICA BOOM</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {['BOOM 1000', 'BOOM 900', 'BOOM 600', 'BOOM 500', 'BOOM 300'].map(p => (
                                        <button key={p} onClick={() => quickSignal(p, 'BUY')} className="py-4 bg-red-600/10 border border-red-600/20 text-xs font-black hover:bg-red-600 hover:text-white transition-all">{p.split(' ')[1]}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-blue-950/20 border border-blue-900/40 p-5">
                                <p className="text-[10px] font-black text-blue-500 uppercase mb-4 italic">ZONA TÁCTICA CRASH</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {['CRASH 1000', 'CRASH 900', 'CRASH 600', 'CRASH 500', 'CRASH 300'].map(p => (
                                        <button key={p} onClick={() => quickSignal(p, 'SELL')} className="py-4 bg-blue-600/10 border border-blue-600/20 text-xs font-black hover:bg-blue-600 hover:text-white transition-all">{p.split(' ')[1]}</button>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-blue-950/20 border border-blue-900/40 p-5 col-span-2">
                                <p className="text-[10px] font-black text-blue-500 uppercase mb-4 italic">ENTRADA RÁPIDA WELTRADE (GAINX/PAINX)</p>
                                <div className="grid grid-cols-4 lg:grid-cols-5 gap-2">
                                    {['GainX 400', 'GainX 600', 'GainX 800', 'GainX 999', 'GainX 1200', 'PainX 400', 'PainX 600', 'PainX 800', 'PainX 999', 'PainX 1200', 'BullX 1000', 'BullX 900', 'BullX 777', 'BullX 500', 'BullX 400', 'BearX 1000', 'BearX 900', 'BearX 777', 'BearX 500', 'BearX 400'].map(p => (
                                        <button key={p} onClick={() => quickSignal(p, (p.startsWith('G') || p.startsWith('Bull')) ? 'BUY' : 'SELL')} className="py-4 bg-blue-600/10 border border-blue-600/20 text-[9px] font-black hover:bg-blue-600 hover:text-white transition-all">{p}</button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="xl:col-span-4 space-y-4">
                <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest flex items-center gap-2"><Clock size={14} /> REGISTROS RECIENTES</h3>
                <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                    {recentSignals.map(sig => (
                        <div key={sig.id} className="bg-black/40 border border-white/5 p-4 group hover:border-red-600/30 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <div className={`w-1 h-3 ${sig.type === 'BOOM' ? 'bg-red-600' : 'bg-blue-600'}`}></div>
                                        <span className="text-xs font-black text-white italic uppercase">{sig.pair}</span>
                                        <span className="text-[8px] font-black text-gray-500 uppercase ml-auto">
                                            {sig.timestamp ? new Date(sig.timestamp.toMillis()).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'NOW'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">ENTRADA: <span className="text-white">{sig.entry}</span></p>
                                        {/* Status Badge */}
                                        {sig.status === 'WON' && (
                                            <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-green-600/20 text-green-400 border border-green-600/30">
                                                GANADA
                                            </span>
                                        )}
                                        {sig.status === 'LOST' && (
                                            <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-red-600/20 text-red-400 border border-red-600/30">
                                                PERDIDA
                                            </span>
                                        )}
                                        {sig.status === 'ACTIVE' && (
                                            <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 animate-pulse">
                                                ACTIVA
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[9px] text-gray-600 italic opacity-50">{sig.message}</p>
                                        {sig.sender && (
                                            <span className="text-[7px] font-bold text-gray-600 uppercase tracking-wider opacity-60">
                                                • BY: {sig.sender.split('@')[0]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1 transition-all ml-2">
                                    <button onClick={() => {
                                        setEditingSignalId(sig.id);
                                        setSignalForm({
                                            pair: sig.pair,
                                            type: (sig.type === 'BOOM' || sig.type === 'BUY') ? 'BUY' : 'SELL',
                                            entry: sig.entry || '',
                                            tp: sig.tp || '',
                                            sl: sig.sl || '',
                                            exitPrice: sig.exitPrice || '',
                                            pips: sig.pips || ''
                                        });
                                        setIsHistorical(sig.status !== 'ACTIVE');
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }} className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"><RefreshCw size={14} /></button>
                                    <button onClick={() => deleteSignal(sig.id)} className="p-2 bg-white/5 hover:bg-red-600/20 text-gray-300 hover:text-red-500 border border-white/10 transition-colors"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SignalCenter;
