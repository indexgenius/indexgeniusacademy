import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, Check, Trash2, StopCircle, Users, Image, ExternalLink, File, XCircle } from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';

const UserManagement = ({ adminUser }) => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [renewalUsers, setRenewalUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [userFilter, setUserFilter] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editExpiry, setEditExpiry] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editUpdating, setEditUpdating] = useState(false);
    const [editPending, setEditPending] = useState(null); // New state variable
    const [searchQuery, setSearchQuery] = useState(''); // New state variable
    const [preApproveEmail, setPreApproveEmail] = useState(''); // New state variable
    const [preApproveLoading, setPreApproveLoading] = useState(false); // New state variable
    const [preApproveName, setPreApproveName] = useState(''); // New state variable

    useEffect(() => {
        const unsubPending = onSnapshot(query(collection(db, "users"), where("status", "==", "pending")), (snapshot) => {
            setPendingUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubRenewal = onSnapshot(query(collection(db, "users"), where("status", "==", "renewal_pending")), (snapshot) => {
            setRenewalUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Fetch all users that are not pending or renewal (those are in their own lists)
        // This includes 'approved', 'payment_required', and others for full visibility
        const unsubAll = onSnapshot(query(collection(db, "users"), where("status", "in", ["approved", "payment_required", "rejected"])), (snapshot) => {
            setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubPending();
            unsubRenewal();
            unsubAll();
        };
    }, []);

    const handlePreApprove = async (e) => {
        e.preventDefault();
        if (!preApproveEmail) {
            alert("Por favor, introduce un correo electrónico.");
            return;
        }
        setPreApproveLoading(true);
        try {
            const userRef = doc(db, "users", preApproveEmail.toLowerCase());
            await setDoc(userRef, {
                email: preApproveEmail.toLowerCase(),
                status: 'pre_approved',
                createdAt: serverTimestamp(),
                approvedBy: adminUser.email,
                displayName: preApproveName || null,
                selectedPlan: 'ELITE ACCESS', // Default plan
                membershipPrice: '25' // Default price
            }, { merge: true }); // Use merge to avoid overwriting if doc exists

            alert(`Correo ${preApproveEmail} pre-aprobado. Cuando se registre, será aprobado automáticamente.`);
            setPreApproveEmail('');
            setPreApproveName('');
        } catch (error) {
            console.error("Error pre-aprobando usuario:", error);
            alert("Error al pre-aprobar el correo: " + error.message);
        } finally {
            setPreApproveLoading(false);
        }
    };

    const handleApprove = async (userDoc) => {
        if (!confirm(`¿APROBAR ACCESO PARA ${userDoc.email}?`)) return;
        try {
            const now = new Date();
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);

            await updateDoc(doc(db, "users", userDoc.id), {
                status: 'approved',
                subscriptionActive: true,
                subscriptionStart: now,
                subscriptionEnd: expiry,
                approvedAt: serverTimestamp(),
                receiptUrl: null,
                paymentReported: null
            });

            const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

            // 1. Send push notification
            fetch('https://indexgeniusacademy.com/api/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: "ACCESO CONCEDIDO",
                    body: "BIENVENIDO A INDEX GENIUS ACADEMY. TU CUENTA ESTÁ ACTIVA.",
                    targetEmail: userDoc.email
                })
            }).catch(console.error);

            // 2. Fetch the email template, replace data, and send email via Resend
            try {
                const responseHtml = await fetch('/testemail.html');
                if (responseHtml.ok) {
                    let htmlContent = await responseHtml.text();

                    const planName = userDoc.selectedPlan || 'ELITE ACCESS';
                    const planPrice = userDoc.membershipPrice || '25';
                    const userName = userDoc.displayName || 'Traders';
                    const userEmail = userDoc.email || '';
                    const generatedPassword = userDoc.tmpPassword || 'Contacta a soporte';

                    htmlContent = htmlContent.replace(/{{USER_NAME}}/g, userName);
                    htmlContent = htmlContent.replace(/{{PLAN_NAME}}/g, planName);
                    htmlContent = htmlContent.replace(/{{PLAN_PRICE}}/g, planPrice);
                    htmlContent = htmlContent.replace(/{{USER_EMAIL}}/g, userEmail);
                    htmlContent = htmlContent.replace(/{{USER_PASSWORD}}/g, generatedPassword);

                    let apiUrl = 'https://indexgeniusacademy.com/api/auth/send-welcome-email';
                    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                        apiUrl = '/api/auth/send-welcome-email';
                    }

                    const mailRes = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: userEmail,
                            name: userName,
                            htmlContent: htmlContent
                        })
                    });

                    const mailData = await mailRes.json();
                    if (mailData.success) {
                        console.log("✅ Welcome email sent successfully");
                        // Solo borramos la clave temporal si el correo se envió con éxito
                        if (userDoc.tmpPassword) {
                            await updateDoc(doc(db, "users", userDoc.id), {
                                tmpPasswordKey: userDoc.tmpPassword, // Guardamos una copia segura oculta si quieres, o simplemente no la borramos del todo aún
                                // tmpPassword: null // Lo dejamos por ahora para que el admin pueda verla si el correo falla
                            });
                        }
                    } else {
                        throw new Error(mailData.error || "Error en el servidor de correo");
                    }
                }
            } catch (err) {
                console.error("❌ Error sending welcome email:", err);
                alert("AVISO: El usuario fue aprobado pero el correo de bienvenida falló: " + err.message);
            }

            alert("SISTEMA: UNIDAD APROBADA Y NOTIFICADA.");
        } catch (e) {
            alert("FALLO CRÍTICO EN LA APROBACIÓN: " + e.message);
        }
    };

    const handleResendWelcome = async (user) => {
        if (!user.tmpPassword && !user.tmpPasswordKey) {
            alert("NO HAY CONTRASEÑA TEMPORAL REGISTRADA PARA ESTA UNIDAD.");
            return;
        }

        setEditUpdating(true);
        try {
            const responseHtml = await fetch('/testemail.html');
            if (!responseHtml.ok) throw new Error("No se pudo cargar la plantilla");
            let htmlContent = await responseHtml.text();

            const password = user.tmpPassword || user.tmpPasswordKey;

            htmlContent = htmlContent.replace(/{{USER_NAME}}/g, user.displayName || 'Trader');
            htmlContent = htmlContent.replace(/{{PLAN_NAME}}/g, user.selectedPlan || 'ACCESS');
            htmlContent = htmlContent.replace(/{{PLAN_PRICE}}/g, user.membershipPrice || '25');
            htmlContent = htmlContent.replace(/{{USER_EMAIL}}/g, user.email);
            htmlContent = htmlContent.replace(/{{USER_PASSWORD}}/g, password);

            let apiUrl = 'https://indexgeniusacademy.com/api/auth/send-welcome-email';
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                apiUrl = '/api/auth/send-welcome-email';
            }

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    name: user.displayName,
                    htmlContent: htmlContent
                })
            });

            const data = await res.json();
            if (data.success) {
                alert("¡CORREO RE-ENVIADO CON ÉXITO!");
            } else {
                throw new Error(data.error);
            }
        } catch (e) {
            alert("ERROR AL RE-ENVIAR: " + e.message);
        } finally {
            setEditUpdating(false);
        }
    };

    const handleReject = async (uid) => {
        if (!confirm("¿DENEGAR ACCESO? ESTO NO SE PUEDE DESHACER FÁCILMENTE.")) return;
        try {
            await updateDoc(doc(db, "users", uid), { status: 'rejected' });
        } catch (e) {
            alert("FALLO EN EL RECHAZO: " + e.message);
        }
    };

    const handleRenew = async (userDoc) => {
        if (!confirm(`¿CONFIRMAR RENOVACIÓN PARA ${userDoc.email}?`)) return;
        try {
            const now = new Date();
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);

            await updateDoc(doc(db, "users", userDoc.id), {
                status: 'approved',
                subscriptionActive: true,
                subscriptionStart: now,
                subscriptionEnd: expiry,
                renewedAt: serverTimestamp()
            });

            const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
            fetch('https://indexgeniusacademy.com/api/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: "SUSCRIPCIÓN RENOVADA",
                    body: "TU ACCESO TÁCTICO HA SIDO EXTENDIDO POR 30 DÍAS.",
                    targetEmail: userDoc.email
                })
            }).catch(console.error);

            alert("RENOVACIÓN EXITOSA");
        } catch (e) {
            alert("FALLO EN LA RENOVACIÓN: " + e.message);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!editingUser) return;
        setEditUpdating(true);
        try {
            const updates = {};

            if (editExpiry) {
                const expiryDate = new Date(editExpiry);
                updates.subscriptionEnd = expiryDate;
                updates.subscriptionActive = expiryDate > new Date();
            }

            if (editEmail && editEmail !== editingUser.email) {
                updates.email = editEmail.toLowerCase().trim();
            }

            if (editPassword) {
                updates.tmpPassword = editPassword;
            }

            await updateDoc(doc(db, "users", editingUser.id), updates);
            alert("DATOS DE USUARIO ACTUALIZADOS EN FIRESTORE");
            setEditingUser(null);
        } catch (e) {
            alert("FALLO EN LA ACTUALIZACIÓN: " + e.message);
        } finally {
            setEditUpdating(false);
        }
    };

    const handleTriggerPasswordReset = async (email) => {
        if (!confirm(`¿ENVIAR CORREO DE RESTABLECIMIENTO A ${email}?`)) return;
        try {
            await sendPasswordResetEmail(auth, email);
            alert("CORREO DE RESTABLECIMIENTO ENVIADO");
        } catch (e) {
            alert("ERROR AL ENVIAR: " + e.message);
        }
    };

    const handleToggleTemplateAccess = async (userDoc) => {
        const currentStatus = userDoc.hasTemplateAccess || false;
        if (!confirm(`¿${currentStatus ? 'QUITAR' : 'CONCEDER'} ACCESO A PLANTILLAS PARA ${userDoc.email}?`)) return;

        try {
            await updateDoc(doc(db, "users", userDoc.id), {
                hasTemplateAccess: !currentStatus,
                templateStatusChangedAt: serverTimestamp()
            });
            alert(`ACCESO A PLANTILLAS: ${!currentStatus ? 'CONCEDIDO' : 'REVOCADO'}`);
        } catch (e) {
            alert("FALLO AL ELIMINAR: " + e.message);
        }
    };

    const handleDeleteUser = async (uid) => {
        if (!confirm("¿ESTÁS SEGURO DE ELIMINAR ESTE USUARIO? ESTA ACCIÓN ES IRREVERSIBLE.")) return;
        try {
            await deleteDoc(doc(db, "users", uid));
            alert("USUARIO ELIMINADO");
        } catch (e) {
            alert("FALLO AL ELIMINAR: " + e.message);
        }
    };

    const filteredUsers = allUsers.filter(u =>
        u.email?.toLowerCase().includes(userFilter.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(userFilter.toLowerCase())
    ).slice(0, 10);

    return (
        <div className="max-w-2xl mx-auto space-y-8 pt-8">
            {/* LISTA PENDIENTE */}
            <div className="space-y-4 mb-8 border-b border-white/10 pb-8">
                <h3 className="text-sm font-black text-yellow-500 uppercase tracking-widest animate-pulse">APROBACIONES PENDIENTES ({pendingUsers.length})</h3>
                {pendingUsers.length === 0 && <p className="text-[10px] text-gray-600 italic tracking-widest">SIN SOLICITUDES PENDIENTES</p>}
                {pendingUsers.map(u => (
                    <div key={u.id} className="bg-white/5 p-4 border-l-2 border-yellow-500 space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                                    {u.photoURL ? (
                                        <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Users size={16} className="text-gray-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white uppercase">{u.email}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-[9px] text-gray-500 uppercase tracking-wider">{u.displayName}</p>
                                        {u.selectedPlan && (
                                            <span className="text-[8px] font-black text-yellow-500 bg-yellow-500/10 px-2 py-0.5 border border-yellow-500/20 uppercase tracking-tighter">
                                                {u.selectedPlan} — ${u.membershipPrice || '?'}
                                            </span>
                                        )}
                                        {u.referredBy && (
                                            <span className="text-[8px] font-black text-red-600 bg-red-600/10 px-2 py-0.5 border border-red-600/20 uppercase tracking-tighter">
                                                REF: {u.referredBy.substring(0, 8)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleApprove(u)} className="px-4 py-2 bg-green-500/20 text-green-500 text-[10px] font-black border border-green-500/50 hover:bg-green-500 hover:text-black transition-all uppercase tracking-widest">ACEPTAR</button>
                                <button onClick={() => handleReject(u.id)} className="px-4 py-2 bg-red-600/20 text-red-600 text-[10px] font-black border border-red-600/50 hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest">DENEGAR</button>
                            </div>
                        </div>

                        {/* Receipt Preview */}
                        {u.receiptUrl && (
                            <div className="flex items-center gap-3 bg-black/40 border border-white/5 p-3 rounded">
                                <a href={u.receiptUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                                    <img src={u.receiptUrl} alt="Comprobante" className="w-16 h-16 object-cover rounded border border-white/10 hover:border-yellow-500 transition-colors cursor-pointer" />
                                </a>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-1"><Image size={10} /> COMPROBANTE DE PAGO</p>
                                    <a href={u.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-[8px] text-blue-400 hover:text-blue-300 uppercase tracking-wider underline flex items-center gap-1 mt-1">
                                        VER EN TAMAÑO COMPLETO <ExternalLink size={8} />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* LISTA DE RENOVACIÓN */}
            <div className="space-y-4 mb-8 border-b border-white/10 pb-8">
                <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest animate-pulse">SOLICITUDES DE RENOVACIÓN ({renewalUsers.length})</h3>
                {renewalUsers.length === 0 && <p className="text-[10px] text-gray-600 italic tracking-widest">SIN SOLICITUDES DE RENOVACIÓN</p>}
                {renewalUsers.map(u => (
                    <div key={u.id} className="bg-white/5 p-4 flex justify-between items-center border-l-2 border-blue-500">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                                {u.photoURL ? (
                                    <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Users size={16} className="text-gray-600" />
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white uppercase">{u.email}</p>
                                <p className="text-[9px] text-gray-500 uppercase tracking-wider">SOLICITÓ RENOVACIÓN</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleRenew(u)} className="px-4 py-2 bg-blue-500/20 text-blue-500 text-[10px] font-black border border-blue-500/50 hover:bg-blue-500 hover:text-black transition-all uppercase tracking-widest">RENOVAR 30 DÍAS</button>
                            <button onClick={() => handleReject(u.id)} className="px-4 py-2 bg-red-600/20 text-red-600 text-[10px] font-black border border-red-600/50 hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest">DENEGAR</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* SECCIÓN DE PRE-APROBACIÓN RÁPIDA */}
            <div className="mb-8 bg-red-600/5 border border-red-600/20 p-6 rounded-sm">
                <div className="flex items-center gap-3 mb-4 text-red-600 uppercase font-black italic tracking-widest text-xs">
                    <Users size={16} /> REGISTRO DE UNIDAD EXTERNA
                </div>
                <form onSubmit={handlePreApprove} className="flex flex-col lg:flex-row gap-3">
                    <input
                        type="email"
                        placeholder="CORREO DE LA NUEVA UNIDAD"
                        value={preApproveEmail}
                        onChange={(e) => setPreApproveEmail(e.target.value)}
                        className="bg-black/40 border border-white/10 p-4 text-xs font-bold text-white outline-none flex-grow"
                    />
                    <button
                        type="submit"
                        disabled={preApproveLoading}
                        className="bg-red-600 text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50"
                    >
                        {preApproveLoading ? 'PROCESANDO...' : 'GENERAR PROTOCOLO'}
                    </button>
                </form>
                <p className="mt-3 text-[9px] text-gray-500 font-bold uppercase tracking-wider italic">
                    * ESTO TE DARÁ LAS INSTRUCCIONES PARA VINCULAR A UN USUARIO QUE AÚN NO SE HA REGISTRADO.
                </p>
            </div>

            <div className="space-y-6">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">BÚSQUEDA TÁCTICA AVANZADA</h3>
                <div className="flex gap-2">
                    <input
                        value={userFilter}
                        onChange={e => setUserFilter(e.target.value)}
                        placeholder="FILTRAR POR EMAIL O NOMBRE..."
                        className="flex-1 bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none placeholder:text-gray-600 focus:border-red-600 transition-colors"
                    />
                    <div className="p-4 bg-white/5 text-gray-600 border border-white/10">
                        <Search size={20} />
                    </div>
                </div>

                <div className="space-y-2">
                    {filteredUsers.map(u => (
                        <div key={u.id} className="bg-white/5 border border-white/10 p-4 group hover:bg-white/10 transition-all">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                                        {u.photoURL ? (
                                            <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Users size={16} className="text-gray-600" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-white uppercase truncate">{u.email}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate">{u.displayName || 'UNIDAD ANÓNIMA'}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${u.status === 'approved' ? (u.subscriptionActive ? 'bg-green-500 animate-pulse' : 'bg-red-600') : 'bg-yellow-500'}`}></div>
                                        <span className="text-[8px] font-black text-gray-500 uppercase">
                                            {u.status === 'approved' ? (u.subscriptionActive ? 'ACTIVO' : 'EXPIRADO') : u.status}
                                        </span>
                                    </div>
                                    {u.status === 'payment_required' && (
                                        <button
                                            onClick={() => handleApprove(u)}
                                            className="text-[7px] font-black bg-green-600 text-white px-2 py-0.5 uppercase tracking-tighter"
                                        >
                                            APROBAR MANUALMENTE
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 mt-2 lg:mt-0">
                                <button
                                    onClick={() => {
                                        setEditingUser(u);
                                        setEditEmail(u.email || '');
                                        setEditPassword(u.tmpPassword || '');
                                        if (u.subscriptionEnd) {
                                            const date = u.subscriptionEnd.toMillis ? new Date(u.subscriptionEnd.toMillis()) : new Date(u.subscriptionEnd);
                                            setEditExpiry(date.toISOString().split('T')[0]);
                                        } else {
                                            setEditExpiry('');
                                        }
                                    }}
                                    className="px-4 py-3 lg:px-3 lg:py-1 bg-blue-600 text-white text-[10px] lg:text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20"
                                >
                                    GESTIONAR
                                </button>
                                <button
                                    onClick={() => handleTriggerPasswordReset(u.email)}
                                    className="px-4 py-3 lg:px-3 lg:py-1 bg-yellow-600 text-black text-[10px] lg:text-[9px] font-black uppercase tracking-widest shadow-lg shadow-yellow-600/20"
                                >
                                    RESET PASS
                                </button>
                                <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="px-4 py-3 lg:px-3 lg:py-1 bg-red-600 text-white text-[10px] lg:text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20"
                                >
                                    ELIMINAR
                                </button>
                                <button
                                    onClick={() => handleToggleTemplateAccess(u)}
                                    className={`px-4 py-3 lg:px-3 lg:py-1 text-[10px] lg:text-[9px] font-black uppercase tracking-widest border-2 flex items-center gap-1 ${u.hasTemplateAccess ? 'border-green-600 text-green-600 bg-green-600/10' : 'border-white/20 text-white/40 bg-black/40'}`}
                                >
                                    <File size={12} /> {u.hasTemplateAccess ? 'QUITAR PLANTILLAS' : 'DAR PLANTILLAS'}
                                </button>
                                <button
                                    onClick={async () => {
                                        const current = u.canBroadcast;
                                        await updateDoc(doc(db, "users", u.id), { canBroadcast: !current });
                                        alert(`ESTADO DEL OPERADOR: ${!current ? 'ENCENDIDO' : 'APAGADO'}`);
                                    }}
                                    className={`px-4 py-3 lg:px-3 lg:py-1 text-[10px] lg:text-[9px] font-black uppercase tracking-widest border-2 ${u.canBroadcast ? 'border-red-600 text-red-600 bg-red-600/10' : 'border-white/20 text-white/40 bg-black/40'}`}
                                >
                                    {u.canBroadcast ? 'DESACTIVAR OPS' : 'ACTIVAR OPS'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {editingUser && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <div className="bg-black border border-white/5 p-8 max-w-md w-full space-y-6 shadow-red-glow">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">GESTOR DE UNIDAD</h3>
                            <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-white"><StopCircle /></button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">EMAIL DE REGISTRO</label>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={e => setEditEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 p-4 text-white font-mono text-xs outline-none focus:border-blue-500"
                                    placeholder="NUEVO EMAIL"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">CONTRASEÑA TEMPORAL / NOTA</label>
                                <input
                                    type="text"
                                    value={editPassword}
                                    onChange={e => setEditPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 p-4 text-white font-mono text-xs outline-none focus:border-blue-500"
                                    placeholder="NUEVA CONTRASEÑA"
                                />
                                <p className="text-[8px] text-gray-600 uppercase">Nota: Cambiar esto solo actualiza el registro visible. Usa 'ENVIAR RESET' para cambio real en Auth.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">FECHA DE EXPIRACIÓN</label>
                                <input
                                    type="date"
                                    value={editExpiry}
                                    onChange={e => setEditExpiry(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 p-4 text-white font-mono outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    type="submit"
                                    disabled={editUpdating}
                                    className="flex-1 py-4 bg-red-600 text-white font-black text-[10px] tracking-widest uppercase hover:bg-white hover:text-black transition-all disabled:opacity-50"
                                >
                                    {editUpdating ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                                </button>
                            </div>
                        </form>

                        <div className="border-t border-white/10 pt-4 space-y-3">
                            <button
                                onClick={() => handleResendWelcome(editingUser)}
                                disabled={editUpdating}
                                className="w-full py-4 bg-blue-600/10 border border-blue-600/50 text-blue-500 font-black text-[10px] tracking-widest uppercase hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                            >
                                {editUpdating ? 'PROCESANDO...' : 'REENVIAR BIENVENIDA (CON CLAVE)'}
                            </button>
                            <button
                                onClick={() => handleTriggerPasswordReset(editingUser.email)}
                                className="w-full py-4 bg-yellow-600/10 border border-yellow-600/50 text-yellow-600 font-black text-[10px] tracking-widest uppercase hover:bg-yellow-600 hover:text-black transition-all"
                            >
                                ENVIAR LINK DE RECUPERACIÓN (AUTH)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
