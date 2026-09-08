import React, { useState } from 'react';
import { Hospital, BloodGroup, ComponentType, DemandPrediction } from '../../types';
import { ApiService } from '../../services/api';
import { 
  Building2, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  Layers,
  FileText,
  Activity,
  ArrowRight
} from 'lucide-react';

interface HospitalDashboardProps {
  hospitals: Hospital[];
  onOpenSOSModal: () => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  hospitals,
  onOpenSOSModal,
}) => {
  const [selectedTab, setSelectedTab] = useState<'requests' | 'inventory' | 'reports'>('requests');
  const [selectedHospital, setSelectedHospital] = useState<Hospital>(hospitals[0] || {} as Hospital);
  const [forecastGroup, setForecastGroup] = useState<BloodGroup>('O-');
  const [forecastComponent, setForecastComponent] = useState<ComponentType>('PACKED_RED_BLOOD_CELLS');
  const [dengueFactor, setDengueFactor] = useState<number>(1.0);
  const [rollingAvg, setRollingAvg] = useState<number>(24.0);
  const [currentStock, setCurrentStock] = useState<number>(8.0);

  const [prediction, setPrediction] = useState<DemandPrediction | null>(null);
  const [loadingForecast, setLoadingForecast] = useState<boolean>(false);

  // Screen 7 KPI Metrics
  const kpis = [
    { label: 'Total Requests', count: 24, color: 'text-red-700', bg: 'bg-red-50/70 border-red-100' },
    { label: 'Fulfilled', count: 18, color: 'text-emerald-700', bg: 'bg-emerald-50/70 border-emerald-100' },
    { label: 'Pending', count: 6, color: 'text-amber-700', bg: 'bg-amber-50/70 border-amber-100' },
    { label: 'Emergency', count: 3, color: 'text-rose-700', bg: 'bg-rose-50/70 border-rose-100' },
  ];

  // Screen 7 Recent Requests Table Data
  const recentRequests = [
    { id: 'P001', group: 'O-', component: 'PRBC', units: 2, status: 'Fulfilled' },
    { id: 'P002', group: 'B+', component: 'Platelets', units: 5, status: 'Pending' },
    { id: 'P003', group: 'A-', component: 'PRBC', units: 3, status: 'Emergency' },
    { id: 'P004', group: 'AB+', component: 'FFP', units: 4, status: 'Fulfilled' },
    { id: 'P005', group: 'O+', component: 'PRBC', units: 1, status: 'Pending' },
  ];

  const handleRunForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForecast(true);
    try {
      const pred = await ApiService.getDemandForecast({
        component: forecastComponent,
        blood_group: forecastGroup,
        has_trauma_center: selectedHospital.has_trauma_center ?? true,
        bed_capacity: selectedHospital.bed_capacity ?? 500,
        rolling_7d_avg: rollingAvg,
        current_stock: currentStock,
        dengue_outbreak_factor: dengueFactor,
      });
      setPrediction(pred);
    } catch (err: any) {
      alert(`Forecast failed: ${err.message}`);
    } finally {
      setLoadingForecast(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header (Screen 7 in Reference Image) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Hospital Dashboard
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage blood requests and inventory across connected regional network
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSOSModal}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>New Emergency Requisition</span>
        </button>
      </div>

      {/* 2. 4 Top KPI Cards (Screen 7 in Reference Image) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-4 sm:p-5 border bg-white ${kpi.bg} shadow-2xs space-y-1`}
          >
            <span className="text-xs font-bold text-slate-500 block">{kpi.label}</span>
            <div className={`text-2xl sm:text-3xl font-black ${kpi.color}`}>
              {kpi.count}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Requisitions Table Card (Screen 7 in Reference Image) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Sub-tabs: Recent Requests, Inventory, Reports */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 pt-4">
          <div className="flex items-center gap-4 text-xs font-bold">
            <button
              onClick={() => setSelectedTab('requests')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                selectedTab === 'requests'
                  ? 'border-red-600 text-red-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Recent Requests
            </button>
            <button
              onClick={() => setSelectedTab('inventory')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                selectedTab === 'inventory'
                  ? 'border-red-600 text-red-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Inventory
            </button>
            <button
              onClick={() => setSelectedTab('reports')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                selectedTab === 'reports'
                  ? 'border-red-600 text-red-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Reports
            </button>
          </div>

          <span className="text-[11px] text-slate-400 pb-3 font-medium">
            Live Requisition Stream
          </span>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3 px-6">Patient ID</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Component</th>
                <th className="py-3 px-4 text-center">Units</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {recentRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                    {req.id}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-sm text-[#9B001B]">
                    {req.group}
                  </td>
                  <td className="py-3.5 px-4 font-medium">
                    {req.component}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold">
                    {req.units}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      req.status === 'Fulfilled'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : req.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={onOpenSOSModal}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* 4. AI Demand Forecasting Simulator */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Predictive Hospital Demand Simulator (Scikit-Learn ML)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate forward-looking 7-day requirements based on surgical load and seasonal outbreak risk.
            </p>
          </div>
        </div>

        <form onSubmit={handleRunForecast} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
            <select
              value={forecastGroup}
              onChange={(e) => setForecastGroup(e.target.value as BloodGroup)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold cursor-pointer"
            >
              {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Component</label>
            <select
              value={forecastComponent}
              onChange={(e) => setForecastComponent(e.target.value as ComponentType)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium cursor-pointer"
            >
              <option value="PACKED_RED_BLOOD_CELLS">PRBC</option>
              <option value="PLATELET_CONCENTRATE">Platelets</option>
              <option value="FRESH_FROZEN_PLASMA">FFP</option>
              <option value="WHOLE_BLOOD">Whole Blood</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Current Stock (Units)</label>
            <input
              type="number"
              value={currentStock}
              onChange={(e) => setCurrentStock(Number(e.target.value))}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loadingForecast}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{loadingForecast ? 'Computing...' : 'Forecast Demand'}</span>
            </button>
          </div>
        </form>

        {prediction && (
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs space-y-2 mt-3">
            <div className="font-extrabold text-purple-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Demand Model Forecast Results</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-slate-700 pt-1">
              <div>
                <span className="text-[10px] text-purple-700 uppercase font-bold block">Predicted 7-Day Demand</span>
                <strong className="text-sm font-mono">{prediction.predicted_7d_demand_units} units</strong>
              </div>
              <div>
                <span className="text-[10px] text-purple-700 uppercase font-bold block">Safety Stock</span>
                <strong className="text-sm font-mono text-amber-700">{prediction.recommended_safety_stock_units} units</strong>
              </div>
              <div>
                <span className="text-[10px] text-purple-700 uppercase font-bold block">Classification</span>
                <strong className="text-sm font-mono text-emerald-700">{prediction.availability_classification}</strong>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
