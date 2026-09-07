import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  TrendingDown, 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart2, 
  Filter, 
  RefreshCw, 
  AlertCircle, 
  Sparkles, 
  ExternalLink,
  Layers,
  FileText,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { ApiService } from '../../services/api';
import { WastageAnalytics, WastageRecommendation } from '../../types';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#64748b'];

export const WastageAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<WastageAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<WastageRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedComp, setSelectedComp] = useState<string>('ALL');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analytics, recs] = await Promise.all([
        ApiService.getWastageAnalytics({
          state: selectedState !== 'ALL' ? selectedState : undefined,
          blood_group: selectedGroup !== 'ALL' ? selectedGroup : undefined,
          component: selectedComp !== 'ALL' ? selectedComp : undefined,
        }),
        ApiService.getWastageRecommendations()
      ]);
      setData(analytics);
      setRecommendations(recs);
    } catch (err: any) {
      setError(err.message || 'Failed to load blood wastage analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedState, selectedGroup, selectedComp]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-slate-400 font-medium">Synthesizing hemovigilance wastage metrics and proactive reduction models...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-950/30 border border-red-800/40 rounded-xl text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
        <p className="text-red-300 font-medium">{error || 'Data could not be retrieved'}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-800/40 hover:bg-red-700/50 text-white rounded-lg text-sm transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // Format reason pie data
  const reasonData = Object.entries(data.by_discard_reason).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value
  }));

  // Format component bar data
  const componentData = Object.entries(data.by_component).map(([name, count]) => ({
    name: name.replace(/_/g, ' '),
    count
  }));

  // Format blood bank comparison data
  const bankData = Object.entries(data.by_blood_bank).map(([bank, count]) => ({
    name: bank.split(' ')[0] + ' ' + (bank.split(' ')[1] || ''),
    count
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-semibold tracking-wide uppercase">
              Hemovigilance & Wastage Audit
            </span>
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold tracking-wide">
              Utilization Rate: {data.kpis.utilization_rate_pct}%
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">
            Blood Wastage Analytics & Spoilage Reduction
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Quantitative tracking of collection velocity, transfusion issuance, and discard etiology with proactive rebalance advisories.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-cyan-900/30 self-start sm:self-center"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* 8 Metric KPI Cards Grid (Step 7) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Collected</span>
          <div className="text-xl font-bold text-white mt-1">{data.kpis.total_collected}</div>
          <span className="text-[10px] text-slate-500">units</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">Issued</span>
          <div className="text-xl font-bold text-blue-400 mt-1">{data.kpis.total_issued}</div>
          <span className="text-[10px] text-slate-500">transfused</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Discarded</span>
          <div className="text-xl font-bold text-rose-400 mt-1">{data.kpis.total_discarded}</div>
          <span className="text-[10px] text-slate-500">all causes</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Expiry Loss</span>
          <div className="text-xl font-bold text-amber-400 mt-1">{data.kpis.expiry_related_wastage}</div>
          <span className="text-[10px] text-slate-500">outdated</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Other Discard</span>
          <div className="text-xl font-bold text-slate-300 mt-1">{data.kpis.other_wastage}</div>
          <span className="text-[10px] text-slate-500">TTI/QC/Bags</span>
        </div>

        <div className="bg-slate-900/70 border border-emerald-900/40 p-4 rounded-xl bg-gradient-to-br from-slate-900/70 to-emerald-950/20">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Utilization</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">{data.kpis.utilization_rate_pct}%</div>
          <span className="text-[10px] text-slate-400">Issued/Coll</span>
        </div>

        <div className="bg-slate-900/70 border border-rose-900/40 p-4 rounded-xl bg-gradient-to-br from-slate-900/70 to-rose-950/20">
          <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Wastage Rate</span>
          <div className="text-xl font-bold text-rose-400 mt-1">{data.kpis.wastage_rate_pct}%</div>
          <span className="text-[10px] text-slate-400">Discard/Coll</span>
        </div>

        <div className="bg-slate-900/70 border border-amber-900/40 p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">At-Risk Stock</span>
          <div className="text-xl font-bold text-amber-400 mt-1">{data.kpis.units_at_expiry_risk}</div>
          <span className="text-[10px] text-slate-500">≤ 7d remaining</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-400">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-300">Filters:</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          <span className="text-slate-400">State:</span>
          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            className="bg-transparent text-white focus:outline-none"
          >
            <option value="ALL" className="bg-slate-900">All Regions</option>
            <option value="Delhi" className="bg-slate-900">Delhi-NCR</option>
            <option value="Uttar Pradesh" className="bg-slate-900">Uttar Pradesh</option>
            <option value="Haryana" className="bg-slate-900">Haryana</option>
          </select>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
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

        <div className="flex items-center space-x-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          <span className="text-slate-400">Component:</span>
          <select
            value={selectedComp}
            onChange={e => setSelectedComp(e.target.value)}
            className="bg-transparent text-white focus:outline-none"
          >
            <option value="ALL" className="bg-slate-900">All Components</option>
            <option value="PRBC" className="bg-slate-900">Packed Red Blood Cells (PRBC)</option>
            <option value="PLATELETS" className="bg-slate-900">Platelet Concentrates</option>
            <option value="FFP" className="bg-slate-900">Fresh Frozen Plasma (FFP)</option>
            <option value="CRYOPRECIPITATE" className="bg-slate-900">Cryoprecipitate</option>
          </select>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Collection vs Issue vs Wastage */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Monthly Collection, Issue & Wastage</h3>
              <p className="text-xs text-slate-400">Longitudinal flow of units across facilities</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_trend}>
                <defs>
                  <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="issGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="wasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} 
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Area type="monotone" dataKey="collected" name="Collected" stroke="#06b6d4" fill="url(#colGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="issued" name="Issued" stroke="#10b981" fill="url(#issGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="discarded" name="Discarded" stroke="#ef4444" fill="url(#wasGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Discard Reasons Breakdown */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Discard Etiology Breakdown</h3>
              <p className="text-xs text-slate-400">Categorized by Expiry, TTI Reactive, Bag Damage, QC</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reasonData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {reasonData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} 
                  itemStyle={{ color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wastage by Component */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Wastage by Blood Component</h3>
              <p className="text-xs text-slate-400">Platelets vs PRBC vs FFP outdating volume</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={componentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} 
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="count" name="Discarded Units" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood Bank Comparison */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Facility Spoilage Comparison</h3>
              <p className="text-xs text-slate-400">Total discard volume per licensed blood centre</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bankData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} 
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="count" name="Discarded Units" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Proactive Wastage Reduction Recommendations Engine (Step 8 & 9) */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Proactive Wastage Reduction Engine</h3>
              <span className="px-2.5 py-0.5 bg-slate-800 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-mono">
                Baseline Risk Model v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic mathematical evaluation of stock pressure, days to expiry, and trauma center absorption.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium self-start sm:self-center">
            {recommendations.length} Actionable Advisory Cards
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map(rec => {
            const isUrgent = rec.urgency === 'URGENT_REVIEW';
            const isHigh = rec.urgency === 'HIGH_EXPIRY_RISK';

            return (
              <div 
                key={rec.id}
                className={`p-5 rounded-xl border transition-all ${
                  isUrgent 
                    ? 'bg-red-950/20 border-red-800/40 hover:border-red-700/60' 
                    : isHigh 
                    ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-700/60' 
                    : 'bg-slate-800/40 border-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-slate-800 text-cyan-400 text-xs font-bold rounded-md">
                      {rec.blood_group} {rec.component.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">({rec.available_units} units)</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    isUrgent ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    isHigh ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {rec.urgency.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs font-semibold text-white mt-3 leading-relaxed">
                  {rec.recommendation}
                </p>

                <div className="mt-3 p-3 bg-slate-900/70 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Days to Expiry:</span>
                    <span className="font-bold text-slate-200">{rec.days_to_expiry} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Model Risk Score:</span>
                    <span className="font-mono text-cyan-400">{rec.risk_prediction.risk_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recommended Action:</span>
                    <span className="font-bold text-amber-400">{rec.action_type.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 mt-2.5 italic">
                  * {rec.safety_disclaimer}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Research & Reference Literature Section (Step 21) */}
      {data.research_reference_data && (
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">REFERENCE DATA (Published Literature Benchmarks)</h3>
          </div>
          <div className="p-3.5 bg-amber-950/20 border border-amber-800/30 rounded-xl mb-4 text-xs text-amber-300/90 leading-relaxed">
            <span className="font-bold uppercase tracking-wider">Compliance Demarcation:</span> {data.research_reference_data.disclaimer}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.research_reference_data.citations.map((c, i) => (
              <div key={i} className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Metric</span>
                <p className="text-sm font-bold text-white mt-0.5">{c.metric}</p>
                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="text-lg font-bold text-cyan-400">{c.value}</span>
                  <span className="text-xs text-slate-400 font-mono">Year {c.year}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 border-t border-slate-700/50 pt-1.5">
                  <span className="font-semibold text-slate-300">Source:</span> {c.source}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
