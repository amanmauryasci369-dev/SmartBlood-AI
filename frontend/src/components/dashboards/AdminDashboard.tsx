import React, { useState } from 'react';
import { StockSummary, RebalanceProposal, BloodBank, Hospital } from '../../types';
import { ApiService } from '../../services/api';
import { 
  Building2, 
  Users, 
  Droplets, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  RotateCw, 
  TrendingUp,
  PieChart,
  BarChart3
} from 'lucide-react';

interface AdminDashboardProps {
  stockSummary: StockSummary | null;
  rebalanceProposals: RebalanceProposal[];
  bloodBanks: BloodBank[];
  hospitals: Hospital[];
  onRefreshData: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stockSummary,
  rebalanceProposals,
  bloodBanks,
  hospitals,
  onRefreshData,
  onNavigateToTab,
}) => {
  const [syncing, setSyncing] = useState<boolean>(false);

  // 6 Top KPI Metrics matching Screen 9 in Reference Image
  const kpis = [
    { label: 'Blood Centres', value: '1,254', icon: Building2, color: 'text-red-700', bg: 'bg-red-50 text-red-600' },
    { label: 'Registered Donors', value: '18.6 L+', icon: Users, color: 'text-emerald-700', bg: 'bg-emerald-50 text-emerald-600' },
    { label: 'Blood Units Available', value: '3.4 L+', icon: Droplets, color: 'text-blue-700', bg: 'bg-blue-50 text-blue-600' },
    { label: 'Requests Fulfilled', value: '2,341', icon: CheckCircle2, color: 'text-amber-700', bg: 'bg-amber-50 text-amber-600' },
    { label: 'Emergency Requests', value: '156', icon: AlertTriangle, color: 'text-rose-700', bg: 'bg-rose-50 text-rose-600' },
    { label: 'System Uptime', value: '99.8%', icon: Activity, color: 'text-purple-700', bg: 'bg-purple-50 text-purple-600' },
  ];

  // Blood group breakdown data
  const bloodGroupShares = [
    { group: 'O+', pct: 36, color: '#dc2626' },
    { group: 'A+', pct: 24, color: '#ea580c' },
    { group: 'B+', pct: 18, color: '#3b82f6' },
    { group: 'AB+', pct: 10, color: '#10b981' },
    { group: 'O-', pct: 5, color: '#8b5cf6' },
    { group: 'A-', pct: 4, color: '#ec4899' },
    { group: 'B-', pct: 2, color: '#f59e0b' },
    { group: 'AB-', pct: 1, color: '#64748b' },
  ];

  // State-wise availability bars
  const stateAvailability = [
    { city: 'Delhi', units: 480 },
    { city: 'Noida', units: 280 },
    { city: 'Gurugram', units: 310 },
    { city: 'Faridabad', units: 190 },
    { city: 'Ghaziabad', units: 220 },
  ];

  const handleSync = async () => {
    setSyncing(true);
    try {
      await ApiService.syncERaktKosh('Central Delhi', 'Delhi');
      onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header (Screen 9 in Reference Image) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              National Dashboard
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Real-time overview of blood resources across accredited national network
            </p>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 self-start md:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 text-red-400 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'Sync Registry Feeds'}</span>
        </button>
      </div>

      {/* 2. Top 6 KPI Stat Cards (Screen 9 in Reference Image) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, idx) => {
          const IconComp = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 truncate block">
                  {kpi.label}
                </span>
                <span className={`p-1.5 rounded-lg ${kpi.bg}`}>
                  <IconComp className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className={`text-xl sm:text-2xl font-black ${kpi.color}`}>
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Three Analytics Cards Row (Screen 9 in Reference Image) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Card 1: Blood Group Distribution (Pie/Breakdown) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">
              Blood Group Distribution
            </h3>
            <PieChart className="w-4 h-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-2 gap-4 items-center py-2">
            {/* SVG Pie Chart */}
            <div className="flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-28 h-28 transform -rotate-90">
                {/* SVG circular donut slices */}
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#f1f5f9" strokeWidth="20" />
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#dc2626" strokeWidth="20" strokeDasharray="79 141" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#ea580c" strokeWidth="20" strokeDasharray="53 167" strokeDashoffset="-79" />
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#3b82f6" strokeWidth="20" strokeDasharray="40 180" strokeDashoffset="-132" />
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#10b981" strokeWidth="20" strokeDasharray="22 198" strokeDashoffset="-172" />
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#8b5cf6" strokeWidth="20" strokeDasharray="11 209" strokeDashoffset="-194" />
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#ec4899" strokeWidth="20" strokeDasharray="9 211" strokeDashoffset="-205" />
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#f59e0b" strokeWidth="20" strokeDasharray="4 216" strokeDashoffset="-214" />
                <circle cx="50" cy="50" r="35" fill="transparent" stroke="#64748b" strokeWidth="20" strokeDasharray="2 218" strokeDashoffset="-218" />
              </svg>
            </div>

            {/* Percentage legend list */}
            <div className="space-y-1 text-xs">
              {bloodGroupShares.map((item) => (
                <div key={item.group} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 font-bold font-mono">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                    {item.group}
                  </span>
                  <span className="font-mono text-slate-600 font-semibold">{item.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 text-center">
            Universal donors (O-) constitute 5% of national reserves.
          </div>
        </div>

        {/* Card 2: State-wise Availability (Bar Chart) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">
              State-wise Availability
            </h3>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 py-2">
            {stateAvailability.map((st) => (
              <div key={st.city} className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-800">{st.city}</span>
                  <span className="font-mono text-slate-500">{st.units} units</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-red-600 h-full rounded-full transition-all"
                    style={{ width: `${(st.units / 500) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 text-center">
            Regional hubs balance stock via inter-city express corridors.
          </div>
        </div>

        {/* Card 3: Monthly Trends (Line Chart) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">
              Monthly Trends
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Donations
              </span>
              <span className="flex items-center gap-1 text-red-700">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Requests
              </span>
            </div>
          </div>

          {/* SVG Line Graph */}
          <div className="py-2">
            <svg viewBox="0 0 300 130" className="w-full h-32">
              <defs>
                <linearGradient id="donGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="20" y1="20" x2="280" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="60" x2="280" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="100" x2="280" y2="100" stroke="#f1f5f9" strokeWidth="1" />

              {/* Donations Line (Emerald) */}
              <path
                d="M 30 70 Q 70 50 110 55 T 190 40 T 270 30"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />

              {/* Requests Line (Red) */}
              <path
                d="M 30 85 Q 70 80 110 75 T 190 60 T 270 50"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2.5"
              />

              {/* Data points */}
              <circle cx="270" cy="30" r="3.5" fill="#10b981" />
              <circle cx="270" cy="50" r="3.5" fill="#dc2626" />

              {/* Month Labels */}
              <text x="30" y="120" fontSize="9" fill="#94a3b8" textAnchor="middle">Jan</text>
              <text x="70" y="120" fontSize="9" fill="#94a3b8" textAnchor="middle">Feb</text>
              <text x="110" y="120" fontSize="9" fill="#94a3b8" textAnchor="middle">Mar</text>
              <text x="150" y="120" fontSize="9" fill="#94a3b8" textAnchor="middle">Apr</text>
              <text x="190" y="120" fontSize="9" fill="#94a3b8" textAnchor="middle">May</text>
              <text x="230" y="120" fontSize="9" fill="#94a3b8" textAnchor="middle">Jun</text>
              <text x="270" y="120" fontSize="9" fill="#94a3b8" textAnchor="middle">Jul</text>
            </svg>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 text-center">
            Donation mobilization currently outpacing non-urgent requests by 14%.
          </div>
        </div>

      </div>

    </div>
  );
};
