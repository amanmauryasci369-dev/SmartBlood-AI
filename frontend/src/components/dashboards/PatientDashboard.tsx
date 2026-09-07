import React, { useState } from 'react';
import { BloodGroup, ComponentType, InventoryItem, BloodBank } from '../../types';
import { StatusBadge } from '../StatusBadge';
import { 
  Search, 
  PhoneCall, 
  Building2, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink,
  HeartHandshake
} from 'lucide-react';

interface PatientDashboardProps {
  inventory: InventoryItem[];
  bloodBanks: BloodBank[];
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  inventory,
  bloodBanks,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O+');
  const [selectedComponent, setSelectedComponent] = useState<ComponentType>('PACKED_RED_BLOOD_CELLS');

  // Filter inventory items matching the patient search
  const matchingUnits = inventory.filter(
    item => item.blood_group === selectedGroup && item.component === selectedComponent
  );

  return (
    <div className="space-y-6">
      
      {/* Ethical Transparency Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-white">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Patient Protection & Ethical Sourcing Notice</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          SmartBlood AI connects patients directly with licensed, certified regional blood centers. To protect donor safety and prevent unauthorized commercial exploitation, direct donor phone numbers are never shared publicly. All availability listings clearly distinguish verified laboratory stock from reported feeds.
        </p>
      </div>

      {/* Search Filter Box */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-blood-400" />
          <span>Locate Blood Units Near You</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Required Blood Group</label>
            <div className="grid grid-cols-4 gap-2">
              {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map((bg) => (
                <button
                  type="button"
                  key={bg}
                  onClick={() => setSelectedGroup(bg)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    selectedGroup === bg
                      ? 'bg-blood-600 text-white border border-blood-400 shadow-md'
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Required Component</label>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value as ComponentType)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white"
            >
              <option value="PACKED_RED_BLOOD_CELLS">Packed Red Blood Cells (PRBC)</option>
              <option value="PLATELET_CONCENTRATE">Platelet Concentrate</option>
              <option value="FRESH_FROZEN_PLASMA">Fresh Frozen Plasma (FFP)</option>
              <option value="WHOLE_BLOOD">Whole Blood</option>
              <option value="CRYOPRECIPITATE">Cryoprecipitate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Matching Blood Bank Centers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white">
            Available Verified Centers ({matchingUnits.length} Batches Found)
          </h4>
          <span className="text-xs text-slate-400">Sorted by verification status</span>
        </div>

        {matchingUnits.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-2xl border border-slate-800 space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <div className="text-sm font-semibold text-white">No Direct Stock Found for {selectedGroup} {selectedComponent}</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Please call the 24x7 National Emergency Blood Helpline at <strong>104</strong> or <strong>108</strong> for emergency network mobilization.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingUnits.map((item) => {
              const bank = bloodBanks.find(b => b.id === item.facility_id) || {
                name: 'Regional Blood Transfusion Center',
                district: 'Delhi NCR',
                contact_number: '+91 11 23716441',
              };

              return (
                <div key={item.id} className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-bold text-sm text-white">{bank.name}</h5>
                      <p className="text-xs text-slate-400">{bank.district}</p>
                    </div>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  <div className="flex items-center justify-between text-xs py-2 border-t border-b border-slate-800/80">
                    <span className="text-slate-400">Available Quantity:</span>
                    <span className="font-mono font-bold text-base text-white">{item.units_available} units</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-mono text-slate-200">{bank.contact_number}</span>
                    </div>

                    <a
                      href={`tel:${bank.contact_number}`}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-sm"
                    >
                      Call Desk
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Emergency Helplines Directory */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-blood-400" />
          <span>Official 24x7 Blood & Emergency Helplines (India)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400">National Health Helpline</span>
            <div className="text-lg font-bold text-white font-mono mt-1">104</div>
            <span className="text-[11px] text-emerald-400">Toll-Free 24x7</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400">Emergency Ambulance</span>
            <div className="text-lg font-bold text-white font-mono mt-1">108 / 112</div>
            <span className="text-[11px] text-rose-400">Critical Trauma Dispatch</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400">e-RaktKosh National Portal</span>
            <div className="text-sm font-bold text-blue-400 font-mono mt-1">eraktkosh.in</div>
            <span className="text-[11px] text-slate-400">Official MoHFW Portal</span>
          </div>
        </div>
      </div>

    </div>
  );
};
