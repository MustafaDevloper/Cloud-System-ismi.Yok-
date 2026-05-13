import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Share2, Download, User, FileText, Image as ImageIcon, Archive, Code, File as FileIcon } from 'lucide-react';
import { api } from '../api';

export default function Shared() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('cloud_token') || '';

  const fetchData = async () => {
    try {
      const res = await api.get('/files/shared', token);
      if (res.success) setFiles(res.files);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-black mb-2">Shared With Me</h1>
        <p className="text-gray-500 font-medium tracking-tight">Files shared by your team members</p>
      </header>

      <section className="glass rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-brand" />
            <h2 className="text-xl font-bold">Incoming Shares</h2>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="p-32 text-center text-gray-400 italic animate-pulse">Scanning and fetching shared assets...</div>
          ) : files.length === 0 ? (
            <div className="p-32 text-center text-gray-500">
              <Share2 className="w-20 h-20 mx-auto mb-6 opacity-10" />
              <p className="font-medium italic">No files have been shared with you yet.</p>
              <p className="text-[10px] uppercase font-bold tracking-widest mt-4 opacity-40">Ask your team to share their first file</p>
            </div>
          ) : (
            files.map((file, i) => {
              const Icon = getIcon(file.icon);
              return (
                <motion.div key={file.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-surface border border-border text-blue-400 group-hover:scale-110 transition-transform shadow-xl shadow-black/60">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold group-hover:text-brand transition-colors">{file.filename}</h4>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1.5 text-[10px] bg-brand/10 text-brand px-3 py-1 rounded-full border border-brand/20 font-black uppercase tracking-tighter">
                          <User className="w-3 h-3" /> {file.owner}
                        </span>
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                          {file.sizeHuman}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <a href={`http://localhost:4000/files/${file.filename}/download?token=${token}`} className="p-4 bg-brand text-black rounded-[1.5rem] hover:bg-brand/90 transition-all shadow-xl shadow-brand/30 flex items-center gap-2 font-black text-sm uppercase tracking-tighter active:scale-95">
                    <Download className="w-5 h-5" />
                    <span>Download</span>
                  </a>
                </motion.div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
