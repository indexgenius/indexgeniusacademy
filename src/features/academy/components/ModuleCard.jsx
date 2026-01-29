import React from 'react';
import { Folder, Bell, ChevronRight } from 'lucide-react';

const ModuleCard = ({ name, videoCount, completedCount, isSubscribed, onToggleSubscription, onClick }) => {
    const isComplete = videoCount > 0 && completedCount === videoCount;
    const progressPercent = videoCount === 0 ? 0 : Math.round((completedCount / videoCount) * 100);

    return (
        <div onClick={onClick} className="group bg-black border-2 border-white/5 hover:border-red-600/50 transition-all p-6 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 p-3 z-10 flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); onToggleSubscription(); }} className={`p-2 rounded-full transition-all hover:bg-white/10 ${isSubscribed ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-500'}`}>
                    <Bell size={16} fill={isSubscribed ? "currentColor" : "none"} />
                </button>
                <Folder size={48} className="text-white opacity-20 group-hover:opacity-100 group-hover:text-red-600 transition-all" />
            </div>

            <div>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[9px] font-black bg-white/10 px-2 py-1 uppercase text-gray-400 group-hover:text-white">FOLDER</span>
                    {isComplete && <span className="text-[9px] font-black bg-green-500/20 text-green-500 px-2 py-1 uppercase">COMPLETED</span>}
                </div>
                <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-2 group-hover:text-red-600 transition-colors pr-12">{name}</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{videoCount} FILES ENCRYPTED</p>

                <div className="w-full h-1 bg-white/10 mt-4 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-red-600'}`} style={{ width: `${progressPercent}%` }} />
                </div>
            </div>

            <button className="mt-6 w-full py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black tracking-widest uppercase group-hover:bg-red-600 group-hover:border-red-600 transition-all flex items-center justify-center gap-2">
                INICIAR MÓDULO <ChevronRight size={14} />
            </button>
        </div>
    );
};

export default ModuleCard;
