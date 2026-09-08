import React, { useEffect, useState } from 'react';
import { 
  UserRole, 
  BloodBank, 
  Hospital, 
  InventoryItem, 
  StockSummary, 
  RebalanceProposal,
  AIInsightCard,
  AnalyticsTrendData 
} from './types';
import { ApiService } from './services/api';
import { Navbar, NavTab } from './components/Navbar';
import { HomePage } from './components/home/HomePage';
import { BloodSearchSection } from './components/home/BloodSearchSection';
import { BloodCenterDirectoryPage } from './components/directory/BloodCenterDirectoryPage';
import { EmergencyRequestPage } from './components/emergency/EmergencyRequestPage';
import { DonationCampsPage } from './components/camps/DonationCampsPage';
import { AIBloodIntelligenceDashboard } from './components/insights/AIBloodIntelligenceDashboard';
import { BloodInventoryPage } from './components/inventory/BloodInventoryPage';
import { AboutPage } from './components/about/AboutPage';
import { MapView } from './components/MapView';
import { BRAND } from './constants/branding';
import { LifeLinkLogo } from './components/common/LifeLinkLogo';
import { SmartBloodAllocationPage } from './components/patient/SmartBloodAllocationPage';
import { HospitalBloodExchangePage } from './components/hospital/HospitalBloodExchangePage';

import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { BloodBankDashboard } from './components/dashboards/BloodBankDashboard';
import { HospitalDashboard } from './components/dashboards/HospitalDashboard';
import { DonorDashboard } from './components/dashboards/DonorDashboard';
import { PatientDashboard } from './components/dashboards/PatientDashboard';
import { ExpiryRiskDashboard } from './components/dashboards/ExpiryRiskDashboard';
import { WastageAnalyticsPage } from './components/analytics/WastageAnalyticsPage';
import { HospitalNetworkPage } from './components/dashboards/HospitalNetworkPage';
import { HospitalCommunicationsPage } from './components/dashboards/HospitalCommunicationsPage';
import { AdminConfigurationPage } from './components/dashboards/AdminConfigurationPage';

import { EmergencySOSModal } from './components/EmergencySOSModal';
import { ModelMetricsModal } from './components/ModelMetricsModal';
import { BloodSearchModal } from './components/emergency/BloodSearchModal';
import { AnalyticsCharts } from './components/analytics/AnalyticsCharts';
import { AIInsightsSection } from './components/insights/AIInsightsSection';
import { DonorMatchingPanel } from './components/emergency/DonorMatchingPanel';
import { LiveDemoSimulator } from './components/LiveDemoSimulator';
import { PhoneCall } from 'lucide-react';

import { 
  Activity, 
  Search, 
  Sparkles,
  TrendingUp,
  Users,
  ShieldCheck,
  AlertTriangle,
  Info,
  Droplets,
  Building2
} from 'lucide-react';

export const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [backendHealthy, setBackendHealthy] = useState<boolean>(false);

  // Core Data State
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummary | null>(null);
  const [rebalanceProposals, setRebalanceProposals] = useState<RebalanceProposal[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsightCard[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsTrendData | null>(null);
  
  // Modals & Active Dispatch
  const [isSOSModalOpen, setIsSOSModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState<boolean>(false);
  const [activeDispatch, setActiveDispatch] = useState<{
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    units: number;
    bloodGroup: string;
  } | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<BloodBank | Hospital | null>(null);

  // Role credentials map for instant judging login
  const roleCredentials: Record<UserRole, { email: string; pass: string }> = {
    ADMIN: { email: 'admin@smartblood.gov', pass: 'AdminPassword123!' },
    BLOOD_BANK: { email: 'bloodbank@redcross.org', pass: 'BankPassword123!' },
    HOSPITAL: { email: 'trauma@aiims.edu', pass: 'HospitalPassword123!' },
    DONOR: { email: 'donor.priya@example.com', pass: 'DonorPassword123!' },
    PATIENT: { email: 'patient.rahul@example.com', pass: 'PatientPassword123!' },
  };

  const authenticateRole = async (targetRole: UserRole) => {
    try {
      const creds = roleCredentials[targetRole];
      await ApiService.login(creds.email, creds.pass);
    } catch (err) {
      console.warn('Silent role authentication handled:', err);
      ApiService.clearToken();
    }
  };

  const loadAllData = async () => {
    try {
      const health = await fetch('http://127.0.0.1:8000/health').then(r => r.json()).catch(() => null);
      setBackendHealthy(health?.status === 'healthy');

      const [banks, hosps, inv, summary, rebal, insights, analytics] = await Promise.all([
        ApiService.getBloodBanks().catch(() => []),
        ApiService.getHospitals().catch(() => []),
        ApiService.getInventory().catch(() => []),
        ApiService.getStockSummary().catch(() => null),
        ApiService.getRebalanceProposals().catch(() => []),
        fetch('http://127.0.0.1:8000/api/v1/intel/insights').then(r => r.json()).catch(() => []),
        fetch('http://127.0.0.1:8000/api/v1/intel/analytics').then(r => r.json()).catch(() => null),
      ]);

      setBloodBanks(banks);
      setHospitals(hosps);
      setInventory(inv);
      setStockSummary(summary);
      setRebalanceProposals(rebal);
      setAiInsights(insights);
      setAnalyticsData(analytics);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    authenticateRole(role).then(() => {
      loadAllData();
    });
  }, [role]);

  // Dynamic Browser & Page Title
  useEffect(() => {
    document.title = BRAND.TITLES[activeTab] || BRAND.FULL_NAME;
  }, [activeTab]);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'ADMIN') setActiveTab('admin-dashboard');
    else if (newRole === 'BLOOD_BANK') setActiveTab('inventory');
    else if (newRole === 'HOSPITAL') setActiveTab('hospital-exchange');
    else if (newRole === 'DONOR') setActiveTab('donors');
    else if (newRole === 'PATIENT') setActiveTab('patient-request');
  };

  // Role-Based Route Protection (Rule 1)
  // If non-hospital user attempts to access hospital-exchange, redirect to appropriate tab
  useEffect(() => {
    if (activeTab === 'hospital-exchange' && role !== 'HOSPITAL') {
      console.warn(`RBAC Enforcement: Role '${role}' is not authorized for Hospital Blood Exchange. Redirecting...`);
      setActiveTab('home');
    }
  }, [activeTab, role]);

  const handleDispatchConfirmed = (dispatch: any) => {
    setActiveDispatch(dispatch);
    setIsSOSModalOpen(false);
    loadAllData();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* 1. Header & Navigation (Phases 2 & 12) */}
      <Navbar
        currentRole={role}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSOSModal={() => setIsSOSModalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenMetrics={() => setIsMetricsModalOpen(true)}
        backendHealthy={backendHealthy}
      />

      {/* 2. Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        

        {/* 3. View Routing (Phases 3 - 11) */}
        {activeTab === 'home' && (
          <HomePage
            bloodBanks={bloodBanks}
            hospitals={hospitals}
            onOpenSOSModal={() => setIsSOSModalOpen(true)}
            onNavigateToTab={setActiveTab}
            activeDispatch={activeDispatch}
            selectedFacility={selectedFacility}
            onSelectFacility={(fac) => setSelectedFacility(fac)}
          />
        )}

        {activeTab === 'patient-request' && (
          <SmartBloodAllocationPage />
        )}

        {activeTab === 'find-blood' && (
          <BloodSearchSection
            onOpenSOSModal={() => setIsSOSModalOpen(true)}
            onNavigateToTab={setActiveTab}
            bloodBanks={bloodBanks}
            inventory={inventory}
          />
        )}

        {activeTab === 'blood-centers' && (
          <BloodCenterDirectoryPage
            bloodBanks={bloodBanks}
            inventory={inventory}
            onOpenSOSModal={() => setIsSOSModalOpen(true)}
          />
        )}

        {activeTab === 'nearby' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-xl font-black text-slate-900">Nearby Blood Centers & Facilities (GIS Locator)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time spatial proximity, ambulance transit contours, and cold-chain compliance.
              </p>
            </div>
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs h-[600px] overflow-hidden">
              <MapView
                bloodBanks={bloodBanks}
                hospitals={hospitals}
                activeDispatch={activeDispatch}
                selectedFacility={selectedFacility}
                onSelectFacility={(fac) => setSelectedFacility(fac)}
              />
            </div>
          </div>
        )}

        {activeTab === 'emergency-request' && (
          <EmergencyRequestPage
            hospitals={hospitals}
            onDispatchConfirmed={handleDispatchConfirmed}
          />
        )}

        {activeTab === 'donation-camps' && (
          <DonationCampsPage />
        )}

        {activeTab === 'donors' && (
          <DonorDashboard />
        )}

        {activeTab === 'ai-insights' && (
          <AIBloodIntelligenceDashboard
            onNavigateToTab={setActiveTab}
            onOpenMetrics={() => setIsMetricsModalOpen(true)}
          />
        )}

        {activeTab === 'inventory' && (
          <BloodInventoryPage bloodBanks={bloodBanks} />
        )}

        {activeTab === 'expiry-risk' && (
          <ExpiryRiskDashboard />
        )}

        {activeTab === 'wastage-analytics' && (
          <WastageAnalyticsPage />
        )}

        {activeTab === 'hospital-exchange' && (
          <HospitalBloodExchangePage
            currentRole={role}
            onRoleSwitch={handleRoleChange}
          />
        )}

        {activeTab === 'hospital-network' && (
          <HospitalNetworkPage />
        )}

        {activeTab === 'hospital-communications' && (
          <HospitalCommunicationsPage />
        )}

        {activeTab === 'admin-dashboard' && (
          <div className="space-y-6">
            <AdminDashboard
              stockSummary={stockSummary}
              rebalanceProposals={rebalanceProposals}
              bloodBanks={bloodBanks}
              hospitals={hospitals}
              onRefreshData={loadAllData}
              onNavigateToTab={setActiveTab}
            />
            <AnalyticsCharts data={analyticsData} />
          </div>
        )}

        {activeTab === 'admin-configuration' && (
          <AdminConfigurationPage />
        )}

        {activeTab === 'about' && (
          <AboutPage />
        )}

      </main>

      {/* 4. Professional Healthcare Footer (Reference Section 24) */}
      <footer className="bg-slate-900 text-white mt-14 border-t border-slate-800 text-xs">
        
        {/* National Portal Top Bar */}
        <div className="bg-slate-950/80 border-b border-slate-800/80 py-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Official National Health Mission Integrated Platform</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-slate-400">
              <a href="https://india.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                National Portal of India
              </a>
              <a href="https://digitalindia.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                Digital India
              </a>
              <span className="text-slate-500">&bull;</span>
              <span className="text-slate-400 font-medium">Ministry of Health &amp; Family Welfare</span>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Column 1: LifeLink Primary Platform Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#9B001B] flex items-center justify-center text-white shadow-xs">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <path d="M12 2.5C12 2.5 6 9.5 6 14C6 17.3137 8.68629 20 12 20C15.3137 20 18 17.3137 18 14C18 9.5 12 2.5 12 2.5Z" fill="#ffffff" />
                    <path d="M8.5 14H10.5L11.5 11.5L12.5 16.5L13.5 14H15.5" stroke="#9B001B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-black text-white tracking-tight leading-none">LifeLink</div>
                  <div className="text-[10px] font-semibold text-rose-300 tracking-wide mt-0.5">
                    Connect &bull; Donate &bull; Save
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Autonomous AI blood resource intelligence, FEFO shelf-life prioritization, and emergency inter-hospital allocation system.
              </p>

              {/* 24x7 Helplines Badge */}
              <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80 space-y-1">
                <div className="text-[10px] uppercase font-extrabold text-rose-400 tracking-wider flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  <span>24x7 Emergency Helplines</span>
                </div>
                <div className="text-base font-black text-white font-mono flex items-center gap-2.5 pt-0.5">
                  <span className="text-rose-400">104</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-rose-400">108</span>
                  <span className="text-[10px] font-normal text-slate-400 font-sans ml-1">(Toll-Free National)</span>
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-3.5 text-xs border-b border-slate-800 pb-2">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-slate-400">
                <li>
                  <button onClick={() => setActiveTab('find-blood')} className="hover:text-white cursor-pointer transition-colors flex items-center gap-1.5">
                    <span>Looking for Blood</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('donation-camps')} className="hover:text-white cursor-pointer transition-colors">
                    Donate Blood
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('blood-centers')} className="hover:text-white cursor-pointer transition-colors">
                    Blood Centres
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    setRole('HOSPITAL');
                    setActiveTab('hospital-exchange');
                  }} className="hover:text-white cursor-pointer transition-colors">
                    Hospital Desk (H2H Exchange)
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('ai-insights')} className="hover:text-white cursor-pointer transition-colors">
                    AI Insights
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsSOSModalOpen(true)} className="text-red-400 font-extrabold hover:text-red-300 cursor-pointer transition-colors">
                    Emergency SOS &rarr;
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Portals & Roles */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-3.5 text-xs border-b border-slate-800 pb-2">
                Clinical &amp; Citizen Portals
              </h4>
              <ul className="space-y-2.5 text-slate-400">
                <li>
                  <button onClick={() => {
                    setRole('DONOR');
                    setActiveTab('donors');
                  }} className="hover:text-white cursor-pointer transition-colors">
                    Donor Profile Portal
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    setRole('BLOOD_BANK');
                    setActiveTab('inventory');
                  }} className="hover:text-white cursor-pointer transition-colors">
                    Blood Bank Officer Desk
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    setRole('HOSPITAL');
                    setActiveTab('hospital-network');
                  }} className="hover:text-white cursor-pointer transition-colors">
                    Hospital Network Registry
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    setRole('ADMIN');
                    setActiveTab('admin-dashboard');
                  }} className="hover:text-white cursor-pointer transition-colors">
                    Admin Command Center
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('wastage-analytics')} className="hover:text-white cursor-pointer transition-colors">
                    Wastage Reports &amp; Audit
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Resources & Governance */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-3.5 text-xs border-b border-slate-800 pb-2">
                Resources &amp; System
              </h4>
              <ul className="space-y-2.5 text-slate-400">
                <li>
                  <button onClick={() => setActiveTab('about')} className="hover:text-white cursor-pointer transition-colors">
                    About LifeLink
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsMetricsModalOpen(true)} className="hover:text-rose-400 cursor-pointer text-rose-300 transition-colors">
                    AI Scikit-Learn Validation
                  </button>
                </li>
                <li>
                  <span className="text-slate-500">Help &amp; Documentation</span>
                </li>
                <li>
                  <span className="text-slate-500">Privacy &amp; Data Security</span>
                </li>
                <li>
                  <span className="text-slate-500">Terms of Clinical Decision Support</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Compliance & Copyright Disclaimers */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-slate-500">
            <p>
              Website content managed and hosted by National Health Mission &amp; Ministry of Health and Family Welfare (MoHFW), Government of India.
            </p>
            <p className="text-slate-400 font-medium">
              LifeLink &bull; Connect &bull; Donate &bull; Save &bull; Production Release 2026.
            </p>
          </div>

        </div>
      </footer>

      {/* Modals & Simulation Controls */}
      <EmergencySOSModal
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
        hospitals={hospitals}
        onDispatchConfirmed={handleDispatchConfirmed}
      />

      <BloodSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      <ModelMetricsModal
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
      />

      <LiveDemoSimulator
        onCompleteScenario={handleDispatchConfirmed}
      />

    </div>
  );
};

export default App;
