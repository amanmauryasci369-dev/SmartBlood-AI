import React, { useState, useEffect } from 'react';
import { FEFOItem, BloodBank } from '../../types';
import { ApiService } from '../../services/api';
import { 
  Droplets, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  RefreshCw,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { StatusBadge } from '../StatusBadge';

interface BloodInventoryPageProps {
  bloodBanks: BloodBank[];
}

export const BloodInventoryPage: React.FC<BloodInventoryPageProps> = ({ bloodBanks }) => {
  const [items, setItems] = useState<FEFOItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBank, setSelectedBank] = useState<string>('ALL');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedComponent, setSelectedComponent] = useState<string>('ALL');
  const [selectedFEFO, setSelectedFEFO] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const fefoItems = await ApiService.getInventoryFEFO({
        include_expired: true,
      });
      setItems(fefoItems);
    } catch (err) {
      console.error('Failed to load FEFO inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = items.filter((item) => {
    if (selectedBank !== 'ALL' && item.blood_bank !== selectedBank) return false;
    if (selectedGroup !== 'ALL' && item.blood_group !== selectedGroup) return false;
    if (selectedComponent !== 'ALL' && item.component !== selectedComponent) return false;
    if (selectedFEFO !== 'ALL') {
      const priorityLabel = item.priority === 1 ? 'HIGH' : item.priority === 2 ? 'MEDIUM' : 'LOW';
      if (priorityLabel !== selectedFEFO) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchBatch = item.batch_number.toLowerCase().includes(q);
      const matchBank = item.blood_bank.toLowerCase().includes(q);
      if (!matchBatch && !matchBank) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Droplets className="w-3.5 h-3.5" />
            <span>FEFO Laboratory Inventory Registry</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Blood Stock & Shelf-Life Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Strict First-Expiry-First-Out prioritization ensuring critical batches are issued before spoilage.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Inventory</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Search Batch / Depot</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. BATCH-2026 or AIIMS"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Blood Center</label>
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer"
          >
            <option value="ALL">All Facilities</option>
            {bloodBanks.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Blood Group</label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer"
          >
            <option value="ALL">All Groups</option>
            {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Component</label>
          <select
            value={selectedComponent}
            onChange={(e) => setSelectedComponent(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer"
          >
            <option value="ALL">All Components</option>
            <option value="PACKED_RED_BLOOD_CELLS">Packed Red Blood Cells (PRBC)</option>
            <option value="PLATELET_CONCENTRATE">Platelet Concentrate</option>
            <option value="FRESH_FROZEN_PLASMA">Fresh Frozen Plasma</option>
            <option value="WHOLE_BLOOD">Whole Blood</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">FEFO Priority</label>
          <select
            value={selectedFEFO}
            onChange={(e) => setSelectedFEFO(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium cursor-pointer"
          >
            <option value="ALL">All Priority Tiers</option>
            <option value="HIGH">HIGH (Immediate Issue)</option>
            <option value="MEDIUM">MEDIUM (Approaching)</option>
            <option value="LOW">LOW (Safe Horizon)</option>
          </select>
        </div>
      </div>

      {/* Professional FEFO Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">
            Batch-Level Inventory ({filteredItems.length} Batches)
          </h3>
          <span className="text-xs text-slate-500">
            Ordered by Expiry Horizon & FEFO Algorithm
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600">
              <tr>
                <th className="py-3 px-4">Blood Bank</th>
                <th className="py-3 px-3">Batch</th>
                <th className="py-3 px-3">Group</th>
                <th className="py-3 px-3">Component</th>
                <th className="py-3 px-3">Available</th>
                <th className="py-3 px-3">Reserved</th>
                <th className="py-3 px-3">Issued</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">Days Left</th>
                <th className="py-3 px-3">FEFO Priority</th>
                <th className="py-3 px-4">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    Loading inventory records...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    No batch records match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const priorityLabel = item.priority === 1 ? 'HIGH' : item.priority === 2 ? 'MEDIUM' : 'LOW';
                  const priorityBadge = 
                    item.priority === 1
                      ? 'bg-red-50 text-red-800 border-red-200 font-extrabold'
                      : item.priority === 2
                      ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.blood_bank}</td>
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">{item.batch_number}</td>
                      <td className="py-3 px-3 font-extrabold text-red-600 font-mono text-sm">{item.blood_group}</td>
                      <td className="py-3 px-3 text-slate-700">{item.component.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-3 font-bold font-mono text-slate-900">{item.available_units}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{item.reserved_units || 0}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{item.issued_units || 0}</td>
                      <td className="py-3 px-3 text-slate-600">{item.expiry_date}</td>
                      <td className="py-3 px-3 font-mono font-bold">
                        <span className={item.days_to_expiry <= 2 ? 'text-red-700' : item.days_to_expiry <= 5 ? 'text-amber-700' : 'text-emerald-700'}>
                          {item.days_to_expiry} Days
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${priorityBadge}`}>
                          {priorityLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px] italic">
                        {item.recommended_action}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
