import React, { useState } from 'react';
import { 
  BloodAllocationService, 
  AllocatedBloodUnit, 
  AllocationResult 
} from '../../services/bloodAllocationService';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { 
  Droplets, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building2, 
  Database, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

export const SmartBloodAllocationPage: React.FC = () => {
  // 1. Patient Form State
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [component, setComponent] = useState<string>('Packed Red Blood Cells');
  const [requiredQuantityMl, setRequiredQuantityMl] = useState<number>(450);
  const [location, setLocation] = useState<string>('All Locations');

  // 2. Query & Allocation State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [allocationResult, setAllocationResult] = useState<AllocationResult | null>(null);

  // 3. Unit Reservation State
  const [reservingUnitId, setReservingUnitId] = useState<number | null>(null);
  const [reservationNotice, setReservationNotice] = useState<{
    unitId: number;
    success: boolean;
    message: string;
  } | null>(null);

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const components = [
    'Packed Red Blood Cells',
    'Platelet Concentrate',
    'Fresh Frozen Plasma',
    'Whole Blood',
    'Cryoprecipitate'
  ];

  const locations = [
    'All Locations',
    'New Delhi',
    'Central Delhi',
    'South Delhi',
    'Gurugram',
    'Noida'
  ];

  // Deterministic FEFO Blood Search Handler
  const handleFindAvailableBlood = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReservationNotice(null);

    try {
      const result = await BloodAllocationService.getRecommendedUnits(
        bloodGroup,
        component,
        Number(requiredQuantityMl),
        location === 'All Locations' ? undefined : location
      );
      setAllocationResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to search available blood units.');
      setAllocationResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Concurrency-Safe Unit Reservation Handler
  const handleRequestUnit = async (unit: AllocatedBloodUnit) => {
    setReservingUnitId(unit.id);
    setReservationNotice(null);

    try {
      const res = await BloodAllocationService.reserveUnit(unit.id, 'Patient Self-Request');
      
      // Update local state: transition this unit to reserved
      if (allocationResult) {
        setAllocationResult({
          ...allocationResult,
          units: allocationResult.units.map(u => 
            u.id === unit.id ? { ...u, status: 'reserved', is_allocated: false } : u
          )
        });
      }

      setReservationNotice({
        unitId: unit.id,
        success: true,
        message: res.message || `Unit ${unit.unit_code} successfully reserved for you!`
      });
    } catch (err: any) {
      setReservationNotice({
        unitId: unit.id,
        success: false,
        message: err.message || 'Failed to reserve unit. It may have just been claimed by another patient.'
      });
    } finally {
      setReservingUnitId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Droplets className="w-3.5 h-3.5 text-red-600" />
              <span>FEFO Smart Allocation Protocol</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Patient Blood Request
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Prioritizes eligible blood units based on the nearest expiration date (First Expired, First Out) to minimize wastage and deliver fresh resources rapidly.
            </p>
          </div>

          <div className="self-start sm:self-auto px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 font-medium bg-slate-50 border-slate-200 text-slate-700">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {isSupabaseConfigured() ? 'Supabase Connected' : 'LifeLink Database Active'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Patient Blood Request Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleFindAvailableBlood} className="space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Blood Group */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Blood Group:
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 cursor-pointer focus:ring-2 focus:ring-red-500"
              >
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* Component */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Component:
              </label>
              <select
                value={component}
                onChange={(e) => setComponent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 cursor-pointer focus:ring-2 focus:ring-red-500"
              >
                {components.map((comp) => (
                  <option key={comp} value={comp}>{comp}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Required Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Required Quantity (ml):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={requiredQuantityMl}
                  onChange={(e) => setRequiredQuantityMl(Number(e.target.value))}
                  placeholder="e.g. 450"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-red-500 pr-12"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">ml</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Standard unit bag is typically 450 ml (or 250–350 ml for platelets/plasma).
              </span>
            </div>

            {/* Location (optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location:
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 cursor-pointer focus:ring-2 focus:ring-red-500"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-900/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Search className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Executing FEFO Query...' : 'Find Available Blood'}</span>
            </button>
          </div>

        </form>
      </div>

      {/* 3. Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. Global Reservation Notice Alert */}
      {reservationNotice && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 font-medium border ${
          reservationNotice.success 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {reservationNotice.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{reservationNotice.message}</span>
        </div>
      )}

      {/* 5. Results Section */}
      {allocationResult && (
        <div className="space-y-6">
          
          {/* Summary / Shortage KPI Banner */}
          <div className={`p-5 rounded-2xl border text-xs space-y-3 ${
            allocationResult.is_fully_fulfillable
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-current/20">
              <div className="flex items-center gap-2 font-black text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>FEFO Allocation Summary</span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded border border-current">
                Source: {allocationResult.source}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-[11px] opacity-75 block uppercase font-bold">Requested Quantity</span>
                <strong className="text-base font-black font-mono">{allocationResult.requested_quantity_ml} ml</strong>
              </div>
              <div>
                <span className="text-[11px] opacity-75 block uppercase font-bold">Available Quantity</span>
                <strong className="text-base font-black font-mono">{allocationResult.available_quantity_ml} ml</strong>
              </div>
              <div>
                <span className="text-[11px] opacity-75 block uppercase font-bold">Shortage Quantity</span>
                <strong className={`text-base font-black font-mono ${
                  allocationResult.shortage_quantity_ml > 0 ? 'text-red-700' : 'text-emerald-800'
                }`}>
                  {allocationResult.shortage_quantity_ml} ml
                </strong>
              </div>
            </div>

            <p className="font-medium pt-1">
              {allocationResult.message}
            </p>
          </div>

          {/* Section Header: Recommended Blood Units */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Recommended Blood Units
              </h3>
              <p className="text-xs text-slate-500">
                Sorted strictly from earliest expiration to latest (FEFO Rule: First Expired, First Out).
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
              {allocationResult.units.length} Eligible Units
            </span>
          </div>

          {/* Zero Results State */}
          {allocationResult.units.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No Matching Blood Units Available</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active units matching {bloodGroup} {component} were found with cleared screening status and valid expiration date.
              </p>
            </div>
          ) : (
            /* Cards Grid sorted from earliest expiration to latest */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allocationResult.units.map((unit) => {
                const isUrgent = unit.urgency_level === 'Urgent';
                const isUseSoon = unit.urgency_level === 'Use Soon';
                const isReserved = unit.status === 'reserved';

                // Visual Indicator Badges
                // Expires in 2 days -> "Urgent" (Red)
                // Expires in 7 days -> "Use Soon" (Amber)
                // Expires in 14+ days -> "Normal" (Green)
                const badgeColor = isUrgent
                  ? 'bg-red-100 text-red-800 border-red-200 font-black'
                  : isUseSoon
                  ? 'bg-amber-100 text-amber-800 border-amber-200 font-bold'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold';

                return (
                  <div
                    key={unit.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-3 relative overflow-hidden ${
                      isReserved 
                        ? 'border-slate-300 opacity-65 bg-slate-50' 
                        : unit.is_allocated 
                        ? 'border-red-400 ring-2 ring-red-500/30' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Unit ID & Visual Urgency Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black font-mono text-slate-900">
                          {unit.unit_code}
                        </span>
                        {unit.is_allocated && !isReserved && (
                          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-red-600 text-white shadow-2xs">
                            FEFO Priority
                          </span>
                        )}
                      </div>

                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badgeColor}`}>
                        {unit.urgency_level}
                      </span>
                    </div>

                    {/* Blood Group & Component */}
                    <div className="text-xs font-bold text-slate-800">
                      <span className="text-red-600 font-black text-sm mr-1">{unit.blood_group}</span>
                      <span>&bull;</span>
                      <span className="ml-1 text-slate-700">{unit.component}</span>
                    </div>

                    {/* Quantity */}
                    <div className="text-xs text-slate-600 font-mono font-bold bg-slate-50 py-1.5 px-2.5 rounded-lg border border-slate-100 inline-block">
                      {unit.quantity_ml} ml
                    </div>

                    {/* Blood Bank & City */}
                    <div className="text-xs text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{unit.blood_bank_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{unit.city}</span>
                      </div>
                    </div>

                    {/* Expiration Date & Days Until Expiry */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Expires: {unit.expiration_date}</span>
                      </div>
                      <span className={`font-mono font-black ${
                        unit.days_until_expiry <= 2 
                          ? 'text-red-700 font-black' 
                          : unit.days_until_expiry <= 7 
                          ? 'text-amber-700 font-bold' 
                          : 'text-emerald-700'
                      }`}>
                        Expires in {unit.days_until_expiry} days
                      </span>
                    </div>

                    {/* Action: Request This Unit */}
                    <div className="pt-2">
                      <button
                        type="button"
                        disabled={isReserved || reservingUnitId === unit.id}
                        onClick={() => handleRequestUnit(unit)}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isReserved
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs'
                        }`}
                      >
                        {isReserved ? (
                          <span>Reserved</span>
                        ) : reservingUnitId === unit.id ? (
                          <span>Reserving Unit...</span>
                        ) : (
                          <span>Request This Unit</span>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
