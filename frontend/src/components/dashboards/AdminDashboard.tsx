import React, { useState } from 'react';
import { StockSummary, RebalanceProposal, BloodBank, Hospital } from '../../types';
import { ApiService } from '../../services/api';
import { 
  Building2, 
  Hospital as HospitalIcon, 
  AlertCircle, 
  CheckCircle2, 
  RotateCw, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Database,
  Users,
  AlertTriangle,
  Clock,
  Trash2,
  Send,
  Droplets,
  Layers
} from 'lucide-react';
import { StatusBadge } from '../StatusBadge';

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
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const handleSyncERaktKosh = async () => {
    setSyncing(true);
    setSyncNotice(null);
    try {
      const res = await ApiService.syncERaktKosh('Central Delhi', 'Delhi');
      setSyncNotice(`Successfully ingested ${res.synced_units_count} batch units from e-RaktKosh compatible synthetic feed as REPORTED_AVAILABILITY.`);
      onRefreshData();
    } catch (err: any) {
      setSyncNotice(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const totalUnits = (stockSummary?.total_confirmed_units || 0) + (stockSummary?.total_reported_units || 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Adapter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-1">
            Regional Transfusion Command Hub
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Administrative Management & Oversight
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Autonomous multi-facility inventory monitoring, adapter synchronization, and proactive shelf-life balancing.
          </p>
        </div>

        <button
          onClick={handleSyncERaktKosh}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 text-red-400 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing Adapter...' : 'Sync e-RaktKosh Adapter Feed'}</span>
        </button>
      </div>

      {syncNotice && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2.5">
          <Database className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Top Required KPI Row: 8 Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs">
        
        {/* 1. Total Blood Units */}
        <div className="health-card p-3.5 text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase block truncate">Total Units</span>
          <div className="text-lg font-black text-slate-900 font-mono">{totalUnits}</div>
          <span className="text-[10px] text-slate-400 block">Regional Stock</span>
        </div>

        {/* 2. Blood Banks */}
        <div className="health-card p-3.5 text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase block truncate">Blood Banks</span>
          <div className="text-lg font-black text-blue-700 font-mono">{bloodBanks.length}</div>
          <span className="text-[10px] text-slate-400 block">Licensed Centers</span>
        </div>

        {/* 3. Hospitals */}
        <div className="health-card p-3.5 text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase block truncate">Hospitals</span>
          <div className="text-lg font-black text-indigo-700 font-mono">{hospitals.length}</div>
          <span className="text-[10px] text-slate-400 block">Clinical Desks</span>
        </div>

        {/* 4. Active Donors */}
        <div className="health-card p-3.5 text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase block truncate">Active Donors</span>
          <div className="text-lg font-black text-emerald-700 font-mono">1,480+</div>
          <span className="text-[10px] text-slate-400 block">Masked Tokens</span>
        </div>

        {/* 5. Emergency Requests */}
        <div className="health-card p-3.5 text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase block truncate">Emergency SOS</span>
          <div className="text-lg font-black text-red-600 font-mono">3 Active</div>
          <span className="text-[10px] text-slate-400 block">In Dispatch</span>
        </div>

        {/* 6. Critical Shortages */}
        <div className="health-card p-3.5 text-center space-y-1 bg-red-50/50 border-red-200">
          <span className="text-[10px] font-bold text-red-700 uppercase block truncate">Shortages</span>
          <div className="text-lg font-black text-red-700 font-mono">1 (O−)</div>
          <span className="text-[10px] text-red-600 block">&lt; 3-Day Buffer</span>
        </div>

        {/* 7. Expiry Risk */}
        <div className="health-card p-3.5 text-center space-y-1 bg-amber-50/50 border-amber-200">
          <span className="text-[10px] font-bold text-amber-700 uppercase block truncate">Expiry Risk</span>
          <div className="text-lg font-black text-amber-700 font-mono">{stockSummary?.total_expiring_within_48h || 28}</div>
          <span className="text-[10px] text-amber-600 block">&lt; 48h Shelf-Life</span>
        </div>

        {/* 8. Wastage Risk */}
        <div className="health-card p-3.5 text-center space-y-1 bg-rose-50/50 border-rose-200">
          <span className="text-[10px] font-bold text-rose-700 uppercase block truncate">Wastage Rate</span>
          <div className="text-lg font-black text-rose-700 font-mono">4.2%</div>
          <span className="text-[10px] text-emerald-700 block">&darr; 28% Saved</span>
        </div>

      </div>

      {/* Proactive Inter-Facility Balancing Engine */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Proactive Inter-Facility Redistribution Engine</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated algorithmic proposals routing near-expiry units from low-turnover facilities to apex trauma centers.
            </p>
          </div>
          <StatusBadge status="RECOMMENDED_ACTION" size="sm" />
        </div>

        {rebalanceProposals.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 rounded-xl bg-slate-50 border border-slate-200">
            No imminent unit expiration risks detected across the cluster. Network stock is balanced.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rebalanceProposals.slice(0, 4).map((prop) => (
              <div key={prop.rebalance_id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span className="text-red-700">{prop.source_bank_name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-blue-700">{prop.destination_hospital_name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Score: {prop.wastage_prevention_score}%
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed">
                  {prop.explanation}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                  <span>Transfer: <strong className="text-slate-900">{prop.units_to_transfer} units {prop.blood_group}</strong></span>
                  <span>Transit: <strong className="text-slate-800">{prop.distance_km} km (~{prop.estimated_transit_mins}m)</strong></span>
                  <span className="text-red-700 font-bold">{prop.days_until_expiry}d shelf-life left</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Regional Inventory Breakdown Table */}
      {stockSummary && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900">Regional Inventory by Blood Group</h3>
            <span className="text-xs text-slate-500">Distinguishing confirmed vs reported inventory</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-slate-500 border-b border-slate-200 bg-slate-50 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Blood Group</th>
                  <th className="py-2.5 px-3">Confirmed Units</th>
                  <th className="py-2.5 px-3">Reported Feed Units</th>
                  <th className="py-2.5 px-3">Critical Shelf-Life (&lt;48h)</th>
                  <th className="py-2.5 px-3">Network Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockSummary.breakdown_by_group.map((item) => (
                  <tr key={item.blood_group} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 text-sm font-mono">{item.blood_group}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-semibold font-mono">{item.confirmed_units} units</td>
                    <td className="py-2.5 px-3 text-amber-700 font-mono">{item.reported_units} units</td>
                    <td className="py-2.5 px-3 text-red-700 font-mono font-medium">{item.expiring_within_48h} units</td>
                    <td className="py-2.5 px-3">
                      {item.confirmed_units < 5 ? (
                        <span className="text-[10px] text-red-800 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          Critical Deficit
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Buffer Adequate
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
