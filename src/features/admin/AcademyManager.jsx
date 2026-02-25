import React, { useState, useEffect } from 'react';
import { Upload, Youtube, RefreshCw, Rocket, Play, Trash2, Globe } from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, deleteDoc, where, getDocs } from 'firebase/firestore';
import { videoService } from '../../utils/videoService';
import { getYouTubeThumbnail, getEmbedUrl, fetchYouTubeDuration } from '../../utils/mediaUtils';
import TacticalSelect from '../../components/TacticalSelect';

const AcademyManager = ({ user }) => {
    const [academyForm, setAcademyForm] = useState({ title: '', level: 'BEGINNER', type: 'UPLOAD', duration: '', module: '', url: '' });
    const [videoBlob, setVideoBlob] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [videosList, setVideosList] = useState([]);

    const LEVEL_OPTIONS = [
        { value: 'BEGINNER', label: 'PRINCIPIANTE' },
        { value: 'INTERMEDIATE', label: 'INTERMEDIO' },
        { value: 'ADVANCED', label: 'AVANZADO' },
        { value: 'ELITE (VIP)', label: 'ELITE (VIP)' },
    ];

    useEffect(() => {
        return onSnapshot(collection(db, "academy_videos"), (snapshot) => {
            setVideosList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    }, []);

    useEffect(() => {
        const getDuration = async () => {
            if (academyForm.type === 'LINK' && academyForm.url) {
                const seconds = await fetchYouTubeDuration(academyForm.url);
                if (seconds) {
                    setAcademyForm(prev => ({ ...prev, duration: (seconds / 60).toFixed(2) }));
                }
            }
        };
        getDuration();
    }, [academyForm.url, academyForm.type]);

    const handleDeployLesson = async () => {
        if (!academyForm.title || (!videoBlob && academyForm.type === 'UPLOAD' && !academyForm.id) || (academyForm.type === 'LINK' && !academyForm.url)) {
            alert("COMPLETE TODOS LOS CAMPOS");
            return;
        }

        setUploading(true);
        try {
            if (academyForm.id) {
                const updateData = {
                    title: academyForm.title.toUpperCase(),
                    level: academyForm.level,
                    module: academyForm.module ? academyForm.module.toUpperCase() : 'GENERAL',
                };
                if (academyForm.type === 'LINK' && academyForm.url) updateData.videoUrl = academyForm.url;
                if (academyForm.duration) updateData.duration = parseFloat(academyForm.duration).toFixed(2);
                await updateDoc(doc(db, "academy_videos", academyForm.id), updateData);
                alert("INFORMACIÓN ACTUALIZADA CON ÉXITO");
                setAcademyForm({ title: '', level: 'BEGINNER', type: 'UPLOAD', module: '', url: '', duration: '' });
                setVideoBlob(null);
            } else {
                let uploadResult;
                if (academyForm.type === 'UPLOAD') {
                    const fileInput = document.getElementById('gallery-upload');
                    if (fileInput.files[0]) uploadResult = await videoService.uploadVideo(fileInput.files[0]);
                } else if (academyForm.type === 'LINK') {
                    uploadResult = { url: academyForm.url, id: 'external-link-' + Date.now(), duration: (parseFloat(academyForm.duration) || 0) * 60 };
                }

                if (uploadResult) {
                    await addDoc(collection(db, "academy_videos"), {
                        title: academyForm.title.toUpperCase(),
                        duration: (uploadResult.duration / 60).toFixed(2),
                        level: academyForm.level,
                        module: academyForm.module ? academyForm.module.toUpperCase() : 'GENERAL',
                        videoUrl: uploadResult.url,
                        publicId: uploadResult.id,
                        createdAt: serverTimestamp(),
                        createdBy: user.email,
                        blocked: false
                    });

                    // Notification logic
                    const moduleName = academyForm.module ? academyForm.module.toUpperCase() : 'GENERAL';
                    const q = query(collection(db, "users"), where("subscribedModules", "array-contains", moduleName));
                    const subscribedUsers = await getDocs(q);
                    if (!subscribedUsers.empty) {
                        const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
                        await Promise.all(subscribedUsers.docs.map(async (userDoc) => {
                            const userData = userDoc.data();
                            if (userData.fcmToken || userData.oneSignalId) {
                                fetch('https://indexgeniusacademy.com/api/broadcast', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                    body: JSON.stringify({
                                        title: "🎓 NUEVA CLASE DISPONIBLE",
                                        body: `Nueva lección en ${moduleName}: ${academyForm.title}`,
                                        data: { type: 'ACADEMY', module: moduleName },
                                        targetUser: userData.uid
                                    })
                                }).catch(console.error);
                            }
                        }));
                    }
                    alert("LECCIÓN TÁCTICA DESPLEGADA");
                    setAcademyForm({ title: '', level: 'BEGINNER', type: 'UPLOAD', module: '', url: '', duration: '' });
                    setVideoBlob(null);
                }
            }
        } catch (err) { alert("ERROR: " + err.message); }
        setUploading(false);
    };

    const handleDeleteVideo = async (id) => {
        if (!confirm('¿CONFIRMAR DESTRUCCIÓN DE CLASE?')) return;
        await deleteDoc(doc(db, "academy_videos", id));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
            <div className="space-y-6">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">DESPLEGAR INTELIGENCIA</h3>
                <div className="bg-black border border-white/5 p-6 space-y-4">
                    <div className="flex gap-2 p-1 bg-white/5 border border-white/5 mb-4">
                        {['UPLOAD', 'LINK'].map(type => (
                            <button key={type} onClick={() => setAcademyForm({ ...academyForm, type })} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${academyForm.type === type ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>
                                {type === 'UPLOAD' ? 'SUBIR ARCHIVO' : 'ENLACE YOUTUBE'}
                            </button>
                        ))}
                    </div>
                    <input placeholder="TÍTULO DE LA CLASE" value={academyForm.title} onChange={e => setAcademyForm({ ...academyForm, title: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none" />
                    <div className="grid grid-cols-3 gap-4">
                        <input placeholder="NOMBRE DEL MÓDULO" value={academyForm.module || ''} onChange={e => setAcademyForm({ ...academyForm, module: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none uppercase" />
                        <input type="number" placeholder="MINUTOS" value={academyForm.duration || ''} onChange={e => setAcademyForm({ ...academyForm, duration: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold text-white outline-none uppercase" title="Manual Duration for Links" />
                        <TacticalSelect
                            options={LEVEL_OPTIONS}
                            value={academyForm.level}
                            onChange={val => setAcademyForm({ ...academyForm, level: val })}
                        />
                    </div>
                    {academyForm.type === 'UPLOAD' ? (
                        <div className="relative group">
                            <input type="file" id="gallery-upload" accept="video/*" className="hidden" onChange={(e) => setVideoBlob(e.target.files[0])} />
                            <label htmlFor="gallery-upload" className="w-full h-32 border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer bg-white/[0.02]">
                                <Upload className="text-gray-500 mb-2" />
                                <span className="text-[10px] font-black text-gray-500 uppercase">{videoBlob ? videoBlob.name : 'SELECCIONAR ARCHIVO'}</span>
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <input placeholder="YOUTUBE URL" value={academyForm.url || ''} onChange={e => setAcademyForm({ ...academyForm, url: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 text-xs font-black text-white outline-none" />
                            {academyForm.url && (
                                <div className="p-4 bg-white/5 border border-white/10 space-y-2">
                                    <p className="text-[8px] font-black text-gray-500 uppercase">Vista Previa:</p>
                                    <div className="aspect-video bg-black flex items-center justify-center overflow-hidden border border-white/5">
                                        {academyForm.url.includes('youtube') || academyForm.url.includes('youtu.be') ? (
                                            <img src={getYouTubeThumbnail(academyForm.url)} className="w-full h-auto max-h-full object-contain" alt="YouTube Preview" />
                                        ) : (
                                            <iframe src={getEmbedUrl(academyForm.url)} className="w-full h-full border-0" allowFullScreen />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <button onClick={handleDeployLesson} disabled={uploading} className="w-full py-4 bg-red-600 text-white text-xs font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all">
                        {uploading ? 'SINCRONIZANDO...' : (academyForm.id ? 'ACTUALIZAR CLASE' : 'AUTORIZAR DESPLIEGUE')}
                    </button>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-4 pt-8 border-t border-white/5">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">REGISTRO DE CLASES ACTIVAS</h3>
                <div className="grid grid-cols-1 gap-4">
                    {videosList.map(video => (
                        <div key={video.id} className="p-4 bg-white/5 border border-white/10 flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-black flex items-center justify-center border border-white/10 text-red-600 font-bold text-[10px]">INTEL</div>
                                <div>
                                    <h4 className="text-xs font-black text-white uppercase">{video.title}</h4>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase">{video.level} • {video.duration} MIN</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setAcademyForm({ id: video.id, title: video.title, module: video.module, level: video.level, type: (video.videoUrl?.includes('youtu')) ? 'LINK' : 'UPLOAD', url: video.videoUrl, duration: video.duration }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-3 bg-blue-600/10 text-blue-500 border border-blue-600/30 hover:bg-blue-600 hover:text-white transition-all text-[9px] font-black tracking-widest"><RefreshCw size={14} /></button>
                                <button onClick={() => handleDeleteVideo(video.id)} className="p-3 bg-red-600/10 text-red-600 border border-red-600/30 hover:bg-red-600 hover:text-white transition-all text-[9px] font-black tracking-widest"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AcademyManager;
