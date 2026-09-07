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
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-slate-400 font-medium">Computing FEFO priority queues and expiry decay trajectories...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-950/30 border border-red-800/40 rounded-xl text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-2" />
        <p className="text-red-300 font-medium">{error || 'Data could not be retrieved'}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-800/40 hover:bg-red-700/50 text-white rounded-lg text-sm transition"
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

  // Distinct blood banks for filter
  const bloodBanks = Array.from(new Set(data.items.map(i => i.blood_bank)));

  return (
    <div className="space-y-6">
      {/* Header with Title and Regulatory Standards Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold tracking-wide uppercase">
              Clinical Decision Support
            </span>
            <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-semibold tracking-wide">
              FEFO Prioritization Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">
            Blood Shelf-Life & Expiry-Risk Management
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            First-Expire-First-Out (FEFO) triage queue preventing component spoilage across network blood banks.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowRulesModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium transition shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Regulatory Standards ({rules.length})</span>
          </button>
          <button
            onClick={fetchData}
            className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-cyan-900/30"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Tiers</span>
          </button>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Active Stock</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-white tracking-tight">{data.summary.total_inventory}</span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">units</span>
          </div>
          <div className="mt-2 text-xs text-blue-400 flex items-center font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>FEFO triage queue active</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Expiring Soon (4–7d)</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-amber-400 tracking-tight">{data.summary.expiring_soon_units}</span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">units</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Target for planned elective procedures</p>
        </div>

        <div className="bg-slate-900/70 border border-red-900/40 p-5 rounded-2xl relative overflow-hidden backdrop-blur-sm bg-gradient-to-br from-slate-900/70 to-red-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">High Risk (0–3d)</span>
            <div className="p-2 bg-red-500/10 text-red-400 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-red-400 tracking-tight">{data.summary.high_risk_units}</span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">units</span>
          </div>
          <p className="mt-2 text-xs text-red-400 font-medium">Immediate FEFO issuance / redistribution</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expired / Outdated</span>
            <div className="p-2 bg-slate-800 text-slate-400 rounded-xl">
              <PackageX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-300 tracking-tight">{data.summary.expired_units}</span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">units</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Quarantined for authorized biohazard disposal</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Expiry Risk by Blood Group */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">1. Expiry Risk by Blood Group</h3>
              <p className="text-xs text-slate-400">Inventory status across ABO/Rh phenotypes</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="group" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} 
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="HIGH" name="High Risk (0-3d)" stackId="a" fill="#ef4444" />
                <Bar dataKey="APPROACHING" name="Warning (4-7d)" stackId="a" fill="#f59e0b" />
                <Bar dataKey="SAFE" name="Optimal (>7d)" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Expiry Risk by Component */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">2. Expiry Risk by Component</h3>
              <p className="text-xs text-slate-400">Comparing PRBC, Platelets, FFP, Cryo shelf-life pressure</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={componentChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} 
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="HIGH" name="High Risk (0-3d)" stackId="a" fill="#ef4444" />
                <Bar dataKey="APPROACHING" name="Warning (4-7d)" stackId="a" fill="#f59e0b" />
                <Bar dataKey="SAFE" name="Optimal (>7d)" stackId="a" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Days Remaining Distribution Curve */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">3. Units by Days Remaining Curve</h3>
              <p className="text-xs text-slate-400">Decay horizon distribution across the regional stockpile</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daysDistributionData}>
                <defs>
                  <linearGradient id="decayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="window" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} 
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="units" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#decayGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Blood Bank Comparison */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">4. Expiry Risk by Regional Blood Bank</h3>
              <p className="text-xs text-slate-400">Comparative facility stockpile audit</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(data.by_blood_bank).map(([b, counts]) => ({
                bank: b.split(' ')[0] + ' ' + (b.split(' ')[1] || ''),
                HIGH: counts.HIGH,
                APPROACHING: counts.APPROACHING,
                SAFE: counts.SAFE
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="bank" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} 
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="HIGH" name="High Risk" stackId="b" fill="#ef4444" />
                <Bar dataKey="APPROACHING" name="Warning" stackId="b" fill="#f59e0b" />
                <Bar dataKey="SAFE" name="Optimal" stackId="b" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter Bar & FEFO Priority Queue Table (Step 3 & Step 5) */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">First-Expire-First-Out (FEFO) Priority Table</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Prioritizes compatible blood units by earliest expiry dates (A → B → C) with actionable clinical advisories.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Facility:</span>
              <select
                value={selectedBank}
                onChange={e => setSelectedBank(e.target.value)}
                className="bg-transparent text-white focus:outline-none"
              >
                <option value="ALL" className="bg-slate-900">All Centers</option>
                {bloodBanks.map(b => (
                  <option key={b} value={b} className="bg-slate-900">{b}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-400">Group:</span>
              <select
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
                className="bg-transparent text-white focus:outline-none"
              >
                <option value="ALL" className="bg-slate-900">All Groups</option>
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(g => (
                  <option key={g} value={g} className="bg-slate-900">{g}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-400">Risk Tier:</span>
              <select
                value={selectedRisk}
                onChange={e => setSelectedRisk(e.target.value)}
                className="bg-transparent text-white focus:outline-none"
              >
                <option value="ALL" className="bg-slate-900">All Tiers</option>
                <option value="HIGH_EXPIRY_RISK" className="bg-slate-900 text-red-400">High Risk (0-3d)</option>
                <option value="APPROACHING_EXPIRY" className="bg-slate-900 text-amber-400">Approaching (4-7d)</option>
                <option value="SAFE" className="bg-slate-900 text-emerald-400">Safe (&gt;7d)</option>
                <option value="EXPIRED" className="bg-slate-900 text-slate-400">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/60 text-slate-300 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Blood Bank</th>
                <th className="px-4 py-3.5">Group</th>
                <th className="px-4 py-3.5">Component</th>
                <th className="px-4 py-3.5">Available</th>
                <th className="px-4 py-3.5">Expiry Date</th>
                <th className="px-4 py-3.5">Days Left</th>
                <th className="px-4 py-3.5">Risk Tier</th>
                <th className="px-5 py-3.5">FEFO Reason / Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((item, idx) => {
                const isHigh = item.status === 'HIGH_EXPIRY_RISK';
                const isWarning = item.status === 'APPROACHING_EXPIRY';
                const isExpired = item.status === 'EXPIRED';

                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isHigh ? 'bg-red-950/10' : isWarning ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="px-5 py-4 font-bold text-slate-200 flex items-center space-x-1.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        isHigh ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        isWarning ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-white">{item.blood_bank}</td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 bg-slate-800 text-cyan-400 font-semibold rounded-md text-xs border border-slate-700">
                        {item.blood_group}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-300 font-medium">
                      {item.component.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-4 font-semibold text-white">
                      {item.available_units} <span className="text-xs text-slate-500 font-normal">units</span>
                    </td>
                    <td className="px-4 py-4 text-slate-300 text-xs font-mono">
                      {item.expiry_date}
                    </td>
                    <td className="px-4 py-4 font-bold">
                      <span className={isExpired ? 'text-slate-500' : isHigh ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}>
                        {item.days_to_expiry}d
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {isHigh && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                          High Risk
                        </span>
                      )}
                      {isWarning && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Approaching
                        </span>
                      )}
                      {!isHigh && !isWarning && !isExpired && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Safe
                        </span>
                      )}
                      {isExpired && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-400">
                          Expired
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-300 max-w-xs">
                      <p className="font-medium text-white">{item.reason}</p>
                      <p className="text-cyan-400 mt-0.5 font-semibold text-[11px] uppercase tracking-wide">
                        Advisory: {item.recommended_action.replace(/_/g, ' ')}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regulatory Standards Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Configurable Shelf-Life Standards</h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-400">
              DGHS / CDSCO approved standard shelf-life and storage conditions. Shelf-life values are dynamically configurable by authorized administrators.
            </p>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {rules.map(r => (
                <div key={r.id} className="p-3.5 bg-slate-800/70 border border-slate-700/60 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-cyan-300">{r.component.replace(/_/g, ' ')}</span>
                    <span className="px-2.5 py-0.5 bg-cyan-900/40 text-cyan-300 rounded-full text-xs font-semibold">
                      {r.shelf_life_value} {r.shelf_life_unit}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    <span className="text-slate-400 font-semibold">Storage:</span> {r.storage_method}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    <span className="text-slate-500 font-semibold">Reference:</span> {r.regulatory_reference}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
