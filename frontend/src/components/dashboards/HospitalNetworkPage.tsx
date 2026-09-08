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
  Search,
  Network
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
        requesting_hospital_id: newRequest.requesting_hospital_id,
        target_hospital_id: newRequest.target_hospital_id > 0 ? newRequest.target_hospital_id : undefined,
        blood_group: newRequest.blood_group,
        component: newRequest.component,
        quantity: newRequest.quantity,
        emergency_level: newRequest.emergency_level,
        notes: newRequest.notes
      });
      setShowCreateModal(false);
      fetchOverview();
    } catch (err: any) {
      alert(`Requisition creation failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await ApiService.acceptHospitalRequest(id, 2, 'Accepted via SmartBlood H2H peer allocation network.');
      fetchOverview();
    } catch (err: any) {
      alert(`Accept failed: ${err.message}`);
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Specify rejection reason:', 'Insufficient safety buffer for intensive care unit');
    if (!reason) return;
    try {
      await ApiService.rejectHospitalRequest(id, 2, reason);
      fetchOverview();
    } catch (err: any) {
      alert(`Reject failed: ${err.message}`);
    }
  };

  const handleFulfill = async (id: number) => {
    try {
      await ApiService.fulfillHospitalRequest(id, 'Blood units delivered and cross-matched successfully.');
      fetchOverview();
    } catch (err: any) {
      alert(`Fulfill failed: ${err.message}`);
    }
  };

  if (loading && !overview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3 bg-white p-8 rounded-2xl border border-slate-200">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-slate-600 font-medium text-xs">Scanning Hospital-to-Hospital Peer Sharing Network...</p>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-red-600 mx-auto" />
        <p className="text-red-800 font-semibold text-xs">{error || 'Unable to access network'}</p>
        <button
          onClick={fetchOverview}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">
              Hospital-to-Hospital Network
            </span>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-xs font-bold">
              {overview.hospitals.length} Hospitals &bull; {overview.blood_banks.length} Blood Banks
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
            Inter-Hospital Resource-Sharing Network
          </h2>
          <p className="text-slate-500 text-xs mt-0.5 max-w-2xl">
            Direct peer-to-peer blood requisitioning and cross-match coordination between healthcare facilities and apex trauma centers.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Peer Request</span>
          </button>
          <button
            onClick={fetchOverview}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('REQUESTS')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            activeTab === 'REQUESTS'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Active Requisitions ({overview.requests.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('DISCOVERED')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition cursor-pointer ${
            activeTab === 'DISCOVERED'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
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
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <Inbox className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No Active Peer Requisitions</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No hospital requisitions are currently in progress. Use "Create Peer Request" to dispatch an emergency requisition.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {overview.requests.map(req => {
                const isCritical = req.emergency_level === 'CRITICAL';
                const isPending = req.status === 'PENDING' || req.status === 'SEARCHING';
                const isAccepted = req.status === 'ACCEPTED' || req.status === 'MATCH_FOUND';
                const isFulfilled = req.status === 'FULFILLED';

                return (
                  <div
                    key={req.id}
                    className="health-card p-5 space-y-3.5 border border-slate-200 hover:border-slate-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${
                          isCritical ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.emergency_level}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-700">{req.request_id}</span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-xs text-slate-500">
                          {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        isFulfilled ? 'bg-emerald-100 text-emerald-800' :
                        isAccepted ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400 block uppercase font-bold">Requesting Facility</span>
                        <strong className="text-sm text-slate-900 font-extrabold">{req.requesting_hospital_name}</strong>
                        <span className="text-slate-500 block">{req.requesting_hospital_district}</span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 block uppercase font-bold">Requisition Details</span>
                        <strong className="text-base text-red-600 font-mono font-black">{req.quantity} Units</strong>
                        <span className="text-slate-700 font-bold block">{req.blood_group} ({req.component.replace(/_/g, ' ')})</span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 block uppercase font-bold">Targeted Peer</span>
                        <span className="text-slate-800 font-semibold block">{req.target_hospital_name || 'Open Regional Broadcast'}</span>
                        <span className="text-slate-400 block italic">{req.notes || 'Emergency ICU reserve requisition'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500">
                        Peer verification required prior to cross-match release.
                      </span>

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleReject(req.id)}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleAccept(req.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                            >
                              Accept Requisition
                            </button>
                          </>
                        )}

                        {isAccepted && (
                          <button
                            onClick={() => handleFulfill(req.id)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                          >
                            Mark Fulfilled
                          </button>
                        )}
                      </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overview.hospitals.map(h => (
            <div key={h.id} className="health-card p-5 space-y-3 border border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{h.name}</h4>
                  <p className="text-xs text-slate-500">{h.district}, {h.state}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {h.has_trauma_center ? 'APEX TRAUMA' : 'HOSPITAL'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Bed Capacity</span>
                  <strong className="text-slate-800 font-mono">{h.bed_capacity} Beds</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Confirmed Stock</span>
                  <strong className="text-emerald-700 font-mono">{h.confirmed_units} Units</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Reserved Stock</span>
                  <strong className="text-blue-700 font-mono">{h.reserved_units} Units</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href={`tel:${h.contact_number}`}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{h.contact_number}</span>
                </a>

                <button
                  onClick={() => {
                    setNewRequest({ ...newRequest, target_hospital_id: h.id });
                    setShowCreateModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                >
                  Request Stock
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Peer Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Initiate Inter-Hospital Peer Requisition</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">&times;</button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Peer Hospital</label>
                <select
                  value={newRequest.target_hospital_id}
                  onChange={e => setNewRequest({ ...newRequest, target_hospital_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  <option value={0}>All Available Regional Hospitals (Open Broadcast)</option>
                  {overview.hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name} ({h.district})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={newRequest.blood_group}
                    onChange={e => setNewRequest({ ...newRequest, blood_group: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-red-600"
                  >
                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Units Required</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={newRequest.quantity}
                    onChange={e => setNewRequest({ ...newRequest, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Component</label>
                <select
                  value={newRequest.component}
                  onChange={e => setNewRequest({ ...newRequest, component: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="PACKED_RED_BLOOD_CELLS">Packed Red Blood Cells (PRBC)</option>
                  <option value="PLATELET_CONCENTRATE">Platelet Concentrate</option>
                  <option value="FRESH_FROZEN_PLASMA">Fresh Frozen Plasma</option>
                  <option value="WHOLE_BLOOD">Whole Blood</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Indication / Urgent Notes</label>
                <textarea
                  rows={3}
                  value={newRequest.notes}
                  onChange={e => setNewRequest({ ...newRequest, notes: e.target.value })}
                  placeholder="e.g. Pediatric trauma or massive transfusion protocol"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
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
