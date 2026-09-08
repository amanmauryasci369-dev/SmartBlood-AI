import React, { useState, useEffect } from 'react';
import { BloodBank, InventoryItem } from '../../types';
import { ApiService } from '../../services/api';
import { 
  Building2, 
  MapPin, 
  PhoneCall, 
  Search, 
  Filter, 
  ShieldCheck, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  ExternalLink,
  Navigation
} from 'lucide-react';
import { MapView } from '../MapView';

interface BloodCenterDirectoryPageProps {
  bloodBanks: BloodBank[];
  inventory: InventoryItem[];
  onOpenSOSModal: () => void;
}

export const BloodCenterDirectoryPage: React.FC<BloodCenterDirectoryPageProps> = ({
  bloodBanks,
  inventory,
  onOpenSOSModal,
}) => {
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');
  const [selectedCenter, setSelectedCenter] = useState<BloodBank | null>(null);

  const districts = Array.from(new Set(bloodBanks.map((b) => b.district))).sort();
  const states = Array.from(new Set(bloodBanks.map((b) => b.state))).sort();

  const filteredBanks = bloodBanks.filter((bank) => {
    if (selectedState !== 'ALL' && bank.state !== selectedState) return false;
    if (selectedDistrict !== 'ALL' && bank.district !== selectedDistrict) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = bank.name.toLowerCase().includes(q);
      const matchDist = bank.district.toLowerCase().includes(q);
      const matchLic = bank.license_number.toLowerCase().includes(q);
      if (!matchName && !matchDist && !matchLic) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Authorized Transfusion Network</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Blood Center Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official repository of state-licensed blood transfusion services, cold-chain facilities, and regional storage depots.
          </p>
        </div>

        {/* View Switcher: Cards vs Map */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Directory Cards ({filteredBanks.length})
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            GIS Map View
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Search Name / License</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. AIIMS, Red Cross"
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Filter by State</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 cursor-pointer"
          >
            <option value="ALL">All States</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Filter by District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 cursor-pointer"
          >
            <option value="ALL">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedState('ALL');
              setSelectedDistrict('ALL');
              setSearchQuery('');
            }}
            className="w-full py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer text-xs"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Directory Content */}
      {viewMode === 'map' ? (
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[550px]">
          <MapView
            bloodBanks={filteredBanks}
            hospitals={[]}
            activeDispatch={null}
            selectedFacility={selectedCenter}
            onSelectFacility={(fac) => setSelectedCenter(fac as BloodBank)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBanks.map((bank) => {
            const bankStock = inventory.filter((i) => i.facility_id === bank.id);
            const totalUnits = bankStock.reduce((acc, curr) => acc + curr.units_available, 0);

            return (
              <div
                key={bank.id}
                className="health-card p-5 space-y-3.5 border border-slate-200 hover:border-slate-300 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                      {bank.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                      {bank.license_number}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{bank.district}, {bank.state}</span>
                  </p>
                </div>

                {/* Facility Details Pill Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Cold Storage</span>
                    <strong className="text-slate-800 font-medium">
                      {bank.storage_capacity} Units
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Cold Chain</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Certified</span>
                    </span>
                  </div>
                </div>

                {/* Available Blood Groups Badge Strip */}
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold block">
                    Reported Blood Groups:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <span
                        key={bg}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200"
                      >
                        {bg}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${bank.contact_number}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <PhoneCall className="w-3 h-3 text-slate-600" />
                    <span>{bank.contact_number}</span>
                  </a>

                  <button
                    onClick={onOpenSOSModal}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Request Stock
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
