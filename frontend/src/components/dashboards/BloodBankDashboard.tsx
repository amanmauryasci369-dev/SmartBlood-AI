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
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Blood Center Laboratory Operations</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Physical Stock Verification & Certification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical stock verification, cold-chain assurance, and laboratory batch certification.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs self-start sm:self-auto">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Inventory ({inventory.length})
          </button>
          <button
            onClick={() => setFilterStatus('REPORTED')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterStatus === 'REPORTED' ? 'bg-amber-100 text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reported Feeds ({inventory.filter(i => i.status === 'REPORTED_AVAILABILITY').length})
          </button>
          <button
            onClick={() => setFilterStatus('CONFIRMED')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterStatus === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
              className={`health-card p-5 space-y-3 border transition-all ${
                isConfirmed ? 'border-slate-200' : 'border-amber-300 bg-amber-50/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-900 font-mono">{item.blood_group}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      {item.component.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-1">
                    Batch: {item.batch_number}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-slate-900 font-mono">
                    {item.units_available} <span className="text-xs font-normal text-slate-500">units</span>
                  </div>
                </div>
              </div>

              {/* Badges & Expiry Details */}
              <div className="mt-2 pt-2.5 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <StatusBadge status={item.status} size="sm" />
                  <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                    <Thermometer className="w-3.5 h-3.5 text-blue-600" />
                    <span>{item.temperature_celsius}°C</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Expires: {item.expiry_date}</span>
                  </div>
                  {isExpiringSoon && (
                    <span className="flex items-center gap-1 text-red-700 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                      <AlertTriangle className="w-3 h-3 text-red-600" /> &lt; 3 Days
                    </span>
                  )}
                </div>

                {isConfirmed ? (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Lab Certified
                    </span>
                    <span className="text-[10px] text-emerald-700">Ready for Issue</span>
                  </div>
                ) : (
                  <div className="pt-1">
                    <button
                      onClick={() => handleConfirmUnit(item)}
                      disabled={confirmingId === item.id}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{confirmingId === item.id ? 'Certifying Batch...' : 'Verify & Confirm Physical Stock'}</span>
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
