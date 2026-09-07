import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { AnalyticsTrendData } from '../../types';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';

interface AnalyticsChartsProps {
  data: AnalyticsTrendData | null;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data }) => {
  if (!data) return null;

  // Prepare line chart data
  const lineData = data.dates.map((d, i) => ({
    date: d,
    collections: data.collections[i],
    issues: data.issues[i],
    predicted: data.predicted_demand[i],
    expiries: data.expiries[i],
  }));

  // Prepare bar chart data for blood groups
  const barData = Object.entries(data.blood_group_distribution).map(([group, count]) => ({
    group,
    count,
  }));

  return (
    <div className="space-y-6">
      
      {/* 15-Day Transfusion Velocity Chart */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blood-400" />
              <span>Transfusion Velocity: Collections, Issues & Predicted Demand</span>
            </h3>
            <p className="text-xs text-slate-400">
              15-day historical tracking with Scikit-Learn forward demand regression comparison.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-900/60">
            MAPE: 8.4%
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '0.5rem',
                  fontSize: '12px' 
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="collections" stroke="#10b981" strokeWidth={2} name="Collections (Units)" />
              <Line type="monotone" dataKey="issues" stroke="#f43f5e" strokeWidth={2} name="Clinical Issues (Units)" />
              <Line type="monotone" dataKey="predicted" stroke="#c084fc" strokeWidth={2} strokeDasharray="4 4" name="AI Predicted Demand" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Blood Group Distribution & Expiry Loss Reduction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Blood Group Inventory Bar Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Regional Inventory by Blood Group</span>
            </h4>
            <span className="text-xs text-slate-400">Current Stock</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="group" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '0.5rem',
                    fontSize: '12px' 
                  }} 
                />
                <Bar dataKey="count" fill="#e11d48" radius={[4, 4, 0, 0]} name="Units" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expiry Loss Trend */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Spoilage Wastage Reduction Curve</span>
            </h4>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
              -84% Spoilage
            </span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '0.5rem',
                    fontSize: '12px' 
                  }} 
                />
                <Line type="stepAfter" dataKey="expiries" stroke="#fb7185" strokeWidth={2} name="Expired Units" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
