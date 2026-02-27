import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, limit, Timestamp, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ShieldCheck, Clock, CheckCircle, XCircle, RefreshCw, User, Globe, Search, Filter, Check } from 'lucide-react';

const PaymentAudit = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        // Quitamos el limit(50) para ver todo el historial
        const q = query(
            collection(db, "payment_logs"),
            orderBy("receivedAt", "desc")
        );

        const unsub = onSnapshot(q, (snapshot) => {
            setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const handleManualApprove = async (log) => {
        if (!window.confirm(`¿FORZAR ACTIVACIÓN para ${log.email}?\nConfirmar solo si has verificado el pago de $${log.amount} en tu wallet.`)) return;

        setActionLoading(log.id);
        try {
            // 1. Actualizar Usuario
            const userRef = doc(db, "users", log.userId);
            const subscriptionEnd = new Date();
            subscriptionEnd.setDate(subscriptionEnd.getDate() + 30); // 30 días de suscripción

            await updateDoc(userRef, {
                status: 'approved',
                subscriptionActive: true,
                subscriptionStart: serverTimestamp(),
                subscriptionEnd: Timestamp.fromDate(subscriptionEnd),
                selectedPlan: log.plan,
                paymentMethod: `MANUAL_CRYPTO_${log.currency?.toUpperCase()}`,
                manuallyApprovedByAdmin: true
            });

            // 2. Marcar log como completado manualmente
            const logRef = doc(db, "payment_logs", log.id);
            await updateDoc(logRef, {
                status: 'finished',
                manualApproval: true,
                approvedAt: serverTimestamp()
            });

            alert(`ÉXITO: ${log.email} ha sido activado correctamente.`);
        } catch (error) {
            console.error("Error en aprobación manual:", error);
            alert("Error al activar usuario: " + error.message);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'finished':
            case 'confirmed':
                return {
                    bg: 'bg-green-500/10',
                    border: 'border-green-500/30',
                    text: 'text-green-500',
                    icon: <CheckCircle size={14} />,
                    label: 'PAGO COMPLETADO'
                };
            case 'confirming':
            case 'sending':
                return {
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/30',
                    text: 'text-blue-500',
                    icon: <RefreshCw size={14} className="animate-spin" />,
                    label: 'VERIFICANDO RED'
                };
            case 'waiting':
                return {
                    bg: 'bg-yellow-500/10',
                    border: 'border-yellow-500/30',
                    text: 'text-yellow-500',
                    icon: <Clock size={14} />,
                    label: 'ESPERANDO DEPÓSITO'
                };
            case 'partially_paid':
                return {
                    bg: 'bg-orange-500/10',
                    border: 'border-orange-500/30',
                    text: 'text-orange-500',
                    icon: <Clock size={14} />,
                    label: 'PAGO PARCIAL'
                };
            case 'expired':
            case 'failed':
                return {
                    bg: 'bg-red-600/10',
                    border: 'border-red-600/30',
                    text: 'text-red-500',
                    icon: <XCircle size={14} />,
                    label: 'ERROR / EXPIRADO'
                };
            default:
                return {
                    bg: 'bg-white/5',
                    border: 'border-white/10',
                    text: 'text-gray-400',
                    icon: <Clock size={14} />,
                    label: status?.toUpperCase() || 'PROCESANDO'
                };
        }
    };

    const formatDate = (ts) => {
        if (!ts) return 'N/A';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userId?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'ALL' ||
            (statusFilter === 'COMPLETED' && (log.status === 'finished' || log.status === 'confirmed')) ||
            (statusFilter === 'PENDING' && (log.status === 'waiting' || log.status === 'confirming' || log.status === 'sending' || log.status === 'partially_paid')) ||
            (statusFilter === 'FAILED' && (log.status === 'expired' || log.status === 'failed'));

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-white/10 pb-6 gap-4">
                <div>
                    <h3 className="text-xl font-black italic text-white uppercase flex items-center gap-2">
                        <ShieldCheck className="text-red-600" /> AUDITORÍA NOWPAYMENTS
                    </h3>
                    <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">HISTORIAL COMPLETO DE TRANSACCIONES BLOCKCHAIN</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Búsqueda */}
                    <div className="relative flex-1 lg:min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                        <input
                            type="text"
                            placeholder="BUSCAR POR EMAIL, UID O ID PAGO..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 text-[10px] font-black text-white uppercase outline-none focus:border-red-600 transition-all placeholder:text-gray-700"
                        />
                    </div>

                    {/* Filtro Estado */}
                    <div className="flex bg-white/5 border border-white/10 p-1">
                        {['ALL', 'COMPLETED', 'PENDING', 'FAILED'].map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-4 py-2 text-[9px] font-black uppercase tracking-tighter transition-all ${statusFilter === f ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:text-white'}`}
                            >
                                {f === 'ALL' ? 'VER TODO' : f === 'COMPLETED' ? 'EXITOSOS' : f === 'PENDING' ? 'PENDIENTES' : 'FALLIDOS'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-500">
                        <RefreshCw className="animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest">SINCRONIZANDO PROTOCOLOS...</span>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="py-20 border-2 border-dashed border-white/5 text-center text-gray-600">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">NO SE ENCONTRARON REGISTROS CON ESOS CRITERIOS</p>
                        <button onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }} className="mt-4 text-[9px] text-red-600 font-black uppercase underline tracking-widest">LIMPIAR FILTROS</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">
                                    <th className="p-4">ORDEN CRONOLÓGICO</th>
                                    <th className="p-4">UNIDAD / OPERADOR</th>
                                    <th className="p-4">VALOR / ESTRATEGIA</th>
                                    <th className="p-4">ESTADO TÁCTICO</th>
                                    <th className="p-4">ACCIONES</th>
                                    <th className="p-4 text-right">TERMINAL ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredLogs.map(log => {
                                    const styles = getStatusStyles(log.status);
                                    const isCompleted = log.status === 'finished' || log.status === 'confirmed';

                                    return (
                                        <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors translate-z-0">
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-white italic">{formatDate(log.receivedAt)}</span>
                                                    <span className="text-[8px] text-gray-600 uppercase font-bold tracking-tighter">PROTOCOLO REGISTRADO</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-white/5 flex items-center justify-center border border-white/10 opacity-40 group-hover:opacity-100 group-hover:border-red-600/30 transition-all">
                                                        <User size={14} className="text-gray-400 group-hover:text-red-500" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-bold text-white uppercase truncate max-w-[150px]">{log.email}</span>
                                                        <span className="text-[8px] text-gray-600 font-mono tracking-tighter uppercase">{log.userId?.substring(0, 15)}...</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[13px] font-black text-white tabular-nums">${log.amount}</span>
                                                        <span className="text-[9px] font-bold text-red-600 uppercase italic">{log.currency?.toUpperCase()}</span>
                                                    </div>
                                                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter leading-none">{log.plan}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className={`inline-flex flex-col items-start gap-1`}>
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 border transition-all duration-500 ${styles.border} ${styles.bg} ${styles.text} rounded-sm shadow-sm`}>
                                                        {styles.icon}
                                                        <span className="text-[9px] font-black tracking-widest uppercase whitespace-nowrap">{styles.label}</span>
                                                    </div>
                                                    {log.manualApproval && (
                                                        <span className="text-[7px] font-black text-green-500 uppercase tracking-widest">APROBACIÓN MANUAL</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {!isCompleted ? (
                                                    <button
                                                        onClick={() => handleManualApprove(log)}
                                                        disabled={actionLoading === log.id}
                                                        className="px-4 py-2 bg-red-600/10 border border-red-600/30 text-red-600 text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                                                    >
                                                        {actionLoading === log.id ? 'ACTIVANDO...' : 'APROBAR'}
                                                    </button>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                                        <Check size={16} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-mono text-gray-500 group-hover:text-white transition-colors">{log.paymentId}</span>
                                                    <span className="text-[7px] font-black text-gray-700 uppercase tracking-tighter italic">REF ORDER: {log.orderId?.split('_')[1] || '---'}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="p-6 bg-red-600/5 border border-red-600/10 rounded-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[9px] font-bold text-gray-500 uppercase leading-relaxed tracking-widest text-center md:text-left">
                    SISTEMA DE AUDITORÍA BLOCKCHAIN ACTIVO. SE MUESTRAN TODOS LOS REGISTROS HISTÓRICOS. <br />
                    FILTRADOS POR RELEVANCIA TEMPORAL (MÁS RECIENTES PRIMERO).
                </p>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-black text-white tabular-nums">{logs.length}</span>
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">LOGS TOTALES</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-black text-green-500 tabular-nums">{logs.filter(l => l.status === 'finished' || l.status === 'confirmed').length}</span>
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">CONFIRMADOS</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentAudit;
