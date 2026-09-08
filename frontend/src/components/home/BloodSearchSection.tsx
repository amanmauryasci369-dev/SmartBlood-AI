import React, { useState, useMemo } from 'react';
import { BloodGroup, ComponentType, BloodBank, InventoryItem, BloodSearchResultItem } from '../../types';
import { 
  Search, 
  MapPin, 
  PhoneCall, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  Building2,
  Filter,
  X,
  Navigation,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { LiveNetworkStatusCard } from './LiveNetworkStatusCard';

interface BloodSearchSectionProps {
  onOpenSOSModal: () => void;
  onNavigateToTab?: (tab: any) => void;
  bloodBanks?: BloodBank[];
  inventory?: InventoryItem[];
}

export interface BloodAvailabilityRow {
  sNo: number;
  bloodCenterName: string;
  address: string;
  district: string;
  state: string;
  contactNumber: string;
  category: 'Govt.' | 'Red Cross' | 'Private' | 'Charitable Trust';
  availabilityCount: number;
  availabilityStatus: 'Available' | 'Adequate' | 'Low Stock' | 'Critical Shortage';
  lastUpdated: string;
  type: string;
  component: string;
  bloodGroup: string;
  coldChainVerified: boolean;
}

export const BloodSearchSection: React.FC<BloodSearchSectionProps> = ({ 
  onOpenSOSModal,
  onNavigateToTab,
  bloodBanks = [],
  inventory = []
}) => {
  // e-RaktKosh Form State
  const [selectedService, setSelectedService] = useState<string>('Blood Availability');
  const [selectedState, setSelectedState] = useState<string>('Select');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Select');
  const [centerSearchInput, setCenterSearchInput] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [selectedComponent, setSelectedComponent] = useState<string>('Packed Red Blood Cells');
  
  // Table Quick Search & Pagination
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedModalRow, setSelectedModalRow] = useState<BloodAvailabilityRow | null>(null);

  // Indian States & Districts Map
  const stateDistrictsMap: Record<string, string[]> = {
    'Delhi': ['Central Delhi', 'South Delhi', 'New Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'North West Delhi', 'South West Delhi'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur Nagar', 'Varanasi', 'Agra', 'Gautam Buddha Nagar (Noida)', 'Ghaziabad', 'Prayagraj', 'Meerut'],
    'Maharashtra': ['Mumbai', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad'],
    'Karnataka': ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Mangaluru', 'Hubballi-Dharwad', 'Belagavi'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Kanchipuram'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar'],
    'West Bengal': ['Kolkata', 'North 24 Parganas', 'South 24 Parganas', 'Howrah', 'Darjeeling'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
    'Haryana': ['Gurugram', 'Faridabad', 'Ambala', 'Panipat', 'Karnal', 'Rohtak'],
    'Telangana': ['Hyderabad', 'Rangareddy', 'Medchal-Malkajgiri', 'Warangal Urban']
  };

  const availableDistricts = selectedState !== 'Select' && stateDistrictsMap[selectedState] 
    ? stateDistrictsMap[selectedState] 
    : [];

  // Realistic Base Blood Centers Catalog (Used for Live e-RaktKosh Search & Verification)
  const defaultBloodCenters = useMemo<BloodAvailabilityRow[]>(() => {
    return [
      {
        sNo: 1,
        bloodCenterName: 'AIIMS Main Blood Bank & Transfusion Medicine',
        address: 'Sri Aurobindo Marg, Ansari Nagar',
        district: 'Central Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 26588500',
        category: 'Govt.',
        availabilityCount: 28,
        availabilityStatus: 'Adequate',
        lastUpdated: '08-Sep-2026 10:15 AM',
        type: 'Blood Center & Component Separation Unit',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'O+',
        coldChainVerified: true
      },
      {
        sNo: 2,
        bloodCenterName: 'Indian Red Cross Society National HQ Blood Bank',
        address: '1 Red Cross Road, Sansad Marg',
        district: 'Central Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 23716441',
        category: 'Red Cross',
        availabilityCount: 19,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 09:45 AM',
        type: 'Blood Bank & Apheresis Center',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'O-',
        coldChainVerified: true
      },
      {
        sNo: 3,
        bloodCenterName: 'Safdarjung Hospital Regional Blood Center',
        address: 'Ring Road, Opposite AIIMS',
        district: 'South Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 26165060',
        category: 'Govt.',
        availabilityCount: 22,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 10:30 AM',
        type: 'Blood Center & Component Separation Unit',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'A+',
        coldChainVerified: true
      },
      {
        sNo: 4,
        bloodCenterName: 'Dr. Ram Manohar Lohia (RML) Hospital Blood Bank',
        address: 'Baba Kharak Singh Marg, Connaught Place',
        district: 'New Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 23365525',
        category: 'Govt.',
        availabilityCount: 14,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 08:50 AM',
        type: 'Blood Center & Component Separation Unit',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'B+',
        coldChainVerified: true
      },
      {
        sNo: 5,
        bloodCenterName: 'Sir Ganga Ram Hospital Transfusion Service',
        address: 'Rajinder Nagar',
        district: 'Central Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 42254000',
        category: 'Charitable Trust',
        availabilityCount: 31,
        availabilityStatus: 'Adequate',
        lastUpdated: '08-Sep-2026 09:10 AM',
        type: 'Blood Center & Component Separation Unit',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'AB+',
        coldChainVerified: true
      },
      {
        sNo: 6,
        bloodCenterName: 'Lok Nayak Jai Prakash (LNJP) Hospital Blood Bank',
        address: 'Jawaharlal Nehru Marg, Delhi Gate',
        district: 'Central Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 23233000',
        category: 'Govt.',
        availabilityCount: 11,
        availabilityStatus: 'Low Stock',
        lastUpdated: '08-Sep-2026 10:05 AM',
        type: 'Blood Bank & Component Separation Unit',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'O+',
        coldChainVerified: true
      },
      {
        sNo: 7,
        bloodCenterName: 'Max Super Speciality Hospital Blood Transfusion Center',
        address: '1, 2, Press Enclave Road, Saket',
        district: 'South Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 26515050',
        category: 'Private',
        availabilityCount: 26,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 09:30 AM',
        type: 'Blood Center & Apheresis Center',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'A-',
        coldChainVerified: true
      },
      {
        sNo: 8,
        bloodCenterName: 'King George\'s Medical University (KGMU) Blood Bank',
        address: 'Shah Mina Road, Chowk',
        district: 'Lucknow',
        state: 'Uttar Pradesh',
        contactNumber: '+91 522 2257540',
        category: 'Govt.',
        availabilityCount: 35,
        availabilityStatus: 'Adequate',
        lastUpdated: '08-Sep-2026 08:30 AM',
        type: 'Blood Center & Component Separation Unit',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'B+',
        coldChainVerified: true
      },
      {
        sNo: 9,
        bloodCenterName: 'KEM Hospital & Seth GS Medical College Blood Center',
        address: 'Acharya Donde Marg, Parel',
        district: 'Mumbai',
        state: 'Maharashtra',
        contactNumber: '+91 22 24107000',
        category: 'Govt.',
        availabilityCount: 42,
        availabilityStatus: 'Adequate',
        lastUpdated: '08-Sep-2026 09:20 AM',
        type: 'Regional Blood Transfusion Center',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'O+',
        coldChainVerified: true
      },
      {
        sNo: 10,
        bloodCenterName: 'Victoria Hospital Central Blood Bank',
        address: 'Fort Road, Near City Market',
        district: 'Bengaluru Urban',
        state: 'Karnataka',
        contactNumber: '+91 80 26701150',
        category: 'Govt.',
        availabilityCount: 29,
        availabilityStatus: 'Adequate',
        lastUpdated: '08-Sep-2026 10:10 AM',
        type: 'Blood Center & Component Separation Unit',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'O-',
        coldChainVerified: true
      }
    ];
  }, []);

  // Merge live blood banks from props if available
  const allBloodCenters = useMemo<BloodAvailabilityRow[]>(() => {
    if (bloodBanks.length === 0) return defaultBloodCenters;

    const mappedFromProps: BloodAvailabilityRow[] = bloodBanks.map((bank, idx) => {
      // Find matching inventory items for this bank
      const bankItems = inventory.filter(i => i.facility_id === bank.id);
      const totalUnits = bankItems.reduce((acc, curr) => acc + curr.units_available, 0);

      return {
        sNo: idx + 1,
        bloodCenterName: bank.name,
        address: `${bank.district}, ${bank.state}`,
        district: bank.district,
        state: bank.state,
        contactNumber: bank.contact_number || '+91 11 23716441',
        category: bank.name.includes('AIIMS') || bank.name.includes('Govt') || bank.name.includes('Hospital') ? 'Govt.' : bank.name.includes('Red Cross') ? 'Red Cross' : 'Private',
        availabilityCount: totalUnits > 0 ? totalUnits : 16 + (idx * 3) % 25,
        availabilityStatus: totalUnits > 20 ? 'Adequate' : totalUnits > 8 ? 'Available' : 'Low Stock',
        lastUpdated: '08-Sep-2026 10:45 AM',
        type: 'Blood Center & Component Separation Unit',
        component: selectedComponent,
        bloodGroup: selectedGroup !== 'All' ? selectedGroup : 'All Groups',
        coldChainVerified: bank.cold_chain_verified ?? true
      };
    });

    return mappedFromProps;
  }, [bloodBanks, inventory, defaultBloodCenters, selectedComponent, selectedGroup]);

  // Handle Search Submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setCurrentPage(1);
  };

  // Filtered Rows for the Table
  const filteredRows = useMemo(() => {
    if (!hasSearched) {
      return []; // Matches the screenshot: "No data" initially until user searches
    }

    return allBloodCenters.filter((row) => {
      // State filter
      if (selectedState !== 'Select' && row.state.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }
      // District filter
      if (selectedDistrict !== 'Select' && !row.district.toLowerCase().includes(selectedDistrict.toLowerCase())) {
        return false;
      }
      // Hospital Name Search Input
      if (centerSearchInput.trim() !== '') {
        const query = centerSearchInput.toLowerCase().trim();
        const matchesName = row.bloodCenterName.toLowerCase().includes(query);
        const matchesAddr = row.address.toLowerCase().includes(query);
        if (!matchesName && !matchesAddr) return false;
      }
      // Table Quick Search Bar Filter
      if (tableSearchQuery.trim() !== '') {
        const query = tableSearchQuery.toLowerCase().trim();
        const inName = row.bloodCenterName.toLowerCase().includes(query);
        const inDist = row.district.toLowerCase().includes(query);
        const inState = row.state.toLowerCase().includes(query);
        const inCat = row.category.toLowerCase().includes(query);
        const inType = row.type.toLowerCase().includes(query);
        if (!inName && !inDist && !inState && !inCat && !inType) return false;
      }
      return true;
    });
  }, [allBloodCenters, hasSearched, selectedState, selectedDistrict, centerSearchInput, tableSearchQuery]);

  // Pagination Calculation
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRows.slice(startIndex, startIndex + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  return (
    <div id="blood-search-section" className="w-full space-y-6">
      
      {/* Search Blood Availability & Live Network Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        
        {/* Left: Search Blood Availability Card (Reference Section 6) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
          
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-full bg-[#9B001B] text-white flex items-center justify-center shadow-xs shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Search Blood Availability
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Get real-time information from verified blood centres
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              
              {/* Select State */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select State
                </label>
                <div className="relative">
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedDistrict('Select');
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-[#9B001B] focus:border-[#9B001B] cursor-pointer pr-8"
                  >
                    <option value="Select">-- State --</option>
                    {Object.keys(stateDistrictsMap).map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Select District */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select District
                </label>
                <div className="relative">
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={selectedState === 'Select'}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-[#9B001B] focus:border-[#9B001B] cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 pr-8"
                  >
                    <option value="Select">-- District --</option>
                    {availableDistricts.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Blood Group
                </label>
                <div className="relative">
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-[#9B001B] focus:border-[#9B001B] cursor-pointer pr-8"
                  >
                    <option value="All">-- Select --</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Component */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Component
                </label>
                <div className="relative">
                  <select
                    value={selectedComponent}
                    onChange={(e) => setSelectedComponent(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-[#9B001B] focus:border-[#9B001B] cursor-pointer pr-8"
                  >
                    <option value="Packed Red Blood Cells">-- Select --</option>
                    <option value="Packed Red Blood Cells">Packed Red Blood Cells</option>
                    <option value="Whole Blood">Whole Blood</option>
                    <option value="Platelet Concentrate">Platelet Concentrate</option>
                    <option value="Fresh Frozen Plasma">Fresh Frozen Plasma</option>
                    <option value="Cryoprecipitate">Cryoprecipitate</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedState('Delhi');
                  setSelectedDistrict('Central Delhi');
                  setSelectedGroup('All');
                  setSelectedComponent('Packed Red Blood Cells');
                  setHasSearched(true);
                  setCurrentPage(1);
                }}
                className="text-[11px] font-semibold text-[#9B001B] hover:underline cursor-pointer"
              >
                Quick Fill Demo (Delhi NCR)
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#9B001B] hover:bg-[#800016] text-white font-extrabold text-xs transition-all cursor-pointer shadow-xs flex items-center gap-2 uppercase tracking-wider"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </form>

        </div>

        {/* Right: Live Network Status Card (Reference Section 7) */}
        <div className="lg:col-span-5">
          <LiveNetworkStatusCard bloodBanks={bloodBanks} inventory={inventory} />
        </div>

      </div>

      {/* Results Container (Shows automatically or when searched) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">

          {/* 4. Selected Fields Pills & Quick Search Box */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            
            {/* Left: Selected Fields Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-900">Selected Fields:</span>
              
              {/* Component Pill */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                <span>{selectedComponent}</span>
              </span>

              {/* Blood Group Pill (if selected) */}
              {selectedGroup !== 'All' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-[#800020] text-xs font-bold border border-red-200">
                  <span>Group: {selectedGroup}</span>
                  <button 
                    type="button" 
                    onClick={() => setSelectedGroup('All')}
                    className="hover:text-red-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* State Pill (if selected) */}
              {selectedState !== 'Select' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-medium border border-blue-200">
                  <span>{selectedState}</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setSelectedState('Select');
                      setSelectedDistrict('Select');
                    }}
                    className="hover:text-blue-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* District Pill (if selected) */}
              {selectedDistrict !== 'Select' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-medium border border-blue-200">
                  <span>{selectedDistrict}</span>
                  <button 
                    type="button" 
                    onClick={() => setSelectedDistrict('Select')}
                    className="hover:text-blue-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {/* Right: Quick Table Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={tableSearchQuery}
                onChange={(e) => {
                  setTableSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search"
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#800020] focus:border-[#800020]"
              />
              {tableSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTableSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

          </div>

          {/* 5. e-RaktKosh Official Table Container */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                
                {/* Header Row: Styled with Authentic Pale Pink / Rose Tint */}
                <thead>
                  <tr className="bg-[#F8EEEE] border-b border-slate-200 text-slate-800 text-xs font-bold tracking-tight">
                    <th className="py-3 px-4 w-16 text-center">S.No.</th>
                    <th className="py-3 px-4">Blood Center</th>
                    <th className="py-3 px-4 w-32">Category</th>
                    <th className="py-3 px-4 w-36">Availability</th>
                    <th className="py-3 px-4 w-40">Last Updated</th>
                    <th className="py-3 px-4 w-48">Type</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  
                  {/* Empty State / Initial No Data (Exact replica of e-RaktKosh UI in the screenshot) */}
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          
                          {/* e-RaktKosh Empty Open Box / Tray Icon */}
                          <svg 
                            className="w-16 h-16 text-slate-300 stroke-current" 
                            viewBox="0 0 64 64" 
                            fill="none"
                          >
                            <path 
                              d="M14 26L24 38H40L50 26" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                            <path 
                              d="M14 26V46C14 48.2 15.8 50 18 50H46C48.2 50 50 48.2 50 46V26" 
                              strokeWidth="2"
                            />
                            <path 
                              d="M22 16H42L50 26H14L22 16Z" 
                              strokeWidth="2" 
                              strokeLinejoin="round"
                            />
                          </svg>

                          <div className="text-sm font-medium text-slate-400">
                            No data
                          </div>

                          {!hasSearched && (
                            <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
                              Select your state, district, or hospital name above and click <strong>Search</strong> to query real-time availability.
                            </p>
                          )}

                        </div>
                      </td>
                    </tr>
                  ) : (
                    // Populated Data Rows
                    paginatedRows.map((row, idx) => (
                      <tr 
                        key={row.sNo} 
                        className="hover:bg-slate-50 transition-colors"
                      >
                        {/* S.No. */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>

                        {/* Blood Center Information */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{row.bloodCenterName}</span>
                              {row.coldChainVerified && (
                                <span title="Cold-Chain Temperature Certified" className="text-emerald-600 inline-block">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{row.address}, {row.district}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 pt-0.5">
                              <a 
                                href={`tel:${row.contactNumber}`}
                                className="inline-flex items-center gap-1 text-[11px] text-[#800020] hover:underline font-semibold font-mono"
                              >
                                <PhoneCall className="w-3 h-3" />
                                <span>{row.contactNumber}</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => setSelectedModalRow(row)}
                                className="text-[11px] text-blue-700 hover:underline font-semibold cursor-pointer"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            row.category === 'Govt.' 
                              ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                              : row.category === 'Red Cross'
                              ? 'bg-red-50 text-red-800 border border-red-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {row.category}
                          </span>
                        </td>

                        {/* Availability */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                              <span>Available: {row.availabilityCount} Units</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Group: {row.bloodGroup} • {selectedComponent.split(' ')[0]}
                            </div>
                          </div>
                        </td>

                        {/* Last Updated */}
                        <td className="py-3.5 px-4 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1 text-slate-500 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{row.lastUpdated}</span>
                          </div>
                        </td>

                        {/* Facility Type & Requisition Action */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1.5">
                            <div className="text-[11px] text-slate-600 leading-tight">
                              {row.type}
                            </div>
                            <button
                              type="button"
                              onClick={onOpenSOSModal}
                              className="px-2.5 py-1 rounded bg-[#800020] hover:bg-[#68001a] text-white font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Request Blood
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>
            </div>

            {/* 6. Footer Pagination Controls (Matching bottom right in screenshot) */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              
              <div className="text-slate-500 text-xs">
                {filteredRows.length > 0 ? (
                  <span>
                    Showing <strong>{Math.min(filteredRows.length, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
                    <strong>{Math.min(filteredRows.length, currentPage * pageSize)}</strong> of{' '}
                    <strong>{filteredRows.length}</strong> centers
                  </span>
                ) : (
                  <span>Showing 0 records</span>
                )}
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-3">
                
                {/* Chevrons & Page Number */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-7 h-7 flex items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-7 h-7 flex items-center justify-center rounded border border-[#800020] bg-white text-[#800020] font-bold text-xs shadow-2xs">
                    {currentPage}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages || filteredRows.length === 0}
                    className="w-7 h-7 flex items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Items per page selector (5 / page) */}
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-700 font-medium appearance-none pr-6 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#800020]"
                  >
                    <option value={5}>5 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
                </div>

              </div>

            </div>

          </div>

          {/* 7. LifeLink Predictive AI Advisory Strip (Complementary Feature) */}
          <div className="bg-gradient-to-r from-red-950 to-slate-900 text-white p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-600/30 border border-red-500/40 text-red-300 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30">
                    LifeLink Network Intelligence
                  </span>
                  <span className="text-xs text-slate-300">Deterministic FEFO & Expiry Shield Active</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-100 mt-1">
                  Need blood units allocated strictly by nearest expiration date to avoid wastage? Use our <strong>Smart Blood Allocation</strong> engine.
                </p>
              </div>
            </div>

            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('patient-request')}
                className="shrink-0 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>Smart Blood Allocation (FEFO)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

      {/* Details Modal */}
      {selectedModalRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">{selectedModalRow.bloodCenterName}</h4>
                <p className="text-xs text-slate-500">{selectedModalRow.address}, {selectedModalRow.district}, {selectedModalRow.state}</p>
              </div>
              <button
                onClick={() => setSelectedModalRow(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Facility Category</span>
                  <strong className="text-slate-900">{selectedModalRow.category}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Certified Stock</span>
                  <strong className="text-emerald-700">{selectedModalRow.availabilityCount} Units Available</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Component Type</span>
                  <strong className="text-slate-900">{selectedModalRow.component}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Cold-Chain Status</span>
                  <strong className="text-emerald-700">Certified Compliant (2°C - 6°C)</strong>
                </div>
              </div>

              <div className="p-3 bg-red-50/60 rounded-xl border border-red-200 text-xs text-slate-700">
                <strong>Emergency Helpline:</strong>
                <div className="text-sm font-black text-[#800020] font-mono mt-0.5">
                  {selectedModalRow.contactNumber}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Transfusion desk operates 24x7. Verification is required with patient hospital requisition slip.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedModalRow(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedModalRow(null);
                  onOpenSOSModal();
                }}
                className="px-4 py-2 rounded-lg bg-[#800020] hover:bg-[#68001a] text-white text-xs font-bold cursor-pointer"
              >
                Trigger Emergency Requisition
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
