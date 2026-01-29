import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, writeBatch, Timestamp } from 'firebase/firestore';
import { Clock, Search, Calendar, UserCheck, AlertTriangle, Shield } from 'lucide-react';

const MembershipControl = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [extensionDays, setExtensionDays] = useState(5);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setUsers(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const getStatusColor = (user) => {
        if (!user.subscriptionEnd) return 'text-gray-500';
        const end = user.subscriptionEnd.toDate ? user.subscriptionEnd.toDate() : new Date(user.subscriptionEnd);
        if (end.getFullYear() > 3000) return 'text-purple-500'; // Lifetime
        const daysLeft = Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) return 'text-red-600';
        if (daysLeft < 5) return 'text-yellow-500';
        return 'text-green-500';
    };

    const getDaysLeft = (user) => {
        if (!user.subscriptionEnd) return 'N/A';
        const end = user.subscriptionEnd.toDate ? user.subscriptionEnd.toDate() : new Date(user.subscriptionEnd);
        if (end.getFullYear() > 3000) return 'LIFETIME';
        const daysLeft = Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
        return daysLeft < 0 ? 'EXPIRED' : `${daysLeft} DAYS`;
    };

    const setLifetime = async (userId, userEmail) => {
        if (!confirm(`GRANT LIFETIME ACCESS TO ${userEmail}?`)) return;
        setProcessing(true);
        try {
            // Set date to year 9999
            const lifetimeEnd = new Date('9999-12-31');
            await updateDoc(doc(db, "users", userId), {
                subscriptionEnd: Timestamp.fromDate(lifetimeEnd),
                status: 'approved'
            });
            alert(`LIFETIME ACCESS GRANTED TO ${userEmail}`);
        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        }
        setProcessing(false);
    };

    const deactivateUser = async (userId, userEmail) => {
        if (!confirm(`DEACTIVATE SUBSCRIPTION FOR ${userEmail}? This will expire them immediately.`)) return;
        setProcessing(true);
        try {
            // Set date to yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            await updateDoc(doc(db, "users", userId), {
                subscriptionEnd: Timestamp.fromDate(yesterday),
                status: 'payment_required'
            });
            alert(`SUBSCRIPTION DEACTIVATED FOR ${userEmail}`);
        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        }
        setProcessing(false);
    };

    const extendMembership = async (userId, userEmail, currentEnd, days) => {
        if (!confirm(`Add ${days} days to ${userEmail}?`)) return;
        setProcessing(true);
        try {
            let newEnd;
            const now = new Date();
            const currentEndDate = currentEnd && currentEnd.toDate ? currentEnd.toDate() : (currentEnd ? new Date(currentEnd) : null);

            // If current is lifetime/far future, don't add days, just keeping it lifetime or reset?
            // Assuming adding days to lifetime doesn't make sense unless we switch to finite. 
            // If year > 3000, we treat as current.
            if (currentEndDate && currentEndDate.getFullYear() > 3000) {
                // Even if lifetime, adding days effectively does nothing or we could reset to now + days. 
                // Let's assume extending a lifetime user keeps them lifetime.
                alert("User has Lifetime Access already.");
                setProcessing(false);
                return;
            }

            if (currentEndDate && currentEndDate > now) {
                newEnd = new Date(currentEndDate);
                newEnd.setDate(newEnd.getDate() + parseInt(days));
            } else {
                newEnd = new Date();
                newEnd.setDate(newEnd.getDate() + parseInt(days));
            }

            const alertData = {
                daysAdded: parseInt(days),
                timestamp: Timestamp.now(),
                seen: false
            };

            await updateDoc(doc(db, "users", userId), {
                subscriptionEnd: Timestamp.fromDate(newEnd),
                extensionAlert: alertData,
                status: 'approved'
            });

            alert(`Added ${days} days to ${userEmail}`);
        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        }
        setProcessing(false);
    };

    const extendAllMemberships = async () => {
        if (!confirm(`WARNING: This will add ${extensionDays} days to ALL ${users.length} users. Are you sure?`)) return;
        setProcessing(true);
        try {
            const batchSize = 500;
            let batch = writeBatch(db);
            let operationCount = 0;
            let batchCount = 0;

            const now = new Date();

            for (const user of users) {
                // Only active or approved users usually, but user said "all" in case of outage
                // Let's stick to approved/payment_required/expired to be safe, filtering out pending/rejected if needed
                // For now, let's do all except rejected
                if (user.status === 'rejected') continue;

                const userRef = doc(db, "users", user.id);
                let newEnd;
                const currentEndDate = user.subscriptionEnd && user.subscriptionEnd.toDate ? user.subscriptionEnd.toDate() : (user.subscriptionEnd ? new Date(user.subscriptionEnd) : null);

                if (currentEndDate && currentEndDate > now) {
                    newEnd = new Date(currentEndDate);
                    newEnd.setDate(newEnd.getDate() + parseInt(extensionDays));
                } else {
                    newEnd = new Date();
                    newEnd.setDate(newEnd.getDate() + parseInt(extensionDays));
                }

                const alertData = {
                    daysAdded: parseInt(extensionDays),
                    timestamp: Timestamp.now(),
                    seen: false
                };

                batch.update(userRef, {
                    subscriptionEnd: Timestamp.fromDate(newEnd),
                    extensionAlert: alertData,
                    // status: 'approved' // Optional: Reactivate everyone? Maybe risky. Let's just extend time.
                });

                operationCount++;
                if (operationCount >= batchSize) {
                    await batch.commit();
                    batch = writeBatch(db);
                    operationCount = 0;
                    batchCount++;
                }
            }

            if (operationCount > 0) {
                await batch.commit();
            }

            alert(`Successfully processed massive extension for all users.`);
        } catch (error) {
            console.error(error);
            alert("Error in massive update: " + error.message);
        }
        setProcessing(false);
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/10 pb-6">
                <div>
                    <h3 className="text-xl font-black italic text-white uppercase flex items-center gap-2"><Clock className="text-red-600" /> MEMBERSHIP CONTROL</h3>
                    <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">MANAGE SUBSCRIPTION TIMES & EXTENSIONS</p>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto bg-red-900/10 p-4 border border-red-600/20">
                    <div className="text-[10px] font-black text-red-500 uppercase tracking-widest whitespace-nowrap">MASSIVE RECOVERY:</div>
                    <input
                        type="number"
                        value={extensionDays}
                        onChange={(e) => setExtensionDays(e.target.value)}
                        className="w-16 bg-black border border-red-600/30 text-white font-black p-2 text-center outline-none focus:border-red-600"
                    />
                    <button
                        onClick={extendAllMemberships}
                        disabled={processing}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 font-black text-[10px] tracking-widest uppercase flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {processing ? 'PROCESSING...' : 'ADD DAYS TO ALL'}
                    </button>
                </div>
            </div>

            <div className="bg-black border border-white/10 p-4">
                <div className="flex items-center gap-3 bg-white/5 p-3 border border-white/5 mb-4">
                    <Search className="text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH OPERATOR BY EMAIL OR NAME..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent w-full text-white font-bold text-sm outline-none placeholder:text-gray-600 uppercase"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/10">
                                <th className="p-3">OPERATOR</th>
                                <th className="p-3">STATUS</th>
                                <th className="p-3">EXPIRATION</th>
                                <th className="p-3 text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center">
                                                <UserCheck size={14} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-xs uppercase">{user.displayName || 'UNKNOWN'}</div>
                                                <div className="text-[10px] text-gray-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className={`text-[9px] font-black px-2 py-1 border ${user.status === 'approved' ? 'border-green-500/30 text-green-500 bg-green-500/10' : 'border-red-600/30 text-red-600 bg-red-600/10'}`}>
                                            {user.status || 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className={`font-bold text-xs uppercase ${getStatusColor(user)}`}>
                                            {getDaysLeft(user)}
                                        </div>
                                        <div className="text-[9px] text-gray-600 font-mono">
                                            {user.subscriptionEnd?.toDate ? user.subscriptionEnd.toDate().toLocaleDateString() : 'NO DATA'}
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex flex-wrap items-center justify-end gap-2">
                                            <button
                                                onClick={() => extendMembership(user.id, user.email, user.subscriptionEnd, 3)}
                                                className="px-2 py-1 lg:px-3 lg:py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-[8px] lg:text-[9px] font-black text-white hover:text-green-400 transition-colors uppercase whitespace-nowrap"
                                            >
                                                +3 DAYS
                                            </button>
                                            <button
                                                onClick={() => extendMembership(user.id, user.email, user.subscriptionEnd, 7)}
                                                className="px-2 py-1 lg:px-3 lg:py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-[8px] lg:text-[9px] font-black text-white hover:text-blue-400 transition-colors uppercase whitespace-nowrap"
                                            >
                                                +7 DAYS
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const days = prompt("Enter days to add:", "30");
                                                    if (days) extendMembership(user.id, user.email, user.subscriptionEnd, days);
                                                }}
                                                className="px-2 py-1 lg:px-3 lg:py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-[8px] lg:text-[9px] font-black text-white hover:text-red-400 transition-colors uppercase whitespace-nowrap"
                                            >
                                                CUSTOM
                                            </button>
                                            <button
                                                onClick={() => setLifetime(user.id, user.email)}
                                                className="px-2 py-1 lg:px-3 lg:py-1 bg-purple-900/20 hover:bg-purple-900/40 border border-purple-500/30 text-[8px] lg:text-[9px] font-black text-purple-400 hover:text-purple-300 transition-colors uppercase whitespace-nowrap"
                                            >
                                                LIFETIME
                                            </button>
                                            <button
                                                onClick={() => deactivateUser(user.id, user.email)}
                                                className="px-2 py-1 lg:px-3 lg:py-1 bg-red-900/20 hover:bg-red-900/40 border border-red-600/30 text-[8px] lg:text-[9px] font-black text-red-500 hover:text-red-400 transition-colors uppercase whitespace-nowrap"
                                            >
                                                DEACTIVATE
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-xs font-black uppercase tracking-widest">
                            NO OPERATORS FOUND
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MembershipControl;
