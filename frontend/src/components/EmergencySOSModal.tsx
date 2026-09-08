import React, { useState } from 'react';
import { BloodGroup, ComponentType, EmergencySOSResponse, FacilityRecommendation, Hospital } from '../types';
import { ApiService } from '../services/api';
import { 
  AlertTriangle, 
  X, 
  Send, 
  Sparkles, 
  CheckCircle, 
  ShieldAlert, 
  Navigation, 
  Clock, 
  ThermometerSnowflake 
} from 'lucide-react';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitals: Hospital[];
  onDispatchConfirmed: (dispatch: {
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    units: number;
    bloodGroup: string;
  }) => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  hospitals,
  onDispatchConfirmed,
}) => {
  const [selectedHospitalId, setSelectedHospitalId] = useState<number>(hospitals[0]?.id || 1);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [component, setComponent] = useState<ComponentType>('PACKED_RED_BLOOD_CELLS');
  const [units, setUnits] = useState<number>(4);
  const [urgency, setUrgency] = useState<string>('CRITICAL_IMMEDIATE');
  const [notes, setNotes] = useState<string>('Polytrauma ICU admission with acute hemorrhagic shock.');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sosResult, setSosResult] = useState<EmergencySOSResponse | null>(null);
  const [selectedRec, setSelectedRec] = useState<FacilityRecommendation | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmitSOS = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDispatchSuccess(false);

    try {
      const res = await ApiService.triggerEmergencySOS({
        hospital_id: Number(selectedHospitalId),
        blood_group: bloodGroup,
        component: component,
        units_required: Number(units),
        urgency_level: urgency,
        clinical_notes: notes,
      });
      setSosResult(res);
      if (res.recommendations.length > 0) {
        setSelectedRec(res.recommendations[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to trigger emergency SOS');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDispatch = async () => {
    if (!sosResult || !selectedRec) return;
    setLoading(true);

    try {
      await ApiService.acceptEmergencyRecommendation(
        sosResult.emergency_request_id,
        selectedRec.blood_bank_id,
        units
      );
      setDispatchSuccess(true);

      const targetHospital = hospitals.find((h) => h.id === Number(selectedHospitalId));
      if (targetHospital) {
        onDispatchConfirmed({
          fromLat: targetHospital.latitude + 0.015,
          fromLng: targetHospital.longitude - 0.012,
          toLat: targetHospital.latitude,
          toLng: targetHospital.longitude,
          units: units,
          bloodGroup: bloodGroup,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to confirm dispatch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-8 text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-red-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                LifeLink Emergency Coordination
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wider">
                  Critical Priority
                </span>
              </h3>
              <p className="text-xs text-white/80">Coordinate urgent blood requirements across the connected hospital network</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!sosResult ? (
            /* SOS Request Formulation Form */
            <form onSubmit={handleSubmitSOS} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Requesting Hospital</label>
                  <select
                    value={selectedHospitalId}
                    onChange={(e) => setSelectedHospitalId(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium cursor-pointer"
                  >
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Urgency Triage Level</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="CRITICAL_IMMEDIATE">Critical Immediate (Massive Hemorrhage / Trauma)</option>
                    <option value="URGENT_UNDER_4H">Urgent (Under 4 Hours - ICU / Severe Anemia)</option>
                    <option value="ELECTIVE_PLANNED">Elective Planned (Scheduled Surgery Reserve)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Blood Group Required</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map((bg) => (
                      <button
                        type="button"
                        key={bg}
                        onClick={() => setBloodGroup(bg)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          bloodGroup === bg 
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
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Component Type</label>
                  <select
                    value={component}
                    onChange={(e) => setComponent(e.target.value as ComponentType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="PACKED_RED_BLOOD_CELLS">Packed Red Blood Cells (PRBC)</option>
                    <option value="PLATELET_CONCENTRATE">Platelet Concentrate</option>
                    <option value="FRESH_FROZEN_PLASMA">Fresh Frozen Plasma (FFP)</option>
                    <option value="WHOLE_BLOOD">Whole Blood</option>
                    <option value="CRYOPRECIPITATE">Cryoprecipitate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Units Required</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={units}
                    onChange={(e) => setUnits(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Clinical Context (Anonymized)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Polytrauma resuscitation"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Clinical Safety Notice:</strong> AI allocation engine scores distance, shelf-life, and physical confirmation. Final cross-match and patient verification remains with the treating clinician.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Evaluating Network Routing...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Execute Emergency AI Routing</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Recommendations & AI Explainability View */
            <div className="space-y-4 text-xs">
              {dispatchSuccess ? (
                <div className="p-6 text-center rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="text-base font-black text-slate-900">Emergency Blood Dispatch Authorized</h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    {units} units of {bloodGroup} {component.replace(/_/g, ' ')} dispatched from <strong>{selectedRec?.blood_bank_name}</strong>. Transit corridor established with estimated arrival in {selectedRec?.estimated_transit_mins} mins.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-2 px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer"
                  >
                    Return to Transfusion Portal
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-700">Ranked Facility Matches ({sosResult.recommendations.length})</span>
                    <span className="text-[11px] text-slate-500 font-mono">Request #{sosResult.emergency_request_id}</span>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {sosResult.recommendations.map((rec) => (
                      <div
                        key={rec.rank}
                        onClick={() => setSelectedRec(rec)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          selectedRec?.blood_bank_id === rec.blood_bank_id
                            ? 'border-red-500 bg-red-50/50 ring-2 ring-red-500'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold text-[11px] flex items-center justify-center">
                                #{rec.rank}
                              </span>
                              <h5 className="font-bold text-slate-900">{rec.blood_bank_name}</h5>
                            </div>
                            <p className="text-slate-500 text-[11px] mt-0.5">{rec.district}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            Score: {rec.overall_match_score}%
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-lg border border-slate-100 mt-2 text-[11px]">
                          <div>
                            <span className="text-slate-400 block">Distance</span>
                            <strong className="text-slate-800">{rec.distance_km} km</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block">ETA</span>
                            <strong className="text-emerald-700 font-bold">~{rec.estimated_transit_mins} mins</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Confirmed Units</span>
                            <strong className="text-slate-800">{rec.confirmed_units} Units</strong>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 mt-2">{rec.explanation}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setSosResult(null)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirmDispatch}
                      disabled={loading || !selectedRec}
                      className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Confirming Dispatch...' : `Authorize Dispatch (${selectedRec?.blood_bank_name})`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
