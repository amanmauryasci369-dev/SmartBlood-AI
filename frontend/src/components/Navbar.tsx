import React, { useState } from 'react';
import { UserRole } from '../types';
import { BRAND } from '../constants/branding';
import { LifeLinkLogo } from './common/LifeLinkLogo';
import { ApiService } from '../services/api';
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
  PhoneCall,
  Droplets,
  LayoutDashboard
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; badge: string }> = {
    ADMIN: { label: 'Regional Admin', icon: <Shield className="w-3.5 h-3.5" />, badge: 'bg-amber-100 text-amber-800' },
    BLOOD_BANK: { label: 'Blood Center Officer', icon: <Building2 className="w-3.5 h-3.5" />, badge: 'bg-blue-100 text-blue-800' },
    HOSPITAL: { label: 'Trauma & Hospital Desk', icon: <Hospital className="w-3.5 h-3.5" />, badge: 'bg-rose-100 text-rose-800' },
    DONOR: { label: 'Registered Donor', icon: <Heart className="w-3.5 h-3.5" />, badge: 'bg-emerald-100 text-emerald-800' },
    PATIENT: { label: 'Citizen / Seeker', icon: <UserIcon className="w-3.5 h-3.5" />, badge: 'bg-cyan-100 text-cyan-800' },
  };

  const navItems: Array<{ id: NavTab; label: string }> = [
    { id: 'admin-dashboard', label: 'Dashboard' },
    { id: 'find-blood', label: 'Find Blood' },
    { id: 'blood-centers', label: 'Blood Centers' },
    { id: 'hospital-network', label: 'Hospitals' },
    { id: 'emergency-request', label: 'Emergency' },
    { id: 'ai-insights', label: 'AI Insights' },
    { id: 'donors', label: 'Donors' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      
      {/* 1. Top Healthcare & Network Operational Information Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-200 tracking-wide flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse"></span>
              {BRAND.FULL_NAME}
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-400 text-[11px]">
              e-RaktKosh-compatible prototype/demo data integration
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${backendHealthy ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className="text-slate-300 font-mono font-semibold">
                LifeLink Network Status: {backendHealthy ? 'SYSTEM ONLINE' : 'CONNECTING...'}
              </span>
            </div>

            <button
              onClick={onOpenMetrics}
              className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              title="Inspect genuine Scikit-Learn Model Evaluation Metrics"
            >
              <BarChart3 className="w-3 h-3 text-purple-400" />
              <span>AI Validation Metrics</span>
            </button>

            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-slate-400">Emergency Coordination: 1075 / 108</span>
          </div>

        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          
          {/* Logo & Branding */}
          <div 
            onClick={() => onTabChange('home')}
            className="cursor-pointer select-none shrink-0"
            title={`${BRAND.NAME} — ${BRAND.TAGLINE}`}
          >
            <LifeLinkLogo size="md" showTagline={true} />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-normal transition-all cursor-pointer ${
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
            
            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                  <div className="px-3 py-1 font-bold text-slate-700 border-b border-slate-100 flex items-center justify-between">
                    <span>LifeLink Notifications</span>
                    <span className="text-[10px] font-mono text-red-600 font-bold">2 Unread</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="p-3 hover:bg-slate-50 cursor-pointer">
                      <p className="font-bold text-slate-900">LifeLink AI Alert</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">O− PRBC demand surge projected for AIIMS Trauma Centre.</p>
                    </div>
                    <div className="p-3 hover:bg-slate-50 cursor-pointer">
                      <p className="font-bold text-slate-900">FEFO Expiry Notice</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">18 units approaching 48h expiration threshold.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Persistent Red Emergency CTA */}
            <button
              onClick={onOpenSOSModal}
              id="emergency-sos-btn"
              className="px-3 sm:px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 tracking-wide uppercase cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-white shrink-0" />
              <span className="whitespace-nowrap">Need Blood Now</span>
            </button>

            {/* Role Demonstration Switcher / Profile */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                title="Switch Demonstration Profile"
              >
                {roleConfig[currentRole].icon}
                <span className="hidden lg:inline">{roleConfig[currentRole].label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Active Profile (LifeLink)
                  </div>
                  {(Object.keys(roleConfig) as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        onRoleChange(r);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
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
                  <div className="border-t border-slate-100 mt-1 pt-1 px-3 py-1">
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        ApiService.clearToken();
                        onRoleChange('PATIENT');
                      }}
                      className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1.5 py-1 w-full text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout / Switch User</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
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
              className="w-full py-2.5 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>EMERGENCY SOS: NEED BLOOD NOW</span>
            </button>
            <button
              onClick={() => {
                onOpenMetrics();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 rounded-lg bg-purple-50 text-purple-700 font-semibold text-xs border border-purple-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>Inspect LifeLink AI Metrics</span>
            </button>
          </div>
        </div>
      )}

    </header>
  );
};
