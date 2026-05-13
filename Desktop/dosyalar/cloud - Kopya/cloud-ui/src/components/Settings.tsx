import { useState, useRef } from 'react';
import { User, Key, Trash2, Shield, Upload, Check, ShieldAlert } from 'lucide-react';
import { api } from '../api';

export default function Settings() {
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const token = localStorage.getItem('cloud_token') || '';
  const username = localStorage.getItem('cloud_user') || 'User';

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append('avatar', e.target.files[0]);

    try {
      const res = await api.upload('/auth/avatar', formData, token);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      alert('Avatar upload failed');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('WARNING: THIS IS IRREVERSIBLE. Delete account and erase all files?')) return;
    try {
      const res = await api.delete('/auth/account', token);
      if (res.success) {
        localStorage.clear();
        window.location.reload();
      }
    } catch (err) {
      alert('Action failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header>
        <h1 className="text-4xl font-black mb-2 tracking-tighter">System Settings</h1>
        <p className="text-gray-500 font-medium italic">Manage encryption keys, profile assets, and security</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-1">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><User className="w-5 h-5 text-brand" /> Profile Control</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">Configure your public identity on SecureCloud. Avatars are synchronized across all CLI clients.</p>
        </div>
        
        <div className="md:col-span-2 glass p-10 rounded-[3rem] space-y-8 border border-white/5">
          <div className="flex items-center gap-8">
            <div className="relative group">
              <div className="w-28 h-28 bg-surface-light rounded-full flex items-center justify-center border-4 border-border overflow-hidden shadow-2xl group-hover:border-brand transition-colors">
                <User className="w-14 h-14 text-gray-500" />
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-brand/80 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-full scale-90 group-hover:scale-100">
                <Upload className="w-8 h-8 text-black" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" />
            </div>
            <div>
              <h4 className="text-2xl font-black">{username}</h4>
              <p className="text-brand text-xs font-bold uppercase tracking-widest mt-1">Enterprise Tier • Active</p>
              {success && <p className="text-green-400 text-[10px] font-black uppercase mt-2 flex items-center gap-1"><Check className="w-3 h-3" /> Identity Updated</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-white/5">
        <div className="md:col-span-1">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Shield className="w-5 h-5 text-yellow-500" /> API Security</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">Your private access token for the Watcher CLI. Keep this strictly confidential.</p>
        </div>
        
        <div className="md:col-span-2 glass p-10 rounded-[3rem] space-y-6 border border-white/5 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-[2rem]">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-yellow-500/10 rounded-xl"><Key className="w-6 h-6 text-yellow-500" /></div>
              <div>
                <p className="font-black text-yellow-500 text-sm uppercase tracking-tighter">CLI Master Key</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Active Session Token</p>
              </div>
            </div>
            <code className="bg-black/40 px-4 py-2 rounded-xl text-xs text-brand font-mono font-bold border border-white/5 select-all">
              {token.substring(0, 16)}...
            </code>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-white/5">
        <div className="md:col-span-1 border-l-4 border-red-500/50 pl-6">
          <h3 className="text-lg font-black text-red-500 mb-3 flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> Danger Zone</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">Permanent account termination. This will erase all remote storage metadata immediately.</p>
        </div>
        
        <div className="md:col-span-2 glass p-10 rounded-[3rem] border border-red-500/10 shadow-2xl shadow-red-500/5">
          <button onClick={handleDeleteAccount} className="flex items-center justify-center gap-3 w-full py-5 text-red-500 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 rounded-[1.5rem] transition-all font-black uppercase text-xs tracking-[0.2em] active:scale-[0.98]">
            <Trash2 className="w-5 h-5" />
            <span>Terminate & Wipe All Cloud Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
