import React from 'react';
import { UserRole } from '../types';
import { 
  Activity, 
  Shield, 
  Building2, 
  Hospital, 
  Heart, 
  User as UserIcon, 
  BarChart3, 
  Radio,
  Search,
  HelpCircle,
  LayoutDashboard,
  Clock,
  Trash2,
  Network,
  MessageSquare,
  SlidersHorizontal
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'expiry-risk' 
  | 'wastage-analytics' 
  | 'hospital-network' 
  | 'hospital-communications' 
  | 'admin-configuration' 
  | 'why-smartblood';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenSearch: () => void;
  onOpenMetrics: () => void;
  backendHealthy: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  onOpenSearch,
  onOpenMetrics,
  backendHealthy,
}) => {
  const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    ADMIN: { label: 'Regional Admin', icon: <Shield className="w-4 h-4" />, color: 'text-amber-400' },
    BLOOD_BANK: { label: 'Blood Bank Officer', icon: <Building2 className="w-4 h-4" />, color: 'text-blue-400' },
    HOSPITAL: { label: 'Trauma & Hospital', icon: <Hospital className="w-4 h-4" />, color: 'text-rose-400' },
    DONOR: { label: 'Verified Donor', icon: <Heart className="w-4 h-4" />, color: 'text-emerald-400' },
    PATIENT: { label: 'Patient / Seeker', icon: <UserIcon className="w-4 h-4" />, color: 'text-cyan-400' },
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Status Badge */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onTabChange('dashboard')}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blood-600 to-blood-800 flex items-center justify-center shadow-lg shadow-blood-900/30 border border-blood-500/30 cursor-pointer"
          >
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span 
                onClick={() => onTabChange('dashboard')}
                className="text-lg font-bold tracking-tight text-white cursor-pointer"
              >
                SmartBlood <span className="text-blood-500">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                ACTIVE NETWORK
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Intelligent Emergency Coordination & Allocation System</p>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden xl:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'dashboard' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onTabChange('expiry-risk')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'expiry-risk' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Expiry & FEFO</span>
          </button>

          <button
            onClick={() => onTabChange('wastage-analytics')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'wastage-analytics' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Wastage Analytics</span>
          </button>

          <button
            onClick={() => onTabChange('hospital-network')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'hospital-network' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hospital Network</span>
          </button>

          <button
            onClick={() => onTabChange('hospital-communications')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'hospital-communications' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>Comms</span>
          </button>

          {currentRole === 'ADMIN' && (
            <button
              onClick={() => onTabChange('admin-configuration')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'admin-configuration' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Config</span>
            </button>
          )}

          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all"
          >
            <Search className="w-3.5 h-3.5 text-blood-400" />
            <span>Search</span>
          </button>

          <button
            onClick={() => onTabChange('why-smartblood')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'why-smartblood' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>Why SmartBlood?</span>
          </button>
        </div>

        {/* Right Controls: Model Metrics & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenMetrics}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-medium transition-all shadow-sm"
            title="Inspect trained Scikit-Learn evaluation metrics (MAE, RMSE, Accuracy)"
          >
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">AI Metrics</span>
          </button>

          {/* Role Switcher Demo Bar */}
          <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <div className="text-[11px] text-slate-400 px-2 font-medium hidden lg:block">Role:</div>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              aria-label="Select user role for demonstration"
              className="bg-slate-800 text-white text-xs rounded-md px-2 py-1 font-medium border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blood-500 cursor-pointer"
            >
              {(Object.keys(roleConfig) as UserRole[]).map((r) => (
                <option key={r} value={r}>
                  {roleConfig[r].label}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>
    </header>
  );
};
