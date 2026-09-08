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

import { 
  Play, 
  Activity, 
  Search, 
  Sparkles,
  TrendingUp,
  Users,
  ShieldCheck,
  AlertTriangle,
  Info
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
    else if (newRole === 'HOSPITAL') setActiveTab('hospital-network');
    else if (newRole === 'DONOR') setActiveTab('donors');
    else if (newRole === 'PATIENT') setActiveTab('patient-request');
  };

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

      {/* 4. Professional Healthcare Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-12 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="space-y-3">
              <LifeLinkLogo size="md" showTagline={true} />
              <p className="text-xs font-semibold text-red-600">
                "Connect. Coordinate. Save Time."
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                An intelligent network for blood availability, emergency coordination, shortage prediction, and resource optimization.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-medium">
                AI-powered decision support for intelligent blood resource coordination.
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-3 text-xs">Public Services</h4>
              <ul className="space-y-2 text-slate-500">
                <li><button onClick={() => setActiveTab('find-blood')} className="hover:text-red-600 cursor-pointer">Find Blood</button></li>
                <li><button onClick={() => setActiveTab('blood-centers')} className="hover:text-red-600 cursor-pointer">Blood Centers</button></li>
                <li><button onClick={() => setActiveTab('emergency-request')} className="hover:text-red-600 text-red-600 font-bold cursor-pointer">Emergency Coordination</button></li>
                <li><button onClick={() => setActiveTab('donation-camps')} className="hover:text-red-600 cursor-pointer">Donation Camps</button></li>
                <li><button onClick={() => setActiveTab('donors')} className="hover:text-red-600 cursor-pointer">Donors</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-3 text-xs">Clinical Network</h4>
              <ul className="space-y-2 text-slate-500">
                <li><button onClick={() => setActiveTab('hospital-network')} className="hover:text-red-600 cursor-pointer">Hospitals Network (H2H)</button></li>
                <li><button onClick={() => setActiveTab('hospital-communications')} className="hover:text-red-600 cursor-pointer">Transfusion Communications</button></li>
                <li><button onClick={() => setActiveTab('inventory')} className="hover:text-red-600 cursor-pointer">LifeLink Inventory (FEFO)</button></li>
                <li><button onClick={() => setActiveTab('expiry-risk')} className="hover:text-red-600 cursor-pointer">Expiry Risk Engine</button></li>
                <li><button onClick={() => setActiveTab('wastage-analytics')} className="hover:text-red-600 cursor-pointer">Wastage Reports</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-3 text-xs">System & Links</h4>
              <ul className="space-y-2 text-slate-500">
                <li><button onClick={() => setActiveTab('about')} className="hover:text-red-600 cursor-pointer">About LifeLink</button></li>
                <li><button onClick={() => setActiveTab('ai-insights')} className="hover:text-red-600 cursor-pointer">LifeLink Intelligence</button></li>
                <li><button onClick={() => setIsMetricsModalOpen(true)} className="hover:text-red-600 cursor-pointer">Model Performance Metrics</button></li>
                <li><span className="text-slate-400">Privacy Policy (Masked Donors)</span></li>
                <li><span className="text-slate-400">Terms of Clinical Decision Support</span></li>
                <li><span className="text-slate-400">Contact: support@lifelink.health</span></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-slate-500">
            <p>
              LifeLink &bull; Smart Hospital & Blood Network &bull; Prototype for Healthcare Hackathon 2026.
            </p>
            <p className="text-slate-400">
              AI-powered decision support for intelligent blood resource coordination. Prototype with e-RaktKosh-compatible feed.
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
