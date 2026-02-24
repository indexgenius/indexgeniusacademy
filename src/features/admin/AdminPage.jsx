import React, { useState } from 'react';
import { Radio, Megaphone, ShieldCheck, BookOpen, Key, Users, Wallet, Bell, Image as ImageIcon, Video, Tag } from 'lucide-react';
import NotificationBroadcaster from './NotificationBroadcaster';

// Sub-modules
import SignalCenter from './SignalCenter';
import AnnouncementManager from './AnnouncementManager';
import UserManagement from './UserManagement';
import AcademyManager from './AcademyManager';
import PaymentControl from './PaymentControl';
import CellManager from './CellManager';
import AccessKeys from './AccessKeys';
import PromoManager from './PromoManager';
import MembershipControl from './MembershipControl';
import BroadcastLive from '../live/BroadcastLive';
import DiscountManager from './DiscountManager';

const AdminPage = ({ user, broadcastSignal }) => {
    const [subTab, setSubTab] = useState('signals');

    const tabs = [
        { id: 'signals', icon: Radio, label: 'SIGNAL OPS' },
        { id: 'live', icon: Video, label: 'LIVE BROADCAST' },
        { id: 'announcements', icon: Megaphone, label: 'INTEL DEPLOY' },
        { id: 'promos', icon: ImageIcon, label: 'PROMO STACK' },
        { id: 'notifications', icon: Bell, label: 'PUSH BROADCAST' },
        { id: 'cells', icon: ShieldCheck, label: 'CELLS MANAGER' },
        { id: 'academy', icon: BookOpen, label: 'ACADEMY MGMT' },
        { id: 'users', icon: Users, label: 'USER MGMT' },
        { id: 'keys', icon: Key, label: 'ACCESS KEYS' },
        { id: 'memberships', icon: BookOpen, label: 'MEMBERSHIPS' },
        { id: 'payments', icon: Wallet, label: 'PAYMENT MGMT' },
        { id: 'discounts', icon: Tag, label: 'DESCUENTOS' },
    ];

    return (
        <div className="space-y-4 lg:space-y-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl lg:text-4xl font-black italic tracking-tighter text-white uppercase">
                    COMMAND <span className="text-red-600">CENTER</span>
                </h2>
                <p className="text-[8px] lg:text-[10px] font-bold text-gray-500 tracking-widest uppercase">
                    ADMINISTRATION LEVEL 5 • AUTHORIZED PERSONNEL
                </p>
            </div>

            {/* Sub-Nav */}
            <div className="flex border-b border-white/10 overflow-x-auto custom-scrollbar pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSubTab(tab.id)}
                        className={`px-4 py-3 lg:px-6 lg:py-4 flex items-center gap-2 text-[9px] lg:text-[10px] font-black tracking-widest uppercase transition-colors whitespace-nowrap relative ${subTab === tab.id ? 'text-red-600 border-b-2 border-red-600 bg-red-600/5' : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        <tab.icon size={14} className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">
                {subTab === 'signals' && <SignalCenter broadcastSignal={broadcastSignal} />}
                {subTab === 'live' && <BroadcastLive user={user} />}
                {subTab === 'announcements' && <AnnouncementManager user={user} />}
                {subTab === 'promos' && <PromoManager />}
                {subTab === 'notifications' && <NotificationBroadcaster />}
                {subTab === 'cells' && <CellManager />}
                {subTab === 'academy' && <AcademyManager user={user} />}
                {subTab === 'users' && <UserManagement adminUser={user} />}
                {subTab === 'keys' && <AccessKeys user={user} />}
                {subTab === 'memberships' && <MembershipControl />}
                {subTab === 'payments' && <PaymentControl />}
                {subTab === 'discounts' && <DiscountManager />}
            </div>
        </div>
    );
};

export default AdminPage;
