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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-blood-600/40 shadow-2xl shadow-blood-950/50 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-blood-950/80 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blood-600/30 border border-blood-500 flex items-center justify-center text-blood-400">
              <AlertTriangle className="w-5 h-5 text-blood-400 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Emergency Blood SOS Coordination
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blood-500/20 text-blood-300 border border-blood-500/30">
                  Critical Priority
                </span>
              </h3>
              <p className="text-xs text-slate-400">Multi-criteria spatial matching & cold-chain verification engine</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!sosResult ? (
            /* SOS Request Formulation Form */
            <form onSubmit={handleSubmitSOS} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Requesting Hospital Facility</label>
                  <select
                    value={selectedHospitalId}
                    onChange={(e) => setSelectedHospitalId(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blood-500"
                  >
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Urgency Triage Level</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blood-500"
                  >
                    <option value="CRITICAL_IMMEDIATE">Critical Immediate (Massive Hemorrhage / Active Trauma)</option>
                    <option value="URGENT_UNDER_4H">Urgent (Under 4 Hours - ICU / Severe Anemia)</option>
                    <option value="ELECTIVE_PLANNED">Elective Planned (Scheduled Surgery Reserve)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Blood Group Required</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map((bg) => (
                      <button
                        type="button"
                        key={bg}
                        onClick={() => setBloodGroup(bg)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                          bloodGroup === bg 
                            ? 'bg-blood-600 text-white shadow-md shadow-blood-900/50 border border-blood-400' 
                            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Component Type</label>
                  <select
                    value={component}
                    onChange={(e) => setComponent(e.target.value as ComponentType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blood-500"
                  >
                    <option value="PACKED_RED_BLOOD_CELLS">Packed Red Blood Cells (PRBC)</option>
                    <option value="PLATELET_CONCENTRATE">Platelet Concentrate (RDP / SDP)</option>
                    <option value="FRESH_FROZEN_PLASMA">Fresh Frozen Plasma (FFP)</option>
                    <option value="WHOLE_BLOOD">Whole Blood</option>
                    <option value="CRYOPRECIPITATE">Cryoprecipitate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Units Required (1 - 20)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={units}
                    onChange={(e) => setUnits(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blood-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Clinical Context (Anonymized)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Polytrauma resuscitation"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blood-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-850 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Clinical Safety Notice:</strong> AI allocation engine scores distance, shelf-life, and physical confirmation. Final cross-match and patient verification remains with the treating clinician.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blood-600 to-blood-700 hover:from-blood-500 hover:to-blood-600 text-white font-semibold text-xs shadow-lg shadow-blood-900/40 transition-all disabled:opacity-50"
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
            <div className="space-y-5">
              
              {dispatchSuccess ? (
                <div className="p-6 text-center rounded-xl bg-emerald-950/50 border border-emerald-500/50 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Emergency Blood Dispatch Authorized</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    {units} units of {bloodGroup} {component} dispatched from <strong>{selectedRec?.blood_bank_name}</strong>. Transit corridor established with estimated arrival in {selectedRec?.estimated_transit_mins} mins.
                  </p>
                  <button
                    onClick={() => {
                      setSosResult(null);
                      onClose();
                    }}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Return to Live Command Center
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        AI Multi-Criteria Ranked Blood Centers ({sosResult.recommendations.length} Candidates)
                      </h4>
                      <p className="text-xs text-slate-400">
                        Ranked by confirmed stock sufficiency, Haversine proximity, cold chain, and therapeutic shelf life.
                      </p>
                    </div>
                    <button
                      onClick={() => setSosResult(null)}
                      className="text-xs text-slate-400 hover:text-slate-200 underline"
                    >
                      Modify Parameters
                    </button>
                  </div>

                  {/* Recommendations List */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {sosResult.recommendations.map((rec) => {
                      const isSelected = selectedRec?.blood_bank_id === rec.blood_bank_id;
                      return (
                        <div
                          key={rec.blood_bank_id}
                          onClick={() => setSelectedRec(rec)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-slate-800/90 border-blood-500 shadow-md shadow-blood-950/40' 
                              : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                                rec.rank === 1 ? 'bg-amber-500 text-black' : 'bg-slate-700 text-white'
                              }`}>
                                #{rec.rank}
                              </span>
                              <div>
                                <h5 className="font-bold text-sm text-white">{rec.blood_bank_name}</h5>
                                <p className="text-xs text-slate-400">{rec.district}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                                Match: {rec.overall_match_score}%
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-2 border-t border-slate-750 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Navigation className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span>{rec.distance_km} km away</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>~{rec.estimated_transit_mins} mins transit</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{rec.confirmed_units} Confirmed Units</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-cyan-300">
                              <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>{rec.shelf_life_status}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed AI Explainability Box for Selected Recommendation (Rule 14) */}
                  {selectedRec && (
                    <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-purple-300">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>AI Decision-Support Rationale for #{selectedRec.rank} Choice</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {selectedRec.explanation}
                      </p>
                      <div className="text-[11px] text-purple-400 font-mono">
                        {selectedRec.recommended_action}
                      </div>
                    </div>
                  )}

                  {/* Clinical Disclaimer (Rule 9) */}
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 text-[11px]">
                    <strong>Clinical Decision Support Advisory:</strong> {sosResult.clinical_decision_support_disclaimer}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={handleConfirmDispatch}
                      disabled={loading || !selectedRec}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Authorize & Dispatch {units} Units Now</span>
                    </button>
                  </div>
                </>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
