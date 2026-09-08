import React, { useState } from 'react';
import { BloodBank, InventoryItem } from '../../types';
import { 
  Building2, 
  MapPin, 
  PhoneCall, 
  Mail, 
  ExternalLink, 
  ShieldCheck, 
  Navigation, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft,
  Calendar,
  Share2,
  Bookmark
} from 'lucide-react';

interface BloodCenterDetailPageProps {
  facility?: BloodBank | null;
  inventory?: InventoryItem[];
  onBack: () => void;
  onOpenSOSModal: () => void;
  onViewOnMap?: (facility: BloodBank) => void;
}

export const BloodCenterDetailPage: React.FC<BloodCenterDetailPageProps> = ({
  facility,
  inventory = [],
  onBack,
  onOpenSOSModal,
  onViewOnMap
}) => {
  const [activeTab, setActiveTab] = useState<'availability' | 'about' | 'services' | 'location' | 'insights'>('availability');

  // Default facility fallback if none selected
  const bank = facility || {
    id: 1,
    name: 'AIIMS Blood Centre',
    short_name: 'AIIMS Blood Bank',
    parent_hospital: 'All India Institute of Medical Sciences, New Delhi',
    license_number: 'BB-DL-001',
    district: 'South Delhi',
    state: 'Delhi',
    address: 'Ansari Nagar, New Delhi, Delhi - 110029',
    city: 'New Delhi',
    pincode: '110029',
    category: 'Government',
    contact_number: '011-2659 4307',
    email: 'bloodbank@aiims.edu',
    website: 'https://www.aiims.edu',
    storage_capacity: 5000,
    cold_chain_verified: true,
    source_name: 'e-RaktKosh',
    source_url: 'https://eraktkosh.mohfw.gov.in/',
    source_verified: true,
    latitude: 28.5672,
    longitude: 77.2100,
    is_active: true
  };

  // Matrix data for blood groups & components
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Calculate stock counts from inventory props or generate realistic matrix
  const matrixData = bloodGroups.map((group, idx) => {
    const groupItems = inventory.filter(i => i.facility_id === bank.id && i.blood_group === group);
    const prbc = groupItems.find(i => i.component === 'PACKED_RED_BLOOD_CELLS')?.units_available ?? (group === 'O-' ? 2 : (8 + (idx * 3) % 15));
    const platelets = groupItems.find(i => i.component === 'PLATELET_CONCENTRATE')?.units_available ?? (2 + (idx * 2) % 8);
    const ffp = groupItems.find(i => i.component === 'FRESH_FROZEN_PLASMA')?.units_available ?? (5 + (idx * 4) % 18);
    const whole = groupItems.find(i => i.component === 'WHOLE_BLOOD')?.units_available ?? (3 + (idx * 2) % 10);
    
    let status: 'Available' | 'Low' | 'Critical' = 'Available';
    if (group === 'O-' || prbc < 4) status = 'Critical';
    else if (prbc < 8) status = 'Low';

    return { group, prbc, platelets, ffp, whole, status };
  });

  return (
    <div className="space-y-6">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9B001B] hover:text-[#7d0015] transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Search / Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs cursor-pointer">
            <Bookmark className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs cursor-pointer">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Header Facility Card (Screen 3 in Reference Image) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Info Column */}
          <div className="lg:col-span-8 space-y-4">
            
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {bank.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified</span>
                </span>
                {bank.category && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                    {bank.category}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-600">
                {bank.parent_hospital || 'Affiliated Healthcare Institute'}
              </p>
              
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{bank.address || `${bank.district}, ${bank.state}`}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href={`https://maps.google.com/?q=${bank.latitude},${bank.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <Navigation className="w-3.5 h-3.5 text-[#9B001B]" />
                <span>Get Directions</span>
              </a>

              <a
                href={`tel:${bank.contact_number}`}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call Centre</span>
              </a>

              {onViewOnMap && (
                <button
                  onClick={() => onViewOnMap(bank)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>View on Map</span>
                </button>
              )}

              <button
                onClick={onOpenSOSModal}
                className="px-4 py-2 rounded-xl bg-[#9B001B] hover:bg-[#800016] text-white text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ml-auto"
              >
                <span>Request Blood</span>
              </button>
            </div>

            {/* Facility Details Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Number</span>
                <span className="font-mono font-bold text-slate-800 text-[11px]">{bank.contact_number}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Email</span>
                <span className="font-medium text-slate-700 text-[11px] truncate block">{bank.email || 'transfusion@delhi.gov.in'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Type</span>
                <span className="font-medium text-slate-800 text-[11px]">{bank.category || 'Government'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Updated</span>
                <span className="font-medium text-slate-600 text-[11px]">2 hours ago</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Source</span>
                <a 
                  href={bank.source_url || 'https://eraktkosh.mohfw.gov.in/'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-0.5 text-[11px] font-semibold"
                >
                  <span>{bank.source_name || 'e-RaktKosh'}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

          </div>

          {/* Right Hospital Campus Image Preview Card */}
          <div className="lg:col-span-4 h-48 sm:h-52 rounded-xl overflow-hidden border border-slate-200 relative shadow-2xs group">
            <img 
              src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80" 
              alt={bank.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
              <span className="text-white text-xs font-bold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-rose-300" />
                <span>Regional Transfusion Facility Campus</span>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar text-xs font-bold">
        {[
          { id: 'availability', label: 'Blood Availability' },
          { id: 'about', label: 'About' },
          { id: 'services', label: 'Services' },
          { id: 'location', label: 'Location' },
          { id: 'insights', label: 'AI Insights' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2.5 px-3 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#9B001B] text-[#9B001B]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid: 8x4 Component Matrix & AI Insights Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: 8x4 Blood Component Matrix Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">
              Component Inventory Matrix (Units by Group)
            </h3>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Demo Simulated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2.5 px-4">Blood Group</th>
                  <th className="py-2.5 px-3 text-center">PRBC</th>
                  <th className="py-2.5 px-3 text-center">Platelets</th>
                  <th className="py-2.5 px-3 text-center">FFP</th>
                  <th className="py-2.5 px-3 text-center">Whole Blood</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {matrixData.map((row) => (
                  <tr key={row.group} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-black font-mono text-sm text-[#9B001B]">
                      {row.group}
                    </td>
                    <td className="py-3 px-3 text-center font-bold font-mono">
                      {row.prbc}
                    </td>
                    <td className="py-3 px-3 text-center font-bold font-mono">
                      {row.platelets}
                    </td>
                    <td className="py-3 px-3 text-center font-bold font-mono">
                      {row.ffp}
                    </td>
                    <td className="py-3 px-3 text-center font-bold font-mono">
                      {row.whole}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        row.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : row.status === 'Low'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: AI Insights Card (Exact Match to Screen 3 in Reference) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-[#9B001B]" />
            <span>AI Insights & Analytics</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Demand Forecast</span>
                <span className="font-bold text-slate-800">Stable</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Expiry Risk</span>
                <span className="font-bold text-slate-800">Low</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Nearby Alternative</span>
                <span className="font-bold text-slate-800">3 centres connected</span>
              </div>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Recommended Action</span>
              <p className="font-bold text-slate-900 text-xs">
                Maintain current stock. Rebalance 2 units of Platelets to adjacent trauma facility.
              </p>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed italic pt-1 border-t border-slate-100">
            AI-driven recommendations. Clinical decisions rest with registered medical professionals.
          </p>

          <button
            onClick={onOpenSOSModal}
            className="w-full py-2.5 rounded-xl bg-[#9B001B] hover:bg-[#800016] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Trigger Emergency Requisition
          </button>
        </div>

      </div>

    </div>
  );
};
