import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  Circle, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { BloodBank, Hospital } from '../types';
import { 
  Building2, 
  Hospital as HospitalIcon, 
  ShieldCheck, 
  Search, 
  SlidersHorizontal, 
  Maximize2, 
  Minimize2, 
  Compass, 
  Navigation, 
  Layers, 
  Flame, 
  CheckCircle2,
  X
} from 'lucide-react';

// Fix Leaflet's default marker asset paths in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  bloodBanks: BloodBank[];
  hospitals: Hospital[];
  activeDispatch?: {
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    units: number;
    bloodGroup: string;
  } | null;
  selectedFacility?: BloodBank | Hospital | null;
  onSelectFacility?: (facility: BloodBank | Hospital) => void;
}

// Major Indian metropolitan clusters pre-configured for rapid navigation
const CITY_CLUSTERS = [
  { name: 'All India', lat: 22.5937, lng: 78.9629, zoom: 5, isAll: true },
  { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090, zoom: 11 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, zoom: 11 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, zoom: 11 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, zoom: 11 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, zoom: 11 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, zoom: 11 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, zoom: 11 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, zoom: 11 },
];

// Available basemap tile styles
const BASEMAP_PROVIDERS = [
  {
    id: 'dark',
    name: 'Tactical Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
  },
  {
    id: 'streets',
    name: 'Street Navigation',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  {
    id: 'light',
    name: 'Clean Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
  },
];

// Custom DivIcon for Blood Banks
const createBloodBankIcon = (capacity: number, isSelected: boolean = false) => {
  return L.divIcon({
    className: 'custom-bank-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
      ">
        ${isSelected ? `
          <div style="
            position: absolute;
            inset: -6px;
            border-radius: 50%;
            border: 2px solid #f43f5e;
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        ` : ''}
        <div style="
          background: linear-gradient(135deg, #e11d48 0%, #881337 100%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(225, 29, 72, 0.7);
          border: 2px solid ${isSelected ? '#ffe4e6' : '#ffffff'};
          color: white;
          font-size: 15px;
          transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          transition: transform 0.2s ease;
        ">
          🩸
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

// Custom DivIcon for Hospitals
const createHospitalIcon = (hasTrauma: boolean, isSelected: boolean = false) => {
  return L.divIcon({
    className: 'custom-hosp-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
      ">
        ${hasTrauma ? `
          <div style="
            position: absolute;
            inset: -4px;
            border-radius: 10px;
            background: rgba(245, 158, 11, 0.35);
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          "></div>
        ` : ''}
        <div style="
          background: ${hasTrauma 
            ? 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' 
            : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'};
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px ${hasTrauma ? 'rgba(245, 158, 11, 0.6)' : 'rgba(59, 130, 246, 0.6)'};
          border: 2px solid ${isSelected ? '#ffffff' : '#ffffff'};
          color: white;
          font-size: 14px;
          transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          transition: transform 0.2s ease;
        ">
          ${hasTrauma ? '⚡' : '🏥'}
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

// Custom Icon for Dispatch Endpoints
const createDispatchEndpointIcon = (label: string, isOrigin: boolean) => {
  return L.divIcon({
    className: 'custom-dispatch-endpoint',
    html: `
      <div style="
        background: ${isOrigin ? '#10b981' : '#f43f5e'};
        color: white;
        padding: 2px 6px;
        border-radius: 9999px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.05em;
        border: 2px solid #ffffff;
        box-shadow: 0 0 12px ${isOrigin ? 'rgba(16, 185, 129, 0.8)' : 'rgba(244, 63, 94, 0.8)'};
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
      ">
        <span style="font-size: 11px;">${isOrigin ? '📦' : '🚨'}</span>
        ${label}
      </div>
    `,
    iconSize: [80, 24],
    iconAnchor: [40, 12],
  });
};

// Map controller for programmatic flyTo, invalidateSize, and fitBounds
function MapController({ 
  center, 
  zoom, 
  bounds 
}: { 
  center?: [number, number]; 
  zoom?: number; 
  bounds?: L.LatLngBoundsExpression | null; 
}) {
  const map = useMap();

  // Force map to invalidate size on initial mount and resize to prevent grey tiles
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  // Smoothly fit bounds or fly to center
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14, animate: true, duration: 1 });
    } else if (center) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [center, zoom, bounds, map]);

  return null;
}

export const MapView: React.FC<MapViewProps> = ({
  bloodBanks,
  hospitals,
  activeDispatch,
  selectedFacility,
  onSelectFacility,
}) => {
  // Navigation & View State
  const [selectedCity, setSelectedCity] = useState<string>('Delhi NCR');
  const [activeBasemap, setActiveBasemap] = useState<string>('dark');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Layer Visibility Toggles
  const [showBloodBanks, setShowBloodBanks] = useState<boolean>(true);
  const [showHospitals, setShowHospitals] = useState<boolean>(true);
  const [traumaOnly, setTraumaOnly] = useState<boolean>(false);
  const [showCorridor, setShowCorridor] = useState<boolean>(true);
  const [showCoverageRadius, setShowCoverageRadius] = useState<boolean>(false);

  // Camera Target
  const [cameraCenter, setCameraCenter] = useState<[number, number]>([28.6139, 77.2090]);
  const [cameraZoom, setCameraZoom] = useState<number>(11);
  const [cameraBounds, setCameraBounds] = useState<L.LatLngBoundsExpression | null>(null);

  // Filter blood banks
  const filteredBloodBanks = useMemo(() => {
    if (!showBloodBanks) return [];
    return bloodBanks.filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.district.toLowerCase().includes(q) ||
        b.state.toLowerCase().includes(q)
      );
    });
  }, [bloodBanks, showBloodBanks, searchQuery]);

  // Filter hospitals
  const filteredHospitals = useMemo(() => {
    if (!showHospitals) return [];
    return hospitals.filter((h) => {
      if (traumaOnly && !h.has_trauma_center) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        h.name.toLowerCase().includes(q) ||
        h.district.toLowerCase().includes(q) ||
        h.state.toLowerCase().includes(q)
      );
    });
  }, [hospitals, showHospitals, traumaOnly, searchQuery]);

  // Handle City Cluster Selection
  const handleCitySelect = (cluster: typeof CITY_CLUSTERS[0]) => {
    setSelectedCity(cluster.name);
    if (cluster.isAll) {
      // Calculate overall bounds from all facilities
      const allCoords: [number, number][] = [
        ...bloodBanks.map((b): [number, number] => [b.latitude, b.longitude]),
        ...hospitals.map((h): [number, number] => [h.latitude, h.longitude]),
      ];
      if (allCoords.length > 0) {
        setCameraBounds(L.latLngBounds(allCoords));
      } else {
        setCameraCenter([cluster.lat, cluster.lng]);
        setCameraZoom(cluster.zoom);
        setCameraBounds(null);
      }
    } else {
      setCameraBounds(null);
      setCameraCenter([cluster.lat, cluster.lng]);
      setCameraZoom(cluster.zoom);
    }
  };

  // Focus on active dispatch corridor when triggered
  useEffect(() => {
    if (activeDispatch) {
      const bounds = L.latLngBounds([
        [activeDispatch.fromLat, activeDispatch.fromLng],
        [activeDispatch.toLat, activeDispatch.toLng],
      ]);
      setCameraBounds(bounds);
      setShowCorridor(true);
    }
  }, [activeDispatch]);

  // Focus on externally selected facility
  useEffect(() => {
    if (selectedFacility) {
      setCameraBounds(null);
      setCameraCenter([selectedFacility.latitude, selectedFacility.longitude]);
      setCameraZoom(13);
    }
  }, [selectedFacility]);

  // Current basemap provider
  const basemap = BASEMAP_PROVIDERS.find((p) => p.id === activeBasemap) || BASEMAP_PROVIDERS[0];

  return (
    <div className={`w-full transition-all duration-300 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col bg-slate-950 ${
      isExpanded ? 'h-[650px]' : 'h-[460px] sm:h-[500px]'
    }`}>
      
      {/* Top Interactive GIS Control Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md px-3 sm:px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 z-20">
        
        {/* Left: City Quick Navigation Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-full sm:max-w-xl">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold uppercase tracking-wider mr-1 shrink-0">
            <Navigation className="w-3.5 h-3.5 text-blood-500" />
            <span className="hidden md:inline">Clusters:</span>
          </div>
          {CITY_CLUSTERS.map((city) => (
            <button
              key={city.name}
              onClick={() => handleCitySelect(city)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCity === city.name
                  ? 'bg-blood-600 text-white shadow-md shadow-blood-900/40'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>

        {/* Right: Quick Search, Basemap, Layer Toggles, Expand */}
        <div className="flex items-center gap-2 ml-auto">
          
          {/* Quick Facility Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facility / district..."
              className="pl-8 pr-7 py-1 bg-slate-850 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blood-500 w-36 sm:w-48 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Layer Filter Dropdown Trigger */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-medium transition-all cursor-pointer ${
              showFilters 
                ? 'bg-blood-950/60 text-blood-400 border-blood-700' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Toggle Facility & Transit Layers"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Layers</span>
          </button>

          {/* Basemap Style Selector */}
          <select
            value={activeBasemap}
            onChange={(e) => setActiveBasemap(e.target.value)}
            aria-label="Select basemap style"
            className="bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blood-500 cursor-pointer hidden sm:block"
          >
            {BASEMAP_PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Expand / Minimize Height Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            title={isExpanded ? 'Collapse Map' : 'Expand Fullscreen View'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      {/* Expanded Layer Filter Control Drawer */}
      {showFilters && (
        <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300 z-20">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showBloodBanks}
                onChange={(e) => setShowBloodBanks(e.target.checked)}
                className="rounded border-slate-700 text-blood-600 focus:ring-0"
              />
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blood-500 inline-block"></span>
                Blood Banks ({filteredBloodBanks.length})
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showHospitals}
                onChange={(e) => setShowHospitals(e.target.checked)}
                className="rounded border-slate-700 text-blue-600 focus:ring-0"
              />
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span>
                Hospitals ({filteredHospitals.length})
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={traumaOnly}
                onChange={(e) => setTraumaOnly(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-0"
              />
              <span className="flex items-center gap-1 text-amber-400">
                <span>⚡</span> Trauma Centers Only
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCoverageRadius}
                onChange={(e) => setShowCoverageRadius(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0"
              />
              <span>15km Golden Hour Buffer</span>
            </label>
          </div>

          <div className="text-[11px] text-slate-400">
            Active: <strong className="text-white">{filteredBloodBanks.length + filteredHospitals.length}</strong> facilities rendered
          </div>
        </div>
      )}

      {/* Primary Leaflet Map Container */}
      <div className="relative flex-1 w-full h-full">
        <MapContainer
          center={cameraCenter}
          zoom={cameraZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: '#090d16' }}
        >
          {/* Tile Layer Provider */}
          <TileLayer
            attribution={basemap.attribution}
            url={basemap.url}
          />

          {/* Programmatic Map Controller for smooth panning and tile invalidation */}
          <MapController
            center={cameraCenter}
            zoom={cameraZoom}
            bounds={cameraBounds}
          />

          {/* Golden Hour Radius Buffer (Optional layer) */}
          {showCoverageRadius && selectedFacility && (
            <Circle
              center={[selectedFacility.latitude, selectedFacility.longitude]}
              radius={15000} // 15 km emergency radius
              pathOptions={{
                color: '#f43f5e',
                fillColor: '#f43f5e',
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: '4, 4',
              }}
            />
          )}

          {/* Blood Bank Markers */}
          {filteredBloodBanks.map((bank) => {
            const isSelected = selectedFacility && 'storage_capacity' in selectedFacility && selectedFacility.id === bank.id;
            return (
              <Marker
                key={`bank-${bank.id}`}
                position={[bank.latitude, bank.longitude]}
                icon={createBloodBankIcon(bank.storage_capacity, !!isSelected)}
                eventHandlers={{
                  click: () => onSelectFacility && onSelectFacility(bank),
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-3 bg-slate-900 text-slate-100 min-w-[260px]">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blood-400 uppercase tracking-wider">
                        <Building2 className="w-3.5 h-3.5 text-blood-500" />
                        <span>{bank.category || 'Blood Centre'}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-semibold">
                        ✓ Verified
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white mt-2 leading-snug">{bank.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{bank.address || `${bank.district}, ${bank.state}`}</p>
                    {bank.contact_number && (
                      <p className="text-xs text-blood-400 font-mono mt-1 font-semibold">📞 {bank.contact_number}</p>
                    )}

                    <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs bg-slate-850 p-2 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Capacity</span>
                        <strong className="text-white text-sm">{bank.storage_capacity}</strong> units
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Cold-Chain</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
                          <ShieldCheck className="w-3 h-3" /> Certified
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
                      Demo Mode: Stock counts simulated for algorithm evaluation. Facility details verified via {bank.source_name || 'e-RaktKosh / DSACS'}.
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onSelectFacility && onSelectFacility(bank)}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-blood-600 hover:bg-blood-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Select Facility</span>
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Hospital Markers */}
          {filteredHospitals.map((hosp) => {
            const isSelected = selectedFacility && 'bed_capacity' in selectedFacility && selectedFacility.id === hosp.id;
            return (
              <Marker
                key={`hosp-${hosp.id}`}
                position={[hosp.latitude, hosp.longitude]}
                icon={createHospitalIcon(hosp.has_trauma_center, !!isSelected)}
                eventHandlers={{
                  click: () => onSelectFacility && onSelectFacility(hosp),
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-3 bg-slate-900 text-slate-100 min-w-[240px]">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                        hosp.has_trauma_center ? 'text-amber-400' : 'text-blue-400'
                      }`}>
                        <HospitalIcon className="w-3.5 h-3.5" />
                        {hosp.has_trauma_center ? 'Apex Trauma Center' : 'General Hospital'}
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        #{hosp.id}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white mt-2 leading-snug">{hosp.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{hosp.district}, {hosp.state}</p>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-slate-850 p-2 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Bed Capacity</span>
                        <strong className="text-white text-sm">{hosp.bed_capacity}</strong> beds
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Emergency Level</span>
                        <span className={`font-semibold mt-0.5 block ${hosp.has_trauma_center ? 'text-amber-400' : 'text-blue-400'}`}>
                          {hosp.has_trauma_center ? 'Level 1 Trauma' : 'Standard'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onSelectFacility && onSelectFacility(hosp)}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Select Hospital</span>
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Active Emergency Dispatch Transit Corridor */}
          {activeDispatch && showCorridor && (
            <>
              {/* Origin Marker */}
              <Marker
                position={[activeDispatch.fromLat, activeDispatch.fromLng]}
                icon={createDispatchEndpointIcon('Blood Center', true)}
              />

              {/* Destination Marker */}
              <Marker
                position={[activeDispatch.toLat, activeDispatch.toLng]}
                icon={createDispatchEndpointIcon('Trauma SOS', false)}
              />

              {/* Animated Transit Polyline */}
              <Polyline
                positions={[
                  [activeDispatch.fromLat, activeDispatch.fromLng],
                  [activeDispatch.toLat, activeDispatch.toLng],
                ]}
                pathOptions={{
                  color: '#f43f5e',
                  weight: 5,
                  dashArray: '10, 10',
                  opacity: 0.95,
                }}
              />
            </>
          )}
        </MapContainer>

        {/* Floating Interactive Status & Legend Panel */}
        <div className="absolute bottom-4 left-4 z-[500] glass-panel px-3.5 py-2.5 rounded-xl text-xs flex flex-wrap items-center gap-4 text-slate-300 shadow-xl border border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blood-600 border border-white shadow-sm shadow-blood-500"></span>
            <span className="font-medium text-white">Blood Bank</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-500 border border-white shadow-sm shadow-amber-500"></span>
            <span className="font-medium text-white">Trauma Center</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-500 border border-white shadow-sm shadow-blue-500"></span>
            <span className="font-medium text-white">Hospital</span>
          </div>

          {activeDispatch && (
            <button
              onClick={() => {
                const bounds = L.latLngBounds([
                  [activeDispatch.fromLat, activeDispatch.fromLng],
                  [activeDispatch.toLat, activeDispatch.toLng],
                ]);
                setCameraBounds(bounds);
              }}
              className="flex items-center gap-1.5 text-blood-400 font-semibold bg-blood-950/80 px-2.5 py-1 rounded-lg border border-blood-800/80 hover:border-blood-600 transition-all cursor-pointer animate-pulse"
            >
              <Flame className="w-3.5 h-3.5 text-blood-500 fill-current" />
              <span>Active SOS Corridor ({activeDispatch.units} units {activeDispatch.bloodGroup}) &bull; Focus</span>
            </button>
          )}
        </div>

        {/* Reset View Button */}
        <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
          <button
            onClick={() => handleCitySelect(CITY_CLUSTERS[0])}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Reset to All India Overview"
          >
            <Compass className="w-4 h-4 text-blood-400" />
            <span className="hidden sm:inline">Fit All</span>
          </button>
        </div>

      </div>

    </div>
  );
};
