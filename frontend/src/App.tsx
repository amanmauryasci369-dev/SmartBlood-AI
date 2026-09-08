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
  Play, 
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
        
        {/* Quick Demo Scenario Bar */}
        <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Play className="w-3.5 h-3.5 text-red-600 fill-current" />
            <span className="font-extrabold text-slate-900">SIH 2026 Evaluation Scenarios:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                setActiveTab('hospital-exchange');
                setRole('HOSPITAL');
              }}
              className="px-2.5 py-1 rounded-lg bg-[#800020] hover:bg-[#600018] text-white border border-[#800020] text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Droplets className="w-3 h-3 text-amber-300" />
              <span>Hospital Blood Exchange (FEFO)</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('emergency-request');
                setRole('HOSPITAL');
              }}
              className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-[11px] font-bold transition-all cursor-pointer"
            >
              1. Critical O− Trauma SOS
            </button>
            <button
              onClick={() => {
                setActiveTab('inventory');
                setRole('BLOOD_BANK');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-[11px] font-semibold transition-all cursor-pointer"
            >
              2. Lab Verification (FEFO)
            </button>
            <button
              onClick={() => setActiveTab('expiry-risk')}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold transition-all cursor-pointer"
            >
              3. Shelf-Life Decay
            </button>
            <button
              onClick={() => setActiveTab('wastage-analytics')}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-[11px] font-semibold transition-all cursor-pointer"
            >
              4. Wastage Reduction
            </button>
            <button
              onClick={() => setActiveTab('hospital-network')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-semibold transition-all cursor-pointer"
            >
              5. H2H Peer Requisitions
            </button>
            <button
              onClick={() => setActiveTab('hospital-communications')}
              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-[11px] font-semibold transition-all cursor-pointer"
            >
              6. Coordination Comms
            </button>
            <button
              onClick={() => setActiveTab('ai-insights')}
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>7. AI Shortage Engine</span>
            </button>
          </div>
        </div>

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

      {/* 4. Official Government of India e-RaktKosh Portal Footer */}
      <footer className="bg-slate-900 text-slate-300 mt-16 text-xs border-t-4 border-[#800020]">
        
        {/* Top Government Portals Affiliation Strip */}
        <div className="bg-slate-950 border-b border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <span className="font-bold text-slate-300 uppercase tracking-wider">National Healthcare Portals:</span>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <a href="https://mohfw.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                Ministry of Health & Family Welfare (MoHFW)
              </a>
              <a href="https://nhm.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                National Health Mission (NHM)
              </a>
              <a href="https://india.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                National Portal of India (india.gov.in)
              </a>
              <a href="https://digitalindia.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                Digital India
              </a>
              <a href="https://eraktkosh.mohfw.gov.in" target="_blank" rel="noreferrer" className="text-red-400 font-bold hover:underline">
                Official e-RaktKosh Portal
              </a>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Column 1: Government & Portal Identity */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#800020] flex items-center justify-center text-white font-black text-xs">
                  eR
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">National Health Mission</div>
                  <div className="text-base font-black text-white">
                    <span>e-Rakt</span>
                    <span className="text-red-500">Kosh</span>
                    <span className="text-xs font-normal text-slate-400 ml-1.5">| LifeLink</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                LifeLink is an intelligent hospital and blood resource network integrated with official e-RaktKosh standards, promoting voluntary blood donation and zero wastage through deterministic FEFO allocation.
              </p>

              {/* 24x7 Helplines Badge */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                <div className="text-[10px] uppercase font-bold text-red-400 tracking-wider flex items-center gap-1">
                  <PhoneCall className="w-3 h-3 text-red-400" />
                  <span>24x7 Emergency Helplines (India)</span>
                </div>
                <div className="text-sm font-black text-white font-mono flex items-center gap-3">
                  <span>104 (Health)</span>
                  <span>•</span>
                  <span>108 / 112 (Ambulance)</span>
                </div>
              </div>
            </div>

            {/* Column 2: Looking for Blood */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-3.5 text-xs flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <span>Looking for Blood</span>
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button onClick={() => setActiveTab('find-blood')} className="hover:text-red-400 cursor-pointer flex items-center gap-1.5">
                    <span>Blood Availability</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('patient-request')} className="text-red-400 font-bold hover:text-red-300 cursor-pointer flex items-center gap-1">
                    <span>Smart Blood Allocation (FEFO)</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('blood-centers')} className="hover:text-red-400 cursor-pointer">
                    Blood Center Directory
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('nearby')} className="hover:text-red-400 cursor-pointer">
                    Nearby Centers (GIS Map)
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('emergency-request')} className="text-red-400 font-bold hover:underline cursor-pointer">
                    Emergency Blood Requisition (SOS)
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Want to Donate */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-3.5 text-xs flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <span>Want to Donate</span>
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button onClick={() => setActiveTab('donation-camps')} className="hover:text-red-400 cursor-pointer">
                    Blood Donation Camps
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('donors')} className="hover:text-red-400 cursor-pointer">
                    Donor Directory & Matching
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    authenticateRole('DONOR');
                    setActiveTab('admin-dashboard');
                  }} className="hover:text-red-400 cursor-pointer">
                    Donor Login / Profile
                  </button>
                </li>
                <li>
                  <span className="text-slate-500">Voluntary Blood Donation Guidelines</span>
                </li>
                <li>
                  <span className="text-slate-500">Universal Donor (O-Negative) Protocols</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Clinical & Institutional Login */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-3.5 text-xs flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <span>Clinical & Portals</span>
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button onClick={() => {
                    authenticateRole('HOSPITAL');
                    setActiveTab('hospital-network');
                  }} className="hover:text-red-400 cursor-pointer">
                    Hospital Transfusion Desk (H2H)
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    authenticateRole('BLOOD_BANK');
                    setActiveTab('inventory');
                  }} className="hover:text-red-400 cursor-pointer">
                    Blood Bank Officer Portal
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    authenticateRole('ADMIN');
                    setActiveTab('admin-dashboard');
                  }} className="hover:text-red-400 cursor-pointer">
                    State Command Administrator
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('wastage-analytics')} className="hover:text-red-400 cursor-pointer">
                    Wastage Reports & Audit
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsMetricsModalOpen(true)} className="hover:text-purple-400 cursor-pointer text-purple-300">
                    AI Scikit-Learn Model Metrics
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Compliance & Copyright Disclaimers */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-slate-500">
            <p>
              Website content managed and hosted by National Health Mission & Ministry of Health and Family Welfare (MoHFW), Government of India.
            </p>
            <p className="text-slate-400 font-medium">
              LifeLink — Smart Hospital & Blood Network &bull; Prototype 2026.
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
