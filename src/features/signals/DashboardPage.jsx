import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, Loader2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import QuickBroadcaster from './QuickBroadcaster';
import SignalCard from './SignalCard';

const DashboardPage = ({ user, broadcastSignal }) => {
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ winRatio: 0, pipsToday: 0 });
    const [reconnectTrigger, setReconnectTrigger] = useState(0);
    const [activeBroker, setActiveBroker] = useState('ALL');

    const isAdmin = user?.email?.toLowerCase() === 'admin' || user?.email?.toLowerCase() === 'steven@ingenius.fx' || user?.email?.toLowerCase() === 'jeilin@jeilin.com' || user?.canBroadcast;

    // Detect when app comes back from background (Android PWA fix)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('🔄 Dashboard visible - reconnecting listeners...');
                setReconnectTrigger(prev => prev + 1);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    useEffect(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        const qS = query(collection(db, "signals"), orderBy("timestamp", "desc"), limit(40));
        const unsubS = onSnapshot(qS, (snapshot) => {
            const todaySignals = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(d => {
                    const signalTime = d.timestamp?.toMillis ? d.timestamp.toMillis() : Date.now();
                    return signalTime >= todayStart;
                })
                .map(d => ({
                    ...d,
                    time: d.timestamp ? new Date(d.timestamp.toMillis()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NOW'
                }));

            setSignals(todaySignals);
            setLoading(false);
        }, (error) => {
            console.error('❌ Dashboard signals listener error:', error);
            // Don't retry immediately if it's a permission issue (avoids infinite crash loops)
            if (error.code !== 'permission-denied') {
                setTimeout(() => setReconnectTrigger(prev => prev + 1), 5000);
            }
        });

        const qT = query(collection(db, "signals"), orderBy("closedAt", "desc"), limit(1000));
        const unsubT = onSnapshot(qT, (snapshot) => {
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

            const allClosed = snapshot.docs.map(doc => doc.data()).filter(d => (d.status === 'WON' || d.status === 'LOST') && d.closedAt);

            // Monthly Filter for Win Ratio (Current Calendar Month)
            const monthlyClosed = allClosed.filter(s => s.closedAt?.toMillis() >= monthStart);

            if (monthlyClosed.length > 0) {
                const wins = monthlyClosed.filter(s => s.status === 'WON').length;
                const winRatio = ((wins / monthlyClosed.length) * 100).toFixed(1);

                // Daily Pips from all closed (today filter)
                const dailyPips = allClosed
                    .filter(s => s.closedAt?.toMillis() >= todayStart)
                    .reduce((sum, s) => {
                        let val = parseFloat(s.pips);
                        // If pips field is missing/null, calculate from entry/exit
                        if ((s.pips === undefined || s.pips === null || isNaN(val)) && s.entry && s.exitPrice) {
                            const entry = parseFloat(s.entry);
                            const exit = parseFloat(s.exitPrice);
                            if (!isNaN(entry) && !isNaN(exit)) {
                                const diff = Math.abs(exit - entry);
                                val = Number((s.status === 'WON' ? diff : -diff).toFixed(2));
                            }
                        }
                        return sum + (val || 0);
                    }, 0);

                setStats({
                    winRatio,
                    pipsToday: Math.round(dailyPips)
                });
            } else {
                setStats({
                    winRatio: "100.0",
                    pipsToday: 0
                });
            }
        }, (error) => {
            console.error('❌ Dashboard stats listener error:', error);
            // Permissions issue usually won't be fixed by immediate retry
        });

        return () => { unsubS(); unsubT(); };
    }, [reconnectTrigger]); // Reconnect when trigger changes

    return (
        <div className="space-y-12 pb-20">
            {isAdmin && (
                <div className="bg-black border-b border-white/10 lg:border-2 lg:border-red-600/20 p-0 lg:p-8 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] -z-10"></div>
                    <QuickBroadcaster broadcastSignal={broadcastSignal} />
                </div>
            )}

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-8">
                <div>
                    <h2 className="text-2xl lg:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
                        INDEX GENIUS <span className="text-red-600">ACADEMY</span>
                    </h2>
                    <div className="flex items-center gap-4 lg:gap-6 mt-2 lg:mt-4">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-red-600 shadow-red-glow"></span>
                            <p className="text-[8px] lg:text-[10px] font-black tracking-widest text-gray-400 uppercase">REAL-TIME SIGNALS</p>
                        </div>
                        <p className="text-[8px] lg:text-[10px] font-black tracking-widest text-red-600 uppercase">{stats.winRatio}% MONTHLY ACCURACY</p>
                    </div>
                </div>

                <div className="flex gap-3 lg:gap-4 w-full lg:w-auto">
                    <div className="h-16 lg:h-24 bg-black border-2 border-white/5 p-3 lg:p-6 flex-1 lg:flex-none lg:min-w-[160px] flex flex-col justify-between">
                        <span className="text-[8px] lg:text-[9px] font-black text-gray-500 uppercase">MONTHLY WIN RATE</span>
                        <p className="text-xl lg:text-3xl font-black text-white italic">{stats.winRatio}%</p>
                    </div>
                    <div className="h-16 lg:h-24 bg-red-600 p-3 lg:p-6 flex-1 lg:flex-none lg:min-w-[160px] flex flex-col justify-between shadow-red-glow">
                        <div className="flex justify-between items-center"><span className="text-[8px] lg:text-[9px] font-black text-white/70 uppercase">PIPS TODAY</span><TrendingUp size={12} className="text-white fill-white" /></div>
                        <p className="text-xl lg:text-3xl font-black text-white italic uppercase">{stats.pipsToday > 0 ? '+' : ''}{stats.pipsToday}</p>
                    </div>
                </div>
            </div>

            {/* Broker Filtering Tabs */}
            <div className="flex border-b border-white/10 overflow-x-auto custom-scrollbar pb-1 gap-2">
                {[
                    { id: 'ALL', label: 'TODAS', color: 'bg-white/5 text-gray-400' },
                    { id: 'DERIV', label: 'DERIV', color: 'bg-red-600/10 text-red-500 border-red-600/20' },
                    { id: 'WELTRADE', label: 'WELTRADE', color: 'bg-blue-600/10 text-blue-500 border-blue-600/20' },
                    { id: 'BM', label: 'BM GLOBAL', color: 'bg-yellow-600/10 text-yellow-500 border-yellow-600/20' },
                ].map(b => (
                    <button
                        key={b.id}
                        onClick={() => setActiveBroker(b.id)}
                        className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeBroker === b.id
                            ? (b.id === 'ALL' ? 'border-white text-white' : (b.id === 'DERIV' ? 'border-red-600 text-red-600' : (b.id === 'WELTRADE' ? 'border-blue-600 text-blue-600' : 'border-yellow-600 text-yellow-600')))
                            : 'border-transparent text-gray-600 hover:text-white'}`}
                    >
                        {b.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="text-red-600 animate-spin" size={48} />
                    <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase">SYNCING TERMINALS...</p>
                </div>
            ) : signals.filter(s => activeBroker === 'ALL' ? true : (s.broker === activeBroker || (activeBroker === 'DERIV' && !s.broker))).length === 0 ? (
                <div className="col-span-full py-20 text-center space-y-4 bg-white/5 border border-dashed border-white/10">
                    <TrendingUp className="mx-auto text-gray-700 opacity-20" size={50} />
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                        {activeBroker === 'ALL' ? 'NO HAY SEÑALES REGISTRADAS HOY' : `SIN SEÑALES DE ${activeBroker} HOY`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {signals
                        .filter(s => activeBroker === 'ALL' ? true : (s.broker === activeBroker || (activeBroker === 'DERIV' && !s.broker)))
                        .map(s => <SignalCard key={s.id} {...s} user={user} broadcastSignal={broadcastSignal} />)}
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
