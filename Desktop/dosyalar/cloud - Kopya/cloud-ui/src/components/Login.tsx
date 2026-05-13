import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Mail, Lock, Loader2, ArrowRight, Fingerprint, Globe, Cpu } from 'lucide-react';
import { api } from '../api';

export default function Login({ onLogin, onSwitch }: { onLogin: () => void, onSwitch: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.token) {
        localStorage.setItem('cloud_token', res.token);
        localStorage.setItem('cloud_user', res.username);
        onLogin();
      } else alert(res.message || 'Login failed');
    } catch (err) {
      alert('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050506] relative overflow-hidden font-sans">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#F27D2615,transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]">
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        
        {/* Animated Accents */}
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -30, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[140px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[500px] relative z-10"
      >
        <div className="glass-panel p-12 md:p-16 rounded-[4rem] border border-white/10 relative overflow-hidden bg-white/[0.01] backdrop-blur-[60px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)]">
          {/* Top Gradient Border Edge */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="flex flex-col items-center mb-14">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="w-24 h-24 bg-gradient-to-br from-brand to-[#ff7d1a] rounded-[2.5rem] flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(242,125,38,0.4)] relative border border-white/20 group cursor-pointer"
            >
              <div className="absolute inset-0 rounded-[2.5rem] bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              <Shield className="w-12 h-12 text-black" strokeWidth={2.5} />
            </motion.div>
            
            <h1 className="text-6xl font-black tracking-tighter mb-4 font-heading bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              SECURE<span className="text-brand font-black italic">CLOUD</span>
            </h1>
            
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">System Integrity: Nominal</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 px-1 ml-1 flex items-center gap-2">
                <Globe className="w-3 h-3 opacity-40 ml-[-2px]" />
                Identity Uplink
              </label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-brand transition-all duration-300" />
                <input 
                  required 
                  type="text" 
                  placeholder="Username" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  className="w-full bg-[#0e0e11]/60 border border-white/5 rounded-3xl py-5.5 pl-16 pr-6 focus:outline-none focus:border-brand/50 focus:bg-[#0e0e11] focus:ring-4 focus:ring-brand/5 transition-all font-medium text-lg placeholder:text-gray-700 shadow-inner" 
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 px-1 ml-1 flex items-center gap-2">
                <Fingerprint className="w-3 h-3 opacity-40 ml-[-2px]" />
                Access Signature
              </label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-brand transition-all duration-300" />
                <input 
                  required 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full bg-[#0e0e11]/60 border border-white/5 rounded-3xl py-5.5 pl-16 pr-6 focus:outline-none focus:border-brand/50 focus:bg-[#0e0e11] focus:ring-4 focus:ring-brand/5 transition-all font-medium text-lg placeholder:text-gray-700 font-mono shadow-inner" 
                />
              </div>
            </div>

            <button 
              disabled={loading} 
              className="w-full py-6 mt-4 bg-brand hover:bg-[#ff8c38] text-black font-black uppercase text-sm rounded-3xl shadow-[0_25px_60px_-15px_rgba(242,125,38,0.5)] transition-all flex items-center justify-center gap-4 group active:scale-[0.98] disabled:opacity-50 tracking-[0.3em] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span className="translate-x-3 group-hover:translate-x-0 transition-transform duration-500">Initialize Access</span>
                  <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500" />
                </>
              )}
            </button>
          </form>

          <footer className="mt-16 pt-10 border-t border-white/5 flex flex-col items-center gap-8">
            <div className="flex items-center gap-3">
               <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No mesh identity?</p>
               <button onClick={onSwitch} className="text-brand font-black hover:text-white transition-colors text-xs uppercase tracking-widest underline underline-offset-8 decoration-2 decoration-brand/30 hover:decoration-white">Register Uplink</button>
            </div>
            
            <div className="grid grid-cols-3 gap-10 opacity-20 hover:opacity-100 transition-opacity duration-700">
               <div className="flex flex-col items-center gap-2">
                  <Cpu className="w-5 h-5 text-white" />
                  <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">Node Cluster</span>
               </div>
               <div className="flex flex-col items-center gap-2 border-x border-white/10 px-6">
                  <Globe className="w-5 h-5 text-white" />
                  <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">Edge Gateway</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                  <Shield className="w-5 h-5 text-white" />
                  <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">Vault Layer</span>
               </div>
            </div>
          </footer>
        </div>
        
        {/* Compliance Label */}
        <div className="mt-8 flex justify-center gap-8 opacity-20 text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">
           <span>RSA 4096-BIT</span>
           <span>AES-256-GCM</span>
           <span>ZERO-KNOWLEDGE B3</span>
        </div>
      </motion.div>
    </div>
  );
}
