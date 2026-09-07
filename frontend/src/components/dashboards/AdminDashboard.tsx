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
  Database
} from 'lucide-react';
import { StatusBadge } from '../StatusBadge';

interface AdminDashboardProps {
  stockSummary: StockSummary | null;
  rebalanceProposals: RebalanceProposal[];
  bloodBanks: BloodBank[];
  hospitals: Hospital[];
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stockSummary,
  rebalanceProposals,
  bloodBanks,
  hospitals,
  onRefreshData,
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

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Adapter Controls */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Regional Transfusion Command Hub</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-normal">
              Delhi NCR Cluster
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous multi-facility inventory monitoring, adapter synchronization, and proactive shelf-life balancing.
          </p>
        </div>

        <button
          onClick={handleSyncERaktKosh}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold border border-slate-700 shadow-sm transition-all disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 text-blood-400 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing Adapter...' : 'Sync e-RaktKosh Synthetic Feed'}</span>
        </button>
      </div>

      {syncNotice && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-blood-600/40 text-xs text-slate-200 flex items-center gap-2.5">
          <Database className="w-4 h-4 text-blood-400 shrink-0" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-emerald-900/30">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Physically Confirmed Stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {stockSummary?.total_confirmed_units || 0}
            </span>
            <span className="text-xs text-slate-400">units verified</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-500/80">
            Available for immediate dispatch
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-900/30">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Reported Adapter Feeds</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400 font-mono">
              {stockSummary?.total_reported_units || 0}
            </span>
            <span className="text-xs text-slate-400">units reported</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-500/80">
            Pending physical technician verification
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-rose-900/30">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Expiring Within 48 Hours</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400 font-mono">
              {stockSummary?.total_expiring_within_48h || 0}
            </span>
            <span className="text-xs text-slate-400">units at risk</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-400/80">
            Targeted for priority transfer
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Network Health</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {bloodBanks.length} <span className="text-sm font-normal text-slate-400">banks</span> / {hospitals.length} <span className="text-sm font-normal text-slate-400">hosps</span>
            </span>
          </div>
          <div className="mt-2 text-[11px] text-blue-400/80">
            100% active regional coverage
          </div>
        </div>
      </div>

      {/* Proactive Rebalancing & Wastage Prevention Proposal Section */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Proactive Inter-Facility Balancing Engine (Wastage Prevention)
            </h3>
            <p className="text-xs text-slate-400">
              Autonomous algorithmic proposals matching expiring units from low-turnover facilities with apex trauma hospitals.
            </p>
          </div>
          <StatusBadge status="RECOMMENDED_ACTION" size="sm" />
        </div>

        {rebalanceProposals.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 rounded-xl bg-slate-900 border border-slate-800">
            No imminent unit expiration risks detected across the cluster. Network stock is balanced.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rebalanceProposals.slice(0, 4).map((prop) => (
              <div key={prop.rebalance_id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <span className="text-blood-400">{prop.source_bank_name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-blue-400">{prop.destination_hospital_name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                    Urgency: {prop.wastage_prevention_score}%
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {prop.explanation}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <span>Transfer: <strong className="text-white">{prop.units_to_transfer} units {prop.blood_group}</strong></span>
                  <span>Transit: <strong className="text-slate-200">{prop.distance_km} km (~{prop.estimated_transit_mins}m)</strong></span>
                  <span className="text-rose-400 font-semibold">{prop.days_until_expiry}d shelf-life left</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blood Group Breakdown Table */}
      {stockSummary && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-base font-bold text-white">Regional Inventory Breakdown by Blood Group</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-400 border-b border-slate-800 bg-slate-900/60 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Blood Group</th>
                  <th className="py-2.5 px-3">Confirmed Units</th>
                  <th className="py-2.5 px-3">Reported Feed Units</th>
                  <th className="py-2.5 px-3">Critical Shelf-Life (&lt;48h)</th>
                  <th className="py-2.5 px-3">Network Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stockSummary.breakdown_by_group.map((item) => (
                  <tr key={item.blood_group} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white text-sm font-mono">{item.blood_group}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-semibold font-mono">{item.confirmed_units} units</td>
                    <td className="py-2.5 px-3 text-amber-400 font-mono">{item.reported_units} units</td>
                    <td className="py-2.5 px-3 text-rose-400 font-mono font-medium">{item.expiring_within_48h} units</td>
                    <td className="py-2.5 px-3">
                      {item.confirmed_units < 5 ? (
                        <span className="text-[10px] text-rose-400 font-bold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-900">
                          Critical Deficit
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/40">
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
