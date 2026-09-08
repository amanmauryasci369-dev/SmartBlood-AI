import React, { useState, useEffect, useMemo } from 'react';
import { 
  BloodAllocationService, 
  AllocatedBloodUnit, 
  AllocationResult,
  calculateDaysUntilExpiry,
  getUrgencyBadge
} from '../../services/bloodAllocationService';
import { BloodInventoryUnit } from '../../services/mockBloodInventoryData';
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
  Info,
  Table as TableIcon,
  Filter,
  RefreshCw,
  Box,
  Layers
} from 'lucide-react';

export const SmartBloodAllocationPage: React.FC = () => {
  // Active View Tab: 'ALLOCATION' or 'DATABASE_INSPECTOR'
  const [activeTab, setActiveTab] = useState<'ALLOCATION' | 'DATABASE_INSPECTOR'>('ALLOCATION');

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
  const [reservingUnitId, setReservingUnitId] = useState<string | number | null>(null);
  const [reservationNotice, setReservationNotice] = useState<{
    unitId: string | number;
    success: boolean;
    message: string;
  } | null>(null);

  // 4. Database Inspector State (100 Units)
  const [allUnits, setAllUnits] = useState<BloodInventoryUnit[]>([]);
  const [dbSource, setDbSource] = useState<string>('');
  const [inspectorSearch, setInspectorSearch] = useState<string>('');
  const [inspectorFilter, setInspectorFilter] = useState<'ALL' | 'ELIGIBLE' | 'URGENT' | 'USE_SOON' | 'NORMAL' | 'LONG_SHELF' | 'INELIGIBLE'>('ALL');
  const [inspectorPage, setInspectorPage] = useState<number>(1);
  const [inspectorPageSize, setInspectorPageSize] = useState<number>(10);

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const components = [
    'Packed Red Blood Cells',
    'Whole Blood',
    'Platelets',
    'Fresh Frozen Plasma'
  ];

  const locations = [
    'All Locations',
    'Delhi',
    'Noida',
    'Ghaziabad',
    'Faridabad',
    'Greater Noida'
  ];

  // Load complete 100-unit database for inspector view
  const loadDatabaseUnits = async () => {
    try {
      const data = await BloodAllocationService.getAllInventory();
      setAllUnits(data.units);
      setDbSource(data.source);
    } catch (err) {
      console.warn('Failed to load database units:', err);
    }
  };

  useEffect(() => {
    loadDatabaseUnits();
  }, []);

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
      // Also refresh the inspector dataset
      loadDatabaseUnits();
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
      
      // Update local result state: transition this unit to reserved
      if (allocationResult) {
        setAllocationResult({
          ...allocationResult,
          units: allocationResult.units.map(u => 
            u.id === unit.id ? { ...u, status: 'reserved', is_allocated: false } : u
          )
        });
      }

      // Refresh inspector view
      loadDatabaseUnits();

      setReservationNotice({
        unitId: unit.id,
        success: true,
        message: res.message,
      });
    } catch (err: any) {
      setReservationNotice({
        unitId: unit.id,
        success: false,
        message: err.message || 'Failed to reserve blood unit. Please try another unit.',
      });
    } finally {
      setReservingUnitId(null);
    }
  };

  // Database Inspector Filtered Units
  const filteredInspectorUnits = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    return allUnits.filter(u => {
      const daysLeft = calculateDaysUntilExpiry(u.expiration_date);

      // Status tab filter
      if (inspectorFilter === 'ELIGIBLE') {
        if (u.status !== 'available' || u.screening_status !== 'cleared' || u.expiration_date <= today) return false;
      } else if (inspectorFilter === 'URGENT') {
        if (u.status !== 'available' || u.screening_status !== 'cleared' || u.expiration_date <= today || daysLeft > 3) return false;
      } else if (inspectorFilter === 'USE_SOON') {
        if (u.status !== 'available' || u.screening_status !== 'cleared' || u.expiration_date <= today || daysLeft <= 3 || daysLeft > 7) return false;
      } else if (inspectorFilter === 'NORMAL') {
        if (u.status !== 'available' || u.screening_status !== 'cleared' || u.expiration_date <= today || daysLeft <= 7 || daysLeft > 14) return false;
      } else if (inspectorFilter === 'LONG_SHELF') {
        if (u.status !== 'available' || u.screening_status !== 'cleared' || u.expiration_date <= today || daysLeft <= 14) return false;
      } else if (inspectorFilter === 'INELIGIBLE') {
        if (u.status === 'available' && u.screening_status === 'cleared' && u.expiration_date > today) return false;
      }

      // Search bar filter
      if (inspectorSearch.trim() !== '') {
        const q = inspectorSearch.toLowerCase().trim();
        const inId = u.id.toLowerCase().includes(q);
        const inGroup = u.blood_group.toLowerCase().includes(q);
        const inComp = u.component.toLowerCase().includes(q);
        const inBank = u.blood_bank_name.toLowerCase().includes(q);
        const inCity = u.city.toLowerCase().includes(q);
        const inLoc = u.storage_location.toLowerCase().includes(q);
        if (!inId && !inGroup && !inComp && !inBank && !inCity && !inLoc) return false;
      }

      return true;
    });
  }, [allUnits, inspectorFilter, inspectorSearch]);

  // Inspector Pagination
  const inspectorTotalPages = Math.max(1, Math.ceil(filteredInspectorUnits.length / inspectorPageSize));
  const paginatedInspectorUnits = useMemo(() => {
    const start = (inspectorPage - 1) * inspectorPageSize;
    return filteredInspectorUnits.slice(start, start + inspectorPageSize);
  }, [filteredInspectorUnits, inspectorPage, inspectorPageSize]);

  // Statistics calculation for the 100 units
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const total = allUnits.length;
    const available = allUnits.filter(u => u.status === 'available' && u.screening_status === 'cleared' && u.expiration_date > today).length;
    const urgent = allUnits.filter(u => u.status === 'available' && u.screening_status === 'cleared' && u.expiration_date > today && calculateDaysUntilExpiry(u.expiration_date) <= 3).length;
    const reserved = allUnits.filter(u => u.status === 'reserved').length;
    const used = allUnits.filter(u => u.status === 'used').length;
    const expired = allUnits.filter(u => u.status === 'expired' || u.expiration_date <= today).length;
    const pending = allUnits.filter(u => u.screening_status === 'pending').length;

    return { total, available, urgent, reserved, used, expired, pending };
  }, [allUnits]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* 1. Feature Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#800020] text-xs font-bold uppercase tracking-wider">
              <Droplets className="w-3.5 h-3.5 text-red-600" />
              <span>FEFO Priority Allocation Engine</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Smart Blood Allocation
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              When blood is requested, units with the nearest expiration date are prioritized first (<strong>First Expired, First Out</strong>) to minimize blood wastage and save lives.
            </p>
          </div>

          {/* Database Connection Status Pill */}
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
              isSupabaseConfigured()
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <Database className="w-4 h-4" />
              <span>{isSupabaseConfigured() ? 'Connected to Supabase PostgreSQL' : 'Database: 100 Synthetic Blood Units'}</span>
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              Table: <strong className="text-slate-700">blood_inventory</strong> (BL-1001 to BL-1100)
            </span>
          </div>
        </div>

        {/* 2. View Mode Tabs */}
        <div className="flex items-center gap-3 pt-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('ALLOCATION')}
            className={`pb-2 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'ALLOCATION'
                ? 'border-[#800020] text-[#800020]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span>Patient Blood Request (FEFO)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DATABASE_INSPECTOR')}
            className={`pb-2 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'DATABASE_INSPECTOR'
                ? 'border-[#800020] text-[#800020]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Supabase Database Inspector (100 Units)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB A: PATIENT BLOOD REQUEST & FEFO ALLOCATION */}
      {/* ========================================================================= */}
      {activeTab === 'ALLOCATION' && (
        <div className="space-y-6">
          
          {/* Patient Request Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-red-600" />
                <span>Patient Blood Requirement Form</span>
              </h3>
              <span className="text-xs text-slate-400">Deterministic sorting &bull; No LLM hallucination</span>
            </div>

            <form onSubmit={handleFindAvailableBlood} className="space-y-6">
              
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* 1. Blood Group */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-[#800020] focus:bg-white transition-all cursor-pointer"
                  >
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Blood Component */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Blood Component
                  </label>
                  <select
                    value={component}
                    onChange={(e) => setComponent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-[#800020] focus:bg-white transition-all cursor-pointer"
                  >
                    {components.map(comp => (
                      <option key={comp} value={comp}>{comp}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Required Quantity (ml) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Required Quantity (ml)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={5000}
                    step={50}
                    value={requiredQuantityMl}
                    onChange={(e) => setRequiredQuantityMl(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold font-mono focus:ring-2 focus:ring-[#800020] focus:bg-white transition-all"
                  />
                </div>

                {/* 4. Location / City */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Location / City
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-[#800020] focus:bg-white transition-all cursor-pointer"
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Preset Quick Buttons for Quantity */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 font-semibold">Standard Unit Presets:</span>
                {[350, 450, 700, 900, 1350].map(vol => (
                  <button
                    key={vol}
                    type="button"
                    onClick={() => setRequiredQuantityMl(vol)}
                    className={`px-3 py-1 rounded-lg border font-mono font-bold transition-all cursor-pointer ${
                      requiredQuantityMl === vol
                        ? 'bg-[#800020] text-white border-[#800020]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {vol} ml
                  </button>
                ))}
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Only cleared, unexpired, available blood units are allocated.</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-[#800020] hover:bg-[#68001a] active:bg-[#520014] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-red-900/10 disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  <span>{loading ? 'Executing FEFO Query...' : 'Find Available Blood'}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Reservation Toast / Alert Notice */}
          {reservationNotice && (
            <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn ${
              reservationNotice.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center gap-2">
                {reservationNotice.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <span>{reservationNotice.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setReservationNotice(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Allocation Results Section */}
          {allocationResult && (
            <div className="space-y-6">
              
              {/* Summary KPIs Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Allocation Summary for <span className="text-[#800020]">{bloodGroup}</span> ({component})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluated against: <strong>{allocationResult.source}</strong>
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                    allocationResult.is_fully_fulfillable
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {allocationResult.is_fully_fulfillable ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Demand Fully Met</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Supply Shortage Detected</span>
                      </>
                    )}
                  </span>
                </div>

                {/* 3 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Required Quantity</span>
                    <strong className="text-xl font-black text-slate-900 font-mono">
                      {allocationResult.requested_quantity_ml} ml
                    </strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Requested by patient</span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase block">Available Quantity</span>
                    <strong className="text-xl font-black text-emerald-700 font-mono">
                      {allocationResult.available_quantity_ml} ml
                    </strong>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">Cleared & unexpired</span>
                  </div>

                  <div className={`p-4 rounded-xl border ${
                    allocationResult.shortage_quantity_ml > 0
                      ? 'bg-red-50 border-red-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[11px] font-bold uppercase block ${
                      allocationResult.shortage_quantity_ml > 0 ? 'text-red-700' : 'text-slate-500'
                    }`}>
                      Shortage Quantity
                    </span>
                    <strong className={`text-xl font-black font-mono ${
                      allocationResult.shortage_quantity_ml > 0 ? 'text-red-600' : 'text-slate-900'
                    }`}>
                      {allocationResult.shortage_quantity_ml} ml
                    </strong>
                    <span className={`text-[10px] block mt-0.5 ${
                      allocationResult.shortage_quantity_ml > 0 ? 'text-red-500 font-bold' : 'text-slate-400'
                    }`}>
                      {allocationResult.shortage_quantity_ml > 0 ? 'Urgent Requisition Recommended' : 'Zero Deficit'}
                    </span>
                  </div>
                </div>

                {/* Explanatory Message */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{allocationResult.message}</span>
                </div>
              </div>

              {/* Recommended Blood Units List (Cards) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900">
                    Recommended Blood Units ({allocationResult.units.length} Units Eligible)
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">
                    Strictly sorted by nearest expiration date (FEFO)
                  </span>
                </div>

                {allocationResult.units.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800">No Eligible Blood Units Found</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      All units for {bloodGroup} ({component}) in this location are currently expired, reserved, used, or pending laboratory screening.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allocationResult.units.map((unit) => {
                      const isUrgent = unit.urgency_level === 'Urgent';
                      const isUseSoon = unit.urgency_level === 'Use Soon';
                      const isReserved = unit.status === 'reserved';

                      return (
                        <div
                          key={unit.id}
                          className={`health-card p-5 rounded-2xl border space-y-3 relative overflow-hidden transition-all ${
                            unit.is_allocated 
                              ? 'border-[#800020] bg-red-50/20 shadow-xs' 
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          {/* Top Priority Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-base text-slate-900">
                                  {unit.unit_code}
                                </span>
                                {unit.is_allocated && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#800020] text-white px-2 py-0.5 rounded shadow-2xs">
                                    FEFO Match
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 font-medium">{unit.blood_bank_name}</p>
                            </div>

                            {/* Urgency Badge */}
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight inline-flex items-center gap-1 ${
                              isUrgent 
                                ? 'bg-red-100 text-red-800 border border-red-200' 
                                : isUseSoon
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              <Clock className="w-3 h-3" />
                              <span>{unit.urgency_level}</span>
                            </span>
                          </div>

                          {/* Unit Specification Grid */}
                          <div className="grid grid-cols-2 gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-bold block">Group & Rh</span>
                              <strong className="text-sm font-black text-slate-900">{unit.blood_group}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-bold block">Volume</span>
                              <strong className="text-sm font-mono font-bold text-slate-900">{unit.quantity_ml} ml</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-bold block">Location</span>
                              <span className="text-slate-700 font-medium flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{unit.city}</span>
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-bold block">Storage</span>
                              <span className="text-slate-700 font-mono text-[11px] font-medium">{unit.storage_location || 'Refrigerator A'}</span>
                            </div>
                          </div>

                          {/* Expiration Countdown */}
                          <div className="flex items-center justify-between text-xs py-1 border-t border-slate-100">
                            <span className="text-slate-500">Expiration Date:</span>
                            <div className="text-right">
                              <span className="font-mono font-bold text-slate-800">{unit.expiration_date}</span>
                              <span className={`block text-[10px] font-bold ${
                                isUrgent ? 'text-red-600' : isUseSoon ? 'text-amber-600' : 'text-slate-500'
                              }`}>
                                ({unit.days_until_expiry} days remaining)
                              </span>
                            </div>
                          </div>

                          {/* Request Button */}
                          <button
                            type="button"
                            disabled={isReserved || reservingUnitId === unit.id}
                            onClick={() => handleRequestUnit(unit)}
                            className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                              isReserved
                                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                : 'bg-[#800020] hover:bg-[#68001a] active:bg-[#520014] text-white'
                            }`}
                          >
                            {reservingUnitId === unit.id ? (
                              <span>Locking Unit...</span>
                            ) : isReserved ? (
                              <span>Reserved</span>
                            ) : (
                              <>
                                <span>Request This Unit</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB B: SUPABASE DATABASE INSPECTOR (100 UNITS) */}
      {/* ========================================================================= */}
      {activeTab === 'DATABASE_INSPECTOR' && (
        <div className="space-y-6">
          
          {/* Top KPI Statistics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Units</span>
              <strong className="text-xl font-black text-slate-900 font-mono">{stats.total}</strong>
              <span className="text-[10px] text-slate-400 block">BL-1001 to BL-1100</span>
            </div>

            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Available (Cleared)</span>
              <strong className="text-xl font-black text-emerald-700 font-mono">{stats.available}</strong>
              <span className="text-[10px] text-emerald-600 block">FEFO Eligible</span>
            </div>

            <div className="bg-red-50/60 p-4 rounded-xl border border-red-200 shadow-xs">
              <span className="text-[10px] font-bold text-red-800 uppercase block">Urgent (&le; 3 Days)</span>
              <strong className="text-xl font-black text-red-600 font-mono">{stats.urgent}</strong>
              <span className="text-[10px] text-red-500 block">Immediate dispatch</span>
            </div>

            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 shadow-xs">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Reserved</span>
              <strong className="text-xl font-black text-amber-700 font-mono">{stats.reserved}</strong>
              <span className="text-[10px] text-amber-600 block">Locked for patients</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-600 uppercase block">Used</span>
              <strong className="text-xl font-black text-slate-700 font-mono">{stats.used}</strong>
              <span className="text-[10px] text-slate-500 block">Transfused</span>
            </div>

            <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 shadow-xs">
              <span className="text-[10px] font-bold text-rose-800 uppercase block">Expired</span>
              <strong className="text-xl font-black text-rose-700 font-mono">{stats.expired}</strong>
              <span className="text-[10px] text-rose-600 block">Disposed / Ineligible</span>
            </div>

            <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200 shadow-xs">
              <span className="text-[10px] font-bold text-purple-800 uppercase block">Screening Pending</span>
              <strong className="text-xl font-black text-purple-700 font-mono">{stats.pending}</strong>
              <span className="text-[10px] text-purple-600 block">In Quarantine</span>
            </div>
          </div>

          {/* Controls & Filter Bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Supabase Table Viewer: <span className="font-mono text-[#800020]">blood_inventory</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Source: <strong>{dbSource}</strong>
                </p>
              </div>

              {/* Reset Simulator Button */}
              <button
                type="button"
                onClick={() => {
                  BloodAllocationService.resetLocalInventory();
                  loadDatabaseUnits();
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Restore default 100 units state"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Demo State</span>
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-700 mr-1">Filter View:</span>
              
              {[
                { id: 'ALL', label: `All (100)` },
                { id: 'ELIGIBLE', label: `Eligible & Cleared (${stats.available})` },
                { id: 'URGENT', label: `Urgent (1–3 Days)` },
                { id: 'USE_SOON', label: `Use Soon (4–7 Days)` },
                { id: 'NORMAL', label: `Normal (8–14 Days)` },
                { id: 'LONG_SHELF', label: `Long Shelf (15–30 Days)` },
                { id: 'INELIGIBLE', label: `Ineligible (Expired/Reserved/Pending)` },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setInspectorFilter(tab.id as any);
                    setInspectorPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    inspectorFilter === tab.id
                      ? 'bg-[#800020] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={inspectorSearch}
                onChange={(e) => {
                  setInspectorSearch(e.target.value);
                  setInspectorPage(1);
                }}
                placeholder="Search unit by ID (e.g. BL-1005), Blood Group, Hospital, City, or Storage Location..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800020] focus:bg-white"
              />
            </div>

          </div>

          {/* 100-Unit Table Container */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                
                <thead>
                  <tr className="bg-[#F8EEEE] border-b border-slate-200 text-slate-800 font-bold">
                    <th className="py-3 px-3.5">Unit ID</th>
                    <th className="py-3 px-3.5">Group</th>
                    <th className="py-3 px-3.5">Component</th>
                    <th className="py-3 px-3.5">Volume</th>
                    <th className="py-3 px-3.5">Expiration</th>
                    <th className="py-3 px-3.5">Days Left</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5">Screening</th>
                    <th className="py-3 px-3.5">Blood Bank & City</th>
                    <th className="py-3 px-3.5">Storage</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedInspectorUnits.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400 font-medium">
                        No records match your selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedInspectorUnits.map((u) => {
                      const daysLeft = calculateDaysUntilExpiry(u.expiration_date);
                      const isExpired = u.status === 'expired' || daysLeft < 0;
                      const isUrgent = daysLeft >= 0 && daysLeft <= 3;
                      const isUseSoon = daysLeft > 3 && daysLeft <= 7;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          
                          {/* ID */}
                          <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                            {u.id}
                          </td>

                          {/* Group & Rh */}
                          <td className="py-3 px-3.5">
                            <span className="font-bold text-slate-900 font-mono text-sm">{u.blood_group}</span>
                            <span className="block text-[10px] text-slate-400">{u.rh_type}</span>
                          </td>

                          {/* Component */}
                          <td className="py-3 px-3.5 font-medium text-slate-800">
                            {u.component}
                          </td>

                          {/* Volume */}
                          <td className="py-3 px-3.5 font-mono font-bold text-slate-700">
                            {u.quantity_ml} ml
                          </td>

                          {/* Expiration */}
                          <td className="py-3 px-3.5 font-mono text-slate-700">
                            {u.expiration_date}
                          </td>

                          {/* Days Left & Urgency Badge */}
                          <td className="py-3 px-3.5 font-mono">
                            {isExpired ? (
                              <span className="text-rose-700 font-bold">Expired</span>
                            ) : (
                              <span className={`font-bold ${
                                isUrgent ? 'text-red-600' : isUseSoon ? 'text-amber-600' : 'text-emerald-700'
                              }`}>
                                {daysLeft} days
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              u.status === 'available'
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.status === 'reserved'
                                ? 'bg-amber-100 text-amber-800'
                                : u.status === 'used'
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {u.status}
                            </span>
                          </td>

                          {/* Screening */}
                          <td className="py-3 px-3.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              u.screening_status === 'cleared'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {u.screening_status}
                            </span>
                          </td>

                          {/* Blood Bank */}
                          <td className="py-3 px-3.5">
                            <div className="font-semibold text-slate-900">{u.blood_bank_name}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />
                              <span>{u.city}</span>
                            </div>
                          </td>

                          {/* Storage */}
                          <td className="py-3 px-3.5 font-mono text-[11px] text-slate-600">
                            {u.storage_location}
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>

              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">
                Showing <strong>{Math.min(filteredInspectorUnits.length, (inspectorPage - 1) * inspectorPageSize + 1)}</strong> to{' '}
                <strong>{Math.min(filteredInspectorUnits.length, inspectorPage * inspectorPageSize)}</strong> of{' '}
                <strong>{filteredInspectorUnits.length}</strong> matching records
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectorPage(p => Math.max(1, p - 1))}
                  disabled={inspectorPage === 1}
                  className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-bold"
                >
                  &larr; Prev
                </button>

                <span className="font-bold text-slate-700 px-2 font-mono">
                  Page {inspectorPage} / {inspectorTotalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setInspectorPage(p => Math.min(inspectorTotalPages, p + 1))}
                  disabled={inspectorPage >= inspectorTotalPages}
                  className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-bold"
                >
                  Next &rarr;
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
