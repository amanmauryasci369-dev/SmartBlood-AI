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
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3 bg-white p-8 rounded-2xl border border-slate-200">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-slate-600 font-medium text-xs">Synthesizing hemovigilance wastage metrics and proactive reduction models...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
        <p className="text-red-800 font-semibold text-xs">{error || 'Data could not be retrieved'}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
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
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-xs font-bold uppercase tracking-wider">
              Hemovigilance & Wastage Audit
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
              Utilization Rate: {data.kpis.utilization_rate_pct}%
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
            Blood Wastage Analytics & Spoilage Reduction
          </h2>
          <p className="text-slate-500 text-xs mt-0.5 max-w-2xl">
            Quantitative tracking of collection velocity, transfusion issuance, and discard etiology with proactive rebalance advisories.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* 8 Metric KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
        <div className="health-card p-3.5 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Collected</span>
          <div className="text-lg font-black text-slate-900 font-mono mt-1">{data.kpis.total_collected}</div>
          <span className="text-[10px] text-slate-400">units</span>
        </div>

        <div className="health-card p-3.5 text-center">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Issued</span>
          <div className="text-lg font-black text-blue-700 font-mono mt-1">{data.kpis.total_issued}</div>
          <span className="text-[10px] text-slate-400">transfused</span>
        </div>

        <div className="health-card p-3.5 text-center bg-rose-50/50 border-rose-200">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Discarded</span>
          <div className="text-lg font-black text-rose-700 font-mono mt-1">{data.kpis.total_discarded}</div>
          <span className="text-[10px] text-slate-400">all causes</span>
        </div>

        <div className="health-card p-3.5 text-center bg-amber-50/50 border-amber-200">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Expiry Loss</span>
          <div className="text-lg font-black text-amber-700 font-mono mt-1">{data.kpis.expiry_related_wastage}</div>
          <span className="text-[10px] text-slate-400">outdated</span>
        </div>

        <div className="health-card p-3.5 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Other Discard</span>
          <div className="text-lg font-black text-slate-700 font-mono mt-1">{data.kpis.other_wastage}</div>
          <span className="text-[10px] text-slate-400">TTI/QC/Bags</span>
        </div>

        <div className="health-card p-3.5 text-center bg-emerald-50/50 border-emerald-200">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Utilization</span>
          <div className="text-lg font-black text-emerald-700 font-mono mt-1">{data.kpis.utilization_rate_pct}%</div>
          <span className="text-[10px] text-slate-400">Issued/Coll</span>
        </div>

        <div className="health-card p-3.5 text-center bg-rose-50/50 border-rose-200">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Wastage Rate</span>
          <div className="text-lg font-black text-rose-700 font-mono mt-1">{data.kpis.wastage_rate_pct}%</div>
          <span className="text-[10px] text-slate-400">Discard/Coll</span>
        </div>

        <div className="health-card p-3.5 text-center bg-amber-50/50 border-amber-200">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">At-Risk Stock</span>
          <div className="text-lg font-black text-amber-700 font-mono mt-1">{data.kpis.units_at_expiry_risk}</div>
          <span className="text-[10px] text-slate-400">≤ 7d remaining</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-600 sm:col-span-1">
          <Filter className="w-4 h-4 text-red-600" />
          <span className="font-bold text-slate-900">Filter Analytics:</span>
        </div>

        <div>
          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium cursor-pointer"
          >
            <option value="ALL">All Regions</option>
            <option value="Delhi">Delhi-NCR</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Haryana">Haryana</option>
          </select>
        </div>

        <div>
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium cursor-pointer"
          >
            <option value="ALL">All Blood Groups</option>
            {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedComp}
            onChange={e => setSelectedComp(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium cursor-pointer"
          >
            <option value="ALL">All Components</option>
            <option value="PRBC">Packed Red Blood Cells (PRBC)</option>
            <option value="PLATELETS">Platelet Concentrates</option>
            <option value="FFP">Fresh Frozen Plasma (FFP)</option>
            <option value="CRYOPRECIPITATE">Cryoprecipitate</option>
          </select>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Collection vs Issue vs Wastage */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-900">Monthly Collection, Issue & Wastage</h3>
            <p className="text-xs text-slate-500">Longitudinal flow of units across facilities</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_trend}>
                <defs>
                  <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="issGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="wasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="collected" name="Collected" stroke="#2563eb" fill="url(#colGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="issued" name="Issued" stroke="#10b981" fill="url(#issGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="discarded" name="Discarded" stroke="#dc2626" fill="url(#wasGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Discard Reasons Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-900">Discard Etiology Breakdown</h3>
            <p className="text-xs text-slate-500">Categorized by Expiry, TTI Reactive, Bag Damage, QC</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reasonData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {reasonData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wastage by Component */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-900">Wastage by Blood Component</h3>
            <p className="text-xs text-slate-500">Platelets vs PRBC vs FFP outdating volume</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={componentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px' }} 
                />
                <Bar dataKey="count" name="Discarded Units" fill="#dc2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood Bank Comparison */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-900">Facility Spoilage Comparison</h3>
            <p className="text-xs text-slate-500">Total discard volume per licensed blood centre</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bankData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', fontSize: '12px' }} 
                />
                <Bar dataKey="count" name="Discarded Units" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Proactive Wastage Reduction Recommendations Engine */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-black text-slate-900">Proactive Wastage Reduction Engine</h3>
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-full text-xs font-mono font-bold">
                Baseline Risk Model v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
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
                    ? 'bg-red-50/60 border-red-200' 
                    : isHigh 
                    ? 'bg-amber-50/60 border-amber-200' 
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-white text-slate-900 border border-slate-200 text-xs font-black rounded-md">
                      {rec.blood_group} {rec.component.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">({rec.available_units} units)</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isUrgent ? 'bg-red-100 text-red-800 border border-red-200' :
                    isHigh ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {rec.urgency.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-900 mt-3 leading-relaxed">
                  {rec.recommendation}
                </p>

                <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Days to Expiry:</span>
                    <span className="font-bold text-slate-800">{rec.days_to_expiry} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Model Risk Score:</span>
                    <span className="font-mono text-red-600 font-bold">{rec.risk_prediction.risk_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recommended Action:</span>
                    <span className="font-bold text-amber-700">{rec.action_type.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 mt-2 italic">
                  * {rec.safety_disclaimer}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Research & Reference Literature Section */}
      {data.research_reference_data && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-black text-slate-900">REFERENCE DATA (Published Literature Benchmarks)</h3>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
            <span className="font-bold uppercase tracking-wider">Compliance Demarcation:</span> {data.research_reference_data.disclaimer}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.research_reference_data.citations.map((c, i) => (
              <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Metric</span>
                <p className="font-bold text-slate-900 mt-0.5">{c.metric}</p>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-base font-black text-red-600 font-mono">{c.value}</span>
                  <span className="text-[11px] text-slate-500 font-mono">Year {c.year}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 border-t border-slate-200 pt-1.5">
                  <span className="font-semibold text-slate-700">Source:</span> {c.source}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
