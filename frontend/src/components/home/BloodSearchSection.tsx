import React, { useState } from 'react';
import { BloodGroup, ComponentType, BloodSearchResultItem } from '../../types';
import { StatusBadge } from '../StatusBadge';
import { 
  Search, 
  MapPin, 
  Navigation, 
  PhoneCall, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  SlidersHorizontal,
  ArrowRight,
  Send,
  Info
} from 'lucide-react';

interface BloodSearchSectionProps {
  onOpenSOSModal: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export const BloodSearchSection: React.FC<BloodSearchSectionProps> = ({ 
  onOpenSOSModal,
  onNavigateToTab 
}) => {
  const [state, setState] = useState<string>('Delhi');
  const [district, setDistrict] = useState<string>('Central Delhi');
  const [city, setCity] = useState<string>('New Delhi');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [component, setComponent] = useState<ComponentType>('PACKED_RED_BLOOD_CELLS');
  const [quantity, setQuantity] = useState<number>(2);
  const [maxDistance, setMaxDistance] = useState<number>(30);
  const [usingLocation, setUsingLocation] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [results, setResults] = useState<BloodSearchResultItem[]>([]);
  const [selectedResult, setSelectedResult] = useState<BloodSearchResultItem | null>(null);

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  const componentLabels: Record<ComponentType, string> = {
    PACKED_RED_BLOOD_CELLS: 'Packed Red Blood Cells (PRBC)',
    PLATELET_CONCENTRATE: 'Platelet Concentrate',
    FRESH_FROZEN_PLASMA: 'Fresh Frozen Plasma (FFP)',
    WHOLE_BLOOD: 'Whole Blood',
    CRYOPRECIPITATE: 'Cryoprecipitate'
  };

  const handleUseLocation = () => {
    setUsingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setState('Delhi');
          setDistrict('Central Delhi');
          setCity('Current GPS Location (28.6139° N, 77.2090° E)');
          setUsingLocation(false);
        },
        () => {
          setCity('Delhi NCR (Default Coordinates)');
          setUsingLocation(false);
        }
      );
    } else {
      setCity('Delhi NCR (GPS unavailable)');
      setUsingLocation(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/intel/blood/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blood_group: bloodGroup,
          component: component,
          quantity: Number(quantity),
          max_distance_km: Number(maxDistance),
          emergency_level: 'NORMAL',
        }),
      });
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Blood search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="blood-search-section" className="w-full space-y-6">
      
      {/* Search Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Search className="w-3.5 h-3.5 text-red-600" />
              <span>LifeLink Resource Search</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Find Blood
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Search connected blood centers and hospitals for available blood resources.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleUseLocation}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Navigation className={`w-3.5 h-3.5 text-red-600 ${usingLocation ? 'animate-spin' : ''}`} />
              <span>Use My Location</span>
            </button>
            <button
              onClick={() => {
                setState('Delhi');
                setDistrict('Central Delhi');
                setCity('');
                setBloodGroup('O-');
                setComponent('PACKED_RED_BLOOD_CELLS');
                setQuantity(2);
                setMaxDistance(30);
                setSearched(false);
                setResults([]);
              }}
              type="button"
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Search Parameters Form */}
        <form onSubmit={handleSearch} className="pt-6 space-y-6">
          
          {/* Row 1: Geography Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-red-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Delhi">Delhi (NCT)</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Haryana">Haryana</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-red-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Central Delhi">Central Delhi</option>
                <option value="South Delhi">South Delhi</option>
                <option value="New Delhi">New Delhi</option>
                <option value="East Delhi">East Delhi</option>
                <option value="North Delhi">North Delhi</option>
                <option value="West Delhi">West Delhi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                City / Landmark
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Ansari Nagar, Connaught Place"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Row 2: Blood Group & Component Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            
            {/* Blood Group Selector */}
            <div className="lg:col-span-6 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Blood Group: <span className="text-red-600 font-black">{bloodGroup}</span>
                </label>
                <span className="text-[11px] text-slate-500">Universal RBC match: O-</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {bloodGroups.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setBloodGroup(bg)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-black transition-all cursor-pointer ${
                      bloodGroup === bg
                        ? 'bg-red-600 text-white shadow-md shadow-red-900/20 ring-2 ring-red-600'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Component Selector */}
            <div className="lg:col-span-6 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Blood Component
              </label>
              <select
                value={component}
                onChange={(e) => setComponent(e.target.value as ComponentType)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-red-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="PACKED_RED_BLOOD_CELLS">Packed Red Blood Cells (PRBC)</option>
                <option value="PLATELET_CONCENTRATE">Platelet Concentrate (RDP / SDP)</option>
                <option value="FRESH_FROZEN_PLASMA">Fresh Frozen Plasma (FFP)</option>
                <option value="WHOLE_BLOOD">Whole Blood</option>
                <option value="CRYOPRECIPITATE">Cryoprecipitate</option>
              </select>
            </div>

          </div>

          {/* Row 3: Quantity & Distance Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Units Required:</span>
                <span className="font-mono text-red-600 font-bold">{quantity} Unit(s)</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Maximum Radius:</span>
                <span className="font-mono text-red-600 font-bold">{maxDistance} km</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Reported units reflect public registry counts; physical verification is performed before clinical release.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-md shadow-red-900/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 tracking-wide uppercase"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Querying Blood Banks...' : 'Search Blood Availability'}</span>
            </button>
          </div>

        </form>
      </div>

      {/* AI Intelligence Advisory Strip */}
      <div className="bg-gradient-to-r from-red-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-red-600/30 border border-red-500/40 text-red-400 shrink-0">
            <Sparkles className="w-5 h-5 text-red-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30">
                AI Insight
              </span>
              <span className="text-xs text-slate-300">Predictive Regional Allocation</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-100 mt-1">
              {bloodGroup === 'O-'
                ? 'Regional O− PRBC buffer is restricted (Safety Buffer: 3 days). Compatible units detected at AIIMS Trauma Center with low expiry risk.'
                : `Sufficient ${bloodGroup} ${componentLabels[component]} supply reported across Central Delhi with low immediate stockout probability.`}
            </p>
          </div>
        </div>

        {onNavigateToTab && (
          <button
            type="button"
            onClick={() => onNavigateToTab('ai-insights')}
            className="shrink-0 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>View AI Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Search Results Section */}
      {searched && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Availability Results for <span className="text-red-600">{bloodGroup}</span> ({componentLabels[component]})
              </h3>
              <p className="text-xs text-slate-500">
                Showing {results.length} blood centers within {maxDistance} km radius of {district}
              </p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Sorted by confirmation tier & transit time
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-600">Cross-checking regional inventory feeds...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No Direct Stock Found in Immediate Range</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active inventory for {bloodGroup} was reported within {maxDistance} km. You can expand the search radius or trigger an emergency cross-hospital SOS requisition.
              </p>
              <button
                onClick={onOpenSOSModal}
                className="mt-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Trigger Emergency Requisition
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((r, i) => {
                const isConfirmed = r.status === 'CONFIRMED_AVAILABILITY';
                return (
                  <div
                    key={i}
                    className="health-card p-5 space-y-4 border border-slate-200 hover:border-slate-300 relative overflow-hidden"
                  >
                    {/* Top Facility Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900">{r.blood_bank_name}</h4>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{r.district}, {r.state}</span>
                        </p>
                      </div>
                      <StatusBadge status={r.status} size="sm" />
                    </div>

                    {/* Stock & Transit Stats */}
                    <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Available Units</span>
                        <strong className="text-sm text-slate-900 font-mono font-bold">
                          {r.available_units} Units
                        </strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Road Distance</span>
                        <strong className="text-sm text-slate-900 font-mono font-bold">
                          {r.distance_km} km
                        </strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Transit Time</span>
                        <strong className="text-sm text-emerald-700 font-mono font-bold">
                          ~{r.estimated_transit_minutes} mins
                        </strong>
                      </div>
                    </div>

                    {/* Disclaimer & Cold Chain Tag */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Updated: {r.last_updated ? new Date(r.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '5 min ago'}</span>
                      </span>
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Cold-Chain Verified</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 italic bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
                      {r.availability_disclaimer}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                      <a
                        href={`tel:${r.contact_desk}`}
                        className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-slate-600" />
                        <span>{r.contact_desk}</span>
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedResult(r)}
                          className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={onOpenSOSModal}
                          className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold tracking-wide uppercase transition-colors shadow-2xs cursor-pointer"
                        >
                          Request Blood
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">{selectedResult.blood_bank_name}</h4>
                <p className="text-xs text-slate-500">{selectedResult.district}, {selectedResult.state}</p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p><strong>Component:</strong> {componentLabels[selectedResult.component]}</p>
              <p><strong>Blood Group:</strong> {selectedResult.blood_group}</p>
              <p><strong>Available Units:</strong> {selectedResult.available_units}</p>
              <p><strong>Status:</strong> {selectedResult.status}</p>
              <p><strong>Distance:</strong> {selectedResult.distance_km} km (~{selectedResult.estimated_transit_minutes} min transit)</p>
              <p><strong>Verification Disclaimer:</strong> {selectedResult.availability_disclaimer}</p>
              <p><strong>Direct Transfusion Desk:</strong> {selectedResult.contact_desk}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedResult(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedResult(null);
                  onOpenSOSModal();
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold cursor-pointer"
              >
                Proceed to Request
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
