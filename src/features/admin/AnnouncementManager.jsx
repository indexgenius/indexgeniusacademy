import React, { useState, useEffect } from 'react';
import { Megaphone, Send, RefreshCw, Clock, Trash2, Plus } from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { formatDrivePreview, getYouTubeThumbnail, getEmbedUrl } from '../../utils/mediaUtils';


const AnnouncementManager = ({ user }) => {
    const [annForm, setAnnForm] = useState({ title: '', message: '', imageUrl: '', videoUrl: '' });
    const [annLoading, setAnnLoading] = useState(false);
    const [annList, setAnnList] = useState([]);

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        return onSnapshot(query(collection(db, "announcements"), orderBy("timestamp", "desc")), (snapshot) => {
            setAnnList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const { uploadToDrive } = await import('../../services/driveService');
            const driveLink = await uploadToDrive(file);
            setAnnForm({ ...annForm, videoUrl: driveLink });
            alert("SUBIDA COMPLETADA");
        } catch (error) {
            console.error(error);
            alert("FALLO EN LA SUBIDA: " + error.message);
        }
        setUploading(false);
    };

    const createAnnouncement = async (e) => {
        e.preventDefault();
        if (!annForm.title || !annForm.message) return;
        setAnnLoading(true);
        try {
            await addDoc(collection(db, "announcements"), {
                title: annForm.title.toUpperCase(),
                message: annForm.message,
                imageUrl: annForm.imageUrl || '',
                videoUrl: annForm.videoUrl || '',
                timestamp: serverTimestamp(),
                sender: user.email
            });

            const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
            await fetch('https://indexgeniusacademy.com/api/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    title: "📢 NUEVO ANUNCIO",
                    body: annForm.title.toUpperCase(),
                    data: { type: 'ANNOUNCEMENT' }
                })
            });

            setAnnForm({ title: '', message: '', imageUrl: '', videoUrl: '' });
            alert("ANUNCIO DESPLEGADO");
        } catch (e) { alert("FALLÓ: " + e.message); }
        setAnnLoading(false);
    };

    const deleteAnnouncement = async (id) => {
        if (!confirm('¿ELIMINAR EL ANUNCIO?')) return;
        await deleteDoc(doc(db, "announcements", id));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
            <div className="space-y-6">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">DESPLEGAR NUEVO ANUNCIO</h3>
                <form onSubmit={createAnnouncement} className="space-y-4 bg-black border border-white/5 p-6 shadow-red-glow/5">
                    <input placeholder="TÍTULO DEL ANUNCIO" value={annForm.title} onChange={e => setAnnForm({ ...annForm, title: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none" />
                    <input placeholder="URL DE IMAGEN (OPCIONAL)" value={annForm.imageUrl} onChange={e => setAnnForm({ ...annForm, imageUrl: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none" />
                    <div className="flex gap-2">
                        <input placeholder="URL DE VIDEO (DRIVE/DIRECTO)" value={annForm.videoUrl} onChange={e => setAnnForm({ ...annForm, videoUrl: e.target.value })} className="flex-1 bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none" />
                        <label className="cursor-pointer bg-white/10 border border-white/10 px-4 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                            {uploading ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />}
                            <input type="file" className="hidden" onChange={handleFileUpload} accept="video/*" />
                        </label>
                    </div>

                    {/* VISTA PREVIA */}
                    {(annForm.imageUrl || annForm.videoUrl) && (
                        <div className="p-4 bg-white/5 border border-white/10 space-y-2">
                            <p className="text-[8px] font-black text-gray-500 uppercase">Vista Previa:</p>
                            <div className="aspect-video bg-black flex items-center justify-center overflow-hidden border border-white/5">
                                {annForm.videoUrl ? (
                                    annForm.videoUrl.includes('youtube.com') || annForm.videoUrl.includes('youtu.be') ? (
                                        <img src={getYouTubeThumbnail(annForm.videoUrl)} className="w-full h-auto max-h-full object-contain" alt="YouTube Preview" />
                                    ) : annForm.videoUrl.includes('drive.google.com') ? (
                                        <iframe
                                            src={getEmbedUrl(annForm.videoUrl)}
                                            className="w-full h-full border-0"
                                            allow="autoplay"
                                            allowFullScreen
                                        />
                                    ) : <video src={annForm.videoUrl} className="w-full h-full" controls />
                                ) : <img src={annForm.imageUrl} className="w-full h-auto max-h-full object-contain" alt="Preview" />}

                            </div>
                        </div>
                    )}

                    <textarea placeholder="DETALLES DE LA MISIÓN..." value={annForm.message} onChange={e => setAnnForm({ ...annForm, message: e.target.value })} className="w-full h-48 bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none resize-none" />
                    <button disabled={annLoading} className="w-full py-4 bg-red-600 text-white text-xs font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3">
                        {annLoading ? <RefreshCw className="animate-spin" /> : <Send size={16} />}
                        {annLoading ? 'TRANSMITIENDO...' : 'AUTORIZAR TRANSMISIÓN'}
                    </button>
                </form>
            </div>

            <div className="space-y-6">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">REGISTRO DE TRANSMISIONES</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {annList.map(ann => (
                        <div key={ann.id} className="p-4 bg-white/5 border border-white/10 flex justify-between items-start group hover:bg-white/10 transition-colors">
                            <div className="flex-1">
                                <h4 className="text-xs font-black text-white uppercase mb-1">
                                    {ann.title}
                                    {ann.videoUrl && <span className="ml-2 text-[8px] bg-red-600/20 text-red-500 px-1 py-0.5 rounded">VIDEO</span>}
                                    {ann.imageUrl && !ann.videoUrl && <span className="ml-2 text-[8px] bg-blue-600/20 text-blue-500 px-1 py-0.5 rounded">IMAGEN</span>}
                                </h4>
                                <p className="text-[9px] text-gray-500 line-clamp-2 italic mb-2">{ann.message}</p>
                                <div className="flex items-center gap-2 text-[8px] font-black text-red-600 uppercase">
                                    <Clock size={10} /> {ann.timestamp ? new Date(ann.timestamp.toMillis()).toLocaleString() : 'Reciente'}
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
