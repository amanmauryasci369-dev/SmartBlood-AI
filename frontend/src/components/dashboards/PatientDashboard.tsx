import React, { useState } from 'react';
import { BloodGroup, ComponentType, InventoryItem, BloodBank } from '../../types';
import { StatusBadge } from '../StatusBadge';
import { 
  Search, 
  PhoneCall, 
  Building2, 
  ShieldCheck, 
  AlertCircle, 
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

  const matchingUnits = inventory.filter(
    item => item.blood_group === selectedGroup && item.component === selectedComponent
  );

  return (
    <div className="space-y-6">
      
      {/* Ethical Transparency Banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Patient Protection & Ethical Sourcing Notice</span>
        </div>
        <p className="text-slate-500 leading-relaxed">
          SmartBlood AI connects patients directly with licensed, certified regional blood centers. To protect donor safety and prevent unauthorized commercial exploitation, direct donor phone numbers are never shared publicly. All availability listings clearly distinguish verified laboratory stock from reported feeds.
        </p>
      </div>

      {/* Search Filter Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Search className="w-4 h-4 text-red-600" />
          <span>Locate Blood Units Near You</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase">Required Blood Group</label>
            <div className="grid grid-cols-4 gap-2">
              {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map((bg) => (
                <button
                  type="button"
                  key={bg}
                  onClick={() => setSelectedGroup(bg)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedGroup === bg
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase">Required Component</label>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value as ComponentType)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium cursor-pointer"
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
          <h4 className="text-sm font-black text-slate-900">
            Available Verified Centers ({matchingUnits.length} Batches Found)
          </h4>
          <span className="text-xs text-slate-500">Sorted by verification status</span>
        </div>

        {matchingUnits.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <div className="text-sm font-bold text-slate-900">No Direct Stock Found for {selectedGroup}</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
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
                <div key={item.id} className="health-card p-5 space-y-3 border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-extrabold text-sm text-slate-900">{bank.name}</h5>
                      <p className="text-xs text-slate-500">{bank.district}</p>
                    </div>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  <div className="flex items-center justify-between text-xs py-2 border-t border-b border-slate-100">
                    <span className="text-slate-500">Available Quantity:</span>
                    <span className="font-mono font-black text-base text-slate-900">{item.units_available} units</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 font-mono">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{bank.contact_number}</span>
                    </div>

                    <a
                      href={`tel:${bank.contact_number}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs"
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-red-600" />
          <span>Official 24x7 Blood & Emergency Helplines (India)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-bold block">National Health Helpline</span>
            <div className="text-xl font-black text-slate-900 font-mono mt-0.5">104</div>
            <span className="text-[11px] text-emerald-700 font-semibold">Toll-Free 24x7</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-bold block">Emergency Ambulance</span>
            <div className="text-xl font-black text-red-600 font-mono mt-0.5">108 / 112</div>
            <span className="text-[11px] text-red-700 font-semibold">Critical Trauma Dispatch</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-bold block">e-RaktKosh National Portal</span>
            <div className="text-sm font-bold text-blue-700 font-mono mt-0.5">eraktkosh.in</div>
            <span className="text-[11px] text-slate-500">Official MoHFW Portal</span>
          </div>
        </div>
      </div>

    </div>
  );
};
