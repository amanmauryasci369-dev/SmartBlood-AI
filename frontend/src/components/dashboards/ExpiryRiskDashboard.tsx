import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  PackageX, 
  Filter, 
  RefreshCw, 
  Calendar, 
  BookOpen,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { ApiService } from '../../services/api';
import { FEFOItem, ExpiryRiskSummary, ComponentShelfLifeRule } from '../../types';

export const ExpiryRiskDashboard: React.FC = () => {
  const [data, setData] = useState<ExpiryRiskSummary | null>(null);
  const [rules, setRules] = useState<ComponentShelfLifeRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>('ALL');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summary, shelfRules] = await Promise.all([
        ApiService.getExpiryRiskSummary(),
        ApiService.getShelfLifeRules()
      ]);
      setData(summary);
      setRules(shelfRules);
    } catch (err: any) {
      setError(err.message || 'Failed to load expiry risk analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3 bg-white p-8 rounded-2xl border border-slate-200">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-slate-600 font-medium text-xs">Computing FEFO priority queues and expiry decay trajectories...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-red-600 mx-auto" />
        <p className="text-red-800 font-semibold text-xs">{error || 'Data could not be retrieved'}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Filter items
  const filteredItems = data.items.filter(item => {
    const matchBank = selectedBank === 'ALL' || item.blood_bank === selectedBank;
    const matchGroup = selectedGroup === 'ALL' || item.blood_group === selectedGroup;
    const matchRisk = selectedRisk === 'ALL' || item.status === selectedRisk;
    return matchBank && matchGroup && matchRisk;
  });

  // Prepare chart data for blood group risk
  const groupChartData = Object.entries(data.by_blood_group).map(([group, counts]) => ({
    group,
    SAFE: counts.SAFE,
    APPROACHING: counts.APPROACHING,
    HIGH: counts.HIGH,
    EXPIRED: counts.EXPIRED
  }));

  // Prepare chart data for component risk
  const componentChartData = Object.entries(data.by_component).map(([comp, counts]) => ({
    name: comp.replace(/_/g, ' '),
    SAFE: counts.SAFE,
    APPROACHING: counts.APPROACHING,
    HIGH: counts.HIGH,
    EXPIRED: counts.EXPIRED
  }));

  // Prepare chart data for days distribution
  const daysDistributionData = Object.entries(data.days_distribution).map(([window, units]) => ({
    window,
    units
  }));

  const bloodBanks = Array.from(new Set(data.items.map(i => i.blood_bank)));

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">
              Clinical Decision Support
            </span>
            <span className="px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold">
              FEFO Prioritization Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
            Blood Shelf-Life & Expiry-Risk Management
          </h2>
          <p className="text-slate-500 text-xs mt-0.5 max-w-2xl">
            First-Expire-First-Out (FEFO) triage queue preventing component spoilage across network blood banks.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowRulesModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
            <span>Standards ({rules.length})</span>
          </button>
          <button
            onClick={fetchData}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Tiers</span>
          </button>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="health-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Active Stock</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">{data.summary.total_inventory}</span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">units</span>
          </div>
          <div className="mt-1 text-xs text-blue-700 font-semibold flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>FEFO triage queue active</span>
          </div>
        </div>

        <div className="health-card-urgent p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Expiring Soon (4–7d)</span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black text-amber-800 font-mono tracking-tight">{data.summary.expiring_soon_units}</span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">units</span>
          </div>
          <p className="mt-1 text-xs text-amber-900 font-medium">Target for planned elective procedures</p>
        </div>

        <div className="health-card-critical p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider">High Risk (0–3d)</span>
            <div className="p-2 bg-red-100 text-red-800 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black text-red-700 font-mono tracking-tight">{data.summary.high_risk_units}</span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">units</span>
          </div>
          <p className="mt-1 text-xs text-red-800 font-bold">Immediate FEFO issuance / redistribution</p>
        </div>

        <div className="health-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expired / Outdated</span>
            <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
              <PackageX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black text-slate-700 font-mono tracking-tight">{data.summary.expired_units}</span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">units</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Quarantined for authorized biohazard disposal</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Expiry Risk by Blood Group */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-900">1. Expiry Risk by Blood Group</h3>
            <p className="text-xs text-slate-500">Inventory status across ABO/Rh phenotypes</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="group" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px' }} 
                  itemStyle={{ color: '#0f172a' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="HIGH" name="High Risk (0-3d)" stackId="a" fill="#ef4444" />
                <Bar dataKey="APPROACHING" name="Warning (4-7d)" stackId="a" fill="#f59e0b" />
                <Bar dataKey="SAFE" name="Optimal (>7d)" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Expiry Risk by Component */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-900">2. Expiry Risk by Component</h3>
            <p className="text-xs text-slate-500">Comparing PRBC, Platelets, FFP, Cryo shelf-life pressure</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={componentChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px' }} 
                  itemStyle={{ color: '#0f172a' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="HIGH" name="High Risk (0-3d)" stackId="a" fill="#ef4444" />
                <Bar dataKey="APPROACHING" name="Warning (4-7d)" stackId="a" fill="#f59e0b" />
                <Bar dataKey="SAFE" name="Optimal (>7d)" stackId="a" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Days Remaining Distribution Curve */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-900">3. Units by Days Remaining Curve</h3>
            <p className="text-xs text-slate-500">Decay horizon distribution across the regional stockpile</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daysDistributionData}>
                <defs>
                  <linearGradient id="decayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="window" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px' }} 
                />
                <Area type="monotone" dataKey="units" stroke="#dc2626" fillOpacity={1} fill="url(#decayGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Info Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900">Regulatory FEFO Compliance Note</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In compliance with National Blood Transfusion Council (NBTC) guidelines, whole blood and red cell concentrates are restricted to a maximum 42-day lifespan when stored in CPDA-1/SAGM at 2–6°C. Platelets stored at 20–24°C with continuous agitation expire within 5 days.
          </p>
          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 font-medium">
            SmartBlood AI automatically flags any batch under 72 hours remaining as HIGH RISK, notifying nearby trauma centers for urgent utilization.
          </div>
        </div>
      </div>

      {/* Regulatory Standards Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Regulatory Shelf-Life Rules (NBTC / WHO)</h3>
              <button onClick={() => setShowRulesModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">&times;</button>
            </div>
            <div className="space-y-3 text-xs text-slate-700 max-h-80 overflow-y-auto">
              {rules.map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{r.component.replace(/_/g, ' ')}</span>
                    <span className="text-red-600">{r.shelf_life_value} {r.shelf_life_unit}</span>
                  </div>
                  <p className="text-slate-500">Method: {r.storage_method}</p>
                  <p className="text-slate-400 font-mono text-[10px]">Reference: {r.regulatory_reference}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
