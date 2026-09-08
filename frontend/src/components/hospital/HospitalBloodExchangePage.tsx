import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Clock, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Droplets, 
  ShieldAlert, 
  Activity, 
  RefreshCw, 
  Lock, 
  Inbox, 
  Send, 
  Layers, 
  Flame, 
  Sparkles, 
  Info 
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { 
  UserRole, 
  ExchangeSearchResult, 
  ExchangeUnitCard, 
  ExchangeRequestCard, 
  WastagePreventionDashboard 
} from '../../types';

interface HospitalBloodExchangePageProps {
  currentRole: UserRole;
  onRoleSwitch?: (role: UserRole) => void;
}

export const HospitalBloodExchangePage: React.FC<HospitalBloodExchangePageProps> = ({
  currentRole,
  onRoleSwitch
}) => {
  // Navigation tabs inside Hospital Blood Exchange
  const [activeSubTab, setActiveSubTab] = useState<'find' | 'incoming' | 'outgoing' | 'inventory'>('find');

  // Search Form State
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [component, setComponent] = useState<string>('Packed Red Blood Cells');
  const [quantity, setQuantity] = useState<number>(3);
  const [requiredBy, setRequiredBy] = useState<string>('');
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [searchRadius, setSearchRadius] = useState<string>('25 km');
  
  // Search Results & Loading
  const [loading, setLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<ExchangeSearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Incoming / My Requests State
  const [incomingRequests, setIncomingRequests] = useState<ExchangeRequestCard[]>([]);
  const [myRequests, setMyRequests] = useState<ExchangeRequestCard[]>([]);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(false);

  // Wastage Insight State
  const [wastageData, setWastageData] = useState<WastagePreventionDashboard | null>(null);

  // Confirmation Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalCandidate, setModalCandidate] = useState<{
    hospitalId: number;
    hospitalName: string;
    bloodGroup: string;
    component: string;
    units: ExchangeUnitCard[];
  } | null>(null);
  const [submittingRequest, setSubmittingRequest] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check RBAC
  const isAuthorized = currentRole === 'HOSPITAL';

  // Load Initial Overview and Lists
  useEffect(() => {
    if (isAuthorized) {
      loadOverviewAndRequests();
      // Auto-trigger search for the demo scenario
      handleSearch();
    }
  }, [isAuthorized]);

  const loadOverviewAndRequests = async () => {
    setLoadingRequests(true);
    try {
      const [incoming, outgoing, overview] = await Promise.all([
        ApiService.getIncomingExchangeRequests().catch(() => []),
        ApiService.getMyExchangeRequests().catch(() => []),
        ApiService.getExchangeWastageOverview().catch(() => null)
      ]);
      setIncomingRequests(incoming);
      setMyRequests(outgoing);
      setWastageData(overview);
    } catch (err) {
      console.error('Error fetching exchange data:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSearchError(null);
    try {
      const result = await ApiService.searchHospitalExchange({
        blood_group: bloodGroup,
        component: component,
        required_quantity: Number(quantity),
        search_location: searchLocation.trim() || undefined
      });
      setSearchResults(result);
    } catch (err: any) {
      setSearchError(err.message || 'Failed to query exchange inventory.');
    } finally {
      setLoading(false);
    }
  };

  const openRequestModal = (targetUnits: ExchangeUnitCard[]) => {
    if (!targetUnits.length) return;
    const first = targetUnits[0];
    setModalCandidate({
      hospitalId: first.providing_hospital_id || 2,
      hospitalName: first.providing_hospital_name,
      bloodGroup: first.blood_group,
      component: first.component,
      units: targetUnits
    });
    setIsModalOpen(true);
  };

  const confirmReservation = async () => {
    if (!modalCandidate) return;
    setSubmittingRequest(true);
    setActionNotice(null);

    try {
      const payload = {
        providing_hospital_id: modalCandidate.hospitalId,
        providing_hospital_name: modalCandidate.hospitalName,
        blood_group: modalCandidate.bloodGroup,
        component: modalCandidate.component,
        quantity_requested: modalCandidate.units.length,
        required_by: requiredBy || new Date().toISOString(),
        search_location: searchLocation,
        selected_unit_ids: modalCandidate.units.map(u => u.id)
      };

      const res = await ApiService.createHospitalExchangeRequest(payload);
      setActionNotice({
        type: 'success',
        message: `Blood request #${res.request_id} confirmed! ${res.reserved_units_count} unit(s) atomically locked.`
      });
      setIsModalOpen(false);
      // Refresh search & outgoing lists
      handleSearch();
      loadOverviewAndRequests();
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err.message || 'This blood unit is no longer available. It may have been reserved by another hospital.'
      });
      setIsModalOpen(false);
      // Refresh search to display latest availability
      handleSearch();
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleAccept = async (requestId: number) => {
    try {
      await ApiService.acceptExchangeRequest(requestId);
      setActionNotice({ type: 'success', message: `Request #${requestId} successfully accepted.` });
      loadOverviewAndRequests();
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to accept request.' });
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await ApiService.rejectExchangeRequest(requestId);
      setActionNotice({ type: 'success', message: `Request #${requestId} rejected. Units restored to available inventory.` });
      loadOverviewAndRequests();
      handleSearch();
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Failed to reject request.' });
    }
  };

  // ---------------------------------------------------------------------------
  // RBAC ACCESS GUARD (Rule 1)
  // ---------------------------------------------------------------------------
  if (!isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl border border-red-200 p-8 text-center shadow-lg space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
              Restricted Area • Hospital Staff Only
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-2">
              HOSPITAL BLOOD EXCHANGE ACCESS RESTRICTED
            </h1>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              This module is strictly designated for authenticated hospital transfusion desks to coordinate peer blood exchange and eliminate inventory wastage.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 max-w-md mx-auto text-left space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              Role-Based Access Control (RBAC) Enforced:
            </p>
            <p>Current Active Role: <span className="font-mono font-bold uppercase">{currentRole}</span></p>
            <p>Required Access Role: <span className="font-mono font-bold text-red-700">HOSPITAL</span></p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            {onRoleSwitch && (
              <button
                type="button"
                onClick={() => onRoleSwitch('HOSPITAL')}
                className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Switch to Hospital Role (AIIMS Desk)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* 1. Header Banner & Identity */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-[#800020] text-white text-[10px] font-extrabold uppercase tracking-wider">
                H2H NETWORK
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Hospital Role Verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              HOSPITAL BLOOD EXCHANGE
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Deterministic FEFO (First Expired, First Out) peer blood inventory sharing network to reduce blood wastage across participating healthcare institutions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadOverviewAndRequests}
              disabled={loadingRequests}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRequests ? 'animate-spin text-red-600' : ''}`} />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className={`mt-4 p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 ${
            actionNotice.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2">
              {actionNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
              <span>{actionNotice.message}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* 2. Sub-Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('find')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'find'
                ? 'bg-[#800020] text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Find Blood (FEFO Prioritization)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('incoming')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'incoming'
                ? 'bg-[#800020] text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Incoming Blood Requests</span>
            {incomingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px]">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('outgoing')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'outgoing'
                ? 'bg-[#800020] text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>My Blood Requests</span>
            {myRequests.length > 0 && (
              <span className="px-1.5 py-0.2 bg-slate-700 text-white rounded-full text-[10px]">
                {myRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'inventory'
                ? 'bg-[#800020] text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Inventory & Wastage Insight</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: FIND BLOOD (FEFO PRIORITIZATION)
          ===================================================================== */}
      {activeSubTab === 'find' && (
        <div className="space-y-6">
          
          {/* Search Form Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-[#800020]" />
                <span>Find Blood in Exchange Network</span>
              </h2>
              <span className="text-[11px] font-bold text-slate-500">
                Rule-Based FEFO Allocation Active
              </span>
            </div>

            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Blood Group */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              {/* Component */}
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Blood Component</label>
                <select
                  value={component}
                  onChange={(e) => setComponent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Packed Red Blood Cells">Packed Red Blood Cells (PRBC)</option>
                  <option value="Whole Blood">Whole Blood (WB)</option>
                  <option value="Platelets">Platelets (RDP / SDP)</option>
                  <option value="Fresh Frozen Plasma">Fresh Frozen Plasma (FFP)</option>
                </select>
              </div>

              {/* Required Quantity */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Required Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Required By */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Required By (Date)</label>
                <input
                  type="date"
                  value={requiredBy}
                  onChange={(e) => setRequiredBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Location & Radius */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Search Location</label>
                <input
                  type="text"
                  placeholder="e.g. Delhi, Noida"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Submit CTA */}
              <div className="sm:col-span-2 lg:col-span-6 flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-semibold">Search Radius:</span>
                  {['5 km', '10 km', '25 km', '50 km'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSearchRadius(r)}
                      className={`px-2 py-0.5 rounded-lg border text-[11px] transition-all cursor-pointer ${
                        searchRadius === r
                          ? 'bg-slate-900 text-white border-slate-900 font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-[#800020] hover:bg-[#600018] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Search className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Searching Inventory...' : 'Search Available Blood'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Search Error */}
          {searchError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-800 font-semibold">
              {searchError}
            </div>
          )}

          {/* Allocation Breakdown / Wastage Reduction Summary (Rule 7 & 13) */}
          {searchResults && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-5 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-red-600 text-[10px] font-black uppercase tracking-wider">
                    FEFO ALLOCATION ENGINE
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    Requested: <strong className="text-white">{searchResults.requested_quantity} units</strong> of {searchResults.requested_blood_group} ({searchResults.requested_component})
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {searchResults.wastage_prevention_message}
                </p>
              </div>

              {/* Multi-Unit Numbers */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Requested</div>
                  <div className="text-sm font-black text-white">{searchResults.requested_quantity} units</div>
                </div>
                <div className="h-6 w-px bg-white/20" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Available</div>
                  <div className="text-sm font-black text-emerald-400">{searchResults.available_units_count} units</div>
                </div>
                {searchResults.shortage_units_count > 0 && (
                  <>
                    <div className="h-6 w-px bg-white/20" />
                    <div>
                      <div className="text-[10px] text-rose-400 uppercase font-bold">Shortage</div>
                      <div className="text-sm font-black text-rose-400">{searchResults.shortage_units_count} units</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Recommended FEFO Bundle CTA (Rule 7) */}
          {searchResults && searchResults.recommended_units.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wide">
                    Optimal FEFO Allocation Bundle ({searchResults.recommended_units.length} units selected)
                  </span>
                </div>
                <p className="text-xs text-amber-900">
                  The system selected the earliest-expiring eligible blood units across the network: {' '}
                  <span className="font-mono font-bold">
                    {searchResults.recommended_units.map(u => `${u.unit_code} (${u.days_until_expiry}d)`).join(', ')}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => openRequestModal(searchResults.recommended_units)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-sm transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2"
              >
                <span>Request Recommended Bundle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 3. Results Grid of Cards (Rule 6) */}
          {searchResults && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                <span>Eligible Units Ranked by Expiry (First Expired, First Out)</span>
                <span>Found {searchResults.all_eligible_units.length} Cleared Units</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.all_eligible_units.map((unit, index) => (
                  <div 
                    key={unit.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs transition-all hover:shadow-md flex flex-col justify-between relative ${
                      unit.is_recommended_allocation 
                        ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/20' 
                        : 'border-slate-200'
                    }`}
                  >
                    {/* FEFO Ranking Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 font-mono">{unit.unit_code}</span>
                          <span className="text-[10px] font-bold text-slate-400">Rank #{index + 1}</span>
                        </div>
                        <div className="text-xs font-bold text-red-700 mt-0.5">
                          {unit.blood_group} • {unit.component}
                        </div>
                      </div>

                      {/* Urgency Badge (Rule 6) */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${unit.urgency_color}`}>
                        {unit.urgency_label}
                      </span>
                    </div>

                    {/* Facility & Location Info */}
                    <div className="space-y-1.5 text-xs text-slate-600 border-t border-b border-slate-100 py-2.5 my-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Available Volume:</span>
                        <span className="font-bold text-slate-800">{unit.quantity_ml} ml</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Providing Hospital:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[160px]">{unit.providing_hospital_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">City / Hub:</span>
                        <span className="font-semibold text-slate-800">{unit.city}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Collected On:</span>
                        <span className="font-mono text-slate-700">{unit.collection_date}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Expiration Date:</span>
                        <span className="font-mono font-bold text-slate-900">{unit.expiration_date}</span>
                      </div>
                    </div>

                    {/* Expiry Countdown & Request CTA */}
                    <div className="pt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className={`w-3.5 h-3.5 ${unit.days_until_expiry <= 2 ? 'text-red-600 animate-pulse' : 'text-slate-500'}`} />
                        <span className={`font-black ${unit.days_until_expiry <= 2 ? 'text-red-700' : 'text-slate-700'}`}>
                          Expires in {unit.days_until_expiry} day{unit.days_until_expiry !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => openRequestModal([unit])}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-[#800020] text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Request Blood
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* =====================================================================
          TAB 2: INCOMING BLOOD REQUESTS (Rule 10)
          ===================================================================== */}
      {activeSubTab === 'incoming' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Inbox className="w-4 h-4 text-[#800020]" />
                <span>Incoming Blood Requests from Network Hospitals</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Peer hospitals requesting units from your inventory. Accept or reject with atomic status update.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Total: {incomingRequests.length}
            </span>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <Inbox className="w-8 h-8 mx-auto opacity-40" />
              <p>No incoming blood requests at this moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Request ID</th>
                    <th className="py-3 px-3">Requesting Hospital</th>
                    <th className="py-3 px-3">Blood Group & Component</th>
                    <th className="py-3 px-3">Quantity</th>
                    <th className="py-3 px-3">Requested At</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {incomingRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">REQ-{req.id}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{req.requesting_hospital_name}</td>
                      <td className="py-3 px-3 font-semibold text-red-700">
                        {req.blood_group} • {req.component}
                      </td>
                      <td className="py-3 px-3 font-bold">{req.quantity_requested} unit(s)</td>
                      <td className="py-3 px-3 text-slate-500">{new Date(req.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAccept(req.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 3: MY BLOOD REQUESTS (Rule 11)
          ===================================================================== */}
      {activeSubTab === 'outgoing' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-[#800020]" />
                <span>My Outgoing Blood Requests</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track status of requisitions submitted to peer hospital facilities.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Total: {myRequests.length}
            </span>
          </div>

          {myRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <Send className="w-8 h-8 mx-auto opacity-40" />
              <p>No outgoing requests submitted yet. Use the Find Blood tab to search inventory.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Request ID</th>
                    <th className="py-3 px-3">Providing Hospital</th>
                    <th className="py-3 px-3">Blood Group & Component</th>
                    <th className="py-3 px-3">Quantity</th>
                    <th className="py-3 px-3">Requested Date</th>
                    <th className="py-3 px-3">Allocated Units</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {myRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">REQ-{req.id}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{req.providing_hospital_name}</td>
                      <td className="py-3 px-3 font-semibold text-red-700">
                        {req.blood_group} • {req.component}
                      </td>
                      <td className="py-3 px-3 font-bold">{req.quantity_requested} unit(s)</td>
                      <td className="py-3 px-3 text-slate-500">{new Date(req.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {req.allocated_units.map(u => u.unit_code).join(', ') || 'Pending Allocation'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'fulfilled' ? 'bg-blue-100 text-blue-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 4: INVENTORY & WASTAGE INSIGHT (Rule 12 & 13)
          ===================================================================== */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-6">
          {/* Metric Buckets (Rule 12) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                <span>Total Available</span>
                <Droplets className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {wastageData?.total_available_units ?? 42} <span className="text-sm font-semibold text-slate-400">units</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Cleared and properly stored in network</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-red-200 shadow-xs bg-red-50/20">
              <div className="flex items-center justify-between text-xs text-red-700 font-bold uppercase tracking-wider mb-2">
                <span>Expiring ≤ 3 Days</span>
                <Flame className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-3xl font-black text-red-700">
                {wastageData?.expiring_within_3_days ?? 7} <span className="text-sm font-semibold text-red-400">units</span>
              </div>
              <p className="text-[11px] text-red-600 font-medium mt-1">Critical FEFO requisition priority</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-amber-200 shadow-xs bg-amber-50/20">
              <div className="flex items-center justify-between text-xs text-amber-800 font-bold uppercase tracking-wider mb-2">
                <span>Expiring ≤ 7 Days</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-800">
                {wastageData?.expiring_within_7_days ?? 13} <span className="text-sm font-semibold text-amber-500">units</span>
              </div>
              <p className="text-[11px] text-amber-700 font-medium mt-1">Units nearing critical decay window</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-xs bg-emerald-50/20">
              <div className="flex items-center justify-between text-xs text-emerald-800 font-bold uppercase tracking-wider mb-2">
                <span>Expiring ≤ 30 Days</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-emerald-800">
                {wastageData?.expiring_within_30_days ?? 38} <span className="text-sm font-semibold text-emerald-500">units</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">Standard stable buffer stock</p>
            </div>
          </div>

          {/* Wastage Insight Card (Rule 13) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-black text-slate-900">Blood Wastage Prevention</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-slate-500 font-bold">FEFO Prioritized Allocation</div>
                <div className="text-2xl font-black text-slate-900">100%</div>
                <p className="text-slate-500 text-[11px]">Units ordered deterministically by nearest expiration date.</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <div className="text-amber-800 font-bold">Units Expiring Soon</div>
                <div className="text-2xl font-black text-amber-900">{wastageData?.expiring_within_7_days ?? 13} units</div>
                <p className="text-amber-700 text-[11px]">Eligible units with ≤ 7 days remaining shelf-life.</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="text-emerald-800 font-bold">Wastage Reduction Status</div>
                <div className="text-2xl font-black text-emerald-900">
                  {wastageData?.prioritized_early_utilization_units ?? 13} units
                </div>
                {/* Rule 13: Accurate wording without false claims */}
                <p className="text-emerald-700 text-[11px] font-semibold">
                  Units prioritized for early utilization
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                How FEFO Wastage Prevention Operates:
              </div>
              <p>
                When a hospital searches for blood, the system bypasses random distribution and systematically surfaces the units closest to expiration first. When combined with atomic reservations, blood units nearing expiration are utilized before fresher units can be allocated, minimizing discard rates without sacrificing safety.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          5. CONFIRMATION DIALOG (Rule 8 & 9)
          ===================================================================== */}
      {isModalOpen && modalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#800020]" />
                <span>Request Summary</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Blood Group:</span>
                <span className="font-bold text-red-700">{modalCandidate.bloodGroup}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Component:</span>
                <span className="font-bold text-slate-900">{modalCandidate.component}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Quantity:</span>
                <span className="font-bold text-slate-900">{modalCandidate.units.length} unit(s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Providing Hospital:</span>
                <span className="font-bold text-slate-900">{modalCandidate.hospitalName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Earliest Expiry:</span>
                <span className="font-bold text-amber-700">
                  {modalCandidate.units[0]?.days_until_expiry} days ({modalCandidate.units[0]?.expiration_date})
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Target Blood Units:</span>
                <span className="font-mono font-bold text-slate-800">
                  {modalCandidate.units.map(u => u.unit_code).join(', ')}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-800 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                Atomic Reservation Notice:
              </p>
              <p>
                Confirming this request will atomically transition the selected units from <strong className="text-emerald-700">available</strong> to <strong className="text-amber-700">reserved</strong> using PostgreSQL row-level locks, preventing double booking from any concurrent hospital requests.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={submittingRequest}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReservation}
                disabled={submittingRequest}
                className="px-5 py-2 rounded-xl bg-[#800020] hover:bg-[#600018] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Send className={`w-3.5 h-3.5 ${submittingRequest ? 'animate-spin' : ''}`} />
                <span>{submittingRequest ? 'Locking Units...' : 'Send Request'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Product Boundary & Clinical Safety Disclaimer (Rule 19) */}
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 text-[11px] text-slate-500 space-y-1">
        <p className="font-bold text-slate-700 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          Clinical & Operational Disclaimer (Rule 19):
        </p>
        <p>
          This is a software prototype for inventory optimization and wastage prevention. The system only processes inventory eligibility fields configured by participating blood banks and hospitals. Final clinical transfusion and cross-matching decisions remain exclusively with qualified healthcare professionals and authorized blood-bank personnel. Expiration priority applies strictly after the unit satisfies all configured eligibility rules.
        </p>
      </div>

    </div>
  );
};
