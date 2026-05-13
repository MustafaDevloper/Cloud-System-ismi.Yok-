import { 
  LayoutDashboard, Folder, Share2, Bell, Settings as SettingsIcon, LogOut, ShieldAlert, Code, Zap
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  storageUsed?: string;
  isAdmin?: boolean;
}

export default function Sidebar({ activeTab, onTabChange, onLogout, storageUsed = '0 B', isAdmin = false }: SidebarProps) {
  return (
    <aside className="w-72 border-r border-white/5 bg-[#0e0e11] flex flex-col h-screen relative z-30">
      <div className="p-8 flex items-center gap-4">
        <motion.div 
          whileHover={{ rotate: 180 }}
          className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(242,125,38,0.3)] group cursor-pointer"
        >
          <Zap className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />
        </motion.div>
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tighter text-white uppercase font-heading">Secure<span className="text-brand italic">Cloud</span></span>
          <span className="text-[8px] font-black tracking-[0.4em] text-gray-600 uppercase">Neural Network UI</span>
        </div>
      </div>

      <nav className="flex-1 px-6 py-6 space-y-2 custom-scrollbar">
        <NavItem icon={LayoutDashboard} label="Terminal Home" active={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
        <NavItem icon={Code} label="Mesh Workspace" active={activeTab === 'workspace'} onClick={() => onTabChange('workspace')} />
        <NavItem icon={Folder} label="Data Archive" active={activeTab === 'files'} onClick={() => onTabChange('files')} />
        <NavItem icon={Share2} label="Direct Uplinks" active={activeTab === 'shared'} onClick={() => onTabChange('shared')} />
        <NavItem icon={Bell} label="Signal Feed" active={activeTab === 'notifications'} onClick={() => onTabChange('notifications')} />
        <NavItem icon={SettingsIcon} label="Core Settings" active={activeTab === 'settings'} onClick={() => onTabChange('settings')} />
        
        {isAdmin && (
          <div className="pt-6 mt-6 border-t border-white/5">
             <span className="px-4 text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-4 block">Privileged Access</span>
            <NavItem 
              icon={ShieldAlert} 
              label="Root Access" 
              active={activeTab === 'admin'} 
              onClick={() => onTabChange('admin')} 
              isSpecial
            />
          </div>
        )}
      </nav>

      <div className="px-8 py-8 border-t border-white/5 bg-black/20">
        <div className="mb-8">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 mb-3">
            <span>Archive Usage</span>
            <span className="text-brand">{storageUsed}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '33%' }}
               className="h-full bg-gradient-to-r from-brand to-orange-400 rounded-full shadow-[0_0_12px_rgba(242,125,38,0.4)]" 
            />
          </div>
        </div>
        
        <button 
          onClick={onLogout} 
          className="flex items-center gap-4 w-full px-5 py-3.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20 group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Exit Portal</span>
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon: Icon, label, active, onClick, isSpecial = false }: { icon: any, label: string, active: boolean, onClick: () => void, isSpecial?: boolean }) {
  const activeClass = isSpecial 
    ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
    : 'bg-brand/10 text-brand border border-brand/20 shadow-[0_0_15px_rgba(242,125,38,0.1)]';
    
  const inactiveClass = isSpecial 
    ? 'text-red-500/40 hover:text-red-400 hover:bg-red-500/5 border border-transparent' 
    : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] border border-transparent';
  
  return (
    <motion.button 
      whileTap={{ scale: 0.98 }}
      onClick={onClick} 
      className={`flex items-center gap-4 w-full px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
        active ? activeClass : inactiveClass
      }`}
    >
      <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span>{label}</span>
      {active && (
        <motion.div 
          layoutId="active-pill"
          className={`ml-auto w-1 h-4 rounded-full ${isSpecial ? 'bg-red-500' : 'bg-brand'}`} 
        />
      )}
    </motion.button>
  );
}
