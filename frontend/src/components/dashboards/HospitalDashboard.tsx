import React, { useState } from 'react';
import { Hospital, BloodGroup, ComponentType, DemandPrediction } from '../../types';
import { ApiService } from '../../services/api';
import { 
  Hospital as HospitalIcon, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  Send, 
  ShieldAlert, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { StatusBadge } from '../StatusBadge';

interface HospitalDashboardProps {
  hospitals: Hospital[];
  onOpenSOSModal: () => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  hospitals,
  onOpenSOSModal,
}) => {
  const [selectedHospital, setSelectedHospital] = useState<Hospital>(hospitals[0] || {} as Hospital);
  const [forecastGroup, setForecastGroup] = useState<BloodGroup>('O-');
  const [forecastComponent, setForecastComponent] = useState<ComponentType>('PACKED_RED_BLOOD_CELLS');
  const [dengueFactor, setDengueFactor] = useState<number>(1.0);
  const [rollingAvg, setRollingAvg] = useState<number>(24.0);
  const [currentStock, setCurrentStock] = useState<number>(8.0);

  const [prediction, setPrediction] = useState<DemandPrediction | null>(null);
  const [loadingForecast, setLoadingForecast] = useState<boolean>(false);

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
      
      {/* Hospital SOS Action Banner */}
      <div className="glass-panel-glow p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-blood-600/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blood-500 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-blood-400">Emergency Transfusion Protocol</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Acute Blood Shortage & Trauma Response</h2>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            Initiate automated multi-criteria routing across regional blood banks. AI matches confirmed units, estimates transit time in traffic, and maintains cold-chain integrity.
          </p>
        </div>

        <button
          onClick={onOpenSOSModal}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blood-600 via-blood-500 to-blood-600 hover:from-blood-500 hover:to-blood-500 text-white font-bold text-sm shadow-xl shadow-blood-900/50 hover:shadow-blood-700/60 transition-all transform hover:-translate-y-0.5"
        >
          <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
          <span>Trigger Emergency Blood SOS</span>
        </button>
      </div>

      {/* AI Demand Forecasting Simulator */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Predictive Blood Demand Forecasting (Scikit-Learn ML)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Forward-looking 7-day hospital requirement estimation based on trauma status, surgical capacity, and seasonal outbreak factors.
            </p>
          </div>
          <StatusBadge status="PREDICTED_AVAILABILITY" size="sm" />
        </div>

        <form onSubmit={handleRunForecast} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Blood Group</label>
            <select
              value={forecastGroup}
              onChange={(e) => setForecastGroup(e.target.value as BloodGroup)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            >
              {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Component</label>
            <select
              value={forecastComponent}
              onChange={(e) => setForecastComponent(e.target.value as ComponentType)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="PACKED_RED_BLOOD_CELLS">Packed Red Blood Cells (PRBC)</option>
              <option value="PLATELET_CONCENTRATE">Platelet Concentrate</option>
              <option value="FRESH_FROZEN_PLASMA">Fresh Frozen Plasma</option>
              <option value="WHOLE_BLOOD">Whole Blood</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Seasonal Dengue Outbreak Index
            </label>
            <select
              value={dengueFactor}
              onChange={(e) => setDengueFactor(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value={1.0}>1.0x (Baseline / Non-Epidemic)</option>
              <option value={1.8}>1.8x (Moderate Monsoon Spike)</option>
              <option value={3.0}>3.0x (Acute Dengue Platelet Crisis)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loadingForecast}
              className="w-full py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <TrendingUp className="w-4 h-4" />
              <span>{loadingForecast ? 'Evaluating Model...' : 'Calculate 7-Day Forecast'}</span>
            </button>
          </div>
        </form>

        {/* Prediction Results Display */}
        {prediction && (
          <div className="p-4 rounded-xl bg-slate-900 border border-purple-800/40 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-850 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400">Projected 7-Day Demand</span>
                <div className="text-2xl font-black text-purple-300 font-mono mt-1">
                  {prediction.predicted_7d_demand_units} <span className="text-xs font-normal text-slate-400">units</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-850 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400">Recommended Safety Reserve</span>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                  {prediction.recommended_safety_stock_units} <span className="text-xs font-normal text-slate-400">units</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-850 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400">Projected Shortfall Deficit</span>
                <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                  {prediction.projected_deficit} <span className="text-xs font-normal text-slate-400">units</span>
                </div>
              </div>
            </div>

            {/* Explainability Breakdown (Rule 14) */}
            <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-900/40 text-xs space-y-1.5">
              <div className="font-bold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Forecasting Rationale:</span>
              </div>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {prediction.explainability.top_drivers.map((driver, idx) => (
                  <li key={idx}>{driver}</li>
                ))}
              </ul>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-purple-900/30">
                {prediction.explainability.clinical_advisory}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
