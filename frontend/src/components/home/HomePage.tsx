import React from 'react';
import { HeroReferenceSection } from './HeroReferenceSection';
import { QuickActionCards } from './QuickActionCards';
import { BloodSearchSection } from './BloodSearchSection';
import { OngoingInitiativesSection } from './OngoingInitiativesSection';
import { MapView } from '../MapView';
import { BloodBank, Hospital } from '../../types';
import { ArrowRight } from 'lucide-react';

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
    <div className="space-y-8 sm:space-y-10">
      
      {/* 1. Hero Section (Reference Design Section 3 & 4) */}
      <HeroReferenceSection
        onNavigateToTab={onNavigateToTab}
        onOpenSOSModal={onOpenSOSModal}
        onScrollToSearch={scrollToSearch}
      />

      {/* 2. Quick Action Cards (Reference Design Section 5) */}
      <QuickActionCards
        onNavigateToTab={onNavigateToTab}
        onOpenSOSModal={onOpenSOSModal}
        onScrollToSearch={scrollToSearch}
      />

      {/* 3. Search Blood Availability & Live Network Status (Reference Design Section 6 & 7) */}
      <BloodSearchSection 
        onOpenSOSModal={onOpenSOSModal} 
        onNavigateToTab={onNavigateToTab}
        bloodBanks={bloodBanks}
      />

      {/* 4. Ongoing Initiatives (Reference Design Section 8) */}
      <OngoingInitiativesSection
        onNavigateToTab={onNavigateToTab}
      />

      {/* 5. Interactive Geospatial Resource Map */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Regional Transfusion Facility Map
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Live geographic overview of accredited blood banks, trauma centers, and transit corridors.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('nearby')}
            className="self-start sm:self-auto text-xs font-bold text-[#9B001B] hover:text-[#7a0014] flex items-center gap-1 cursor-pointer group"
          >
            <span>Open Full Proximity Locator</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-[420px]">
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

