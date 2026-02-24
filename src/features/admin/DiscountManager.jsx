import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Copy, Check, X } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const DiscountManager = () => {
    const [codes, setCodes] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [copied, setCopied] = useState(null);

    // New code form
    const [newCode, setNewCode] = useState('');
    const [discountType, setDiscountType] = useState('percentage');
    const [discountValue, setDiscountValue] = useState('');
    const [maxUses, setMaxUses] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [validPlans, setValidPlans] = useState([]);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "discount_codes"), (snapshot) => {
            setCodes(snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0)));
        });
        return () => unsub();
    }, []);

    const handleCreate = async () => {
        if (!newCode.trim() || !discountValue) return;
        try {
            await addDoc(collection(db, "discount_codes"), {
                code: newCode.trim().toUpperCase(),
                type: discountType,
                value: Number(discountValue),
                maxUses: maxUses ? Number(maxUses) : null,
                currentUses: 0,
                validPlans: validPlans.length > 0 ? validPlans : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                active: true,
                createdAt: serverTimestamp()
            });
            setNewCode('');
            setDiscountValue('');
            setMaxUses('');
            setExpiresAt('');
            setValidPlans([]);
            setShowCreate(false);
        } catch (err) {
            console.error(err);
            alert("Error al crear código");
        }
    };

    const toggleActive = async (codeDoc) => {
        await updateDoc(doc(db, "discount_codes", codeDoc.id), { active: !codeDoc.active });
    };

    const handleDelete = async (id) => {
        if (!confirm("¿ELIMINAR ESTE CÓDIGO?")) return;
        await deleteDoc(doc(db, "discount_codes", id));
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), 2000);
    };

    const togglePlan = (planId) => {
        setValidPlans(prev => prev.includes(planId) ? prev.filter(p => p !== planId) : [...prev, planId]);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pt-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Tag size={16} className="text-red-600" /> CÓDIGOS DE DESCUENTO
                    </h3>
                    <p className="text-[9px] text-gray-600 italic tracking-widest mt-1">{codes.length} CÓDIGO(S) REGISTRADO(S)</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2"
                >
                    <Plus size={14} /> CREAR
                </button>
            </div>

            {/* Create Form */}
            {showCreate && (
                <div className="bg-white/5 border border-white/10 p-6 space-y-4">
                    <h4 className="text-xs font-black text-red-600 uppercase tracking-widest">NUEVO CÓDIGO</h4>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">CÓDIGO</label>
                        <input
                            type="text"
                            value={newCode}
                            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                            placeholder="EJ: ELITE50"
                            className="w-full bg-black border border-white/10 p-3 text-sm font-bold text-white uppercase outline-none focus:border-red-600"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">TIPO</label>
                            <select
                                value={discountType}
                                onChange={(e) => setDiscountType(e.target.value)}
                                className="w-full bg-black border border-white/10 p-3 text-sm font-bold text-white outline-none focus:border-red-600"
                            >
                                <option value="percentage">PORCENTAJE (%)</option>
                                <option value="fixed">MONTO FIJO ($)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">VALOR</label>
                            <input
                                type="number"
                                value={discountValue}
                                onChange={(e) => setDiscountValue(e.target.value)}
                                placeholder={discountType === 'percentage' ? 'EJ: 50' : 'EJ: 100'}
                                className="w-full bg-black border border-white/10 p-3 text-sm font-bold text-white outline-none focus:border-red-600"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">USOS MÁXIMOS (OPCIONAL)</label>
                            <input
                                type="number"
                                value={maxUses}
                                onChange={(e) => setMaxUses(e.target.value)}
                                placeholder="ILIMITADO"
                                className="w-full bg-black border border-white/10 p-3 text-sm font-bold text-white outline-none focus:border-red-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">EXPIRA (OPCIONAL)</label>
                            <input
                                type="date"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                className="w-full bg-black border border-white/10 p-3 text-sm font-bold text-white outline-none focus:border-red-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">PLANES VÁLIDOS (VACÍO = TODOS)</label>
                        <div className="flex gap-2">
                            {['index-one', 'index-pro', 'index-black'].map(planId => (
                                <button
                                    key={planId}
                                    onClick={() => togglePlan(planId)}
                                    className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${validPlans.includes(planId) ? 'bg-red-600 border-red-600 text-white' : 'bg-black border-white/10 text-gray-500 hover:border-white/30'}`}
                                >
                                    {planId.replace('index-', 'INDEX ').toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleCreate}
                            disabled={!newCode.trim() || !discountValue}
                            className="flex-1 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-40"
                        >
                            CREAR CÓDIGO
                        </button>
                        <button
                            onClick={() => setShowCreate(false)}
                            className="px-6 py-3 bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                        >
                            CANCELAR
                        </button>
                    </div>
                </div>
            )}

            {/* Codes List */}
            <div className="space-y-3">
                {codes.length === 0 && (
                    <p className="text-[10px] text-gray-600 italic tracking-widest text-center py-8">NO HAY CÓDIGOS CREADOS</p>
                )}
                {codes.map(code => (
                    <div key={code.id} className={`border p-4 transition-all ${code.active ? 'border-white/10 bg-white/5' : 'border-white/5 bg-white/[0.02] opacity-50'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleCopy(code.code)} className="flex items-center gap-2">
                                    <span className="text-sm font-black text-white uppercase tracking-widest">{code.code}</span>
                                    {copied === code.code ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-gray-600" />}
                                </button>
                                <span className={`text-[8px] font-black px-2 py-0.5 uppercase tracking-widest ${code.active ? 'text-green-500 bg-green-500/10 border border-green-500/20' : 'text-red-500 bg-red-500/10 border border-red-500/20'}`}>
                                    {code.active ? 'ACTIVO' : 'INACTIVO'}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleActive(code)}
                                    className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest border transition-all ${code.active ? 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500 hover:text-black' : 'border-green-500/30 text-green-500 hover:bg-green-500 hover:text-black'}`}
                                >
                                    {code.active ? 'DESACTIVAR' : 'ACTIVAR'}
                                </button>
                                <button
                                    onClick={() => handleDelete(code.id)}
                                    className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest border border-red-600/30 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                            <span>{code.type === 'percentage' ? `${code.value}% OFF` : `$${code.value} OFF`}</span>
                            <span>•</span>
                            <span>USOS: {code.currentUses || 0}{code.maxUses ? ` / ${code.maxUses}` : ' / ∞'}</span>
                            {code.validPlans && (
                                <>
                                    <span>•</span>
                                    <span>PLANES: {code.validPlans.map(p => p.replace('index-', '').toUpperCase()).join(', ')}</span>
                                </>
                            )}
                            {code.expiresAt && (
                                <>
                                    <span>•</span>
                                    <span>EXPIRA: {code.expiresAt.toDate ? code.expiresAt.toDate().toLocaleDateString() : new Date(code.expiresAt).toLocaleDateString()}</span>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DiscountManager;
