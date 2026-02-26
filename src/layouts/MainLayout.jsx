import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import { Bell, Send, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MembershipExtensionModal from '../features/notifications/MembershipExtensionModal';

const MainLayout = ({
    user,
    activeTab,
    setActiveTab,
    onLogout,
    unreadAnnouncements,
    notifications,
    pushEnabled,
    adblockDetected,
    rePromptPush,
    broadcastSignal,
    customMsg,
    setCustomMsg,
    children
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isSupreme = user?.email?.toLowerCase() === 'admin' || user?.email?.toLowerCase() === 'steven@ingenius.fx' || user?.email?.toLowerCase() === 'jeilin@jeilin.com';

    return (
        <div className="flex bg-dark min-h-[100dvh] text-white font-space selection:bg-red-600 selection:text-white overflow-x-hidden">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={onLogout}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                canBroadcast={isSupreme || user?.canBroadcast}
                isSupreme={isSupreme}
                unreadAnnouncements={unreadAnnouncements}
            />

            <main className="flex-1 lg:ml-64 min-h-[100dvh] overflow-y-auto z-0 pb-20 lg:pb-0">
                <div className="fixed top-0 right-0 w-[400px] lg:w-[800px] h-[400px] lg:h-[800px] bg-red-600/5 blur-[150px] -z-10 pointer-events-none"></div>

                <header
                    className="border-b border-white/5 sticky top-0 bg-dark/80 backdrop-blur-xl z-40 flex items-center justify-between px-4 lg:px-10"
                    style={{
                        WebkitBackdropFilter: 'blur(24px)',
                        paddingTop: 'env(safe-area-inset-top)',
                        height: 'calc(4.5rem + env(safe-area-inset-top))',
                        marginTop: 0
                    }}
                >
                    <div className="flex flex-col">
                        <span className="text-[8px] lg:text-[10px] font-black tracking-[0.2em] text-red-600 uppercase italic leading-none mb-1">Status: Authorized (v6.2 - SW FILES)</span>
                        <p className="text-[10px] lg:text-xs font-bold text-white/50 uppercase truncate max-w-[120px] lg:max-w-none">{user?.email}</p>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-6">
                        {isSupreme && (
                            <div className="hidden sm:flex items-center gap-2 bg-white/5 p-1 border border-white/10 group">
                                <input
                                    type="text"
                                    value={customMsg}
                                    onChange={(e) => setCustomMsg(e.target.value)}
                                    placeholder="CUSTOM SIGNAL..."
                                    className="bg-transparent border-none outline-none text-[10px] font-bold px-3 py-1 w-32 uppercase tracking-widest placeholder:text-gray-600"
                                    onKeyDown={(e) => e.key === 'Enter' && broadcastSignal(customMsg)}
                                />
                                <button
                                    onClick={() => broadcastSignal(customMsg)}
                                    className="p-2 bg-red-600 hover:bg-white hover:text-red-600 transition-colors"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        )}

                        {/* Signal Sync Status Indicator */}
                        <div className="hidden lg:flex flex-col items-end mr-2">
                            <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">DATA LINK STATUS</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-1 h-1 rounded-full ${adblockDetected ? 'bg-orange-500 animate-pulse' : (pushEnabled ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-600 animate-pulse shadow-[0_0_5px_#dc2626]')}`}></div>
                                <span className={`text-[9px] font-black tracking-widest ${adblockDetected ? 'text-orange-500' : (pushEnabled ? 'text-green-500' : 'text-red-600')}`}>
                                    {adblockDetected ? 'SHIELD ALERT' : (pushEnabled ? 'SECURE' : 'LINK DOWN')}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={rePromptPush}
                            className={`w-8 h-8 lg:w-12 lg:h-12 flex items-center justify-center border transition-all ${pushEnabled ? 'border-red-600/20 text-red-600/40' : 'border-yellow-500 text-yellow-500 shadow-yellow-glow animate-pulse'
                                }`}
                        >
                            <Bell size={16} className={`lg:w-5 lg:h-5 ${pushEnabled ? '' : 'animate-bounce'}`} />
                        </button>

                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="w-8 h-8 lg:w-12 lg:h-12 bg-red-gradient p-[2px] rounded-full group relative shrink-0 lg:pointer-events-none"
                        >
                            <div className="w-full h-full bg-dark flex items-center justify-center group-hover:bg-red-600 transition-colors overflow-hidden rounded-full">
                                {user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.email}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <span className="font-black text-white text-xs lg:text-base">{user?.email?.[0]?.toUpperCase()}</span>
                                )}
                            </div>
                        </button>
                    </div>
                </header>

                {/* Notifications Overlay */}
                <div className="fixed top-24 right-6 lg:right-10 z-[100] space-y-4 pointer-events-none">
                    <AnimatePresence>
                        {notifications.map(n => (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 50, scale: 0.8 }}
                                className="bg-black/95 border-2 border-red-600 p-6 shadow-red-glow flex items-start gap-4 pointer-events-auto min-w-[320px] backdrop-blur-xl"
                                style={{ WebkitBackdropFilter: 'blur(16px)' }}
                            >
                                <div className="relative shrink-0">
                                    <Bell className="text-red-600 animate-bounce" size={24} />
                                    <div className="absolute -inset-2 bg-red-600/30 blur-xl rounded-full animate-pulse"></div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-[9px] font-black text-red-600 uppercase tracking-[0.2em]">
                                            {n.data?.type ? `${n.data.type} INTEL` : 'Live Signal'}
                                        </p>
                                        <p className="text-[8px] font-bold text-gray-500 uppercase">{n.time} UTC</p>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-black italic tracking-tighter uppercase text-white leading-tight">
                                            {n.data?.pair || n.msg}
                                        </p>
                                        {n.data?.entry && n.data?.entry !== '---' && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-red-600 uppercase">ENTRY:</span>
                                                <span className="text-[12px] font-black text-white">{n.data.entry}</span>
                                            </div>
                                        )}
                                        {n.data?.pair && <p className="text-[10px] font-bold text-gray-500 uppercase italic opacity-70">{n.msg}</p>}
                                    </div>

                                    <div className="mt-3 w-full h-1 bg-white/5">
                                        <motion.div
                                            initial={{ width: "100%" }}
                                            animate={{ width: "0%" }}
                                            transition={{ duration: 12, ease: "linear" }}
                                            className="h-full bg-red-600 shadow-[0_0_8px_#ff0000]"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="p-3 lg:p-10">
                    {children}
                </div>

                {/* Adblock Detected Overlay */}
                {adblockDetected && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed inset-x-4 bottom-24 z-[110] bg-black/95 border-2 border-orange-600 p-6 backdrop-blur-2xl shadow-[0_0_30px_rgba(234,88,12,0.2)]"
                    >
                        <div className="flex items-start gap-4">
                            <div className="bg-orange-600 p-2 shrink-0">
                                <Zap size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black text-white uppercase italic tracking-tighter mb-1">DATA LINK BLOCKED BY SHIELD</h4>
                                <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase">
                                    Un bloqueador de anuncios o navegador (Brave/uBlock) está interceptando la señal.<br />
                                    <span className="text-white">SOLUCIÓN TÁCTICA:</span> Desactiva el "Shield" o bloqueador para este sitio para recibir notificaciones y telemetría en tiempo real.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <MembershipExtensionModal user={user} />

            </main>
        </div>
    );
};

export default MainLayout;
