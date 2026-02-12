import React from 'react';
import { Play, Clock, BookOpen, Share2, Bell } from 'lucide-react';
import { getYouTubeID } from '../../../utils/mediaUtils';

const VideoCard = ({ video, isCompleted, onPlay, onShare, onToggleProgress, isSubscribed, onToggleSubscription }) => {
    const videoId = getYouTubeID(video.videoUrl);
    const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

    return (
        <div onClick={onPlay} className="group bg-black border-2 border-white/5 hover:border-red-600/50 transition-all p-4 cursor-pointer relative overflow-hidden">
            {isCompleted && (
                <div className="absolute top-0 left-0 bg-green-500 text-black text-[7px] font-black px-3 py-1 uppercase tracking-widest z-20 skew-x-[-20deg] ml-[-5px]">
                    MASTERED
                </div>
            )}
            <div className="absolute top-0 right-0 p-2 z-10 flex gap-2">
                <div className="bg-red-600 text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest">{video.level}</div>
            </div>

            <div className="w-full aspect-video bg-white/5 mb-4 flex items-center justify-center relative group-hover:bg-red-600/10 transition-colors overflow-hidden">
                {thumb && <img src={thumb} alt={video.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-2 border-white/20 group-hover:border-red-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-600 transition-all bg-black/50 backdrop-blur-sm">
                        <Play size={20} className="text-white fill-current ml-1" />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="font-black italic text-lg text-white uppercase leading-none group-hover:text-red-600 transition-colors line-clamp-2 h-10">{video.title}</h3>
                <div className="flex items-center gap-4 text-gray-500">
                    <div className="flex items-center gap-2"><Clock size={12} /><span className="text-[9px] font-bold tracking-widest">{video.duration} MIN</span></div>
                    <div className="flex items-center gap-2"><BookOpen size={12} /><span className="text-[9px] font-bold tracking-widest uppercase">INTEL</span></div>
                </div>
            </div>

            <div className="flex gap-2 mt-4">
                <button onClick={(e) => { e.stopPropagation(); onShare(); }} className="p-3 bg-white/5 border border-white/10 hover:border-red-600/50 hover:bg-red-600/10 transition-all text-white/40 hover:text-red-600"><Share2 size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); onToggleProgress(); }} className={`flex-1 px-6 py-3 font-black text-[10px] tracking-widest uppercase transition-all ${isCompleted ? 'bg-green-600/10 text-green-500 border border-green-500/30' : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white hover:text-black'}`}>
                    {isCompleted ? 'REVIEWED' : 'START INTEL'}
                </button>
            </div>
        </div>
    );
};

export default VideoCard;
