import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Server, Users, HardDrive, Cpu, Activity, Clock, ShieldAlert } from 'lucide-react';
import { api } from '../api';

export default function AdminPanel() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('cloud_token') || '';

  const fetchAdminData = async () => {
    try {
      const res = await api.get('/admin/system', token);
      if (res.success) setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-32 text-center text-brand flex flex-col items-center">
        <Server className="w-16 h-16 mb-6 animate-pulse opacity-50" />
        <p className="font-bold tracking-widest uppercase text-xs">Accessing Mainframe...</p>
      </div>
    );
  }

  if (!data?.system) {
    return (
      <div className="flex flex-col items-center justify-center p-32 text-center text-red-500">
        <ShieldAlert className="w-24 h-24 mb-6 opacity-20" />
        <h2 className="text-3xl font-black mb-2 uppercase">Access Denied</h2>
        <p className="text-gray-500 italic">This area is restricted to SuperAdmins only.</p>
      </div>
    );
  }

  const { system, users } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header>
        <h1 className="text-4xl font-black mb-2 tracking-tighter text-blue-500 flex items-center gap-3">
          <Server className="w-8 h-8" />
          Master Console
        </h1>
        <p className="text-gray-500 font-medium italic">Live server diagnostics and user quota management</p>
      </header>

      {/* Hardware Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 rounded-[2rem] border border-blue-500/20 shadow-xl shadow-blue-500/5 relative overflow-hidden">
          <Cpu className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-500/5" />
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Operating System</p>
          <h3 className="text-xl font-bold truncate">{system.os}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-[2rem] border border-brand/20 shadow-xl shadow-brand/5 relative overflow-hidden">
          <Clock className="absolute -right-4 -bottom-4 w-24 h-24 text-brand/5" />
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Server PC Uptime</p>
          <h3 className="text-xl font-bold">{system.uptime}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6 rounded-[2rem] border border-green-500/20 shadow-xl shadow-green-500/5 relative overflow-hidden md:col-span-2">
          <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-green-500/5" />
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">RAM Consumption</p>
              <h3 className="text-xl font-bold">{system.ramInfo}</h3>
            </div>
            <span className="text-green-500 font-black text-2xl">{system.ramPercent}%</span>
          </div>
          <div className="h-2 w-full bg-surface-lighter rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${system.ramPercent > 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${system.ramPercent}%` }} />
          </div>
        </motion.div>
      </div>

      {/* User Management Table */}
      <section className="glass rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-brand" />
            <h2 className="text-xl font-bold">Network Identities</h2>
          </div>
          <div className="px-4 py-1.5 bg-brand/10 text-brand rounded-full text-xs font-black uppercase tracking-widest border border-brand/20">
            {users.length} Active
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-light/50 border-b border-white/5">
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Identity</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Plan / Tier</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Cloud Quota</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Object Count</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u: any, i: number) => (
                <motion.tr key={u.username} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-white/5 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${u.username === 'admin' ? 'bg-blue-500/20 text-blue-500' : 'bg-brand/20 text-brand'}`}>
                        {u.username[0].toUpperCase()}
                      </div>
                      <span className="font-bold">{u.username}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${u.username === 'admin' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                      {u.tier}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{u.usedSpace}</span>
                    </div>
                  </td>
                  <td className="p-5 text-gray-400 font-medium">{u.fileCount} Objects</td>
                  <td className="p-5 text-xs text-gray-500 font-medium">{new Date(u.createdAt).toLocaleDateString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
