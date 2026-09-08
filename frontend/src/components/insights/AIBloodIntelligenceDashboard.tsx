import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Heart, 
  Building2, 
  CheckCircle2, 
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';

interface AIBloodIntelligenceDashboardProps {
  onNavigateToTab?: (tab: any) => void;
  onOpenMetrics?: () => void;
}

export const AIBloodIntelligenceDashboard: React.FC<AIBloodIntelligenceDashboardProps> = ({
  onNavigateToTab,
  onOpenMetrics,
}) => {
  const [activeTab, setActiveTab] = useState<'forecast' | 'shortage' | 'expiry' | 'matching'>('forecast');

  // Blood group comparison data matching Screen 8 in Reference Image
  const groups = [
    { group: 'O+', current: 48, predicted: 62 },
    { group: 'O-', current: 12, predicted: 28 },
    { group: 'A+', current: 36, predicted: 42 },
    { group: 'A-', current: 18, predicted: 24 },
    { group: 'B+', current: 52, predicted: 50 },
    { group: 'B-', current: 15, predicted: 20 },
    { group: 'AB+', current: 22, predicted: 18 },
    { group: 'AB-', current: 8, predicted: 14 },
  ];

  const maxVal = 70;

  return (
    <div className="space-y-6">
      
      {/* 1. Header (Screen 8 in Reference Image) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              AI-Powered Blood Intelligence
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Turning data into lifesaving decisions • Machine Learning Predictive Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Last updated: 10 mins ago</span>
        </div>
      </div>

      {/* 2. Sub Tabs (Screen 8 in Reference Image) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-0 overflow-x-auto no-scrollbar text-xs font-bold">
        {[
          { id: 'forecast', label: 'Demand Forecast' },
          { id: 'shortage', label: 'Shortage Prediction' },
          { id: 'expiry', label: 'Expiry Risk' },
          { id: 'matching', label: 'Donor Matching' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2.5 px-3 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Main Dual Column Layout (Screen 8 in Reference Image) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Dual Bar Chart: Blood Demand Forecast (Next 7 Days) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Blood Demand Forecast (Next 7 Days)
              </h3>
              <p className="text-xs text-slate-500">
                Regional demand projection vs current validated inventory
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-3 h-3 rounded bg-red-600 inline-block" />
                <span>Current Stock</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-3 h-3 rounded bg-rose-200 inline-block" />
                <span>Predicted Demand</span>
              </div>
            </div>
          </div>

          {/* Chart Rendering */}
          <div className="pt-4 pb-2">
            <div className="grid grid-cols-8 gap-2 sm:gap-4 items-end h-56 border-b border-slate-200 px-2">
              {groups.map((item) => {
                const currentH = (item.current / maxVal) * 100;
                const predictedH = (item.predicted / maxVal) * 100;

                return (
                  <div key={item.group} className="flex flex-col items-center h-full justify-end group">
                    <div className="flex items-end gap-1 sm:gap-1.5 w-full justify-center">
                      {/* Current Stock Bar */}
                      <div
                        style={{ height: `${currentH}%` }}
                        className="w-2 sm:w-3.5 bg-red-600 rounded-t transition-all group-hover:brightness-110 relative"
                        title={`Current: ${item.current} units`}
                      />

                      {/* Predicted Demand Bar */}
                      <div
                        style={{ height: `${predictedH}%` }}
                        className="w-2 sm:w-3.5 bg-rose-200 rounded-t transition-all group-hover:brightness-95 relative"
                        title={`Predicted: ${item.predicted} units`}
                      />
                    </div>

                    <span className="mt-2 text-xs font-black font-mono text-slate-800">
                      {item.group}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 px-1">
              <span>Units (PRBC)</span>
              <span>Scikit-Learn Gradient Boosting Regressor (R²: 0.91)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span>Forecast updated hourly based on incoming trauma logs and elective surgery schedules.</span>
            {onOpenMetrics && (
              <button
                onClick={onOpenMetrics}
                className="text-red-700 font-bold hover:underline cursor-pointer"
              >
                View ML Metrics &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Right: Key Insights Card (Screen 8 in Reference Image) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-4 h-4 text-red-600" />
            <h3 className="font-extrabold text-sm text-slate-900">
              Key Insights
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-red-50/70 border border-red-200 text-red-900 space-y-0.5">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>O- Stock Critical Alert</span>
              </div>
              <p className="text-[11px] text-red-800">
                O- negative stock may become critical in <strong>3 days</strong> due to trauma demand spike.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-0.5">
              <div className="font-bold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Peak Demand Forecast</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Peak seasonal requirement expected next week across Central and South Delhi.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-0.5">
              <div className="font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Shelf-Life Advisory</span>
              </div>
              <p className="text-[11px] text-slate-600">
                <strong>12 units</strong> of Platelets expiring within 5 days across regional network.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 space-y-0.5">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Mobilization Target</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Donation drives recommended in Delhi NCR targeting universal donor categories.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('hospital-exchange')}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Execute FEFO Rebalancing</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
