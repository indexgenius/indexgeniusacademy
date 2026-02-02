import React, { useState, useEffect } from 'react';
import {
    Users,
    TrendingUp,
    DollarSign,
    ShieldCheck,
    ArrowUpRight,
    Activity,
    Database,
    Zap,
    Search,
    Filter,
    AlertCircle,
    Clock,
    RefreshCw,
    CheckCircle2,
    XCircle,
    UserMinus,
    Calendar,
    ChevronDown,
    X,
    MessageSquare,
    Send,
    Terminal,
    Eye,
    Settings,
    ShieldAlert,
    Trash2,
    Skull,
    BellRing
} from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, query, onSnapshot, orderBy, where, limit, getDocs, updateDoc, doc, deleteDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

const SupremeDashboard = ({ user: adminUser }) => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        pendingPayments: 0,
        totalRevenue: 0,
        newToday: 0,
        referralLeads: 0
    });
    const [users, setUsers] = useState([]);
    const [recentPayments, setRecentPayments] = useState([]);
    const [liveEvents, setLiveEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('overview'); // overview, users, command, logs
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterSubscription, setFilterSubscription] = useState('ALL');
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [visibleCount, setVisibleCount] = useState(12); // Initial limit

    useEffect(() => {
        // Reset visible count when filters change to avoid confusion
        setVisibleCount(12);
    }, [searchTerm, filterStatus, filterSubscription, view]);

    useEffect(() => {
        // Real-time listener for all users
        const qUsers = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const unsubUsers = onSnapshot(qUsers, (snapshot) => {
            const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(userList);

            // Calculate stats
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const active = userList.filter(u => u.status === 'approved' && u.subscriptionActive).length;
            const pending = userList.filter(u => u.status === 'pending').length;
            const today = userList.filter(u => {
                const created = u.createdAt?.toDate ? u.createdAt.toDate() : null;
                return created && created >= startOfToday;
            }).length;
            const revenue = active * 25;
            const leads = userList.filter(u => u.referredBy).length;

            setStats({
                totalUsers: userList.length,
                activeUsers: active,
                pendingPayments: pending,
                totalRevenue: revenue,
                newToday: today,
                referralLeads: leads
            });
            setLoading(false);
        });

        // Real-time listener for payment notifications
        const qPayments = query(
            collection(db, "notifications"),
            where("type", "==", "subscription_payment"),
            orderBy("timestamp", "desc"),
            limit(15)
        );
        const unsubPayments = onSnapshot(qPayments, (snapshot) => {
            setRecentPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Live Events Feed
        const qEvents = query(
            collection(db, "notifications"),
            orderBy("timestamp", "desc"),
            limit(10)
        );
        const unsubEvents = onSnapshot(qEvents, (snapshot) => {
            setLiveEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubUsers();
            unsubPayments();
            unsubEvents();
        };
    }, []);

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.id?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus.toLowerCase();
        const matchesSub = filterSubscription === 'ALL' ||
            (filterSubscription === 'ACTIVE' ? u.subscriptionActive : !u.subscriptionActive);

        return matchesSearch && matchesStatus && matchesSub;
    }).sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
    });

    const handleSupremeApprove = async (u) => {
        if (!confirm(`OVERRIDE: AUTHORIZE ACCESS FOR ${u.email}?`)) return;
        try {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);
            await updateDoc(doc(db, "users", u.id), {
                status: 'approved',
                subscriptionActive: true,
                subscriptionStart: serverTimestamp(),
                subscriptionEnd: expiry,
                approvedAt: serverTimestamp(),
                approvedBy: 'SUPREME_COMMANDER'
            });
            alert("UNIT AUTHORIZED.");
        } catch (e) { console.error(e); }
    };

    const handleSupremeDelete = async (u) => {
        if (!confirm(`DANGER: PERMANENTLY WIPE ${u.email} FROM DATABASE?`)) return;
        try {
            await deleteDoc(doc(db, "users", u.id));
            alert("UNIT NEUTRALIZED.");
        } catch (e) { console.error(e); }
    };

    const handleBroadcast = async () => {
        if (!broadcastMsg) return;
        setIsBroadcasting(true);
        try {
            const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
            await fetch('https://ingenus-fx.vercel.app/api/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    title: "🛰️ COMMAND CENTER BROADCAST",
                    body: broadcastMsg,
                    type: 'system_alert'
                })
            });

            await addDoc(collection(db, "announcements"), {
                title: "ALERTA DE SISTEMA",
                content: broadcastMsg,
                priority: 'high',
                timestamp: serverTimestamp(),
                createdBy: 'SUPREME_OVERRIDE'
            });

            setBroadcastMsg('');
            alert("MESSAGE DEPLOYED TO ALL UNITS.");
        } catch (e) {
            alert("BROADCAST FAILED.");
        } finally {
            setIsBroadcasting(false);
        }
    };

    const UserGrowthBar = ({ list }) => {
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString('es-ES', { weekday: 'short' });
        }).reverse();

        const data = days.map((day, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            d.setHours(0, 0, 0, 0);
            const count = list.filter(u => {
                const created = u.createdAt?.toDate ? u.createdAt.toDate() : null;
                if (!created) return false;
                created.setHours(0, 0, 0, 0);
                return created.getTime() === d.getTime();
            }).length;
            return count;
        });

        const max = Math.max(...data, 1);

        return (
            <div className="flex items-end gap-2 h-32 w-full pt-4">
                {data.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                            className="w-full bg-red-600/40 border-t-2 border-red-600 relative group"
                            style={{ height: `${(val / max) * 100}%` }}
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-red-600 text-[8px] px-1 font-black text-white pointer-events-none transition-opacity">
                                {val}
                            </div>
                        </div>
                        <span className="text-[7px] font-black text-gray-400 uppercase tracking-tighter">{days[i]}</span>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <RefreshCw className="text-red-600 animate-spin" size={40} />
        </div>
    );

    return (
        <div className="space-y-6 lg:space-y-10 selection:bg-red-600 selection:text-white pb-20">
            {/* Supreme Header - Optimized for visibility */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/10 pb-6 lg:pb-8">
                <div className="flex-1 w-full space-y-4">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="text-red-600 shrink-0" size={16} />
                        <span className="text-[9px] lg:text-[10px] font-black text-red-600 tracking-wider lg:tracking-[0.4em] uppercase">SYSTEM COMMAND PROTOCOL v7.0</span>
                    </div>

                    <h2 className="text-3xl lg:text-7xl font-black italic tracking-tighter text-white uppercase leading-tight lg:leading-none">
                        SYSTEM <span className="text-red-600">OVERRIDE</span>
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[8px] lg:text-[9px] font-black text-gray-500 uppercase tracking-widest pt-2">
                        <div className="flex items-center gap-2">
                            <Activity size={10} className="text-green-500" />
                            <span>KERNEL: <span className="text-white">ONLINE</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Database size={10} className="text-blue-500" />
                            <span>REPLICA: <span className="text-white">SYNCED</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Terminal size={10} className="text-red-600" />
                            <span>ADMIN: <span className="text-white">JEILIN_SUPREME</span></span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 bg-white/10 p-1 border border-white/20 w-full lg:w-auto mt-4 lg:mt-0">
                    {[
                        { id: 'overview', icon: Activity },
                        { id: 'users', icon: Users },
                        { id: 'command', icon: Zap },
                        { id: 'logs', icon: Terminal }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setView(t.id)}
                            className={`flex-1 lg:flex-none px-4 lg:px-6 py-3 lg:py-4 text-[11px] lg:text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 ${view === t.id ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30' : 'bg-black/60 text-gray-400 border-white/5 hover:text-white'}`}
                        >
                            <t.icon size={14} className="lg:w-4 lg:h-4" /> {t.id}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {view === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'CONNECTED UNITS', value: stats.totalUsers, icon: Users, delta: stats.newToday, deltaLabel: 'TODAY' },
                                { label: 'AUTHORIZATION ON', value: stats.activeUsers, icon: Activity, color: 'text-green-500' },
                                { label: 'PENDING LIQUID', value: stats.pendingPayments, icon: DollarSign, color: 'text-yellow-500', alert: stats.pendingPayments > 0 },
                                { label: 'SYSTEM REVENUE', value: `$${stats.totalRevenue.toLocaleString()}`, icon: Database, color: 'text-red-600' }
                            ].map((stat, i) => (
                                <div key={i} className={`bg-black border-2 ${stat.alert ? 'border-red-600/50 shadow-red-glow animate-pulse' : 'border-white/5'} p-6 relative overflow-hidden group hover:border-red-600/30 transition-all`}>
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <stat.icon size={50} />
                                    </div>
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className={`text-4xl font-black italic uppercase ${stat.color || 'text-white'}`}>{stat.value}</p>
                                    {stat.delta !== undefined && (
                                        <div className="mt-4 flex items-center gap-2">
                                            <span className="text-[8px] font-black bg-white/10 px-2 py-0.5 text-white">+{stat.delta} {stat.deltaLabel}</span>
                                            <TrendingUp size={10} className="text-green-500" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Mid Section: Chart & Leads */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white/10 border border-white/10 p-8 space-y-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Terminal size={200} /></div>
                                <div className="flex justify-between items-center relative z-10">
                                    <h4 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                                        <TrendingUp size={16} className="text-red-600" /> UNIT GROWTH ACCELERATION
                                    </h4>
                                    <span className="text-[9px] font-black text-white/30 uppercase">7-DAY CACHE</span>
                                </div>
                                <div className="relative z-10">
                                    <UserGrowthBar list={users} />
                                </div>
                            </div>

                            <div className="bg-red-600 p-8 space-y-6 relative overflow-hidden group flex flex-col justify-between">
                                <Zap className="absolute top-0 right-0 opacity-10 blur-sm group-hover:scale-125 transition-transform" size={200} />
                                <div className="relative z-10">
                                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/60 mb-2">LIVE EVENT FEED</h4>
                                    <div className="space-y-4 mt-4">
                                        {liveEvents.slice(0, 4).map(e => (
                                            <div key={e.id} className="border-l-2 border-white/20 pl-3 py-1">
                                                <p className="text-[10px] font-black text-white uppercase truncate">{e.title || 'SYSTEM UPDATE'}</p>
                                                <p className="text-[8px] text-black font-bold uppercase tracking-widest truncate">{e.userEmail}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[9px] font-black text-black uppercase bg-white px-2 py-1 inline-block">SUPREME_WATCH_ENABLED</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'users' && (
                    <motion.div
                        key="users"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        {/* Search & Filters */}
                        <div className="space-y-6">
                            {/* Big Search Bar */}
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-600 transition-colors" size={24} />
                                <input
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="SEARCH BY EMAIL, NAME OR SYSTEM ID..."
                                    className="w-full bg-white/5 border-2 border-white/5 p-8 pl-16 text-xl font-black italic tracking-tighter uppercase outline-none focus:border-red-600/50 focus:bg-white/10 transition-all placeholder:text-gray-800"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-2"
                                    >
                                        <X size={24} />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4 items-center">
                                <div className="flex bg-white/5 p-1 border border-white/10 shrink-0">
                                    {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setFilterStatus(status)}
                                            className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === status ? 'bg-red-600 text-white shadow-red-glow' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                                <div className="ml-auto text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] bg-white/5 px-4 py-2 border border-white/10">
                                    UNITS FOUND: <span className="text-red-600 ml-1">{filteredUsers.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* User Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredUsers.length === 0 ? (
                                <div className="col-span-full py-20 text-center space-y-4 bg-white/5 border border-dashed border-white/10">
                                    <UserMinus className="mx-auto text-gray-700" size={50} />
                                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest">ZERO MATCHES IN SYSTEM CACHE</p>
                                    <button onClick={() => { setSearchTerm(''); setFilterStatus('ALL'); }} className="text-[10px] font-black text-red-600 uppercase border border-red-600/30 px-6 py-2 hover:bg-red-600 hover:text-white transition-all">RESET FILTERS</button>
                                </div>
                            ) : (
                                <>
                                    {filteredUsers.slice(0, visibleCount).map(u => (
                                        <motion.div
                                            layout
                                            key={u.id}
                                            className="bg-black border-2 border-white/5 p-8 space-y-6 hover:border-red-600/40 transition-all group relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                {u.status === 'approved' ? <CheckCircle2 size={100} /> : <AlertCircle size={100} />}
                                            </div>

                                            <div className="flex justify-between items-start relative z-10">
                                                <div className="w-16 h-16 bg-red-600 flex items-center justify-center font-black italic skew-x-[-10deg] shadow-lg group-hover:scale-110 transition-transform overflow-hidden border-2 border-white/10">
                                                    {u.photoURL ? (
                                                        <img src={u.photoURL} alt="" className="w-full h-full object-cover skew-x-[10deg] scale-125" />
                                                    ) : (
                                                        <span className="text-2xl">{u.email?.[0].toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`text-[9px] font-black px-3 py-1 border-2 ${u.status === 'approved' ? 'border-green-600 text-green-500' :
                                                        u.status === 'pending' ? 'border-yellow-600 text-yellow-500' :
                                                            'border-red-600 text-red-600'
                                                        } uppercase tracking-tighter leading-none`}>
                                                        {u.status || 'NEW'}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${u.subscriptionActive ? 'bg-green-500 animate-pulse' : 'bg-red-600'}`}></span>
                                                        <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">{u.subscriptionActive ? 'LINK ACTIVE' : 'EXPIRED'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative z-10">
                                                <p className="text-sm font-black text-white uppercase truncate tracking-tighter mb-1">{u.email}</p>
                                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest truncate">{u.displayName || 'ANONYMOUS UNIT'}</p>
                                            </div>

                                            <div className="pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">JOINED SYNC</p>
                                                    <div className="flex items-center gap-2 text-white/40">
                                                        <Calendar size={10} />
                                                        <p className="text-[10px] font-black uppercase">
                                                            {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">SYSTEM ID</p>
                                                    <p className="text-[10px] font-black text-red-600 uppercase font-mono tracking-tighter">#{u.id.substring(0, 8)}</p>
                                                </div>
                                            </div>

                                            {/* SUPREME OVERRIDE BUTTONS - Visible by default on mobile, hover-only on desktop */}
                                            <div className="grid grid-cols-2 gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 mt-2 lg:mt-0 p-1 lg:p-0">
                                                {u.status !== 'approved' && (
                                                    <button
                                                        onClick={() => handleSupremeApprove(u)}
                                                        className="py-3 lg:py-2 bg-green-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-green-600 shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <ShieldCheck size={12} /> AUTHORIZE
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleSupremeDelete(u)}
                                                    className="py-3 lg:py-2 bg-black/60 lg:bg-white/10 text-red-600 text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-red-600/40"
                                                >
                                                    <Skull size={12} /> TERMINATE
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {filteredUsers.length > visibleCount && (
                                        <div className="col-span-full py-10 flex justify-center">
                                            <button
                                                onClick={() => setVisibleCount(prev => prev + 12)}
                                                className="px-12 py-4 bg-white/5 border border-white/10 text-[10px] font-black text-white hover:bg-red-600 hover:border-red-600 transition-all uppercase tracking-[0.3em] italic"
                                            >
                                                CARGAR MÁS UNIDADES <ChevronDown className="inline ml-2 animate-bounce" size={16} />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}

                {view === 'command' && (
                    <motion.div
                        key="command"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto space-y-10"
                    >
                        <div className="bg-red-600/5 border-2 border-red-600 p-10 space-y-8 relative overflow-hidden">
                            <BellRing className="absolute -top-10 -right-10 opacity-5" size={300} />

                            <div className="relative z-10">
                                <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase flex items-center gap-4">
                                    <Zap className="text-red-600" /> SYSTEM-WIDE BROADCAST
                                </h3>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">EMERGENCY TRANSMISSION TO ALL CONNECTED UNITS</p>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <textarea
                                    value={broadcastMsg}
                                    onChange={e => setBroadcastMsg(e.target.value)}
                                    placeholder="ENTER COMMAND DIRECTIVE..."
                                    className="w-full bg-black border border-white/10 p-6 text-sm font-black italic tracking-widest uppercase outline-none focus:border-red-600 min-h-[150px] placeholder:text-gray-800"
                                />
                                <button
                                    onClick={handleBroadcast}
                                    disabled={isBroadcasting || !broadcastMsg}
                                    className="w-full py-5 bg-red-600 text-white font-black italic uppercase tracking-[0.4em] text-xs hover:bg-white hover:text-red-600 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                                >
                                    {isBroadcasting ? 'TRANSMITTING...' : 'INITIATE DEPLOYMENT'} <Send size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 border border-white/10 p-8 space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-red-600">MAINTENANCE OPS</h4>
                                <div className="space-y-2">
                                    <button className="w-full p-4 bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 uppercase tracking-widest text-left hover:border-red-600 transition-all flex justify-between items-center group">
                                        FLUSH SYSTEM LOGS <RefreshCw size={14} className="group-hover:rotate-180 transition-transform" />
                                    </button>
                                    <button className="w-full p-4 bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 uppercase tracking-widest text-left hover:border-red-600 transition-all flex justify-between items-center group">
                                        RESET SIGNAL CACHE <Activity size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-8 space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-red-600">SECURITY AUDIT</h4>
                                <div className="space-y-2">
                                    <button className="w-full p-4 bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 uppercase tracking-widest text-left hover:border-red-600 transition-all flex justify-between items-center group">
                                        SCAN FOR MALWARE <ShieldCheck size={14} />
                                    </button>
                                    <button className="w-full p-4 bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 uppercase tracking-widest text-left hover:border-red-600 transition-all flex justify-between items-center group">
                                        ENFORCE SSL SYNC <Activity size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'logs' && (
                    <motion.div
                        key="logs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-black border border-white/10 p-10 font-mono space-y-6 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Terminal size={400} /></div>

                        <div className="flex justify-between items-center border-b border-white/10 pb-6 relative z-10">
                            <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">RAW SYSTEM_LOGS.EXE</h3>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] text-green-500 tracking-widest">● LIVE STREAMING</span>
                                <button className="text-[9px] text-red-600 uppercase font-black hover:text-white transition-colors">EXPORT DATA</button>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10 max-h-[600px] overflow-y-auto custom-scrollbar">
                            {liveEvents.map(log => (
                                <div key={log.id} className="flex gap-6 py-3 border-b border-white/5 hover:bg-white/5 transition-all group">
                                    <span className="text-gray-600 text-[10px] shrink-0">[{log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString() : '00:00:00'}]</span>
                                    <span className="text-red-600 text-[10px] font-black uppercase shrink-0 w-24">{log.type || 'SYSTEM'}</span>
                                    <div className="flex-1">
                                        <p className="text-white/80 text-[10px] uppercase font-bold tracking-tight">{log.title}: {log.message || log.body}</p>
                                        <p className="text-[8px] text-gray-600 uppercase mt-1">SOURCE_ENTITY: {log.userEmail || 'INTERNAL_KERNEL'}</p>
                                    </div>
                                    <span className="text-gray-800 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">PID_{log.id.substring(0, 6)}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupremeDashboard;
