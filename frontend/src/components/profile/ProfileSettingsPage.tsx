import React, { useState } from 'react';
import { 
  User as UserIcon, 
  History, 
  Bookmark, 
  Bell, 
  ShieldCheck, 
  HelpCircle, 
  Calendar, 
  Edit3, 
  LogOut, 
  Mail, 
  PhoneCall, 
  MapPin, 
  Droplets,
  CheckCircle2
} from 'lucide-react';
import { UserRole } from '../../types';

interface ProfileSettingsPageProps {
  currentRole: UserRole;
  onNavigateToTab?: (tab: any) => void;
  onOpenSOSModal?: () => void;
}

export const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({
  currentRole,
  onNavigateToTab,
  onOpenSOSModal
}) => {
  const [activeSidebarTab, setActiveSidebarTab] = useState<'profile' | 'history' | 'searches' | 'notifications' | 'privacy' | 'help'>('profile');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const sidebarItems = [
    { id: 'profile', label: 'My Profile', icon: UserIcon },
    { id: 'history', label: 'Donation History', icon: History },
    { id: 'searches', label: 'Saved Searches', icon: Bookmark },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Profile &amp; Settings
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage your donor account, preferences, and verified health credentials
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active &amp; Verified</span>
        </span>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Main 3-Column Screen 11 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Navigation Sidebar */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1">
          {sidebarItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeSidebarTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSidebarTab(item.id as any)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#9B001B] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Center Column: User Profile Details (Exact Screen 11 reference) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-slate-900">User Profile</h2>
            <span className="text-[11px] text-slate-400 font-mono">UID: LL-DL-2026-9901</span>
          </div>

          {/* Avatar & Name Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-black text-xl border-2 border-white shadow-sm overflow-hidden">
              <UserIcon className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">Akshay Joshiya</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Voluntary Blood Donor</p>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                Email
              </span>
              <span className="font-semibold text-slate-900 block">akshay@example.com</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-slate-400" />
                Phone
              </span>
              <span className="font-mono font-bold text-slate-900 block">+91 98765 43210</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                Location
              </span>
              <span className="font-semibold text-slate-900 block">New Delhi, Delhi</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Droplets className="w-3 h-3 text-red-600" />
                Blood Group
              </span>
              <span className="font-mono font-black text-red-700 text-sm block">O+</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 pt-2 flex items-center justify-between border-t border-slate-100">
            <span>Member Since: <strong>Jan 2025</strong></span>
            <span className="text-emerald-700 font-semibold">Eligible to Donate</span>
          </div>
        </div>

        {/* Right Column: Quick Actions (Exact Screen 11 reference) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-sm text-slate-900">Quick Actions</h3>
          </div>

          <div className="space-y-2 text-xs font-bold">
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('donation-camps')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#9B001B] hover:bg-[#800016] text-white transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Donation</span>
            </button>

            <button
              onClick={() => onNavigateToTab && onNavigateToTab('wastage-analytics')}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all cursor-pointer flex items-center gap-2"
            >
              <History className="w-4 h-4 text-slate-600" />
              <span>View History</span>
            </button>

            <button
              onClick={() => {
                setSavedNotice('Profile update modal opened.');
                setTimeout(() => setSavedNotice(null), 3000);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all cursor-pointer flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4 text-slate-600" />
              <span>Update Profile</span>
            </button>

            <button
              onClick={() => {
                setSavedNotice('Session logged out successfully.');
                setTimeout(() => setSavedNotice(null), 3000);
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-red-600 hover:bg-red-50 transition-all cursor-pointer flex items-center gap-2 pt-2 mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
