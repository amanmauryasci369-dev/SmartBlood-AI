import React, { useState } from 'react';
import { UserRole } from '../types';
import { 
  Shield, 
  Building2, 
  Hospital, 
  Heart, 
  User as UserIcon, 
  BarChart3, 
  Search, 
  AlertTriangle,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  MapPin,
  Calendar,
  Network,
  Clock,
  SlidersHorizontal,
  Info,
  Layers,
  Bell,
  LogOut,
  PhoneCall
} from 'lucide-react';

export type NavTab = 
  | 'home'
  | 'find-blood'
  | 'blood-centers'
  | 'nearby'
  | 'emergency-request'
  | 'donation-camps'
  | 'donors'
  | 'ai-insights'
  | 'hospital-network'
  | 'hospital-communications'
  | 'inventory'
  | 'expiry-risk'
  | 'wastage-analytics'
  | 'admin-dashboard'
  | 'admin-configuration'
  | 'about';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenSOSModal: () => void;
  onOpenSearch: () => void;
  onOpenMetrics: () => void;
  backendHealthy: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  onOpenSOSModal,
  onOpenSearch,
  onOpenMetrics,
  backendHealthy,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; badge: string }> = {
    ADMIN: { label: 'Regional Admin', icon: <Shield className="w-3.5 h-3.5" />, badge: 'bg-amber-100 text-amber-800' },
    BLOOD_BANK: { label: 'Blood Center Officer', icon: <Building2 className="w-3.5 h-3.5" />, badge: 'bg-blue-100 text-blue-800' },
    HOSPITAL: { label: 'Trauma & Hospital Desk', icon: <Hospital className="w-3.5 h-3.5" />, badge: 'bg-rose-100 text-rose-800' },
    DONOR: { label: 'Registered Donor', icon: <Heart className="w-3.5 h-3.5" />, badge: 'bg-emerald-100 text-emerald-800' },
    PATIENT: { label: 'Citizen / Seeker', icon: <UserIcon className="w-3.5 h-3.5" />, badge: 'bg-cyan-100 text-cyan-800' },
  };

  const navItems: Array<{ id: NavTab; label: string; icon?: React.ReactNode }> = [
    { id: 'home', label: 'Home' },
    { id: 'find-blood', label: 'Find Blood' },
    { id: 'blood-centers', label: 'Blood Centers' },
    { id: 'hospital-network', label: 'Hospitals' },
    { id: 'emergency-request', label: 'Emergency' },
    { id: 'donation-camps', label: 'Camps' },
    { id: 'donors', label: 'Donors' },
    { id: 'ai-insights', label: 'AI Insights' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      
      {/* 1. Top Government / Healthcare Information Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-200 tracking-wide flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse"></span>
              SMARTBLOOD AI &bull; Intelligent Blood Resource Management System
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-400 text-[11px]">
              Synthetic e-RaktKosh Compatible Coordination Engine
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${backendHealthy ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className="text-slate-300 font-mono">
                {backendHealthy ? 'Network: 100% Operational' : 'Connecting to Node...'}
              </span>
            </div>

            <button
              onClick={onOpenMetrics}
              className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
              title="Inspect genuine Scikit-Learn Model Evaluation Metrics"
            >
              <BarChart3 className="w-3 h-3 text-purple-400" />
              <span>AI Validation Metrics</span>
            </button>

            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Toll-Free Emergency: 1075 / 108</span>
          </div>

        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          
          {/* Logo & Branding */}
          <div 
            onClick={() => onTabChange('home')}
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
          >
            {/* Custom Blood-Drop + AI Neural Network Vector Logo */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-red-600 to-red-800 flex items-center justify-center shadow-md shadow-red-900/20 border border-red-500/40 relative">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current" aria-hidden="true">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="currentColor" opacity="0.95" />
                <circle cx="12" cy="14" r="2.2" fill="#0f172a" />
                <circle cx="9" cy="11.5" r="1.2" fill="#38bdf8" />
                <circle cx="15" cy="11.5" r="1.2" fill="#38bdf8" />
                <circle cx="12" cy="18" r="1.2" fill="#38bdf8" />
                <line x1="9" y1="11.5" x2="12" y2="14" stroke="#ffffff" strokeWidth="1" />
                <line x1="15" y1="11.5" x2="12" y2="14" stroke="#ffffff" strokeWidth="1" />
                <line x1="12" y1="14" x2="12" y2="18" stroke="#ffffff" strokeWidth="1" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                  SmartBlood <span className="text-red-600">AI</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-700 uppercase tracking-wider">
                  HEALTHCARE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-tight mt-0.5 hidden sm:block">
                AI-Powered Intelligent Blood Resource Management System
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-normal transition-all ${
                    isActive
                      ? 'bg-red-50 text-red-700 border-b-2 border-red-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Persistent Red Emergency CTA */}
            <button
              onClick={onOpenSOSModal}
              id="emergency-sos-btn"
              className="px-3.5 sm:px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 tracking-wide uppercase cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-white animate-pulse shrink-0" />
              <span className="whitespace-nowrap">Need Blood Now</span>
            </button>

            {/* Role Demonstration Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                title="Switch Demonstration Role"
              >
                {roleConfig[currentRole].icon}
                <span className="hidden xl:inline">{roleConfig[currentRole].label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Demonstration Role
                  </div>
                  {(Object.keys(roleConfig) as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        onRoleChange(r);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        currentRole === r ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {roleConfig[r].icon}
                        <span>{roleConfig[r].label}</span>
                      </span>
                      {currentRole === r && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                  activeTab === item.id
                    ? 'bg-red-50 text-red-700 border-l-3 border-red-600'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenSOSModal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>EMERGENCY SOS: NEED BLOOD NOW</span>
            </button>
            <button
              onClick={() => {
                onOpenMetrics();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 rounded-lg bg-purple-50 text-purple-700 font-semibold text-xs border border-purple-200 flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>Inspect AI Model Metrics</span>
            </button>
          </div>
        </div>
      )}

    </header>
  );
};
