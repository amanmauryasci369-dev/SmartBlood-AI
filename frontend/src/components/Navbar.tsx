import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../types';
import { BRAND } from '../constants/branding';
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
  Bell, 
  LogOut, 
  PhoneCall, 
  Droplets, 
  LayoutDashboard,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Activity,
  FileText
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
  | 'about'
  | 'patient-request'
  | 'hospital-exchange';

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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');

  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; badge: string }> = {
    ADMIN: { label: 'Admin Command', icon: <Shield className="w-3.5 h-3.5" />, badge: 'bg-slate-900 text-white' },
    BLOOD_BANK: { label: 'Blood Bank Officer', icon: <Building2 className="w-3.5 h-3.5" />, badge: 'bg-red-100 text-red-800' },
    HOSPITAL: { label: 'Hospital Desk', icon: <Hospital className="w-3.5 h-3.5" />, badge: 'bg-blue-100 text-blue-800' },
    DONOR: { label: 'Registered Donor', icon: <Heart className="w-3.5 h-3.5" />, badge: 'bg-emerald-100 text-emerald-800' },
    PATIENT: { label: 'Citizen / Seeker', icon: <UserIcon className="w-3.5 h-3.5" />, badge: 'bg-cyan-100 text-cyan-800' },
  };

  const handleNavClick = (tab: NavTab) => {
    onTabChange(tab);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  return (
    <header ref={navRef} className="sticky top-0 z-40 w-full bg-white shadow-md">
      
      {/* 1. Official National Government Header Strip (e-RaktKosh & MoHFW) */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left: Emblem of India & National Health Mission e-RaktKosh Logo */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            
            {/* Government of India Emblem & MoHFW Text */}
            <div 
              onClick={() => onTabChange('home')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              {/* Ashoka Stambh SVG Graphic */}
              <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200">
                <Building2 className="w-5 h-5 text-slate-800" />
              </div>

              <div className="text-left">
                <div className="text-[11px] font-bold text-slate-900 leading-tight">
                  स्वास्थ्य एवं परिवार कल्याण मंत्रालय
                </div>
                <div className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">
                  Ministry of Health and Family Welfare
                </div>
                <div className="text-[9px] text-slate-500 font-medium">
                  Government of India
                </div>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-slate-200" />

            {/* National Health Mission + e-RaktKosh Co-branding */}
            <div 
              onClick={() => onTabChange('home')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#800020] flex items-center justify-center text-white font-black text-xs shadow-xs">
                eR
              </div>
              <div className="text-left">
                <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 leading-tight">
                  National Health Mission
                </div>
                <div className="text-base font-black text-[#800020] tracking-tight flex items-center gap-1">
                  <span>e-Rakt</span>
                  <span className="text-red-600">Kosh</span>
                  <span className="text-[10px] font-semibold text-slate-400 ml-1">| LifeLink</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right: National Helplines, Language Toggle, and Status Indicators */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-xs">
            
            {/* 24x7 Official Blood & Health Helplines */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs text-[#800020]">
              <PhoneCall className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span className="font-semibold">24x7 Toll-Free:</span>
              <strong className="font-mono font-black text-red-700">104 / 108</strong>
            </div>

            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${backendHealthy ? 'bg-emerald-500' : 'bg-amber-400'} inline-block`}></span>
              <span className="text-slate-600 font-mono font-semibold">
                {backendHealthy ? 'MoHFW Network Live' : 'Reconnecting...'}
              </span>
            </div>

            {/* Language Switcher [ EN | HI ] */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-bold">
              <button 
                type="button"
                onClick={() => setLang('EN')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  lang === 'EN' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                EN
              </button>
              <button 
                type="button"
                onClick={() => setLang('HI')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  lang === 'HI' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                HI
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                  <div className="px-3 py-1 font-bold text-slate-700 border-b border-slate-100 flex items-center justify-between">
                    <span>e-RaktKosh Bulletins</span>
                    <span className="text-[10px] font-mono text-red-600 font-bold">2 Live Updates</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="p-3 hover:bg-slate-50 cursor-pointer" onClick={() => handleNavClick('ai-insights')}>
                      <p className="font-bold text-slate-900">FEFO Expiry Alert</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Automated shelf-life reallocation active for Delhi NCR banks.</p>
                    </div>
                    <div className="p-3 hover:bg-slate-50 cursor-pointer" onClick={() => handleNavClick('hospital-network')}>
                      <p className="font-bold text-slate-900">Regional Buffer Balance</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">O- Negative PRBC critical requisition prioritized.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>
      </div>

      {/* 2. Authentic e-RaktKosh Primary Maroon Navigation Bar */}
      <div className="bg-[#800020] text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">
          
          {/* Main Desktop Navigation Items */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold">
            
            {/* Home */}
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`px-3.5 py-2 rounded-md transition-colors cursor-pointer ${
                activeTab === 'home' 
                  ? 'bg-black/20 text-white font-bold border-b-2 border-white' 
                  : 'text-white/90 hover:bg-black/10 hover:text-white'
              }`}
            >
              Home
            </button>

            {/* About e-Raktkosh Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'about' ? null : 'about')}
                className={`px-3.5 py-2 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  activeDropdown === 'about' || activeTab === 'about'
                    ? 'bg-black/20 text-white font-bold border-b-2 border-white'
                    : 'text-white/90 hover:bg-black/10 hover:text-white'
                }`}
              >
                <span>About e-Raktkosh</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {activeDropdown === 'about' && (
                <div className="absolute left-0 mt-1 w-64 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                  <button
                    type="button"
                    onClick={() => handleNavClick('about')}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-[#800020] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <FileText className="w-4 h-4 text-[#800020]" />
                    <span>About LifeLink & e-RaktKosh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('wastage-analytics')}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-[#800020] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Wastage Analytics & Reports</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenMetrics();
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-[#800020] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span>AI Model Validation Metrics</span>
                  </button>
                </div>
              )}
            </div>

            {/* Looking for Blood Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'looking' ? null : 'looking')}
                className={`px-3.5 py-2 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  activeDropdown === 'looking' || ['find-blood', 'patient-request', 'blood-centers', 'nearby', 'emergency-request'].includes(activeTab)
                    ? 'bg-black/20 text-white font-bold border-b-2 border-white'
                    : 'text-white/90 hover:bg-black/10 hover:text-white'
                }`}
              >
                <span>Looking for Blood</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {activeDropdown === 'looking' && (
                <div className="absolute left-0 mt-1 w-72 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                  <button
                    type="button"
                    onClick={() => handleNavClick('find-blood')}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 hover:text-[#800020] flex items-center gap-2.5 cursor-pointer font-bold"
                  >
                    <Search className="w-4 h-4 text-[#800020]" />
                    <div>
                      <div className="font-bold text-slate-900">Blood Availability</div>
                      <div className="text-[10px] text-slate-500 font-normal">Official state & district inventory search</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('patient-request')}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 hover:text-[#800020] flex items-center gap-2.5 cursor-pointer font-bold bg-red-50/50"
                  >
                    <Droplets className="w-4 h-4 text-red-600" />
                    <div>
                      <div className="font-bold text-red-700 flex items-center gap-1">
                        <span>Smart Blood Allocation</span>
                        <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded">FEFO</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">Prioritized by nearest expiration date</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('blood-centers')}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-[#800020] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Blood Center Directory</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('nearby')}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-[#800020] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Nearby Centers (GIS Locator)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('emergency-request')}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-[#800020] flex items-center gap-2 cursor-pointer font-medium text-red-700"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Emergency Requisition (SOS)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Want to Donate Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'donate' ? null : 'donate')}
                className={`px-3.5 py-2 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  activeDropdown === 'donate' || ['donation-camps', 'donors'].includes(activeTab)
                    ? 'bg-black/20 text-white font-bold border-b-2 border-white'
                    : 'text-white/90 hover:bg-black/10 hover:text-white'
                }`}
              >
                <span>Want to Donate</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {activeDropdown === 'donate' && (
                <div className="absolute left-0 mt-1 w-64 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                  <button
                    type="button"
                    onClick={() => handleNavClick('donation-camps')}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-[#800020] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Calendar className="w-4 h-4 text-[#800020]" />
                    <span>Blood Donation Camps</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('donors')}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-[#800020] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Heart className="w-4 h-4 text-red-600" />
                    <span>Donor Directory & Matching</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onRoleChange('DONOR');
                      handleNavClick('admin-dashboard');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-[#800020] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <UserIcon className="w-4 h-4 text-emerald-600" />
                    <span>Donor Profile Portal</span>
                  </button>
                </div>
              )}
            </div>

            {/* Blood Centre Login Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'login' ? null : 'login')}
                className={`px-3.5 py-2 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  activeDropdown === 'login' || ['hospital-network', 'hospital-communications', 'inventory', 'expiry-risk', 'admin-dashboard'].includes(activeTab)
                    ? 'bg-black/20 text-white font-bold border-b-2 border-white'
                    : 'text-white/90 hover:bg-black/10 hover:text-white'
                }`}
              >
                <span>Blood Centre Login</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {activeDropdown === 'login' && (
                <div className="absolute left-0 mt-1 w-72 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Departmental Portals
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onRoleChange('BLOOD_BANK');
                      handleNavClick('inventory');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-[#800020] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Building2 className="w-4 h-4 text-red-600" />
                    <span>Blood Bank Officer Login</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onRoleChange('HOSPITAL');
                      handleNavClick('hospital-network');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-[#800020] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Hospital className="w-4 h-4 text-blue-600" />
                    <span>Hospital Transfusion Desk (H2H)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onRoleChange('ADMIN');
                      handleNavClick('admin-dashboard');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-[#800020] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Shield className="w-4 h-4 text-slate-900" />
                    <span>State Command Administrator</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onRoleChange('PATIENT');
                      handleNavClick('patient-request');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-[#800020] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <UserIcon className="w-4 h-4 text-cyan-700" />
                    <span>Citizen / Patient Portal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onRoleChange('HOSPITAL');
                      handleNavClick('hospital-exchange');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-[#800020] flex items-center gap-2 cursor-pointer font-bold text-blue-800 bg-blue-50/50"
                  >
                    <Hospital className="w-4 h-4 text-blue-700" />
                    <div>
                      <div className="font-black text-blue-950">Hospital Blood Exchange</div>
                      <div className="text-[10px] text-slate-500 font-normal">FEFO Peer Wastage-Reduction Network</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* HOSPITAL BLOOD EXCHANGE (FEFO Peer Network) */}
            {/* // TODO: Re-enable hospital authentication and role-based access before production. */}
            <button
              type="button"
              onClick={() => {
                handleNavClick('hospital-exchange');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'hospital-exchange'
                  ? 'bg-white text-[#800020] font-black border-white shadow-sm'
                  : 'bg-black/20 hover:bg-black/30 text-white font-bold border-white/20'
              }`}
            >
              <Hospital className="w-3.5 h-3.5 text-blue-200" />
              <span>HOSPITAL BLOOD EXCHANGE</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-400 text-slate-900 font-extrabold">
                FEFO
              </span>
            </button>

            {/* AI Insights Direct Link */}
            <button
              type="button"
              onClick={() => handleNavClick('ai-insights')}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ai-insights'
                  ? 'bg-black/20 text-white font-bold border-b-2 border-white'
                  : 'text-white/90 hover:bg-black/10 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>AI Insights</span>
            </button>

          </nav>

          {/* Right Action Buttons on Maroon Bar */}
          <div className="flex items-center gap-2.5">
            
            {/* Quick Find Blood Shortcut */}
            <button
              type="button"
              onClick={() => handleNavClick('find-blood')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer border border-white/20"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Find Blood</span>
            </button>

            {/* Emergency SOS Button */}
            <button
              type="button"
              onClick={onOpenSOSModal}
              id="emergency-sos-btn"
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer border border-red-400"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-white animate-bounce" />
              <span>Emergency SOS</span>
            </button>

            {/* Active User / Role Badge */}
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/20 text-white text-[11px] font-medium border border-white/10">
              {roleConfig[currentRole].icon}
              <span>{roleConfig[currentRole].label}</span>
            </div>

          </div>

        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-slate-200 px-4 pt-4 pb-6 space-y-4 shadow-xl max-h-[80vh] overflow-y-auto">
          
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Main Navigation</div>
            
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-800 hover:bg-red-50 hover:text-[#800020] cursor-pointer"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('find-blood')}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-[#800020] bg-red-50 flex items-center justify-between cursor-pointer"
            >
              <span>Blood Availability (Find Blood)</span>
              <Search className="w-3.5 h-3.5 text-[#800020]" />
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('patient-request')}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-700 bg-red-50/70 flex items-center justify-between cursor-pointer"
            >
              <span>Smart Blood Allocation (FEFO Priority)</span>
              <Droplets className="w-3.5 h-3.5 text-red-600" />
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('blood-centers')}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Blood Center Directory
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('donation-camps')}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Blood Donation Camps
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('donors')}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Donor Matching & Registry
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Clinical & Hospital Portals</div>
            
            <button
              type="button"
              onClick={() => {
                onRoleChange('HOSPITAL');
                handleNavClick('hospital-exchange');
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Hospital className="w-3.5 h-3.5 text-blue-700" />
                <span>Hospital Blood Exchange (H2H)</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 bg-blue-600 text-white rounded font-mono font-bold">FEFO</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('hospital-network')}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Hospital Network (H2H)
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('inventory')}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              LifeLink Blood Inventory (FEFO)
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('admin-dashboard')}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Admin Command Center
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('ai-insights')}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              AI Insights & Shortage Forecasting
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onOpenSOSModal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer uppercase tracking-wider"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>EMERGENCY SOS: NEED BLOOD NOW</span>
            </button>
          </div>

        </div>
      )}

    </header>
  );
};
