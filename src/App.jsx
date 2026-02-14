import React, { useState, useEffect, useRef } from 'react';
// Components
// Core Modules
import Landing from './features/landing/LandingPage';
import Login from './features/auth/AuthPage';
import Dashboard from './features/signals/DashboardPage';
import Admin from './features/admin/AdminPage';
import ResetPassword from './features/auth/ResetPasswordPage';

// Modular Feature Components
import Groups from './features/community/GroupsPage';
import Announcements from './features/community/AnnouncementsPage';
import Profile from './features/user/ProfilePage';
import Academy from './features/academy/AcademyPage';
import Templates from './features/trading/TemplatesPage';
import Charts from './features/trading/ChartsPage';
import TradingHistory from './features/trading/HistoryPage';
import MonthlyHistory from './features/trading/MonthlyHistory';
import Affiliate from './features/affiliate/AffiliateDashboard';
import SupremeDashboard from './features/admin/SupremeDashboard';

// Access & Protection
import PendingApproval from './features/access/PendingApproval';
import SubscriptionExpired from './features/access/SubscriptionExpired';
import PaymentPortal from './features/access/PaymentPortal';
import PromoModal from './features/notifications/PromoModal';
import NotificationPromptModal from './features/notifications/NotificationPromptModal';

import { db } from './firebase';
import { onSnapshot, query, orderBy, collection, limit } from "firebase/firestore";

// Hooks & Services
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

  // URL Auth Action Detection
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const oobCode = urlParams.get('oobCode');
  const isResetFlow = mode === 'resetPassword' && oobCode;

  // 1. Auth & Profile
  const { user, login, logout } = useAuth();

  // 1.5. Referral Tracking
  useReferralTracker();


  // 2. PWA & Device Status
  const { isStandalone, pushEnabled, adblockDetected, rePromptPush } = usePWA();

  const isAdmin = user?.email?.toLowerCase() === 'admin' || user?.email?.toLowerCase() === 'steven@ingenius.fx' || user?.email?.toLowerCase() === 'jeilin@jeilin.com' || user?.canBroadcast;
  const isSupreme = user?.email?.toLowerCase() === 'admin' || user?.email?.toLowerCase() === 'steven@ingenius.fx' || user?.email?.toLowerCase() === 'jeilin@jeilin.com';

  // 2. Real-time Signals
  const isAuthorized = user?.status === 'approved' || isAdmin;
  const { lastSignal } = useSignals(appLoadTimeRef.current, isAuthorized);

  // 2.5. Detect when app comes back from background (Android PWA fix)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 App visible - reconnecting all listeners...');
        setReconnectTrigger(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // 3. Signal Trigger
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
  // 3. Unread Announcements Logic
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "announcements"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
      const saved = localStorage.getItem(`read_announcements_${user.uid}`);
      const readIds = new Set(saved ? JSON.parse(saved) : []);
      const count = snapshot.docs.filter(doc => !readIds.has(doc.id)).length;
      setUnreadAnnouncements(count);
    }, (error) => {
      console.error('❌ Announcements listener error:', error);
    });
  }, [user?.uid, reconnectTrigger]);

  const broadcastSignal = async (signalObj) => {
    try {
      await signalService.broadcastSignal(signalObj, user.email);
      setCustomMsg('');
    } catch (e) {
      console.error(e);
      alert("Error: " + e.message);
    }
  };

  // 4. Admin Notification Listener (New Payments)
  useEffect(() => {
    if (!isAdmin) return;

    // Listen for unread subscription payments created in the last 5 minutes
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const q = query(
      collection(db, "notifications"),
      orderBy("timestamp", "desc"),
      limit(5)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          // Only alert for recent payments (avoid spam on reload)
          const time = data.timestamp?.toMillis ? data.timestamp.toMillis() : Date.now();
          if (data.type === 'subscription_payment' && time > Date.now() - 10000) {
            triggerLocalNotification({
              message: `💰 PAGO RECIBIDO: ${data.userEmail}`,
              timestamp: data.timestamp
            });
          }
        }
      });
    }, (error) => {
      console.error('❌ Admin notifications listener error:', error);
    });

    return () => unsub();
  }, [isAdmin, reconnectTrigger]);

  const [showAuth, setShowAuth] = useState(false);

  // --- GATING LOGIC ---
  // 0. If it's a Reset Password flow
  if (isResetFlow) return <ResetPassword oobCode={oobCode} />;

  // 1. If no user, handle Landing vs Login
  if (!user) {
    if (!isStandalone && !showAuth) {
      return <Landing onShowAuth={() => setShowAuth(true)} />;
    }
    return <Login onLogin={(u) => {
      login(u);
      setShowAuth(false);
      // If user is brand new (created just now or payment_required), 
      // we might want to flag that they should see the guide
      if (u.status === 'payment_required') {
        localStorage.setItem('show_onboarding', 'true');
      }
    }} />;
  }

  // 2. If user exists, handle status gating
  if (user?.status === 'payment_required') return <PaymentPortal user={user} onLogout={logout} />;
  if (user?.status === 'pending' || user?.status === 'rejected') return <PendingApproval onLogout={logout} status={user.status} user={user} />;

  const isExpired = () => {
    if (user?.status === 'renewal_pending') return true;
    if (user?.subscriptionEnd) {
      const end = user.subscriptionEnd.toDate ? user.subscriptionEnd.toDate() : new Date(user.subscriptionEnd);
      return end < new Date();
    }
    return false;
  };

  if (isExpired()) return <SubscriptionExpired user={user} onLogout={logout} />;



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
      {activeTab === 'announcements' && <Announcements user={user} />}
      {activeTab === 'charts' && <Charts />}
      {activeTab === 'trading-history' && <TradingHistory user={user} />}
      {activeTab === 'monthly-history' && <MonthlyHistory />}
      {activeTab === 'academy' && <Academy user={user} />}
      {activeTab === 'templates' && <Templates user={user} />}
      {activeTab === 'affiliate' && <Affiliate user={user} />}
      {activeTab === 'supreme' && isSupreme && <SupremeDashboard user={user} />}
      {activeTab === 'admin' && (user?.canBroadcast || isAdmin) && <Admin user={user} broadcastSignal={broadcastSignal} />}
      {activeTab === 'groups' && <Groups user={user} />}
      {activeTab === 'profile' && <Profile user={user} />}
      {user?.status === 'approved' && <PromoModal />}
      {user?.status === 'approved' && (
        <NotificationPromptModal
          pushEnabled={pushEnabled}
          onEnable={rePromptPush}
        />
      )}
    </MainLayout>
  );
}

export default App;
