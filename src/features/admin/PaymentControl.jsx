import React, { useState, useEffect } from 'react';
import { Wallet, RefreshCw, Trash2, Landmark, Smartphone } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import TacticalSelect from '../../components/TacticalSelect';

const PaymentControl = () => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [pmForm, setPmForm] = useState({ category: 'CRIPTO', name: '', value: '', owner: '', icon: 'Wallet' });
    const [pmLoading, setPmLoading] = useState(false);

    useEffect(() => {
        return onSnapshot(collection(db, "payment_methods"), (snapshot) => {
            setPaymentMethods(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    }, []);

    const CATEGORY_OPTIONS = [
        { value: 'CRIPTO', label: 'CRIPTO (USDT, BINANCE)' },
        { value: 'BANCO', label: 'BANCO (BANCOLOMBIA)' },
        { value: 'APP', label: 'APP DIGITAL (NEQUI)' },
    ];

    const ICON_OPTIONS = [
        { value: 'Wallet', label: 'BILLETERA POR DEFECTO' },
        { value: 'Landmark', label: 'LOGO BANCO' },
        { value: 'Smartphone', label: 'APP MÓVIL' },
        { value: 'usdt', label: 'LOGO USDT' },
        { value: 'binance', label: 'LOGO BINANCE' },
        { value: 'nequi', label: 'LOGO NEQUI' },
        { value: 'bancolombia', label: 'LOGO BANCOLOMBIA' },
        { value: 'bitcoin', label: 'LOGO BITCOIN' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pmForm.name || !pmForm.value) return;
        setPmLoading(true);
        try {
            if (pmForm.id) {
                const { id, ...data } = pmForm;
                await updateDoc(doc(db, "payment_methods", id), data);
                alert("CANAL ACTUALIZADO");
            } else {
                await addDoc(collection(db, "payment_methods"), pmForm);
                alert("CANAL REGISTRADO");
            }
            setPmForm({ category: 'CRIPTO', name: '', value: '', owner: '', icon: 'Wallet' });
        } catch (e) { console.error(e); }
        setPmLoading(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿TERMINAR ESTE CANAL DE PAGO?')) return;
        await deleteDoc(doc(db, "payment_methods", id));
    };

    const seedTacticalPayments = async () => {
        if (!confirm('¿FORZAR LA CARGA DE DATOS DE PAGO POR DEFECTO?')) return;
        const defaults = [
            { category: 'CRIPTO', name: 'USDT BEP20', value: '0x144e498af4fefaad6c92beda2c5bf7d0e32ac7f6', owner: '', icon: 'usdt' },
            { category: 'CRIPTO', name: 'USDT TRC20', value: 'TEKjEEne4rihqtYvqBpjkszbW8NTMWxdxt', owner: '', icon: 'usdt' },
            { category: 'CRIPTO', name: 'BINANCE ID', value: '1143079866', owner: 'YainelisOFC', icon: 'binance' },
            { category: 'APP', name: 'NEQUI', value: '3053442573', owner: 'YESITH HOMEZ', icon: 'nequi' },
            { category: 'BANCO', name: 'BANCOLOMBIA', value: '67800020193', owner: 'YESITH HOMEZ', icon: 'bancolombia' },
        ];
        for (const d of defaults) await addDoc(collection(db, "payment_methods"), d);
        alert('SISTEMA: 6 MÉTODOS DE PAGO INICIALIZADOS');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
            <div className="space-y-6">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">{pmForm.id ? 'EDITAR CANAL' : 'AGREGAR CANAL DE PAGO'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 bg-black border border-white/5 p-6 shadow-red-glow/5 relative">
                    <TacticalSelect
                        options={CATEGORY_OPTIONS}
                        value={pmForm.category}
                        onChange={val => setPmForm({ ...pmForm, category: val })}
                        placeholder="SELECCIONAR CATEGORÍA"
                    />
                    <input placeholder="NOMBRE DEL MÉTODO" value={pmForm.name} onChange={e => setPmForm({ ...pmForm, name: e.target.value.toUpperCase() })} className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none" />
                    <input placeholder="VALOR / DIRECCIÓN" value={pmForm.value} onChange={e => setPmForm({ ...pmForm, value: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none" />
                    <input placeholder="NOMBRE DEL TITULAR" value={pmForm.owner} onChange={e => setPmForm({ ...pmForm, owner: e.target.value.toUpperCase() })} className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none" />
                    <TacticalSelect
                        options={ICON_OPTIONS}
                        value={pmForm.icon}
                        onChange={val => setPmForm({ ...pmForm, icon: val })}
                        placeholder="SELECCIONAR LOGO"
                    />
                    <button disabled={pmLoading} className={`w-full py-4 text-white text-xs font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all ${pmForm.id ? 'bg-blue-600' : 'bg-red-600'}`}>
                        {pmLoading ? 'SINCRONIZANDO...' : pmForm.id ? 'ACTUALIZAR CANAL' : 'AUTORIZAR CANAL'}
                    </button>
                    {pmForm.id && (
                        <button type="button" onClick={() => setPmForm({ category: 'CRIPTO', name: '', value: '', owner: '', icon: 'Wallet' })} className="w-full py-2 text-[8px] font-black text-gray-500 hover:text-white transition-colors">[ CANCELAR EDICIÓN ]</button>
                    )}
                    <button type="button" onClick={seedTacticalPayments} className="w-full text-[9px] font-black text-gray-700 hover:text-red-500 transition-colors pt-4 uppercase tracking-[0.3em]">[ INICIALIZAR PAGOS TÁCTICOS ]</button>
                </form>
            </div>

            <div className="space-y-6">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">AUDITORÍA DEL SISTEMA: MÉTODOS ACTIVOS</h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {paymentMethods.map(pm => (
                        <div key={pm.id} className="p-5 bg-white/5 border border-white/10 flex justify-between items-center group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gray-800 group-hover:bg-red-600 transition-colors"></div>
                            <div className="flex items-center gap-4 pl-2">
                                <div className="w-10 h-10 bg-black border border-white/10 flex items-center justify-center p-1">
                                    {pm.icon === 'bancolombia' ? <img src="/img/metodos/logos/Logo_Bancolombia2.png" className="w-full h-full object-contain" alt="BAN" /> :
                                        pm.icon === 'nequi' ? <img src="/img/metodos/logos/nequi-37254.png" className="w-8 h-8 object-contain" alt="NEQ" /> :
                                            pm.icon === 'binance' ? <img src="/img/metodos/logos/Binance_logo.svg.png" className="w-8 h-8 object-contain" alt="BIN" /> :
                                                pm.icon === 'usdt' ? <img src="/img/metodos/logos/Tether_Logo.svg.png" className="w-8 h-8 object-contain" alt="USD" /> :
                                                    pm.icon === 'bitcoin' ? <img src="/img/metodos/logos/Bitcoin_logo.svg.png" className="w-8 h-8 object-contain" alt="BTC" /> :
                                                        <Wallet size={16} className="text-gray-600" />}
                                </div>
                                <div>
                                    <span className="text-[8px] font-black text-red-600 uppercase tracking-[0.2em] mb-1 block">{pm.category}</span>
                                    <p className="text-sm font-black text-white italic tracking-tight">{pm.name}</p>
                                    <p className="text-[10px] font-mono font-bold text-gray-500 break-all max-w-[150px] lg:max-w-xs">{pm.value}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setPmForm(pm)} className="p-3 bg-white/5 text-gray-400 hover:text-white transition-all"><RefreshCw size={14} /></button>
                                <button onClick={() => handleDelete(pm.id)} className="p-3 bg-red-600/10 text-red-600 border border-red-600/30 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PaymentControl;
