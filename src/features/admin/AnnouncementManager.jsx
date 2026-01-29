import React, { useState, useEffect } from 'react';
import { Megaphone, Send, RefreshCw, Clock, Trash2 } from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const AnnouncementManager = ({ user }) => {
    const [annForm, setAnnForm] = useState({ title: '', message: '', imageUrl: '' });
    const [annLoading, setAnnLoading] = useState(false);
    const [annList, setAnnList] = useState([]);

    useEffect(() => {
        return onSnapshot(query(collection(db, "announcements"), orderBy("timestamp", "desc")), (snapshot) => {
            setAnnList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    }, []);

    const createAnnouncement = async (e) => {
        e.preventDefault();
        if (!annForm.title || !annForm.message) return;
        setAnnLoading(true);
        try {
            await addDoc(collection(db, "announcements"), {
                title: annForm.title.toUpperCase(),
                message: annForm.message,
                imageUrl: annForm.imageUrl || '',
                timestamp: serverTimestamp(),
                sender: user.email
            });

            const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
            await fetch('https://ingenus-fx.vercel.app/api/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    title: "📢 NEW ANNOUNCEMENT",
                    body: annForm.title.toUpperCase(),
                    data: { type: 'ANNOUNCEMENT' }
                })
            });

            setAnnForm({ title: '', message: '', imageUrl: '' });
            alert("ANNOUNCEMENT DEPLOYED");
        } catch (e) { alert("FAILED: " + e.message); }
        setAnnLoading(false);
    };

    const deleteAnnouncement = async (id) => {
        if (!confirm('TERMINATE ANNOUNCEMENT?')) return;
        await deleteDoc(doc(db, "announcements", id));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
            <div className="space-y-6">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">DEPLOY NEW INTEL</h3>
                <form onSubmit={createAnnouncement} className="space-y-4 bg-black border border-white/5 p-6 shadow-red-glow/5">
                    <input placeholder="ANNOUNCEMENT TITLE" value={annForm.title} onChange={e => setAnnForm({ ...annForm, title: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none" />
                    <input placeholder="IMAGE URL (OPTIONAL)" value={annForm.imageUrl} onChange={e => setAnnForm({ ...annForm, imageUrl: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none" />
                    <textarea placeholder="MISSION DETAILS..." value={annForm.message} onChange={e => setAnnForm({ ...annForm, message: e.target.value })} className="w-full h-48 bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none resize-none" />
                    <button disabled={annLoading} className="w-full py-4 bg-red-600 text-white text-xs font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3">
                        {annLoading ? <RefreshCw className="animate-spin" /> : <Send size={16} />}
                        {annLoading ? 'TRANSMITTING...' : 'AUTHORIZE BROADCAST'}
                    </button>
                </form>
            </div>

            <div className="space-y-6">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">TRANSMISSION LOG</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {annList.map(ann => (
                        <div key={ann.id} className="p-4 bg-white/5 border border-white/10 flex justify-between items-start group hover:bg-white/10 transition-colors">
                            <div className="flex-1">
                                <h4 className="text-xs font-black text-white uppercase mb-1">{ann.title}</h4>
                                <p className="text-[9px] text-gray-500 line-clamp-2 italic mb-2">{ann.message}</p>
                                <div className="flex items-center gap-2 text-[8px] font-black text-red-600 uppercase">
                                    <Clock size={10} /> {ann.timestamp ? new Date(ann.timestamp.toMillis()).toLocaleString() : 'Recent'}
                                </div>
                            </div>
                            <button onClick={() => deleteAnnouncement(ann.id)} className="p-2 text-gray-600 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnnouncementManager;
