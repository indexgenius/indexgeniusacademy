import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, BarChart3, ChevronRight, Target, Award, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const MonthlyHistory = () => {
    const [allSignals, setAllSignals] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(null); // { year, month }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "signals"), orderBy("closedAt", "desc"));
        const unsub = onSnapshot(q, (snapshot) => {
            const closed = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(d => (d.status === 'WON' || d.status === 'LOST') && d.closedAt);

            setAllSignals(closed);

            const months = {};
            closed.forEach(sig => {
                const date = sig.closedAt.toDate();
                const key = `${date.getFullYear()}-${date.getMonth()}`;
                if (!months[key]) {
                    months[key] = {
                        year: date.getFullYear(),
                        month: date.getMonth(),
                        pips: 0,
                        wins: 0,
                        total: 0,
                    };
                }
                let val = parseFloat(sig.pips);
                if ((sig.pips === undefined || sig.pips === null || isNaN(val)) && sig.entry && sig.exitPrice) {
                    const entry = parseFloat(sig.entry);
                    const exit = parseFloat(sig.exitPrice);
                    if (!isNaN(entry) && !isNaN(exit)) {
                        const diff = Math.abs(exit - entry);
                        val = sig.status === 'WON' ? diff : -diff;
                    }
                }
                months[key].pips += (val || 0);
                if (sig.status === 'WON') months[key].wins++;
                months[key].total++;
            });

            const stats = Object.values(months).sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
            });

            setMonthlyStats(stats);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const getMonthName = (m) => {
        const names = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
        return names[m];
    };

    const getFilteredSignals = () => {
        if (!selectedMonth) return [];
        return allSignals.filter(sig => {
            const date = sig.closedAt.toDate();
            return date.getFullYear() === selectedMonth.year && date.getMonth() === selectedMonth.month;
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Activity className="text-red-600 animate-spin" size={48} />
                <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase">ANALYZING MONTHLY PERFORMANCE...</p>
            </div>
        );
    }

    if (selectedMonth) {
        const signals = getFilteredSignals();
        return (
            <div className="space-y-8 pb-10">
                <div className="flex items-center justify-between">
                    <button onClick={() => setSelectedMonth(null)} className="text-[10px] font-black text-red-600 uppercase tracking-widest border border-red-600/30 px-4 py-2 hover:bg-red-600 hover:text-white transition-all">
                        ← BACK TO ALL MONTHS
                    </button>
                    <div className="text-right uppercase">
                        <p className="text-[10px] font-black text-gray-500 tracking-widest">{selectedMonth.year}</p>
                        <h2 className="text-3xl font-black italic text-white tracking-tighter">{getMonthName(selectedMonth.month)}</h2>
                    </div>
                </div>

                <div className="border border-white/10 bg-black">
                    <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 text-[9px] font-black text-gray-500 tracking-widest uppercase hidden md:grid">
                        <div className="col-span-3">ASSET</div>
                        <div className="col-span-3">TIME</div>
                        <div className="col-span-3 text-center">STATUS</div>
                        <div className="col-span-3 text-right">PROFIT</div>
                    </div>

                    <div className="divide-y divide-white/5">
                        {signals.map((log) => (
                            <div key={log.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                                <div className="col-span-6 md:col-span-3 uppercase">
                                    <p className="text-sm font-black text-white italic tracking-tighter">{log.pair}</p>
                                    <p className="text-[9px] font-bold text-gray-600 tracking-wider">MARKET OPS</p>
                                </div>
                                <div className="col-span-6 md:col-span-3 text-right md:text-left">
                                    <p className="text-[10px] font-bold text-gray-400">
                                        {new Date(log.closedAt.toMillis()).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="col-span-6 md:col-span-3 flex md:justify-center">
                                    <span className={`px-3 py-1 text-[9px] font-black border ${log.status === 'WON' ? 'border-green-500/30 text-green-500' : 'border-red-600/30 text-red-600'} uppercase tracking-widest`}>
                                        {log.status === 'WON' ? 'TARGET' : 'LOSS'}
                                    </span>
                                </div>
                                <div className="col-span-6 md:col-span-3 text-right">
                                    <p className={`text-xl font-black italic ${log.status === 'WON' ? 'text-green-500' : 'text-red-500'}`}>
                                        {(() => {
                                            let val = parseFloat(log.pips);
                                            if ((log.pips === undefined || log.pips === null || isNaN(val)) && log.entry && log.exitPrice) {
                                                const entry = parseFloat(log.entry);
                                                const exit = parseFloat(log.exitPrice);
                                                if (!isNaN(entry) && !isNaN(exit)) {
                                                    val = Math.abs(exit - entry);
                                                }
                                            }
                                            return (log.status === 'WON' ? '+' : '-') + Math.abs(val || 0).toFixed(1);
                                        })()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl lg:text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
                    MONTHLY <span className="text-red-600">PERFORMANCE</span>
                </h2>
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-red-600 shadow-red-glow"></div>
                    <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">HISTORICAL TRADING ANALYTICS</p>
                </div>
            </div>

            {/* Monthly Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthlyStats.map((stat, idx) => {
                    const winRate = ((stat.wins / stat.total) * 100).toFixed(1);
                    return (
                        <motion.button
                            key={`${stat.year}-${stat.month}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => setSelectedMonth(stat)}
                            className="bg-black border-2 border-white/5 p-6 lg:p-8 relative group hover:border-red-600/30 transition-all overflow-hidden text-left w-full"
                        >
                            <BarChart3 className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 -rotate-12 group-hover:text-red-600/10 transition-colors" />

                            <div className="relative z-10 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 tracking-[0.3em] uppercase mb-1">{stat.year}</p>
                                        <h3 className="text-2xl lg:text-3xl font-black italic text-white tracking-tighter">{getMonthName(stat.month)}</h3>
                                    </div>
                                    <div className="bg-red-600/10 border border-red-600/20 px-3 py-1 flex items-center gap-2">
                                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">VIEW OPS</span>
                                        <ChevronRight size={14} className="text-red-600" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">TOTAL PIPS</p>
                                        <p className={`text-2xl font-black italic ${stat.pips >= 0 ? 'text-[#00ff41]' : 'text-red-600'}`}>
                                            {stat.pips > 0 ? '+' : ''}{Math.round(stat.pips)}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">WIN RATE</p>
                                        <p className="text-2xl font-black italic text-white">{winRate}%</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4 text-[10px] font-black tracking-widest uppercase">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Target size={12} className="text-red-600" />
                                        <span>{stat.total} TRADES</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Award size={12} className="text-[#00ff41]" />
                                        <span>{stat.wins} WINS</span>
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}

                {monthlyStats.length === 0 && (
                    <div className="col-span-full py-20 bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center space-y-4">
                        <Calendar size={48} className="text-gray-700" />
                        <p className="text-[10px] font-black tracking-widest text-gray-600 uppercase">NO HISTORICAL DATA FOUND</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonthlyHistory;
