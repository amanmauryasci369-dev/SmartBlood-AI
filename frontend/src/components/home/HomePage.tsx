import React from 'react';
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
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-white p-8 sm:p-12 shadow-xl">
        {/* Subtle background radial glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Healthcare Decision Support</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-white">LifeLink</span>
                <span className="px-2.5 py-0.5 rounded-md bg-red-600/30 border border-red-500/40 text-[11px] font-bold text-red-300 uppercase tracking-widest">Network</span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-red-400 tracking-wide uppercase">
                Smart Hospital & Blood Network
              </p>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug text-slate-100">
              Connecting Hospitals. <span className="text-red-500">Saving Critical Time.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
              An intelligent network for blood availability, emergency coordination, shortage prediction, and resource optimization.
            </p>

            <p className="text-xs text-slate-400 italic">
              "Connect hospitals. Find blood faster. Predict shortages. Reduce wastage."
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={scrollToSearch}
                className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs sm:text-sm font-black tracking-wide uppercase shadow-lg shadow-red-900/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Find Blood</span>
              </button>

              <button
                onClick={onOpenSOSModal}
                className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-bold tracking-wide uppercase border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Emergency Request</span>
              </button>

              <button
                onClick={() => onNavigateToTab('hospital-network')}
                className="px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 text-xs sm:text-sm font-bold tracking-wide uppercase border border-cyan-800/50 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Network className="w-4 h-4 text-cyan-400" />
                <span>Explore LifeLink Network</span>
              </button>
            </div>
          </div>

          {/* Conceptual Network Diagram: Hospitals <-> Blood Banks <-> LifeLink Network <-> Donors <-> Emergency */}
          <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Network className="w-3.5 h-3.5" />
                Resource Coordination Flow
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                LIVE NODES
              </span>
            </div>

            <div className="space-y-2 text-center text-xs font-semibold">
              <div className="p-2.5 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-200 flex items-center justify-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>HOSPITALS & CLINICS</span>
              </div>
              <div className="text-slate-500 font-mono text-sm leading-none">&#8597;</div>
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-200 flex items-center justify-center gap-2">
                <Droplets className="w-4 h-4 text-red-400" />
                <span>LICENSED BLOOD CENTERS</span>
              </div>
              <div className="text-slate-500 font-mono text-sm leading-none">&#8597;</div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-red-600/30 via-slate-800 to-cyan-600/30 border-2 border-red-500 text-white shadow-lg flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-red-400" />
                <span className="font-black tracking-wider text-sm">LIFELINK NETWORK</span>
              </div>
              <div className="text-slate-500 font-mono text-sm leading-none">&#8597;</div>
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 flex items-center justify-center gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                <span>VERIFIED DONORS</span>
              </div>
              <div className="text-slate-500 font-mono text-sm leading-none">&#8597;</div>
              <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-200 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>PATIENT / EMERGENCY REQUESTS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time stats ribbon at bottom of hero */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 block">Connected Blood Centers</span>
            <strong className="text-lg font-mono font-bold text-white">50+ Licensed Centers</strong>
          </div>
          <div>
            <span className="text-slate-400 block">AI Anticipation Horizon</span>
            <strong className="text-lg font-mono font-bold text-red-400">72 Hours Prior</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Connected Hospitals</span>
            <strong className="text-lg font-mono font-bold text-emerald-400">Regional Network</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Coordination Engine</span>
            <strong className="text-lg font-mono font-bold text-cyan-400">LifeLink AI Active</strong>
          </div>
        </div>
      </section>

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
