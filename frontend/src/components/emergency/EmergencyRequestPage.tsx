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
  ShieldAlert, 
  Navigation, 
  PhoneCall,
  UserCheck,
  Network
} from 'lucide-react';
import { StatusBadge } from '../StatusBadge';

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
  const [quantity, setQuantity] = useState<number>(4);
  const [emergencyLevel, setEmergencyLevel] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL'>('CRITICAL');
  const [location, setLocation] = useState<string>('Trauma Resuscitation Bay 1, Emergency Dept');
  const [requiredBy, setRequiredBy] = useState<string>('Immediate (within 30 mins)');
  const [clinicalNotes, setClinicalNotes] = useState<string>('Massive transfusion protocol initiated for acute hemorrhagic shock.');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedResponse, setSubmittedResponse] = useState<EmergencySOSResponse | null>(null);
  const [sourceRanking, setSourceRanking] = useState<any>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDispatchSuccess(false);

    try {
      const [sosRes, ranking] = await Promise.all([
        ApiService.triggerEmergencySOS({
          hospital_id: Number(selectedHospitalId),
          blood_group: bloodGroup,
          component: component,
          units_required: Number(quantity),
          urgency_level: emergencyLevel,
          clinical_notes: `${location} - ${requiredBy}: ${clinicalNotes}`,
        }),
        ApiService.getEmergencySourceRanking({
          hospital_id: Number(selectedHospitalId),
          blood_group: bloodGroup,
          component: component,
          units_required: Number(quantity),
          emergency_level: emergencyLevel,
        }).catch(() => null),
      ]);

      setSubmittedResponse(sosRes);
      setSourceRanking(ranking);
    } catch (err: any) {
      setError(err.message || 'Failed to submit emergency blood requisition');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDispatch = async (rec: any) => {
    if (!submittedResponse) return;
    setLoading(true);
    try {
      await ApiService.acceptEmergencyRecommendation(
        submittedResponse.emergency_request_id,
        rec.blood_bank_id,
        quantity
      );
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
      alert(`Dispatch confirmation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider mb-1">
              Priority Clinical Protocol &bull; LifeLink Emergency
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              LifeLink Emergency Coordination
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Coordinate urgent blood requirements across the connected hospital network.
            </p>
          </div>
        </div>
      </div>

      {/* Triage Request Form */}
      {!submittedResponse ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Emergency Level Tiers */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Emergency Triage Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { level: 'CRITICAL', label: 'CRITICAL (Immediate)', color: 'border-red-500 bg-red-50 text-red-800' },
                { level: 'HIGH', label: 'HIGH (< 2 Hours)', color: 'border-amber-500 bg-amber-50 text-amber-800' },
                { level: 'MEDIUM', label: 'MEDIUM (< 6 Hours)', color: 'border-blue-500 bg-blue-50 text-blue-800' },
                { level: 'NORMAL', label: 'NORMAL (Elective)', color: 'border-slate-300 bg-slate-50 text-slate-800' },
              ].map((t) => (
                <button
                  key={t.level}
                  type="button"
                  onClick={() => setEmergencyLevel(t.level as any)}
                  className={`p-3 rounded-xl border text-xs font-black transition-all cursor-pointer text-left ${
                    emergencyLevel === t.level
                      ? `${t.color} ring-2 ring-red-500 shadow-xs`
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Facility, Blood Group & Component */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Requesting Hospital
              </label>
              <select
                value={selectedHospitalId}
                onChange={(e) => setSelectedHospitalId(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium cursor-pointer"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold text-red-600 cursor-pointer"
              >
                {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Blood Component
              </label>
              <select
                value={component}
                onChange={(e) => setComponent(e.target.value as ComponentType)}
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

          {/* Quantity, Location & Required By */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Units Required
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Ward / Specific Bay
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. ICU Bay 4"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Required By Timeline
              </label>
              <input
                type="text"
                value={requiredBy}
                onChange={(e) => setRequiredBy(e.target.value)}
                placeholder="e.g. Within 45 minutes"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Clinical Indication & Cross-Match Notes
            </label>
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-medium"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Dispatches multi-source requisition across regional blood network.
            </span>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting Requisition...' : 'Submit Emergency Request'}</span>
            </button>
          </div>

        </form>
      ) : (
        /* Results View After Submission */
        <div className="space-y-6">
          
          {/* Submission Status Confirmation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                  REQUEST BROADCAST ACTIVE
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  ID: #{submittedResponse.emergency_request_id}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {quantity} Units {bloodGroup} {component.replace(/_/g, ' ')}
              </h3>
              <p className="text-xs text-slate-500">
                {submittedResponse.clinical_decision_support_disclaimer}
              </p>
            </div>

            <button
              onClick={() => setSubmittedResponse(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer"
            >
              New Emergency Request
            </button>
          </div>

          {dispatchSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Emergency dispatch confirmed! Laboratory physical reserve holds units for rapid ambulance transit.
              </span>
            </div>
          )}

          {/* Multi-Source Ranked Recommendations */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>AI Multi-Source Facility Recommendations ({submittedResponse.recommendations.length})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submittedResponse.recommendations.map((rec) => (
                <div
                  key={rec.rank}
                  className="health-card p-5 space-y-3.5 border border-slate-200 hover:border-slate-300 relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          #{rec.rank}
                        </span>
                        <h5 className="font-extrabold text-sm text-slate-900">{rec.blood_bank_name}</h5>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{rec.district}</p>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      Score: {rec.overall_match_score}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Distance</span>
                      <strong className="text-slate-800 font-bold">{rec.distance_km} km</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">ETA</span>
                      <strong className="text-emerald-700 font-bold">~{rec.estimated_transit_mins} mins</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Confirmed Stock</span>
                      <strong className="text-slate-800 font-bold">{rec.confirmed_units} Units</strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                    <p className="font-medium">{rec.explanation}</p>
                    <p className="text-red-700 font-semibold">{rec.recommended_action}</p>
                  </div>

                  <button
                    onClick={() => handleConfirmDispatch(rec)}
                    disabled={loading || dispatchSuccess}
                    className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {dispatchSuccess ? 'Dispatch Reserved' : 'Accept & Dispatch Units'}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
