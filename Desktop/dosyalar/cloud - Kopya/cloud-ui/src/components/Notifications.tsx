import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, FileUp, Trash2, CheckCircle, Info, Share2 } from 'lucide-react';

interface Notification {
  id: string;
  type: 'upload' | 'delete' | 'system' | 'share';
  message: string;
  time: Date;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const token = localStorage.getItem('cloud_token') || '';

  useEffect(() => {
    const eventSource = new EventSource(`http://localhost:4000/events?token=${token}`);

    eventSource.addEventListener('file-uploaded', (e) => {
      const data = JSON.parse(e.data);
      addNotification('upload', `New file uploaded: ${data.originalName}`);
    });

    eventSource.addEventListener('file-deleted', (e) => {
      const data = JSON.parse(e.data);
      addNotification('delete', `File deleted: ${data.name}`);
    });

    eventSource.addEventListener('file-shared', (e) => {
      const data = JSON.parse(e.data);
      addNotification('share', `${data.owner} shared a file: ${data.filename}`);
    });

    eventSource.addEventListener('connected', () => {
      addNotification('system', 'Live event stream established');
    });

    return () => eventSource.close();
  }, []);

  const addNotification = (type: Notification['type'], message: string) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      time: new Date(),
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'upload': return FileUp;
      case 'delete': return Trash2;
      case 'share': return Share2;
      case 'system': return CheckCircle;
      default: return Info;
    }
  };

  const getColor = (type: Notification['type']) => {
    switch (type) {
      case 'upload': return 'text-brand bg-brand/10 border-brand/20';
      case 'delete': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'share': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'system': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Notifications</h1>
          <p className="text-gray-500 font-medium italic">Real-time system events and team activity</p>
        </div>
        <button onClick={() => setNotifications([])} className="text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">Clear Stream</button>
      </header>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {notifications.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-32 text-center text-gray-500 italic rounded-[3.5rem] border-dashed">
              <Bell className="w-16 h-16 mx-auto mb-6 opacity-5" />
              <p className="opacity-40">No activities logged yet.</p>
            </motion.div>
          ) : (
            notifications.map(notif => {
              const Icon = getIcon(notif.type);
              return (
                <motion.div key={notif.id} layout initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="glass p-5 rounded-[2rem] flex items-center gap-5 border border-white/5 shadow-xl">
                  <div className={`p-4 rounded-2xl border ${getColor(notif.type)} shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm tracking-tight">{notif.message}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mt-2 opacity-60">
                      {notif.time.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
