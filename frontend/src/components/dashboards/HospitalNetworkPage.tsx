import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Send, 
  Inbox, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Plus, 
  RefreshCw, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCheck,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Search
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { HospitalNetworkOverview, HospitalBloodRequest } from '../../types';

export const HospitalNetworkPage: React.FC = () => {
  const [overview, setOverview] = useState<HospitalNetworkOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'DISCOVERED' | 'REQUESTS'>('REQUESTS');

  // New Request Modal state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newRequest, setNewRequest] = useState({
    requesting_hospital_id: 1,
    target_hospital_id: 0,
    blood_group: 'O-',
    component: 'PACKED_RED_BLOOD_CELLS',
    quantity: 3,
    emergency_level: 'CRITICAL',
    notes: ''
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getHospitalNetworkOverview();
      setOverview(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to hospital network');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ApiService.createHospitalRequest({
        requesting_hospital_id: Number(newRequest.requesting_hospital_id),
        target_hospital_id: newRequest.target_hospital_id > 0 ? Number(newRequest.target_hospital_id) : undefined,
        blood_group: newRequest.blood_group,
        component: newRequest.component,
        quantity: Number(newRequest.quantity),
        emergency_level: newRequest.emergency_level,
        notes: newRequest.notes
      });
      setShowCreateModal(false);
      await fetchOverview();
    } catch (err: any) {
      alert(err.message || 'Error creating request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (id: number, hospId: number) => {
    try {
      await ApiService.acceptHospitalRequest(id, hospId, 'Accepting requisition; holding units in lab incubator');
      await fetchOverview();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReject = async (id: number, hospId: number) => {
    const reason = prompt('Please state the clinical reason for rejecting this requisition:');
    if (!reason) return;
    try {
      await ApiService.rejectHospitalRequest(id, hospId, reason);
      await fetchOverview();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleConfirmVerification = async (id: number) => {
    try {
      await ApiService.confirmHospitalRequest(id, 'Lab cross-match certification verified by clinical officer');
      await fetchOverview();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFulfill = async (id: number) => {
    try {
      await ApiService.fulfillHospitalRequest(id, 'Received and custody signed by emergency triage department');
      await fetchOverview();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading && !overview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-slate-400 font-medium">Scanning Hospital-to-Hospital Peer Sharing Network...</p>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="p-6 bg-red-950/30 border border-red-800/40 rounded-xl text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-2" />
        <p className="text-red-300 font-medium">{error || 'Unable to access network'}</p>
        <button
          onClick={fetchOverview}
          className="mt-4 px-4 py-2 bg-red-800/40 hover:bg-red-700/50 text-white rounded-lg text-sm transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold tracking-wide uppercase">
              Hospital-to-Hospital Network
            </span>
            <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-semibold tracking-wide">
              {overview.hospitals.length} Hospitals • {overview.blood_banks.length} Blood Banks
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">
            Inter-Hospital Resource-Sharing Network
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Direct peer-to-peer blood requisitioning and cross-match coordination between healthcare facilities and apex trauma centers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-rose-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Create Peer Request</span>
          </button>
          <button
            onClick={fetchOverview}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('REQUESTS')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'REQUESTS'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Active Requisitions ({overview.requests.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('DISCOVERED')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'DISCOVERED'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Discovered Healthcare Nodes ({overview.hospitals.length + overview.blood_banks.length})</span>
        </button>
      </div>

      {/* Tab Content: Active Requisitions */}
      {activeTab === 'REQUESTS' && (
        <div className="space-y-4">
          {overview.requests.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
              <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-300">No Active Peer Requisitions</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No hospital requisitions are currently in progress. Use "Create Peer Request" to dispatch an emergency requisition.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {overview.requests.map(req => {
                const isCritical = req.emergency_level === 'CRITICAL';
                const isPending = req.status === 'PENDING';
                const isVerification = req.status === 'VERIFICATION_REQUIRED';
                const isConfirmed = req.status === 'CONFIRMED';
                const isFulfilled = req.status === 'FULFILLED';
                const isRejected = req.status === 'REJECTED';

                return (
                  <div 
                    key={req.id}
                    className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-800/40">
                          {req.request_id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {req.emergency_level}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isPending ? 'bg-slate-800 text-slate-300' :
                          isVerification ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          isConfirmed ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          isFulfilled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex items-baseline space-x-2">
                        <span className="text-xl font-bold text-white">
                          {req.quantity} units {req.blood_group} {req.component.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center">
                          <span className="text-slate-500 mr-1">From:</span> 
                          <span className="text-white font-medium">{req.requesting_hospital_name}</span>
                        </span>
                        <span>→</span>
                        <span className="flex items-center">
                          <span className="text-slate-500 mr-1">Target:</span> 
                          <span className="text-cyan-300 font-medium">{req.target_hospital_name}</span>
                        </span>
                        <span className="text-slate-600">•</span>
                        <span>Created: {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {req.notes && (
                        <p className="text-xs text-slate-400 italic bg-slate-800/40 p-2 rounded-lg border border-slate-700/40">
                          Notes: {req.notes}
                        </p>
                      )}
                    </div>

                    {/* Workflow Action Buttons (Step 12) */}
                    <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleAccept(req.id, 2)}
                            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleReject(req.id, 2)}
                            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-red-950/40 text-red-400 border border-slate-700 rounded-xl text-xs font-semibold transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {isVerification && (
                        <button
                          onClick={() => handleConfirmVerification(req.id)}
                          className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-amber-900/30"
                        >
                          <CheckCheck className="w-4 h-4" />
                          <span>Confirm Cross-Match Verification</span>
                        </button>
                      )}

                      {isConfirmed && (
                        <button
                          onClick={() => handleFulfill(req.id)}
                          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-900/30"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm Delivery & Fulfill</span>
                        </button>
                      )}

                      {isFulfilled && (
                        <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-800/40">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Transfer Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Discovered Healthcare Nodes */}
      {activeTab === 'DISCOVERED' && (
        <div className="space-y-6">
          {/* Hospitals */}
          <div>
            <h3 className="text-base font-bold text-white mb-3 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Peer Hospitals & Apex Trauma Centers</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overview.hospitals.map(h => (
                <div key={h.id} className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold text-cyan-400">{h.district}, {h.state}</span>
                      <h4 className="text-base font-bold text-white mt-0.5">{h.name}</h4>
                    </div>
                    {h.has_trauma_center && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[10px] font-bold uppercase">
                        Apex Trauma
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex justify-around text-center text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">REPORTED</span>
                      <span className="font-bold text-white">{h.reported_units} units</span>
                    </div>
                    <div className="border-l border-slate-700 pl-3">
                      <span className="text-slate-400 block text-[10px]">CONFIRMED</span>
                      <span className="font-bold text-emerald-400">{h.confirmed_units} units</span>
                    </div>
                    <div className="border-l border-slate-700 pl-3">
                      <span className="text-slate-400 block text-[10px]">RESERVED</span>
                      <span className="font-bold text-amber-400">{h.reserved_units} units</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1 text-slate-500" /> {h.contact_number}</span>
                    <span>{h.bed_capacity} beds</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blood Banks */}
          <div>
            <h3 className="text-base font-bold text-white mb-3 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-rose-400" />
              <span>Regional Transfusion Centers & Blood Banks</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overview.blood_banks.map(b => (
                <div key={b.id} className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold text-rose-400">{b.district}, {b.state}</span>
                      <h4 className="text-base font-bold text-white mt-0.5">{b.name}</h4>
                    </div>
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-[10px] font-bold">
                      {b.cold_chain_verified ? 'Cold-Chain Certified' : 'Standard'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex justify-around text-center text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">AVAILABLE</span>
                      <span className="font-bold text-white">{b.total_units} units</span>
                    </div>
                    <div className="border-l border-slate-700 pl-3">
                      <span className="text-slate-400 block text-[10px]">CONFIRMED</span>
                      <span className="font-bold text-emerald-400">{b.confirmed_units}</span>
                    </div>
                    <div className="border-l border-slate-700 pl-3">
                      <span className="text-slate-400 block text-[10px]">RESERVED</span>
                      <span className="font-bold text-amber-400">{b.reserved_units}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1 text-slate-500" /> {b.contact_number}</span>
                    <span>Cap: {b.storage_capacity} units</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Peer Blood Request (Step 10 & 12) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-bold text-white">Create Peer Hospital Blood Request</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Requesting Hospital</label>
                <select
                  value={newRequest.requesting_hospital_id}
                  onChange={e => setNewRequest({ ...newRequest, requesting_hospital_id: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                >
                  {overview.hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Target Hospital (Optional - Leave for Network Broadcast)</label>
                <select
                  value={newRequest.target_hospital_id}
                  onChange={e => setNewRequest({ ...newRequest, target_hospital_id: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value={0}>Network Broadcast (All Nearby Facilities)</option>
                  {overview.hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Blood Group</label>
                  <select
                    value={newRequest.blood_group}
                    onChange={e => setNewRequest({ ...newRequest, blood_group: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-bold"
                  >
                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Component</label>
                  <select
                    value={newRequest.component}
                    onChange={e => setNewRequest({ ...newRequest, component: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="PACKED_RED_BLOOD_CELLS">Packed Red Blood Cells</option>
                    <option value="PLATELET_CONCENTRATE">Platelet Concentrate</option>
                    <option value="FRESH_FROZEN_PLASMA">Fresh Frozen Plasma</option>
                    <option value="WHOLE_BLOOD">Whole Blood</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Required Units</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newRequest.quantity}
                    onChange={e => setNewRequest({ ...newRequest, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Emergency Level</label>
                  <select
                    value={newRequest.emergency_level}
                    onChange={e => setNewRequest({ ...newRequest, emergency_level: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 font-bold text-red-400"
                  >
                    <option value="CRITICAL">CRITICAL (Immediate Trauma)</option>
                    <option value="URGENT">URGENT (&lt; 2 Hours)</option>
                    <option value="ROUTINE">ROUTINE (Elective / Scheduled)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Clinical Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Major trauma OT surgery; uncrossmatched emergency release requested."
                  value={newRequest.notes}
                  onChange={e => setNewRequest({ ...newRequest, notes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition shadow-lg shadow-rose-900/40"
                >
                  {submitting ? 'Broadcasting...' : 'Broadcast Requisition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
