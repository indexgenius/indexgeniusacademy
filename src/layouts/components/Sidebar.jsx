import { LayoutDashboard, Users, User, Settings, LogOut, TrendingUp, Zap, Menu, X, FileCode, GraduationCap, Shield, Megaphone, History, Video } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout, isOpen, onClose, canBroadcast, isSupreme, unreadAnnouncements = 0 }) => {
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'SEÑALES' },
        { id: 'live-classes', icon: Video, label: 'CLASES EN VIVO' },
        { id: 'trading-history', icon: History, label: 'HISTORIAL TRADING' },
        { id: 'monthly-history', icon: TrendingUp, label: 'HISTORIAL MENSUAL' },
        { id: 'academy', icon: GraduationCap, label: 'ACADEMIA' },
        { id: 'templates', icon: FileCode, label: 'PLANTILLAS' },
        { id: 'affiliate', icon: Users, label: 'AFILIADOS' },
        ...(isSupreme ? [{ id: 'supreme', icon: Zap, label: 'SUPREME' }] : []),
        ...(canBroadcast ? [{ id: 'admin', icon: Shield, label: 'ADMIN' }] : []),
        { id: 'groups', icon: Users, label: 'GRUPOS' },
        { id: 'announcements', icon: Megaphone, label: 'NOTICIAS', count: unreadAnnouncements },
        { id: 'profile', icon: User, label: 'PERFIL' },
    ];

    const handleTabClick = (id) => {
        setActiveTab(id);
        onClose();
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm lg:hidden"
                    style={{ zIndex: 9998 }}
                    onClick={onClose}
                ></div>
            )}

            <aside
                className={`w-64 h-screen bg-black border-r border-white/5 flex flex-col fixed left-0 top-0 transition-transform duration-500 ease-in-out lg:translate-x-0 overflow-y-auto custom-scrollbar ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ zIndex: 9999 }}
            >
                <div className="p-6 lg:p-10 flex flex-col items-start gap-4">
                    <div className="flex items-center gap-3 group pointer-events-none">
                        <div className="w-10 h-10 lg:w-14 lg:h-14 flex items-center justify-center relative overflow-hidden">
                            <img src="/img/logos/IMG_5208.PNG" alt="Bull Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-lg lg:text-xl font-black italic tracking-tighter leading-none">
                                IndexGenius<br /><span className="text-red-600">ACADEMY</span>
                            </h1>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 lg:px-6 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleTabClick(item.id)}
                            className={`w-full flex items-center gap-3 px-4 lg:px-6 py-3 lg:py-4 transition-all duration-300 group relative ${activeTab === item.id
                                ? 'text-white'
                                : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {activeTab === item.id && (
                                <div className="absolute left-0 w-1 h-6 lg:h-8 bg-red-600 shadow-red-glow"></div>
                            )}
                            <item.icon
                                size={16}
                                className={`transition-colors duration-300 ${activeTab === item.id ? 'text-red-600' : 'group-hover:text-red-600'}`}
                            />
                            <span className="font-black text-[11px] tracking-[0.2em] uppercase flex-1 text-left">{item.label}</span>
                            {item.count > 0 && (
                                <span className="bg-red-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-none shadow-red-glow animate-pulse">
                                    {item.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-6 lg:p-8 space-y-4">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-none flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                        <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">CORRIENDO SEÑALES: ON</span>
                    </div>

                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-4 px-6 py-3 text-gray-500 hover:text-red-500 transition-colors uppercase font-black text-[10px] tracking-widest text-left"
                    >
                        <LogOut size={16} />
                        <span>CERRAR SESIÓN</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
