import React, { useState, useEffect } from 'react';
import { History, Radio, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const HistoryPage = ({ user }) => {
    const [battleLog, setBattleLog] = useState([]);
    const [stats, setStats] = useState({
        dailyPips: 0,
        monthlyPips: 0,
        totalWinRate: '0%',
        monthlyWinRate: '0%',
        totalOps: 0
    });

    useEffect(() => {
        const q = query(
            collection(db, "signals"),
            orderBy("closedAt", "desc"),
            limit(200)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

            const allClosed = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(d => (d.status === 'WON' || d.status === 'LOST') && d.closedAt);

            // Filter for CURRENT MONTH ONLY
            const currentMonthClosed = allClosed.filter(s => s.closedAt?.toMillis() >= monthStart);
            setBattleLog(currentMonthClosed);

            if (currentMonthClosed.length > 0) {
                // 1. Monthly Win Rate (replaces total in this view)
                const wins = currentMonthClosed.filter(s => s.status === 'WON').length;
                const winRate = ((wins / currentMonthClosed.length) * 100).toFixed(1);

                // 2. Daily Pips
                const dailyPips = currentMonthClosed
                    .filter(s => s.closedAt?.toMillis() >= todayStart)
                    .reduce((sum, s) => sum + (s.pips || 0), 0);

                // 3. Monthly Pips
                const monthlyPips = currentMonthClosed.reduce((sum, s) => sum + (s.pips || 0), 0);

                setStats({
                    dailyPips: Math.round(dailyPips),
                    monthlyPips: Math.round(monthlyPips),
                    totalWinRate: `${winRate}%`,
                    monthlyWinRate: `${winRate}%`,
                    totalOps: currentMonthClosed.length
                });
            } else {
                setStats({
                    dailyPips: 0,
                    monthlyPips: 0,
                    totalWinRate: '100%',
                    monthlyWinRate: '100%',
                    totalOps: 0
                });
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-3xl lg:text-5xl font-black italic tracking-tighter text-white uppercase mb-2">
                        Trading History
                    </h2>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                        COMPLETE OPERATIONS LOG • REAL-TIME ANALYTICS
                    </p>
                </div>
                <History className="text-red-600" size={40} />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black border border-white/10 p-6 flex flex-col justify-between group hover:border-red-600/30 transition-all">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">DAILY PIPS</p>
                    <p className={`text-3xl font-black italic tracking-tighter ${stats.dailyPips >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stats.dailyPips > 0 ? '+' : ''}{stats.dailyPips}
                    </p>
                </div>
                <div className="bg-black border border-white/10 p-6 flex flex-col justify-between group hover:border-red-600/30 transition-all">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">MONTHLY PIPS</p>
                    <p className={`text-3xl font-black italic tracking-tighter ${stats.monthlyPips >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
                        {stats.monthlyPips > 0 ? '+' : ''}{stats.monthlyPips}
                    </p>
                </div>
                <div className="bg-black border border-white/10 p-6 flex flex-col justify-between group hover:border-red-600/30 transition-all">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">WIN RATE</p>
                    <p className="text-3xl font-black italic tracking-tighter text-white">{stats.monthlyWinRate}</p>
                </div>
                <div className="bg-black border border-white/10 p-6 flex flex-col justify-between group hover:border-red-600/30 transition-all">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">TOTAL TRADES</p>
                    <p className="text-3xl font-black italic tracking-tighter text-white">{stats.totalOps}</p>
                </div>
            </div>

            {/* Operations Log Table */}
            <div className="border border-white/10 bg-black">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 text-[9px] font-black text-gray-500 tracking-widest uppercase hidden md:grid">
                    <div className="col-span-3">ASSET / TYPE</div>
                    <div className="col-span-3">TIME</div>
                    <div className="col-span-3 text-center">STATUS</div>
                    <div className="col-span-3 text-right">PROFIT / LOSS</div>
                </div>

                {/* Table Body */}
                <div className="space-y-2">
                    {battleLog.length > 0 ? battleLog.map((log) => (
                        <div key={log.id} className={`grid grid-cols-12 gap-4 p-4 items-center transition-all border ${log.status === 'WON'
                            ? 'bg-green-500/5 border-green-500/10 hover:bg-green-500/10 hover:border-green-500/30'
                            : 'bg-red-600/5 border-red-600/10 hover:bg-red-600/10 hover:border-red-600/30'
                            }`}>

                            {/* Asset Info */}
                            <div className="col-span-6 md:col-span-3 flex items-center gap-3">
                                <div>
                                    <p className="text-sm font-black text-white italic tracking-tighter uppercase">{log.pair}</p>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{log.type}</p>
                                </div>
                            </div>

                            {/* Time */}
                            <div className="col-span-6 md:col-span-3 text-right md:text-left">
                                <p className="text-[10px] font-bold text-gray-400 tracking-widest">
                                    {log.closedAt ? new Date(log.closedAt.toMillis()).toLocaleDateString() : '-'}
                                </p>
                                <p className="text-[9px] font-bold text-gray-600 tracking-wider">
                                    {log.closedAt ? new Date(log.closedAt.toMillis()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                </p>
                            </div>

                            {/* Status Badge */}
                            <div className="col-span-6 md:col-span-3 flex justify-start md:justify-center mt-2 md:mt-0">
                                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${log.status === 'WON' ? 'border-green-500/30 text-green-500 bg-green-500/10 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'border-red-600/30 text-red-600 bg-red-600/10 shadow-[0_0_10px_rgba(220,38,38,0.2)]'}`}>
                                    {log.status === 'WON' ? 'TARGET HIT' : 'STOP LOSS'}
                                </span>
                            </div>

                            {/* Pips Result */}
                            <div className="col-span-6 md:col-span-3 text-right mt-2 md:mt-0">
                                <p className={`text-xl font-black italic tracking-tighter ${log.status === 'WON' ? 'text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]'}`}>
                                    {log.status === 'WON' ? '+' : ''}{Math.abs(log.pips || 0)} <span className="text-[10px] text-gray-500 not-italic font-bold">PTS</span>
                                </p>
                            </div>
                        </div>
                    )) : (
                        <div className="p-12 text-center text-gray-500 text-[10px] font-black tracking-widest uppercase">
                            NO OPERATIONS RECORDED IN THE LOG
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;
