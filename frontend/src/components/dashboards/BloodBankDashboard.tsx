import React, { useState } from 'react';
import { InventoryItem } from '../../types';
import { ApiService } from '../../services/api';
import { StatusBadge } from '../StatusBadge';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Thermometer, 
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface BloodBankDashboardProps {
  inventory: InventoryItem[];
  onRefreshData: () => void;
}

export const BloodBankDashboard: React.FC<BloodBankDashboardProps> = ({
  inventory,
  onRefreshData,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const handleConfirmUnit = async (item: InventoryItem) => {
    setConfirmingId(item.id);
    try {
      await ApiService.confirmInventory(item.id, item.units_available, item.temperature_celsius);
      onRefreshData();
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
    } finally {
      setConfirmingId(null);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    if (filterStatus === 'REPORTED') return item.status === 'REPORTED_AVAILABILITY';
    if (filterStatus === 'CONFIRMED') return item.status === 'CONFIRMED_AVAILABILITY';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blood-500" />
            <span>Blood Bank Laboratory Operations</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Physical stock verification, cold-chain assurance, and laboratory batch certification.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterStatus === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Inventory ({inventory.length})
          </button>
          <button
            onClick={() => setFilterStatus('REPORTED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterStatus === 'REPORTED' ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reported Feeds ({inventory.filter(i => i.status === 'REPORTED_AVAILABILITY').length})
          </button>
          <button
            onClick={() => setFilterStatus('CONFIRMED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterStatus === 'CONFIRMED' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' : 'text-slate-400 hover:text-white'
            }`}
          >
            Confirmed Stock ({inventory.filter(i => i.status === 'CONFIRMED_AVAILABILITY').length})
          </button>
        </div>
      </div>

      {/* Inventory Batch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.map((item) => {
          const isExpiringSoon = new Date(item.expiry_date).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000;
          const isConfirmed = item.status === 'CONFIRMED_AVAILABILITY';

          return (
            <div
              key={item.id}
              className={`glass-panel p-4 rounded-xl border transition-all ${
                isConfirmed ? 'border-slate-800 hover:border-slate-700' : 'border-amber-900/40 bg-amber-950/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-white font-mono">{item.blood_group}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {item.component.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    Batch: {item.batch_number}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-white font-mono">
                    {item.units_available} <span className="text-xs font-normal text-slate-400">units</span>
                  </div>
                </div>
              </div>

              {/* Badges & Expiry Details */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <StatusBadge status={item.status} size="sm" />
                  <div className="flex items-center gap-1 text-slate-400">
                    <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{item.temperature_celsius}°C</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>Expires: {item.expiry_date}</span>
                  </div>
                  {isExpiringSoon && (
                    <span className="flex items-center gap-1 text-rose-400 font-bold bg-rose-950/80 px-1.5 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3" /> Expiry Alert
                    </span>
                  )}
                </div>

                {isConfirmed ? (
                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-900/40 text-[11px] text-emerald-400 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Certified by Lab Staff
                    </span>
                    <span className="text-[10px] text-emerald-500/80">Available</span>
                  </div>
                ) : (
                  <div className="pt-1">
                    <button
                      onClick={() => handleConfirmUnit(item)}
                      disabled={confirmingId === item.id}
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{confirmingId === item.id ? 'Certifying...' : 'Verify & Confirm Physical Stock'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
