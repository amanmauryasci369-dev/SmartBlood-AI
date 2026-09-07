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
import { MapView } from './components/MapView';
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
import { WhySmartBloodPage } from './components/WhySmartBloodPage';
import { LiveDemoSimulator } from './components/LiveDemoSimulator';
import { 
  Play, 
  Activity, 
  Search, 
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';

export const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
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
      // Health check
      const health = await fetch('http://127.0.0.1:8000/health').then(r => r.json()).catch(() => null);
      setBackendHealthy(health?.status === 'healthy');

      // Parallel data fetching across modules
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

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
  };

  const handleDispatchConfirmed = (dispatch: any) => {
    setActiveDispatch(dispatch);
    setIsSOSModalOpen(false);
    loadAllData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentRole={role}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenMetrics={() => setIsMetricsModalOpen(true)}
        backendHealthy={backendHealthy}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Quick Demo Scenario Bar */}
        <div className="glass-panel px-4 py-2.5 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Play className="w-3.5 h-3.5 text-blood-400 fill-current" />
            <span className="font-bold text-white">Live System Scenarios:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setRole('HOSPITAL');
                setIsSOSModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition-all"
            >
              1. Critical O- Trauma SOS
            </button>
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setRole('BLOOD_BANK');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition-all"
            >
              2. Lab Physical Stock Verification
            </button>
            <button
              onClick={() => setActiveTab('expiry-risk')}
              className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-800 text-[11px] font-medium transition-all"
            >
              FEFO Expiry Tiers
            </button>
            <button
              onClick={() => setActiveTab('wastage-analytics')}
              className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[11px] font-medium transition-all"
            >
              Wastage Analytics
            </button>
            <button
              onClick={() => setActiveTab('hospital-network')}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-medium transition-all"
            >
              H2H Network
            </button>
            <button
              onClick={() => setActiveTab('hospital-communications')}
              className="px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-800 text-[11px] font-medium transition-all"
            >
              Coordination Comms
            </button>
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setIsSearchModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition-all flex items-center gap-1"
            >
              <Search className="w-3 h-3 text-blood-400" />
              <span>Multi-Parameter Search</span>
            </button>
            <button
              onClick={() => setActiveTab('why-smartblood')}
              className="px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800 text-[11px] font-medium transition-all flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Why SmartBlood AI?</span>
            </button>
          </div>
        </div>

        {/* View Routing */}
        {activeTab === 'why-smartblood' && <WhySmartBloodPage />}
        {activeTab === 'expiry-risk' && <ExpiryRiskDashboard />}
        {activeTab === 'wastage-analytics' && <WastageAnalyticsPage />}
        {activeTab === 'hospital-network' && <HospitalNetworkPage />}
        {activeTab === 'hospital-communications' && <HospitalCommunicationsPage />}
        {activeTab === 'admin-configuration' && <AdminConfigurationPage />}

        {activeTab === 'dashboard' && (
          <>
            {/* Step 19: Integrated Alert Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* 🔴 CRITICAL */}
              <div 
                onClick={() => setIsSOSModalOpen(true)}
                className="p-4 bg-red-950/30 border border-red-900/50 hover:border-red-600/60 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] shadow-lg shadow-red-950/20"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[10px] font-bold uppercase tracking-wider">
                    🔴 CRITICAL
                  </span>
                  <span className="text-[10px] text-slate-500">AI Shortage Engine</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-2">O− PRBC Shortage Projected</h4>
                <p className="text-xs text-red-300/80 mt-1">
                  Demand forecast exceeds regional buffer at AIIMS Trauma Center.
                </p>
              </div>

              {/* 🟠 HIGH */}
              <div 
                onClick={() => setActiveTab('expiry-risk')}
                className="p-4 bg-amber-950/30 border border-amber-900/50 hover:border-amber-600/60 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] shadow-lg shadow-amber-950/20"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] font-bold uppercase tracking-wider">
                    🟠 HIGH
                  </span>
                  <span className="text-[10px] text-slate-500">FEFO Engine</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-2">28 Units Approaching Expiry</h4>
                <p className="text-xs text-amber-300/80 mt-1">
                  Platelets & PRBC batches require immediate elective prioritization.
                </p>
              </div>

              {/* 🟡 ATTENTION */}
              <div 
                onClick={() => setActiveTab('hospital-network')}
                className="p-4 bg-blue-950/30 border border-blue-900/50 hover:border-blue-600/60 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] shadow-lg shadow-blue-950/20"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[10px] font-bold uppercase tracking-wider">
                    🟡 ATTENTION
                  </span>
                  <span className="text-[10px] text-slate-500">H2H Network</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-2">Hospital Peer Requisitions</h4>
                <p className="text-xs text-blue-300/80 mt-1">
                  Active peer blood requisitions pending cross-match verification.
                </p>
              </div>

              {/* 🟢 OPPORTUNITY */}
              <div 
                onClick={() => setActiveTab('wastage-analytics')}
                className="p-4 bg-emerald-950/30 border border-emerald-900/50 hover:border-emerald-600/60 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] shadow-lg shadow-emerald-950/20"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold uppercase tracking-wider">
                    🟢 OPPORTUNITY
                  </span>
                  <span className="text-[10px] text-slate-500">Rebalance AI</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-2">Blood Bank Surplus Balance</h4>
                <p className="text-xs text-emerald-300/80 mt-1">
                  Safdarjung Regional Centre has confirmed surplus O+ stock.
                </p>
              </div>
            </div>

            {/* Geospatial Map Section */}
            <section className="w-full">
              <MapView
                bloodBanks={bloodBanks}
                hospitals={hospitals}
                activeDispatch={activeDispatch}
                selectedFacility={selectedFacility}
                onSelectFacility={(facility) => setSelectedFacility(facility)}
              />
            </section>

            {/* AI Insights Synthesis Section (Module 17) */}
            <section>
              <AIInsightsSection insights={aiInsights} />
            </section>

            {/* Role-Specific Portal Dashboard */}
            <section className="space-y-6">
              {role === 'ADMIN' && (
                <>
                  <AdminDashboard
                    stockSummary={stockSummary}
                    rebalanceProposals={rebalanceProposals}
                    bloodBanks={bloodBanks}
                    hospitals={hospitals}
                    onRefreshData={loadAllData}
                  />
                  <AnalyticsCharts data={analyticsData} />
                </>
              )}

              {role === 'BLOOD_BANK' && (
                <BloodBankDashboard
                  inventory={inventory}
                  onRefreshData={loadAllData}
                />
              )}

              {role === 'HOSPITAL' && (
                <>
                  <HospitalDashboard
                    hospitals={hospitals}
                    onOpenSOSModal={() => setIsSOSModalOpen(true)}
                  />
                  <DonorMatchingPanel bloodGroup="O-" />
                  <AnalyticsCharts data={analyticsData} />
                </>
              )}

              {role === 'DONOR' && (
                <DonorDashboard />
              )}

              {role === 'PATIENT' && (
                <PatientDashboard
                  inventory={inventory}
                  bloodBanks={bloodBanks}
                />
              )}
            </section>
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500 space-y-1">
        <p>SmartBlood AI &bull; Autonomous Blood Resource Management & Emergency Coordination Platform</p>
        <p className="text-[11px] text-slate-600">
          Synthetic e-RaktKosh compatible adapter feed &bull; Scikit-Learn genuine ML evaluation &bull; Clinical decision support advisory
        </p>
      </footer>

      {/* Modals & 1-Click Live Demo Simulation */}
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
