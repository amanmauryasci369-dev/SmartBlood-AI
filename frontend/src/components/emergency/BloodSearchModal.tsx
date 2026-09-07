import React, { useState } from 'react';
import { BloodGroup, ComponentType, BloodSearchResultItem } from '../../types';
import { StatusBadge } from '../StatusBadge';
import { 
  Search, 
  X, 
  Navigation, 
  PhoneCall, 
  ShieldCheck, 
  AlertCircle,
  Sliders
} from 'lucide-react';

interface BloodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BloodSearchModal: React.FC<BloodSearchModalProps> = ({ isOpen, onClose }) => {
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [component, setComponent] = useState<ComponentType>('PACKED_RED_BLOOD_CELLS');
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [urgency, setUrgency] = useState<string>('NORMAL');
  const [results, setResults] = useState<BloodSearchResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);

  if (!isOpen) return null;

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
          quantity: 2,
          max_distance_km: maxDistance,
          emergency_level: urgency,
        }),
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blood-600/30 border border-blood-500 flex items-center justify-center text-blood-400">
              <Search className="w-5 h-5 text-blood-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Fast Multi-Parameter Blood Search</h3>
              <p className="text-xs text-slate-400">Differentiating certified physical reserves from reported adapter feeds</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          <form onSubmit={handleSearch} className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Component</label>
                <select
                  value={component}
                  onChange={(e) => setComponent(e.target.value as ComponentType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="PACKED_RED_BLOOD_CELLS">Packed Red Blood Cells (PRBC)</option>
                  <option value="PLATELET_CONCENTRATE">Platelet Concentrate</option>
                  <option value="FRESH_FROZEN_PLASMA">Fresh Frozen Plasma</option>
                  <option value="WHOLE_BLOOD">Whole Blood</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Max Radius: <strong className="text-white">{maxDistance} km</strong>
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full accent-blood-500 mt-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Rule 10: Reported feeds are clearly separated from lab-confirmed units.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-blood-600 hover:bg-blood-500 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{loading ? 'Searching...' : 'Search Blood Units'}</span>
              </button>
            </div>
          </form>

          {/* Results List */}
          {searched && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Matching Blood Centers: <strong>{results.length}</strong></span>
                <span>Sorted by confirmation status & distance</span>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No blood units found matching parameters in this radius.
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((r, i) => (
                    <div key={i} className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{r.blood_bank_name}</h4>
                          <p className="text-xs text-slate-400">{r.district}, {r.state}</p>
                        </div>
                        <StatusBadge status={r.status} size="sm" />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-1 border-t border-b border-slate-800/80">
                        <div>
                          <span className="text-slate-400">Available:</span> <strong className="text-white">{r.available_units} units</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Distance:</span> <strong className="text-slate-200">{r.distance_km} km</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Transit:</span> <strong className="text-cyan-400">~{r.estimated_transit_minutes} mins</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Cold Chain:</span> <strong className="text-emerald-400">Verified</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-[11px] text-slate-400 italic">
                          {r.availability_disclaimer}
                        </span>
                        <a
                          href={`tel:${r.contact_desk}`}
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 font-mono text-xs flex items-center gap-1.5"
                        >
                          <PhoneCall className="w-3 h-3 text-emerald-400" />
                          <span>{r.contact_desk}</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
