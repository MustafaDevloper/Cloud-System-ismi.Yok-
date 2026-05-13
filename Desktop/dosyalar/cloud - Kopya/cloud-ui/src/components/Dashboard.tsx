import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, Search, File as FileIcon, Download, Trash2, 
  Loader2, FileText, Image as ImageIcon, Archive, Code, Share2, Folder 
} from 'lucide-react';
import { api } from '../api';
import Sidebar from './Sidebar';

export default function Dashboard({ onLogout, hideSidebar = false }: { onLogout: () => void, hideSidebar?: boolean }) {
  const [files, setFiles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [sharingFile, setSharingFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem('cloud_token') || '';

  const fetchData = async () => {
    try {
      const [filesRes, healthRes, usersRes] = await Promise.all([
        api.get('/files', token),
        api.get('/health', token),
        api.get('/users', token)
      ]);
      if (filesRes.files) setFiles(filesRes.files);
      if (healthRes.status === 'ok') setStatsData(healthRes);
      if (usersRes.success) setUsers(usersRes.users);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const res = await api.upload('/upload', formData, token);
      if (res.success) fetchData();
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleShare = async (targetUser: string) => {
    if (!sharingFile) return;
    try {
      const res = await api.post('/files/share', { filename: sharingFile, targetUser }, token);
      if (res.success) {
        alert(`Shared with ${targetUser}!`);
        setSharingFile(null);
      }
    } catch (err) {
      alert('Sharing failed');
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      const res = await api.delete(`/files/${name}`, token);
      if (res.success) fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const getIcon = (iconStr: string) => {
    switch (iconStr) {
      case '📄': return FileText;
      case '🖼️': return ImageIcon;
      case '🎬': return ImageIcon;
      case '📦': return Archive;
      case '💻': return Code;
      default: return FileIcon;
    }
  };

  const stats = [
    { label: 'Total Files', value: statsData?.fileCount || '0', sub: 'Stored in cloud' },
    { label: 'Storage Used', value: statsData?.totalSize || '0 B', sub: 'Total capacity' },
    { label: 'System Uptime', value: statsData?.uptime || '0s', sub: 'Server status' },
  ];

  const content = (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-8">
        <div className="flex flex-col">
           <h1 className="text-5xl font-black tracking-tighter uppercase font-heading">Data <span className="text-brand italic">Vault</span></h1>
           <p className="text-gray-500 font-medium tracking-widest text-[10px] uppercase mt-2">Active Node: Primary Secure Cluster</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-96 text-gray-400 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 group-focus-within:text-brand transition-colors" />
            <input 
              type="text" 
              placeholder="Query files..."
              className="w-full bg-[#0e0e11] border border-white/5 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/5 transition-all shadow-2xl font-medium text-sm"
            />
          </div>
          
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-brand hover:bg-[#ff8c38] text-black font-black uppercase text-xs tracking-widest px-8 py-4 rounded-2xl flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-[0_15px_40px_-10px_rgba(242,125,38,0.4)]"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            <span>{uploading ? 'Provisioning...' : 'Upload Data'}</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#0e0e11] p-10 rounded-[3rem] relative overflow-hidden group border border-white/5 shadow-xl"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 rounded-full -mr-24 -mt-24 blur-[80px] group-hover:bg-brand/10 transition-colors" />
            <div className="relative z-10">
              <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4">{stat.label}</p>
              <h3 className="text-5xl font-black mb-3 tracking-tighter text-white font-heading">{stat.value}</h3>
              <p className="text-brand/40 text-[9px] font-black uppercase tracking-[0.1em]">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="bg-[#0e0e11] rounded-[3.5rem] overflow-hidden border border-white/5 shadow-2xl mb-12">
        <div className="p-8 px-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <h2 className="text-xl font-black uppercase tracking-widest font-heading">Relational Storage</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
            <span className="text-brand text-[10px] font-black uppercase tracking-widest">Streaming Active</span>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="p-32 text-center text-gray-500">
               <Loader2 className="w-12 h-12 animate-spin mx-auto mb-6 opacity-20" />
               <p className="font-medium animate-pulse">Syncing with SecureCloud...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="p-32 text-center text-gray-500">
               <Folder className="w-16 h-16 mx-auto mb-6 opacity-10" />
               <p className="italic mb-2 opacity-40">Your cloud storage is empty.</p>
               <button onClick={() => fetchData()} className="text-brand text-xs font-bold uppercase hover:underline">Refresh List</button>
            </div>
          ) : (
            files.map((file, i) => {
              const Icon = getIcon(file.icon);
              return (
                <motion.div 
                  key={file.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-4 flex items-center justify-between hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-surface border border-border text-brand group-hover:scale-110 transition-transform shadow-lg shadow-black/40">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold group-hover:text-brand transition-colors text-sm">{file.name}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-70">
                        {file.sizeHuman} • {new Date(file.modified).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSharingFile(file.name)} className="p-3 hover:bg-brand/10 hover:text-brand rounded-xl transition-all text-gray-500" title="Share"><Share2 className="w-5 h-5" /></button>
                    <a href={`http://localhost:4000/files/${file.name}/download?token=${token}`} className="p-3 hover:bg-brand/10 hover:text-brand rounded-xl transition-all text-gray-500" title="Download"><Download className="w-5 h-5" /></a>
                    <button onClick={() => handleDelete(file.name)} className="p-3 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all text-gray-500" title="Delete"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      <AnimatePresence>
        {sharingFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-sm glass p-10 rounded-[3rem] shadow-2xl border border-white/10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black">Share File</h3>
                <button onClick={() => setSharingFile(null)} className="text-gray-500 hover:text-white text-xl">✕</button>
              </div>
              <p className="text-sm text-gray-400 mb-8 italic">Sharing: <span className="text-brand font-bold not-italic">"{sharingFile}"</span></p>
              
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {users.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-10 opacity-50 font-medium italic">No team members found.</p>
                ) : (
                  users.map(u => (
                    <button key={u.username} onClick={() => handleShare(u.username)} className="w-full flex items-center gap-4 p-4 bg-surface border border-border rounded-[1.5rem] hover:border-brand transition-all text-left group">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-brand font-black group-hover:scale-110 transition-transform">
                        {u.username[0].toUpperCase()}
                      </div>
                      <span className="flex-1 font-bold">{u.username}</span>
                      <Share2 className="w-4 h-4 text-gray-600 group-hover:text-brand" />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  if (hideSidebar) return content;

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-white">
      <Sidebar activeTab="dashboard" onTabChange={() => {}} onLogout={onLogout} storageUsed={statsData?.totalSize || '0 B'} />
      <main className="flex-1 overflow-y-auto p-10 relative custom-scrollbar">
        {content}
      </main>
    </div>
  );
}
