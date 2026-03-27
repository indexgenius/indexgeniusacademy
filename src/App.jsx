import React, { useState, useEffect, useRef } from 'react';

// 🔥 IMPORT FIREBASE NOTIFICACIONES
import { activarNotificaciones, escucharNotificaciones } from './firebase';

// Components
import Landing from './features/landing/LandingPage';
import Login from './features/auth/AuthPage';
import Dashboard from './features/signals/DashboardPage';
import Admin from './features/admin/AdminPage';
import ResetPassword from './features/auth/ResetPasswordPage';

import Groups from './features/community/GroupsPage';
import Announcements from './features/community/AnnouncementsPage';
import Profile from './features/user/ProfilePage';
import Academy from './features/academy/AcademyPage';
import Templates from './features/trading/TemplatesPage';
import Charts from './features/trading/ChartsPage';
import TradingHistory from './features/trading/HistoryPage';
import MonthlyHistory from './features/trading/MonthlyHistory';
import LiveClasses from './features/live/LiveClassesPage';
import Affiliate from './features/affiliate/AffiliateDashboard';
import SupremeDashboard from './features/admin/SupremeDashboard';

import PendingApproval from './features/access/PendingApproval';
import PaymentPortal from './features/access/PaymentPortal';
import PromoModal from './features/notifications/PromoModal';
import NotificationPromptModal from './features/notifications/NotificationPromptModal';
import PhoneCaptureModal from './features/user/PhoneCaptureModal';

import { db } from './firebase';
import { onSnapshot, query, orderBy, collection, limit } from "firebase/firestore";

import { useSignals } from './hooks/useSignals';
import { useAuth } from './hooks/useAuth';
import { usePWA } from './hooks/usePWA';
import { useReferralTracker } from './hooks/useReferralTracker';
import { signalService } from './services/signalService';
import MainLayout from './layouts/MainLayout';

function App() {
  const appLoadTimeRef = useRef(Date.now());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);
  const [customMsg, setCustomMsg] = useState('');
  const [reconnectTrigger, setReconnectTrigger] = useState(0);
  const [upgradeData, setUpgradeData] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const oobCode = urlParams.get('oobCode');
  const isResetFlow = mode === 'resetPassword' && oobCode;

  const { user, login, logout } = useAuth();
  useReferralTracker();

  const { isStandalone, pushEnabled, adblockDetected, rePromptPush } = usePWA();

  const isAdmin = user?.email?.toLowerCase() === 'admin' || user?.email?.toLowerCase() === 'steven@ingenius.fx' || user?.email?.toLowerCase() === 'jeilin@jeilin.com' || user?.canBroadcast;
  const isSupreme = user?.email?.toLowerCase() === 'admin' || user?.email?.toLowerCase() === 'steven@ingenius.fx' || user?.email?.toLowerCase() === 'jeilin@jeilin.com';

  const isAuthorized = user?.status === 'approved' || isAdmin;
  const { lastSignal } = useSignals(appLoadTimeRef.current, isAuthorized);

  // 🔥 ACTIVAR NOTIFICACIONES AUTOMÁTICAMENTE
  useEffect(() => {
    if (user) {
      activarNotificaciones();
      escucharNotificaciones();
    }
  }, [user]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastTrigger = parseInt(localStorage.getItem('last_reconnect_trigger') || '0');
        const now = Date.now();
        if (now - lastTrigger > 30000) {
          setReconnectTrigger(prev => prev + 1);
          localStorage.setItem('last_reconnect_trigger', now.toString());
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (lastSignal) triggerLocalNotification(lastSignal);
  }, [lastSignal]);

  const triggerLocalNotification = (signalData) => {
    const msg = typeof signalData === 'string' ? signalData : signalData.message;

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification("IndexGenius ACADEMY", {
        body: msg,
        icon: '/img/iconos/pwa-192x192.png',
        vibrate: [200, 100, 200]
      });
    }

    const signalTime = signalData.timestamp?.toMillis() || Date.now();
    const newNotif = {
      id: Date.now(),
      msg: signalData.message,
      data: signalData,
      time: new Date(signalTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    setNotifications((prev) => [newNotif, ...prev].slice(0, 3));
    setTimeout(() => {
      setNotifications((prev) => prev.filter(n => n.id !== newNotif.id));
    }, 12000);
  };

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "announcements"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
      const saved = localStorage.getItem(`read_announcements_${user.uid}`);
      const readIds = new Set(saved ? JSON.parse(saved) : []);
      const count = snapshot.docs.filter(doc => !readIds.has(doc.id)).length;
      setUnreadAnnouncements(count);
    });
  }, [user?.uid, reconnectTrigger]);

  const broadcastSignal = async (signalObj) => {
    try {
      await signalService.broadcastSignal(signalObj, user.email);
      setCustomMsg('');
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const [showAuth, setShowAuth] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');

  const triggerAuth = (mode = 'login') => {
    setAuthInitialMode(mode);
    setShowAuth(true);
  };

  if (isResetFlow) return <ResetPassword oobCode={oobCode} />;

  if (!user) {
    if (!isStandalone && !showAuth) {
      return <Landing onShowAuth={(mode) => triggerAuth(mode)} />;
    }
    return <Login initialMode={authInitialMode} onLogin={async (u) => {
      await login(u);
      setShowAuth(false);
    }} />;
  }

  if (!isAdmin && !isSupreme) {
    if (user?.status === 'payment_required') return <PaymentPortal user={user} onLogout={logout} />;
    if (user?.status === 'pending' || user?.status === 'rejected') return <PendingApproval onLogout={logout} status={user.status} user={user} />;
  }

  return (
    <MainLayout
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={logout}
      unreadAnnouncements={unreadAnnouncements}
      notifications={notifications}
      pushEnabled={pushEnabled}
      adblockDetected={adblockDetected}
      rePromptPush={rePromptPush}
      broadcastSignal={broadcastSignal}
      customMsg={customMsg}
      setCustomMsg={setCustomMsg}
    >
      {activeTab === 'dashboard' && <Dashboard user={user} broadcastSignal={broadcastSignal} />}
      {activeTab === 'admin' && isAdmin && <Admin user={user} broadcastSignal={broadcastSignal} />}
      {activeTab === 'groups' && <Groups user={user} />}
      {activeTab === 'profile' && <Profile user={user} />}
      <PhoneCaptureModal user={user} />
      {user?.status === 'approved' && <PromoModal />}
      {user?.status === 'approved' && (
        <NotificationPromptModal pushEnabled={pushEnabled} onEnable={rePromptPush} />
      )}
    </MainLayout>
  );
}

export default App;