import React, { useState, useEffect } from 'react';
import { Copy, Users, DollarSign, ExternalLink, Check, Award, BarChart3, TrendingUp } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';

const AffiliateDashboard = ({ user }) => {
    const [referrals, setReferrals] = useState([]);
    const [stats, setStats] = useState({
        totalClicks: 0,
        totalReferrals: 0,
        activeSubscriptions: 0,
        unpaidCommissions: 0
    });
    const [copied, setCopied] = useState(false);

    // Referral Link
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const referralLink = `${baseUrl}?ref=${user.uid}`;

    useEffect(() => {
        if (!user?.uid) return;

        // Listen for users referred by this user
        const q = query(collection(db, "users"), where("referredBy", "==", user.uid));
        const unsub = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setReferrals(list);

            // Calculate real-time stats
            setStats(prev => ({
                ...prev,
                totalReferrals: list.length,
                activeSubscriptions: list.filter(u => u.status === 'approved').length,
                unpaidCommissions: list.filter(u => u.status === 'approved').length * 10 // Example: $10 per active sub
            }));
        });

        return () => unsub();
    }, [user?.uid]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h2 className="text-3xl lg:text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
                        AFFILIATE <span className="text-red-600">NETWORK</span>
                    </h2>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-600 animate-pulse shadow-red-glow"></span>
                            <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase">PARTNER PROGRAM ACTIVE</p>
                        </div>
                        <p className="text-[10px] font-black tracking-widest text-red-600 uppercase">TIER 1 OPERATOR</p>
                    </div>
                </div>

                <div className="w-full lg:w-auto">
                    <div className="p-4 bg-black border-2 border-red-600/20 flex flex-col gap-2">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">YOUR UNIQUE EXTRACTION LINK</span>
                        <div className="flex items-center gap-3">
                            <code className="bg-white/5 px-4 py-2 text-[11px] font-mono text-red-500 border border-white/5 truncate max-w-[200px] lg:max-w-xs uppercase">
                                {referralLink}
                            </code>
                            <button
                                onClick={copyToClipboard}
                                className={`p-2 transition-all ${copied ? 'bg-green-600 text-white' : 'bg-red-600 text-white hover:bg-white hover:text-red-600'}`}
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'TOTAL REFERRALS', value: stats.totalReferrals, icon: Users, color: 'text-white' },
                    { label: 'ACTIVE SUBS', value: stats.activeSubscriptions, icon: Award, color: 'text-green-500' },
                    { label: 'EST. REVENUE', value: `$${stats.unpaidCommissions}`, icon: DollarSign, color: 'text-red-600' },
                    { label: 'CONV. RATE', value: stats.totalReferrals > 0 ? `${((stats.activeSubscriptions / stats.totalReferrals) * 100).toFixed(0)}%` : '0%', icon: TrendingUp, color: 'text-white' },
                ].map((stat, i) => (
                    <div key={i} className="bg-black border-2 border-white/5 p-6 space-y-3 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <stat.icon size={40} />
                        </div>
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">{stat.label}</span>
                        <p className={`text-3xl font-black italic shadow-sm uppercase ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Referral List */}
            <div className="bg-black border-2 border-white/5">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">RECRUITED OPERATORS LOG</h3>
                    <BarChart3 size={16} className="text-red-600" />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="p-6 text-[9px] font-black text-gray-500 uppercase tracking-widest">OPERATOR EMAIL</th>
                                <th className="p-6 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">JOIN DATE</th>
                                <th className="p-6 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">STATUS</th>
                                <th className="p-6 text-[9px] font-black text-gray-500 uppercase tracking-widest text-right">COMMISSION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {referrals.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center">
                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em]">NO DATA DETECTED IN SECTOR</p>
                                    </td>
                                </tr>
                            ) : (
                                referrals.map((ref) => (
                                    <tr key={ref.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-black text-white uppercase group-hover:text-red-600 transition-colors">{ref.email}</span>
                                                <span className="text-[8px] font-bold text-gray-600 uppercase">ID: {ref.id.substring(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="text-[11px] font-bold text-gray-400">
                                                {ref.createdAt?.toDate ? ref.createdAt.toDate().toLocaleDateString() : '---'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={`text-[9px] font-black px-3 py-1 border ${ref.status === 'approved'
                                                ? 'border-green-600 text-green-500'
                                                : ref.status === 'payment_required'
                                                    ? 'border-yellow-600 text-yellow-500'
                                                    : 'border-red-600 text-red-600'
                                                } uppercase`}>
                                                {ref.status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <span className={`text-[12px] font-black ${ref.status === 'approved' ? 'text-white' : 'text-gray-600'}`}>
                                                {ref.status === 'approved' ? '+$10.00' : '$0.00'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Info Banner */}
            <div className="flex items-center gap-4 p-6 bg-red-600/5 border border-red-600/20 italic">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    SYSTEM ADVISORY: Commissions are calculated upon successful subscription activation of recruited operators. Payouts are processed every Friday.
                </p>
            </div>
        </div>
    );
};

export default AffiliateDashboard;
