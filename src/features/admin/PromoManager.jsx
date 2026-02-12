import React, { useState, useEffect } from 'react';
import { Image, Save, Trash2, Power, ChevronUp, ChevronDown, Plus, RefreshCw } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { formatDrivePreview } from '../../utils/mediaUtils';


const PromoManager = () => {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(false);

    const SLOTS = [
        { id: 'bridge', title: 'BRIDGE MARKETS', img: '/img/promos/bridge_markets_promo_v2.jpg', defaultDesc: 'EXCLUSIVO: OPERA SINTÉTICOS CON BONOS DEL 100% HASTA EL 200%', link: 'https://trading.bridgemarkets.global/register?ref=af2fad19-0a06-4b62-8&branchUuid=759c4fa8-df5b-4cdc-97ae-7' },
        { id: 'weltrade', title: 'WELTRADE INTEG', img: '/img/promos/weltrade.jpg', defaultDesc: 'PRÓXIMAS ALERTAS DE LA PLATAFORMA' },
        { id: 'affiliate', title: 'AFFILIATE -25%', img: '/img/promos/discount.jpg', defaultDesc: 'RECOMPENSAS POR REFERIR ACTIVAS' },
    ];

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const initGapi = () => {
            window.gapi.load('client:auth2', () => {
                window.gapi.client.init({
                    apiKey: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY,
                    clientId: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID,
                    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
                    scope: "https://www.googleapis.com/auth/drive.file"
                });
            });
        };
        if (window.gapi) initGapi();

        const q = query(collection(db, "promos"), orderBy("order", "asc"));
        return onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPromos(list);
        });
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const GoogleAuth = window.gapi.auth2.getAuthInstance();
            if (!GoogleAuth.isSignedIn.get()) {
                await GoogleAuth.signIn();
            }

            const { uploadToDrive } = await import('../../services/driveService');
            const driveLink = await uploadToDrive(file);
            setEditForm({ ...editForm, videoUrl: driveLink });
            alert("UPLOAD COMPLETE");
        } catch (error) {
            console.error(error);
            alert("UPLOAD FAILED: " + error.message);
        }
        setUploading(false);
    };

    const [editingSlot, setEditingSlot] = useState(null);
    const [editForm, setEditForm] = useState({});

    const startEditing = (slot, existing) => {
        setEditingSlot(slot.id);
        setEditForm(existing || {
            slotId: slot.id,
            title: slot.title,
            imageUrl: slot.img,
            videoUrl: '',
            description: slot.defaultDesc,
            link: slot.link || '#',
            order: existing?.order || index
        });
    };

    const saveEdit = async () => {
        setLoading(true);
        try {
            const existing = promos.find(p => p.slotId === editingSlot);
            if (existing) {
                await updateDoc(doc(db, "promos", existing.id), {
                    ...editForm,
                    updatedAt: new Date()
                });
            } else {
                await addDoc(collection(db, "promos"), {
                    ...editForm,
                    active: true,
                    updatedAt: new Date()
                });
            }
            setEditingSlot(null);
            alert("PROMO UPDATED");
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const toggleStatus = async (slot) => {
        const existing = promos.find(p => p.slotId === slot.id);
        if (!existing) {
            // If it doesn't exist, create it with defaults first
            await addDoc(collection(db, "promos"), {
                slotId: slot.id,
                title: slot.title,
                imageUrl: slot.img,
                description: slot.defaultDesc,
                link: slot.link || '#',
                active: true,
                order: SLOTS.findIndex(s => s.id === slot.id),
                createdAt: new Date()
            });
            return;
        }
        setLoading(true);
        try {
            await updateDoc(doc(db, "promos", existing.id), {
                active: !existing.active
            });
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const purgeOldData = async () => {
        if (!confirm("THIS WILL RESET ALL PROMO SETTINGS. CONTINUE?")) return;
        setLoading(true);
        try {
            for (const p of promos) {
                await deleteDoc(doc(db, "promos", p.id));
            }
            alert("DATABASE PURGED. YOU CAN NOW RE-ACTIVATE SLOTS.");
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const getPromoData = (slotId) => promos.find(p => p.slotId === slotId);

    return (
        <div className="max-w-6xl mx-auto pt-8 space-y-8">
            <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
                <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">TACTICAL ADVERTISING SLOTS</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Control the visibility of marketing intelligence on entry</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SLOTS.map((slot) => {
                    const promo = getPromoData(slot.id);
                    const active = promo?.active || false;
                    const isEditing = editingSlot === slot.id;

                    return (
                        <div key={slot.id} className={`bg-black border transition-all p-6 space-y-4 relative group ${active ? 'border-red-600 shadow-red-glow/20' : 'border-white/5 opacity-40'}`}>
                            <div className="aspect-[4/5] bg-white/5 border border-white/10 overflow-hidden relative">
                                {promo?.videoUrl ? (
                                    <div className="w-full h-full bg-black flex items-center justify-center">
                                        <Power className="text-red-600 animate-pulse" size={48} />
                                        <span className="absolute bottom-2 right-2 text-[8px] font-black bg-red-600 px-2 py-1 text-white">VIDEO ACTIVE</span>
                                    </div>
                                ) : (
                                    <img src={promo?.imageUrl || slot.img} alt={slot.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                )}
                                {!active && <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] -rotate-45 border border-white/20 px-4 py-2">OFLINE</span>
                                </div>}
                            </div>

                            <div className="space-y-1 text-center">
                                <h4 className="text-xs font-black text-white uppercase">{promo?.title || slot.title}</h4>
                                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter">{slot.id.toUpperCase()} MODULE</p>
                            </div>

                            {isEditing ? (
                                <div className="space-y-2 pt-2 bg-white/5 p-4 border border-white/10">
                                    <input className="w-full bg-black border border-white/10 p-2 text-[9px] text-white" placeholder="TITLE" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                                    <input className="w-full bg-black border border-white/10 p-2 text-[9px] text-white" placeholder="IMAGE URL" value={editForm.imageUrl} onChange={e => setEditForm({ ...editForm, imageUrl: e.target.value })} />
                                    <div className="flex gap-1">
                                        <input className="flex-1 bg-black border border-white/10 p-2 text-[9px] text-white font-bold text-red-500" placeholder="VIDEO URL (DRIVE)" value={editForm.videoUrl} onChange={e => setEditForm({ ...editForm, videoUrl: e.target.value })} />
                                        <label className="cursor-pointer bg-white/5 border border-white/10 px-2 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                            {uploading ? <RefreshCw className="animate-spin" size={12} /> : <Plus size={12} />}
                                            <input type="file" className="hidden" onChange={handleFileUpload} accept="video/*" />
                                        </label>
                                    </div>

                                    {/* LIVE PREVIEW */}
                                    {(editForm.imageUrl || editForm.videoUrl) && (
                                        <div className="p-4 bg-white/5 border border-white/10 space-y-2">
                                            <p className="text-[8px] font-black text-gray-500 uppercase">Live Intel Preview:</p>
                                            <div className="aspect-video bg-black flex items-center justify-center overflow-hidden border border-white/5">
                                                {editForm.videoUrl ? (
                                                    editForm.videoUrl.includes('drive.google.com') ? (
                                                        <iframe
                                                            src={formatDrivePreview(editForm.videoUrl)}
                                                            className="w-full h-full border-0"
                                                            allowFullScreen
                                                        />
                                                    ) : <video src={editForm.videoUrl} className="w-full h-full" controls />
                                                ) : <img src={editForm.imageUrl} className="w-full h-auto max-h-full object-contain" alt="Preview" />}

                                            </div>
                                        </div>
                                    )}

                                    <textarea className="w-full bg-black border border-white/10 p-2 text-[9px] text-white h-20" placeholder="DESC" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                                    <input className="w-full bg-black border border-white/10 p-2 text-[9px] text-white" placeholder="LINK" value={editForm.link} onChange={e => setEditForm({ ...editForm, link: e.target.value })} />
                                    <div className="flex items-center gap-2">
                                        <label className="text-[8px] text-gray-500 font-bold uppercase">Priority Order:</label>
                                        <input type="number" className="w-20 bg-black border border-white/10 p-2 text-[9px] text-white" placeholder="0" value={editForm.order} onChange={e => setEditForm({ ...editForm, order: parseInt(e.target.value) || 0 })} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={saveEdit} className="flex-1 py-2 bg-green-600 text-white text-[9px] font-black uppercase">SAVE</button>
                                        <button onClick={() => setEditingSlot(null)} className="flex-1 py-2 bg-white/10 text-white text-[9px] font-black uppercase">CANCEL</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleStatus(slot)}
                                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${active ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}
                                    >
                                        <Power size={14} />
                                        {active ? 'OFF' : 'ON'}
                                    </button>
                                    <button
                                        onClick={() => startEditing(slot, promo)}
                                        className="px-4 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                                    >
                                        <Save size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 italic">
                <div className="w-2 h-2 bg-red-600 animate-pulse"></div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    SYSTEM INFO: Active slots will be displayed to users in a rotational stack upon platform entry.
                </p>
                <button
                    onClick={purgeOldData}
                    className="ml-auto text-[9px] text-gray-600 hover:text-red-500 underline uppercase tracking-tighter"
                >
                    [ RESET PROMO DATABASE ]
                </button>
            </div>
        </div>
    );
};

export default PromoManager;
