import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, writeBatch, Timestamp, deleteDoc } from 'firebase/firestore';
import { Clock, Search, Calendar, UserCheck, AlertTriangle, Shield, Trash2, Smartphone } from 'lucide-react';

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
        if (!confirm(`¿OTORGAR ACCESO DE POR VIDA A ${userEmail}?`)) return;
        setProcessing(true);
        try {
            // Set date to year 9999
            const lifetimeEnd = new Date('9999-12-31');
            await updateDoc(doc(db, "users", userId), {
                subscriptionEnd: Timestamp.fromDate(lifetimeEnd),
                status: 'approved'
            });
            alert(`ACCESO DE POR VIDA OTORGADO A ${userEmail}`);
        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        }
        setProcessing(false);
    };

    const deactivateUser = async (userId, userEmail) => {
        if (!confirm(`¿DESACTIVAR SUSCRIPCIÓN PARA ${userEmail}? Esto la expirará inmediatamente.`)) return;
        setProcessing(true);
        try {
            // Set date to yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            await updateDoc(doc(db, "users", userId), {
                subscriptionEnd: Timestamp.fromDate(yesterday),
                status: 'payment_required'
            });
            alert(`SUSCRIPCIÓN DESACTIVADA PARA ${userEmail}`);
        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        }
        setProcessing(false);
    };

    const deleteUser = async (userId, userEmail) => {
        if (!confirm(`¿ELIMINAR PERMANENTEMENTE A ${userEmail}? ESTO NO SE PUEDE DESHACER. Si el usuario se une de nuevo, comenzará como una unidad nueva.`)) return;
        setProcessing(true);
        try {
            await deleteDoc(doc(db, "users", userId));
            alert(`USUARIO ${userEmail} ELIMINADO DEL SISTEMA`);
        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        }
        setProcessing(false);
    };

    const sendExtensionEmail = async (userDoc, daysAdded, newExpiry) => {
        try {
            const responseHtml = await fetch('/extension-email.html');
            if (!responseHtml.ok) return;
            let htmlContent = await responseHtml.text();

            const userName = userDoc.displayName || 'Trader';
            const userEmail = userDoc.email;

            htmlContent = htmlContent.replace(/{{USER_NAME}}/g, userName);
            htmlContent = htmlContent.replace(/{{DAYS_ADDED}}/g, daysAdded);
            htmlContent = htmlContent.replace(/{{NEW_EXPIRY}}/g, newExpiry);

            let apiUrl = 'https://indexgeniusacademy.com/api/auth/send-welcome-email';
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                apiUrl = '/api/auth/send-welcome-email';
            }

            await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail,
                    name: userName,
                    htmlContent: htmlContent
                })
            });
        } catch (e) {
            console.error("Email error:", e);
        }
    };

    const extendMembership = async (userId, userEmail, currentEnd, days) => {
        const daysInt = parseInt(days);
        if (!confirm(`¿Agregar ${daysInt} días a ${userEmail}?`)) return;
        setProcessing(true);
        try {
            let newEnd;
            const now = new Date();
            const currentEndDate = currentEnd && currentEnd.toDate ? currentEnd.toDate() : (currentEnd ? new Date(currentEnd) : null);

            if (currentEndDate && currentEndDate.getFullYear() > 3000) {
                alert("La unidad ya tiene acceso de por vida.");
                setProcessing(false);
                return;
            }

            if (currentEndDate && currentEndDate > now) {
                newEnd = new Date(currentEndDate);
                newEnd.setDate(newEnd.getDate() + daysInt);
            } else {
                newEnd = new Date();
                newEnd.setDate(newEnd.getDate() + daysInt);
            }

            const alertData = {
                daysAdded: daysInt,
                timestamp: Timestamp.now(),
                seen: false
            };

            await updateDoc(doc(db, "users", userId), {
                subscriptionEnd: Timestamp.fromDate(newEnd),
                extensionAlert: alertData,
                status: 'approved'
            });

            // Send Email
            const expiryStr = newEnd.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
            await sendExtensionEmail({ id: userId, email: userEmail, displayName: users.find(u => u.id === userId)?.displayName }, daysInt, expiryStr);

            alert(`Se agregaron ${daysInt} días a ${userEmail} y se envió correo de notificación.`);
        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        }
        setProcessing(false);
    };

    const extendAllMemberships = async () => {
        if (!confirm(`ADVERTENCIA: Esto agregará ${extensionDays} días a los ${users.length} usuarios. ¿Está seguro?`)) return;
        setProcessing(true);
        try {
            const batchSize = 500;
            let batch = writeBatch(db);
            let operationCount = 0;
            let batchCount = 0;
            const affectedUsers = [];
            const daysInt = parseInt(extensionDays);

            const now = new Date();

            for (const user of users) {
                if (user.status === 'rejected') continue;

                const userRef = doc(db, "users", user.id);
                let newEnd;
                const currentEndDate = user.subscriptionEnd && user.subscriptionEnd.toDate ? user.subscriptionEnd.toDate() : (user.subscriptionEnd ? new Date(user.subscriptionEnd) : null);

                if (currentEndDate && currentEndDate.getFullYear() > 3000) continue;

                if (currentEndDate && currentEndDate > now) {
                    newEnd = new Date(currentEndDate);
                    newEnd.setDate(newEnd.getDate() + daysInt);
                } else {
                    newEnd = new Date();
                    newEnd.setDate(newEnd.getDate() + daysInt);
                }

                const alertData = {
                    daysAdded: daysInt,
                    timestamp: Timestamp.now(),
                    seen: false
                };

                batch.update(userRef, {
                    subscriptionEnd: Timestamp.fromDate(newEnd),
                    extensionAlert: alertData,
                });

                // Prepare email (we'll send them after batch commit to not block the DB write)
                const expiryStr = newEnd.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
                affectedUsers.push({ user, expiryStr });

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

            // Massive Email Notification (Async)
            if (affectedUsers.length > 0) {
                alert(`ACTUALIZACIÓN COMPLETADA. Enviando notificacones por correo a ${affectedUsers.length} usuarios...`);

                // Process in small groups to avoid crushing the browser/API
                const groupSize = 5;
                for (let i = 0; i < affectedUsers.length; i += groupSize) {
                    const group = affectedUsers.slice(i, i + groupSize);
                    await Promise.all(group.map(item =>
                        sendExtensionEmail(item.user, daysInt, item.expiryStr)
                    ));
                    // Small delay between groups
                    if (i + groupSize < affectedUsers.length) await new Promise(r => setTimeout(r, 500));
                }
            }

            alert(`Operación masiva completada con éxito.`);
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
                    <h3 className="text-xl font-black italic text-white uppercase flex items-center gap-2"><Clock className="text-red-600" /> CONTROL DE MEMBRESÍAS</h3>
                    <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">GESTIONAR TIEMPOS DE SUSCRIPCIÓN Y EXTENSIONES</p>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto bg-red-900/10 p-4 border border-red-600/20">
                    <div className="text-[10px] font-black text-red-500 uppercase tracking-widest whitespace-nowrap">RECUPERACIÓN MASIVA:</div>
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
                        {processing ? 'PROCESANDO...' : 'SUMAR DÍAS A TODOS'}
                    </button>
                </div>
            </div>

            <div className="bg-black border border-white/10 p-4">
                <div className="flex items-center gap-3 bg-white/5 p-3 border border-white/5 mb-4">
                    <Search className="text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="BUSCAR OPERADOR POR EMAIL O NOMBRE..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent w-full text-white font-bold text-sm outline-none placeholder:text-gray-600 uppercase"
                    />
                </div>

                <div className="space-y-4">
                    {/* Header - Only Desktop */}
                    <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/10">
                        <div className="col-span-4">OPERADOR</div>
                        <div className="col-span-2 text-center">ESTADO</div>
                        <div className="col-span-2 text-center">EXPIRACIÓN</div>
                        <div className="col-span-4 text-right">ACCIONES</div>
                    </div>

                    <div className="space-y-3">
                        {filteredUsers.map(user => (
                            <div key={user.id} className="bg-white/[0.02] lg:bg-transparent border border-white/5 lg:border-none p-4 lg:p-0 lg:px-6 lg:py-4 transition-colors grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                                {/* Operator Info */}
                                <div className="lg:col-span-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                            <UserCheck size={16} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm uppercase tracking-tight">{user.displayName || 'DESCONOCIDO'}</div>
                                            <div className="flex flex-col">
                                                <div className="text-[10px] text-gray-500 font-mono">{user.email}</div>
                                                {user.phone && (
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-green-500 font-black tracking-tighter uppercase">PH: {user.phone}</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(`https://wa.me/${user.phone.replace(/\D/g, '')}`, '_blank');
                                                            }}
                                                            className="p-1 bg-green-500/10 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all rounded"
                                                        >
                                                            <Smartphone size={8} />
                                                        </button>
                                                    </div>
                                                )}
                                                {user.referredBy && (
                                                    <div className="mt-1">
                                                        <span className="text-[7px] font-black text-red-600 bg-red-600/5 px-2 py-0.5 border border-red-600/10 uppercase tracking-tighter">
                                                            REF: {user.referredBy.substring(0, 8)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="lg:col-span-2 flex lg:justify-center items-center gap-3">
                                    <span className="lg:hidden text-[8px] font-black text-gray-600 uppercase tracking-widest">ESTADO:</span>
                                    <span className={`text-[9px] font-black px-2 py-1 border ${user.status === 'approved' ? 'border-green-500/30 text-green-500 bg-green-500/10' : 'border-red-600/30 text-red-600 bg-red-600/10'}`}>
                                        {user.status === 'approved' ? 'APROBADO' : user.status === 'pending' ? 'PENDIENTE' : 'PAGO REQUERIDO'}
                                    </span>
                                </div>

                                {/* Expiration */}
                                <div className="lg:col-span-2 flex lg:flex-col lg:items-center justify-start gap-3">
                                    <span className="lg:hidden text-[8px] font-black text-gray-600 uppercase tracking-widest">EXPIRACIÓN:</span>
                                    <div className="lg:text-center">
                                        <div className={`font-black text-xs uppercase ${getStatusColor(user)}`}>
                                            {getDaysLeft(user) === 'EXPIRED' ? 'EXPIRADO' : getDaysLeft(user) === 'LIFETIME' ? 'DE POR VIDA' : getDaysLeft(user).replace('DAYS', 'DÍAS')}
                                        </div>
                                        <div className="text-[9px] text-gray-600 font-mono mt-0.5">
                                            {user.subscriptionEnd?.toDate ? user.subscriptionEnd.toDate().toLocaleDateString() : 'SIN DATOS'}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Container - Stacked on mobile */}
                                <div className="lg:col-span-4 pt-4 lg:pt-0 border-t border-white/5 lg:border-none">
                                    <div className="flex flex-wrap items-center lg:justify-end gap-2">
                                        <button
                                            onClick={() => extendMembership(user.id, user.email, user.subscriptionEnd, 3)}
                                            className="flex-1 lg:flex-none px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black text-white hover:text-green-400 transition-colors uppercase whitespace-nowrap"
                                        >
                                            +3 DÍAS
                                        </button>
                                        <button
                                            onClick={() => extendMembership(user.id, user.email, user.subscriptionEnd, 7)}
                                            className="flex-1 lg:flex-none px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black text-white hover:text-blue-400 transition-colors uppercase whitespace-nowrap"
                                        >
                                            +7 DÍAS
                                        </button>
                                        <button
                                            onClick={() => {
                                                const days = prompt("Ingrese días a sumar:", "30");
                                                if (days) extendMembership(user.id, user.email, user.subscriptionEnd, days);
                                            }}
                                            className="flex-1 lg:flex-none px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black text-white hover:text-red-400 transition-colors uppercase whitespace-nowrap"
                                        >
                                            PERSONALIZADO
                                        </button>
                                        <button
                                            onClick={() => setLifetime(user.id, user.email)}
                                            className="flex-1 lg:flex-none px-3 py-2 bg-purple-900/20 hover:bg-purple-900/40 border border-purple-500/30 text-[9px] font-black text-purple-400 hover:text-purple-300 transition-colors uppercase whitespace-nowrap"
                                        >
                                            DE POR VIDA
                                        </button>
                                        <button
                                            onClick={() => deactivateUser(user.id, user.email)}
                                            className="flex-1 lg:flex-none px-3 py-2 bg-yellow-900/20 hover:bg-yellow-900/40 border border-yellow-600/30 text-[9px] font-black text-yellow-500 hover:text-yellow-400 transition-colors uppercase whitespace-nowrap"
                                        >
                                            DESACTIVAR
                                        </button>
                                        <button
                                            onClick={() => deleteUser(user.id, user.email)}
                                            className="flex-1 lg:flex-none px-3 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-600/30 text-[9px] font-black text-red-500 hover:text-red-400 transition-colors uppercase whitespace-nowrap flex items-center justify-center gap-1"
                                        >
                                            <Trash2 size={12} /> ELIMINAR
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="p-12 text-center text-gray-500 text-xs font-black uppercase tracking-widest border-2 border-dashed border-white/5 mt-4">
                            NO SE ENCONTRARON OPERADORES EN EL SISTEMA
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MembershipControl;
