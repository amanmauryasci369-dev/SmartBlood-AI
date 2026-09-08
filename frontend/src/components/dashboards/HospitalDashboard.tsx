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
      <div className="health-card-critical p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-red-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">Emergency Transfusion Protocol</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Acute Blood Shortage & Trauma Response</h2>
          <p className="text-xs text-slate-600 max-w-xl mt-1">
            Initiate automated multi-criteria routing across regional blood banks. AI matches confirmed units, estimates transit time in traffic, and maintains cold-chain integrity.
          </p>
        </div>

        <button
          onClick={onOpenSOSModal}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-900/20 transition-all cursor-pointer uppercase tracking-wide"
        >
          <AlertTriangle className="w-4 h-4 text-white" />
          <span>Trigger Emergency Blood SOS</span>
        </button>
      </div>

      {/* AI Demand Forecasting Simulator */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Predictive Blood Demand Forecasting (Scikit-Learn ML)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Forward-looking 7-day hospital requirement estimation based on trauma status, surgical capacity, and seasonal outbreak factors.
            </p>
          </div>
          <StatusBadge status="PREDICTED_AVAILABILITY" size="sm" />
        </div>

        <form onSubmit={handleRunForecast} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase">Blood Group</label>
            <select
              value={forecastGroup}
              onChange={(e) => setForecastGroup(e.target.value as BloodGroup)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-red-600 cursor-pointer"
            >
              {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase">Blood Component</label>
            <select
              value={forecastComponent}
              onChange={(e) => setForecastComponent(e.target.value as ComponentType)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium cursor-pointer"
            >
              <option value="PACKED_RED_BLOOD_CELLS">Packed Red Blood Cells (PRBC)</option>
              <option value="PLATELET_CONCENTRATE">Platelet Concentrate</option>
              <option value="FRESH_FROZEN_PLASMA">Fresh Frozen Plasma</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase">Current Stock On Hand</label>
            <input
              type="number"
              value={currentStock}
              onChange={(e) => setCurrentStock(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold font-mono text-slate-900"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loadingForecast}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loadingForecast ? 'Generating ML Forecast...' : 'Run Demand Projection'}
            </button>
          </div>
        </form>

        {/* Prediction Results Display */}
        {prediction && (
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-500 font-bold block">7-Day Projected Demand</span>
                <strong className="text-2xl font-black text-slate-900 font-mono">
                  {prediction.predicted_7d_demand_units} Units
                </strong>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Recommended Safety Buffer</span>
                <strong className="text-2xl font-black text-red-600 font-mono">
                  {prediction.recommended_safety_stock_units} Units
                </strong>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Projected Deficit</span>
                <strong className="text-2xl font-black text-amber-600 font-mono">
                  {prediction.projected_deficit} Units
                </strong>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Status Tier</span>
                <span className="inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-red-100 text-red-800 border border-red-200">
                  {prediction.availability_classification}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-1 text-slate-600">
              <p className="font-bold text-slate-900">Clinical Decision Support Advisory:</p>
              <p>{prediction.explainability?.clinical_advisory}</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
