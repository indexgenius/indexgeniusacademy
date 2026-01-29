import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Ban, Loader2, Check, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { fetchPrice } from '../../utils/deriv';

const SignalCard = ({ id, symbol, type, pair, timeframe, status, entry, tp, sl, time, timestamp, user, broadcastSignal, exitPrice }) => {
    const [updating, setUpdating] = useState(false);
    const [isExpired, setIsExpired] = useState(false);

    const isActive = status === 'ACTIVE';
    const isAdmin = user?.email?.toLowerCase() === 'admin' || user?.email?.toLowerCase() === 'steven@ingenius.fx' || user?.canBroadcast;

    useEffect(() => {
        if (!timestamp || !isActive) return;
        const check = () => {
            const now = Date.now();
            const signalTime = timestamp.toMillis ? timestamp.toMillis() : Date.now();
            if (now - signalTime > 60 * 60 * 1000) setIsExpired(true);
        };
        check();
        const interval = setInterval(check, 60000);
        return () => clearInterval(interval);
    }, [timestamp, isActive]);

    const handleStatusUpdate = async (newStatus) => {
        if (!isAdmin) return;
        setUpdating(true);
        try {
            const hitPrice = symbol ? (await fetchPrice(symbol).catch(() => 'MARKET PRICE')) : 'MARKET PRICE';
            const signalRef = doc(db, "signals", id);

            // Calculate Pips
            let pips = 0;
            const entryVal = parseFloat(entry);
            const exitVal = parseFloat(hitPrice);

            if (!isNaN(entryVal) && !isNaN(exitVal)) {
                // Absolute difference logic: WON = positive, LOST = negative
                const diff = Math.abs(exitVal - entryVal);
                pips = Math.round(newStatus === 'WON' ? diff : -diff);
            }

            await updateDoc(signalRef, {
                status: newStatus,
                exitPrice: hitPrice,
                pips: pips,
                closedAt: serverTimestamp()
            });

            if (broadcastSignal) {
                const isWin = newStatus === 'WON';
                await broadcastSignal({
                    title: isWin ? '✅ TAKE PROFIT' : '⚠️ STOP LOSS',
                    message: `${pair} - ${isWin ? 'GANANCIAS' : 'SALIDA'} @ ${hitPrice}`,
                    pair: pair,
                    type: isWin ? 'WIN' : 'LOSS',
                    status: newStatus,
                    skipSave: true
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative w-full bg-black border-[3px] p-4 lg:p-8 flex flex-col justify-between overflow-hidden group font-inter 
            ${isActive
                    ? 'border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.2)]'
                    : (status === 'WON'
                        ? 'border-green-800/50 shadow-[0_0_20px_rgba(22,101,52,0.1)] opacity-90'
                        : (status === 'LOST'
                            ? 'border-red-900/30 opacity-75'
                            : 'border-white/10 opacity-60 grayscale')
                    )
                }`}
        >
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4 lg:mb-8 relative z-10">
                <div className="space-y-1 lg:space-y-2">
                    <h3 className="text-xl lg:text-4xl font-black italic uppercase text-white tracking-tighter leading-none">
                        {pair || 'ASSET ERROR'}
                    </h3>
                    <div className="flex items-center gap-2 lg:gap-3">
                        <span className="bg-[#00ff41] text-black text-[8px] lg:text-[10px] font-black uppercase px-2 py-0.5 tracking-widest leading-none">
                            {type || 'SIGNAL'}
                        </span>
                        <span className="text-gray-500 text-[8px] lg:text-[10px] font-black uppercase tracking-widest">
                            {timeframe || 'M1'} PERIOD
                        </span>
                    </div>
                </div>

                <div className="relative">
                    <div className={`transform skew-x-[-12deg] px-3 py-1 flex items-center justify-center ${isActive ? 'bg-red-600' : 'bg-gray-800'}`}>
                        <span className="text-white text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] transform skew-x-[12deg]">
                            {status === 'ACTIVE' ? 'READY' : (status === 'WON' ? 'WIN' : (status === 'LOST' ? 'LOSS' : status))}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Data Section */}
            <div className="grid grid-cols-2 gap-4 relative z-10 mt-4">
                {/* Left Column: Entry & TP */}
                <div className="space-y-6">
                    <div>
                        <p className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">ENTRY POINT</p>
                        <p className="text-3xl lg:text-5xl font-black text-white tracking-tight">{entry}</p>
                    </div>
                    <div>
                        <p className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">
                            {status === 'WON' ? 'CLOSED AT' : 'TARGET PROFIT'}
                        </p>
                        <p className={`text-base lg:text-xl font-black tracking-widest ${status === 'WON' ? 'text-[#00ff41]' : 'text-[#00ff41]'}`}>
                            {status === 'WON' ? (exitPrice || tp || '---') : (tp || '---')}
                        </p>
                    </div>
                </div>

                {/* Right Column: SL & Actions */}
                <div className="flex flex-col justify-between items-end">
                    <div className="text-right">
                        <p className="text-[8px] lg:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">
                            {status === 'LOST' ? 'CLOSED AT' : 'SAFETY LOSS'}
                        </p>
                        <p className={`text-base lg:text-xl font-black tracking-widest ${status === 'LOST' ? 'text-red-600' : 'text-red-600'}`}>
                            {status === 'LOST' ? (exitPrice || sl || '--- ---') : (sl || '--- ---')}
                        </p>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && isActive && (
                        <div className="flex gap-2 lg:gap-3 mt-4">
                            <button
                                onClick={() => handleStatusUpdate('WON')}
                                disabled={updating}
                                className="w-14 h-14 lg:w-20 lg:h-20 rounded-xl border-2 border-[#00ff41] bg-[#00ff41]/10 hover:bg-[#00ff41] hover:text-black text-[#00ff41] flex flex-col items-center justify-center gap-1 transition-all group/btn"
                            >
                                {updating ? <Loader2 size={20} className="animate-spin" /> : (
                                    <>
                                        <CheckCircle2 size={24} className="lg:w-8 lg:h-8" strokeWidth={2} />
                                        <span className="text-[6px] lg:text-[8px] font-black uppercase tracking-tight leading-none text-center">TAKE<br />PROFIT</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleStatusUpdate('LOST')}
                                disabled={updating}
                                className="w-14 h-14 lg:w-20 lg:h-20 rounded-xl border-2 border-red-600 bg-red-600/10 hover:bg-red-600 hover:text-white text-red-600 flex flex-col items-center justify-center gap-1 transition-all group/btn"
                            >
                                {updating ? <Loader2 size={20} className="animate-spin" /> : (
                                    <>
                                        <XCircle size={24} className="lg:w-8 lg:h-8" strokeWidth={2} />
                                        <span className="text-[6px] lg:text-[8px] font-black uppercase tracking-tight leading-none text-center">STOP<br />LOSS</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 opacity-50 relative z-10">
                <Clock size={12} className="text-red-600" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {time || 'Unknown Time'}
                </span>
            </div>

            {/* Background Effects */}
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none ${isActive ? 'bg-red-600/5' : (status === 'WON' ? 'bg-green-800/10' : (status === 'LOST' ? 'bg-red-900/5' : 'bg-transparent'))}`}></div>
        </motion.div>
    );
};

export default SignalCard;
