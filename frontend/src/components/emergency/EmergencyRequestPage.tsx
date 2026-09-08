import React, { useState } from 'react';
import { BloodGroup, ComponentType, EmergencySOSResponse, Hospital } from '../../types';
import { ApiService } from '../../services/api';
import { 
  AlertTriangle, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building2, 
  Navigation, 
  PhoneCall,
  Activity,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface EmergencyRequestPageProps {
  hospitals: Hospital[];
  onDispatchConfirmed: (dispatch: any) => void;
}

export const EmergencyRequestPage: React.FC<EmergencyRequestPageProps> = ({
  hospitals,
  onDispatchConfirmed,
}) => {
  const [selectedHospitalId, setSelectedHospitalId] = useState<number>(hospitals[0]?.id || 1);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [component, setComponent] = useState<ComponentType>('PACKED_RED_BLOOD_CELLS');
  const [quantity, setQuantity] = useState<number>(2);
  const [patientLocation, setPatientLocation] = useState<string>('New Delhi');
  const [hospitalName, setHospitalName] = useState<string>('AIIMS Apex Trauma Center');
  const [emergencyLevel, setEmergencyLevel] = useState<'Critical' | 'Urgent' | 'Standard'>('Critical');
  const [additionalNotes, setAdditionalNotes] = useState<string>('Accident case - Urgent hemorrhagic resuscitation');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedResponse, setSubmittedResponse] = useState<EmergencySOSResponse | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<boolean>(false);

  // AI Matched Nearby Centres (from reference Screen 4)
  const nearbyAiCentres = [
    {
      name: 'Safdarjung Hospital Regional Blood Centre',
      distance: '4.1 km',
      units: 8,
      eta: '12 mins',
      status: 'Available',
      phone: '+91 11 26165060'
    },
    {
      name: 'AIIMS Main Blood Bank & Transfusion Medicine',
      distance: '2.3 km',
      units: 6,
      eta: '8 mins',
      status: 'Available',
      phone: '+91 11 26588500'
    },
    {
      name: 'Lok Nayak Hospital (LNJP) Blood Centre',
      distance: '5.6 km',
      units: 4,
      eta: '15 mins',
      status: 'Critical Stock',
      phone: '+91 11 23236000'
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const sosRes = await ApiService.triggerEmergencySOS({
        hospital_id: Number(selectedHospitalId),
        blood_group: bloodGroup,
        component: component,
        units_required: Number(quantity),
        urgency_level: emergencyLevel.toUpperCase() as any,
        clinical_notes: `${patientLocation} (${hospitalName}): ${additionalNotes}`,
      });

      setSubmittedResponse(sosRes);
      setDispatchSuccess(true);

      const targetHosp = hospitals.find((h) => h.id === Number(selectedHospitalId));
      if (targetHosp) {
        onDispatchConfirmed({
          fromLat: targetHosp.latitude + 0.012,
          fromLng: targetHosp.longitude - 0.015,
          toLat: targetHosp.latitude,
          toLng: targetHosp.longitude,
          units: quantity,
          bloodGroup: bloodGroup,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit emergency blood requisition');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Alert (Reference Screen 4) */}
      <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Emergency Blood Request
            </h1>
            <p className="text-xs text-slate-500">
              Get immediate assistance • AI-optimized nearest inventory dispatch
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
          <span>Priority Rapid Transit Active</span>
        </div>
      </div>

      {/* Main Grid: Form Left & AI Matches Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
              Patient Requisition Details
            </h2>
            <span className="text-[11px] font-bold text-slate-500">
              Form 28-C Protocol
            </span>
          </div>

          {dispatchSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong>Emergency Broadcast Transmitted!</strong>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Nearest blood centres notified. Transit corridor dispatch triggered.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Blood Group */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Blood Group
                </label>
                <div className="relative">
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-red-600 pr-8 cursor-pointer"
                  >
                    <option value="O-">O- (Universal Donor)</option>
                    <option value="O+">O+</option>
                    <option value="A-">A-</option>
                    <option value="A+">A+</option>
                    <option value="B-">B-</option>
                    <option value="B+">B+</option>
                    <option value="AB-">AB-</option>
                    <option value="AB+">AB+</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Component */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Component
                </label>
                <div className="relative">
                  <select
                    value={component}
                    onChange={(e) => setComponent(e.target.value as ComponentType)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-red-600 pr-8 cursor-pointer"
                  >
                    <option value="PACKED_RED_BLOOD_CELLS">Packed Red Blood Cells (PRBC)</option>
                    <option value="PLATELET_CONCENTRATE">Platelet Concentrate</option>
                    <option value="FRESH_FROZEN_PLASMA">Fresh Frozen Plasma (FFP)</option>
                    <option value="WHOLE_BLOOD">Whole Blood</option>
                    <option value="CRYOPRECIPITATE">Cryoprecipitate</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Required Units */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Required Units
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Patient Location */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Patient Location
                </label>
                <input
                  type="text"
                  value={patientLocation}
                  onChange={(e) => setPatientLocation(e.target.value)}
                  placeholder="e.g. New Delhi, Central Trauma"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Hospital (Optional) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Hospital (Optional)
                </label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. AIIMS, Safdarjung"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Emergency Level */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Emergency Level
                </label>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-extrabold">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>Critical Priority</span>
                  </span>
                </div>
              </div>

            </div>

            {/* Additional Information */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Additional Information
              </label>
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Accident case - Urgent blood transfusion needed"
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-red-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-red-950/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{loading ? 'Transmitting Requisition...' : 'Request Emergency Blood'}</span>
            </button>

          </form>
        </div>

        {/* Right: Nearby Blood Centres (AI Matched) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-red-600" />
              <span>Nearby Blood Centres (AI Matched)</span>
            </h3>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live Transit
            </span>
          </div>

          <div className="space-y-3">
            {nearbyAiCentres.map((centre, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-red-300 bg-slate-50/50 hover:bg-white transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 leading-snug">
                      {centre.name}
                    </h4>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{centre.distance} away</span>
                    </span>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className="inline-block font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {centre.units} units
                    </span>
                    <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-0.5 justify-end mt-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{centre.eta}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <a
                    href={`tel:${centre.phone}`}
                    className="font-mono text-[11px] font-bold text-slate-700 hover:text-red-700 flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3 text-red-600" />
                    <span>{centre.phone}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHospitalId(idx + 1);
                      handleSubmit({ preventDefault: () => {} } as any);
                    }}
                    className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-600 text-red-700 hover:text-white font-bold text-[11px] transition-all cursor-pointer"
                  >
                    Dispatch Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cold-Chain Assurance Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              All dispatch units transported in temperature-monitored smart containers maintaining strict 2°C–6°C cold chain.
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Emergency Help Bar (Matching Screen 4 in Reference) */}
      <div className="bg-red-600 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center font-black shrink-0 shadow-xs">
            <PhoneCall className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black tracking-tight">
              Need Immediate Emergency Help?
            </h4>
            <p className="text-xs text-red-100">
              National Health Mission 24x7 Dedicated Medical Coordination Lines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:104"
            className="px-5 py-2.5 rounded-xl bg-white text-red-700 hover:bg-red-50 font-black text-xs sm:text-sm tracking-wide transition-all shadow-xs flex items-center gap-2"
          >
            <span>Call 104 / 108</span>
            <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-sans font-bold">24x7 Toll-Free</span>
          </a>
        </div>
      </div>

    </div>
  );
};
