import React from 'react';
import { HomeHeroSlider } from './HomeHeroSlider';
import { BloodSearchSection } from './BloodSearchSection';
import { MapView } from '../MapView';
import { BloodBank, Hospital } from '../../types';
import { 
  Search, 
  AlertTriangle, 
  Building2, 
  HeartHandshake, 
  Network, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  Droplets,
  Activity,
  Award
} from 'lucide-react';

interface HomePageProps {
  bloodBanks: BloodBank[];
  hospitals: Hospital[];
  onOpenSOSModal: () => void;
  onNavigateToTab: (tab: any) => void;
  activeDispatch: any;
  selectedFacility: any;
  onSelectFacility: (fac: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  bloodBanks,
  hospitals,
  onOpenSOSModal,
  onNavigateToTab,
  activeDispatch,
  selectedFacility,
  onSelectFacility,
}) => {
  const scrollToSearch = () => {
    const el = document.getElementById('blood-search-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-10">
      
      {/* 1. Modern Slider Hero (Replaced previous dark blue hero) */}
      <HomeHeroSlider
        onNavigateToTab={onNavigateToTab}
        onOpenSOSModal={onOpenSOSModal}
        onScrollToSearch={scrollToSearch}
      />

      {/* 2. Primary Blood Search Card (Prominent Centerpiece) */}
      <BloodSearchSection 
        onOpenSOSModal={onOpenSOSModal} 
        onNavigateToTab={onNavigateToTab}
      />

      {/* 3. Four Core e-RaktKosh-Inspired Functional Hubs */}
      <section className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h3 className="text-xl font-black text-slate-900">
            Citizen & Hospital Public Services
          </h3>
          <p className="text-xs text-slate-500">
            Direct access to regional blood bank inventories, community donation camps, and inter-hospital logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Blood Availability */}
          <div 
            onClick={scrollToSearch}
            className="health-card p-5 cursor-pointer hover:border-red-400 space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Blood Availability</h4>
              <p className="text-xs text-slate-500 mt-1">
                Real-time stock query by blood group, component, and geographic proximity.
              </p>
            </div>
            <span className="text-xs font-bold text-red-600 flex items-center gap-1 pt-1">
              <span>Search Stock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 2: Blood Center Directory */}
          <div 
            onClick={() => onNavigateToTab('blood-centers')}
            className="health-card p-5 cursor-pointer hover:border-blue-400 space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Blood Center Directory</h4>
              <p className="text-xs text-slate-500 mt-1">
                Complete directory of certified regional transfusion centers and lab desks.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 flex items-center gap-1 pt-1">
              <span>View Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 3: Blood Donation Camps */}
          <div 
            onClick={() => onNavigateToTab('donation-camps')}
            className="health-card p-5 cursor-pointer hover:border-emerald-400 space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Blood Donation Camps</h4>
              <p className="text-xs text-slate-500 mt-1">
                Schedule blood donation appointments at community and mobile blood drives.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 pt-1">
              <span>Explore Camps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 4: Hospital Resource Network */}
          <div 
            onClick={() => onNavigateToTab('hospital-network')}
            className="health-card p-5 cursor-pointer hover:border-purple-400 space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Hospital Network (H2H)</h4>
              <p className="text-xs text-slate-500 mt-1">
                Direct hospital-to-hospital requisitions and emergency inventory balancing.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-600 flex items-center gap-1 pt-1">
              <span>View H2H Network</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

        </div>
      </section>

      {/* 4. Interactive Geospatial Resource Map */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Regional Transfusion Facility Map
            </h3>
            <p className="text-xs text-slate-500">
              Live geographic overview of accredited blood banks, trauma centers, and transit corridors.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('nearby')}
            className="self-start sm:self-auto text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <span>Open Full Proximity Locator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[420px]">
          <MapView
            bloodBanks={bloodBanks}
            hospitals={hospitals}
            activeDispatch={activeDispatch}
            selectedFacility={selectedFacility}
            onSelectFacility={onSelectFacility}
          />
        </div>
      </section>

    </div>
  );
};
