import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import Notifications from './components/Notifications';
import Shared from './components/Shared';
import AdminPanel from './components/AdminPanel';
import Workspace from './components/Workspace';
import { api } from './api';

type Tab = 'dashboard' | 'workspace' | 'files' | 'shared' | 'notifications' | 'settings' | 'admin';
type View = 'login' | 'register' | 'authenticated';

export default function App() {
  const [view, setView] = useState<View>('login');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [initialized, setInitialized] = useState(false);
  const [storageUsed, setStorageUsed] = useState('0 B');

  useEffect(() => {
    const token = localStorage.getItem('cloud_token');
    if (token) {
      setView('authenticated');
      fetchStorage(token);
    }
    setInitialized(true);
  }, []);

  const fetchStorage = async (token: string) => {
    try {
      const res = await api.get('/health', token);
      if (res.status === 'ok') setStorageUsed(res.totalSize);
    } catch (err) {}
  };

  const handleAuthSuccess = () => {
    setView('authenticated');
    const token = localStorage.getItem('cloud_token');
    if (token) fetchStorage(token);
  };

  const handleLogout = () => {
    localStorage.clear();
    setView('login');
  };

  if (!initialized) return null;

  return (
    <div className="min-h-screen font-sans bg-[#0A0A0B] text-white selection:bg-brand selection:text-black">
      <AnimatePresence mode="wait">
        {view === 'login' && (
          <motion.div 
            key="login" 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Login onLogin={handleAuthSuccess} onSwitch={() => setView('register')} />
          </motion.div>
        )}

        {view === 'register' && (
          <motion.div 
            key="register" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Register onRegister={handleAuthSuccess} onSwitch={() => setView('login')} />
          </motion.div>
        )}

        {view === 'authenticated' && (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-screen overflow-hidden">
            <Sidebar 
              activeTab={activeTab} 
              onTabChange={(t) => setActiveTab(t as Tab)} 
              onLogout={handleLogout}
              storageUsed={storageUsed}
              isAdmin={localStorage.getItem('cloud_user') === 'admin'}
            />
            
            <main className="flex-1 overflow-y-auto p-2 relative bg-surface-light/20 scroll-smooth">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: 'circOut' }}
                  className="p-8"
                >
                  {(activeTab === 'dashboard' || activeTab === 'files') && <Dashboard onLogout={handleLogout} hideSidebar />}
                  {activeTab === 'workspace' && <Workspace />}
                  {activeTab === 'notifications' && <Notifications />}
                  {activeTab === 'settings' && <Settings />}
                  {activeTab === 'shared' && <Shared />}
                  {activeTab === 'admin' && <AdminPanel />}
                </motion.div>
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
