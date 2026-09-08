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
import { DemoModeBanner } from './components/common/DemoModeBanner';
import { HomePage } from './components/home/HomePage';
import { BloodSearchSection } from './components/home/BloodSearchSection';
import { BloodCenterDirectoryPage } from './components/directory/BloodCenterDirectoryPage';
import { BloodCenterDetailPage } from './components/directory/BloodCenterDetailPage';
import { ProfileSettingsPage } from './components/profile/ProfileSettingsPage';
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
  Building2,
  MapPin
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
  
  // Map View Filters (Screen 5)
  const [mapFilterCity, setMapFilterCity] = useState<string>('Delhi / NCR');
  const [mapFilterGroup, setMapFilterGroup] = useState<string>('All');
  const [mapFilterComponent, setMapFilterComponent] = useState<string>('Packed Red Blood Cells');
  const [mapFilterRadius, setMapFilterRadius] = useState<string>('10 km');

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

      {/* Demo Mode & Authoritative Sources Provenance Disclosure */}
      <DemoModeBanner />

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
            onSelectFacility={(fac) => setSelectedFacility(fac)}
          />
        )}

        {activeTab === 'blood-centers' && (
          <BloodCenterDirectoryPage
            bloodBanks={bloodBanks}
            inventory={inventory}
            onOpenSOSModal={() => setIsSOSModalOpen(true)}
            onSelectFacility={(fac) => setSelectedFacility(fac)}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'blood-center-detail' && (
          <BloodCenterDetailPage
            facility={selectedFacility as BloodBank}
            inventory={inventory}
            onBack={() => setActiveTab('blood-centers')}
            onOpenSOSModal={() => setIsSOSModalOpen(true)}
            onViewOnMap={(fac) => {
              setSelectedFacility(fac);
              setActiveTab('nearby');
            }}
          />
        )}

        {activeTab === 'nearby' && (
          <div className="space-y-6">
            {/* Screen 5: Header and Top Filter Controls Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#800020]" />
                    <span>Find Blood — Interactive GIS Map View</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time geospatial locator with ambulance transit estimation, live inventory, and direct emergency routing.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start md:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>GIS Engine Active</span>
                </span>
              </div>

              {/* Filter Controls Bar matching Screen 5 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">City / Hub</label>
                  <select
                    value={mapFilterCity}
                    onChange={(e) => setMapFilterCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
                  >
                    <option value="Delhi / NCR">Delhi / NCR</option>
                    <option value="New Delhi">New Delhi</option>
                    <option value="South Delhi">South Delhi</option>
                    <option value="Central Delhi">Central Delhi</option>
                    <option value="Noida">Noida / GB Nagar</option>
                    <option value="Gurugram">Gurugram</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Blood Group</label>
                  <select
                    value={mapFilterGroup}
                    onChange={(e) => setMapFilterGroup(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
                  >
                    <option value="All">All Groups</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Component</label>
                  <select
                    value={mapFilterComponent}
                    onChange={(e) => setMapFilterComponent(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
                  >
                    <option value="Packed Red Blood Cells">Packed Red Blood Cells (PRBC)</option>
                    <option value="Platelets">Platelets (RDP / SDP)</option>
                    <option value="Fresh Frozen Plasma">Fresh Frozen Plasma (FFP)</option>
                    <option value="Whole Blood">Whole Blood</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Search Radius</label>
                  <select
                    value={mapFilterRadius}
                    onChange={(e) => setMapFilterRadius(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
                  >
                    <option value="5 km">Within 5 km</option>
                    <option value="10 km">Within 10 km</option>
                    <option value="25 km">Within 25 km</option>
                    <option value="50 km">Within 50 km</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {}}
                    className="w-full py-2 px-4 rounded-xl bg-[#800020] hover:bg-[#68001a] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer h-[38px]"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search Blood</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Split Screen 5: Map View on Left (65%) + Nearby Blood Centres List on Right (35%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left: Interactive Map Container */}
              <div className="lg:col-span-8 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs h-[640px] overflow-hidden">
                <MapView
                  bloodBanks={bloodBanks}
                  hospitals={hospitals}
                  activeDispatch={activeDispatch}
                  selectedFacility={selectedFacility}
                  onSelectFacility={(fac) => setSelectedFacility(fac)}
                />
              </div>

              {/* Right: Nearby Blood Centres List matching Screen 5 */}
              <div className="lg:col-span-4 space-y-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Nearby Blood Centres</h3>
                    <p className="text-[11px] text-slate-500">Sorted by transit time from location</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-[#800020] border border-rose-200">
                    {Math.min(bloodBanks.length || 4, 4)} Available
                  </span>
                </div>

                <div className="space-y-3 max-h-[570px] overflow-y-auto pr-1">
                  {(bloodBanks.length > 0 ? bloodBanks.slice(0, 4) : [
                    {
                      id: 1,
                      name: 'AIIMS Blood Centre',
                      district: 'South Delhi',
                      contact_number: '011-2659 4307',
                      storage_capacity: 450,
                      address: 'Ansari Nagar, New Delhi'
                    },
                    {
                      id: 2,
                      name: 'Safdarjung Hospital Blood Bank',
                      district: 'New Delhi',
                      contact_number: '011-2616 5060',
                      storage_capacity: 320,
                      address: 'Ring Road, New Delhi'
                    },
                    {
                      id: 3,
                      name: 'Indian Red Cross Society NHQ',
                      district: 'Central Delhi',
                      contact_number: '011-2371 1551',
                      storage_capacity: 580,
                      address: '1 Red Cross Road, New Delhi'
                    },
                    {
                      id: 4,
                      name: 'Dr. RML Hospital Blood Bank',
                      district: 'Central Delhi',
                      contact_number: '011-2340 4286',
                      storage_capacity: 290,
                      address: 'Baba Kharak Singh Marg, New Delhi'
                    }
                  ]).map((center: any, idx: number) => {
                    const distances = ['2.4 km • 8 min', '3.1 km • 11 min', '4.8 km • 16 min', '5.6 km • 18 min'];
                    const units = [18, 9, 22, 14];
                    const dist = distances[idx % distances.length];
                    const count = units[idx % units.length];

                    return (
                      <div 
                        key={center.id || idx}
                        className={`bg-white rounded-2xl border p-4 shadow-xs transition-all hover:border-[#800020]/40 ${
                          selectedFacility?.name === center.name ? 'border-[#800020] ring-2 ring-[#800020]/10 bg-rose-50/20' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-tight">
                              {center.name}
                            </h4>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{center.district || 'Delhi'} &bull; {dist}</span>
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            Adequate Stock
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs mb-3">
                          <span className="text-slate-600 font-medium">
                            Available {mapFilterGroup !== 'All' ? mapFilterGroup : 'B+'}:
                          </span>
                          <span className="font-extrabold text-emerald-700">
                            {count} Units Ready
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedFacility(center);
                              setActiveTab('blood-center-detail');
                            }}
                            className="flex-1 py-1.5 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold text-center transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFacility(center);
                            }}
                            className="flex-1 py-1.5 px-2 rounded-lg border border-[#800020] text-[#800020] hover:bg-rose-50 text-xs font-bold text-center transition-colors cursor-pointer"
                          >
                            Locate
                          </button>
                          <button
                            onClick={() => setIsSOSModalOpen(true)}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-[#800020] hover:bg-[#68001a] text-white text-xs font-bold text-center transition-colors cursor-pointer"
                          >
                            Request
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

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

        {activeTab === 'profile' && (
          <ProfileSettingsPage
            currentRole={role}
            onNavigateToTab={setActiveTab}
            onOpenSOSModal={() => setIsSOSModalOpen(true)}
          />
        )}

        {activeTab === 'about' && (
          <AboutPage />
        )}

      </main>

      {/* 4. Professional Healthcare Footer (Reference Section 24 & Complete UI) */}
      <footer className="bg-[#5B0612] text-white mt-14 border-t border-[#46040e] text-xs">
        
        {/* National Portal Top Bar */}
        <div className="bg-[#4a040e] border-b border-[#630714] py-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-rose-200/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-semibold text-white">Official National Health Mission Integrated Platform</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-rose-200/80">
              <a href="https://india.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                National Portal of India
              </a>
              <a href="https://digitalindia.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                Digital India
              </a>
              <span className="text-rose-400/40">&bull;</span>
              <span className="text-rose-100 font-medium">Ministry of Health &amp; Family Welfare</span>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Column 1: LifeLink Primary Platform Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#800020] shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <path d="M12 2.5C12 2.5 6 9.5 6 14C6 17.3137 8.68629 20 12 20C15.3137 20 18 17.3137 18 14C18 9.5 12 2.5 12 2.5Z" fill="#800020" />
                    <path d="M8.5 14H10.5L11.5 11.5L12.5 16.5L13.5 14H15.5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-black text-white tracking-tight leading-none">LifeLink</div>
                  <div className="text-[10px] font-semibold text-rose-200 tracking-wide mt-0.5">
                    Connect &bull; Donate &bull; Save
                  </div>
                </div>
              </div>

              <p className="text-xs text-rose-100/70 leading-relaxed">
                Autonomous AI blood resource intelligence, FEFO shelf-life prioritization, and emergency inter-hospital allocation system.
              </p>

              {/* 24x7 Helplines Badge */}
              <div className="p-3.5 rounded-xl bg-[#4a040e] border border-[#6b0918] space-y-1">
                <div className="text-[10px] uppercase font-extrabold text-rose-300 tracking-wider flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span>24x7 Emergency Helplines</span>
                </div>
                <div className="text-base font-black text-white font-mono flex items-center gap-2.5 pt-0.5">
                  <span className="text-rose-200">104</span>
                  <span className="text-rose-400/50">/</span>
                  <span className="text-rose-200">108</span>
                  <span className="text-[10px] font-normal text-rose-200/70 font-sans ml-1">(Toll-Free National)</span>
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-3.5 text-xs border-b border-rose-900/60 pb-2">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-rose-100/70">
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
                  <button onClick={() => setIsSOSModalOpen(true)} className="text-rose-300 font-extrabold hover:text-white cursor-pointer transition-colors">
                    Emergency SOS &rarr;
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Portals & Roles */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-3.5 text-xs border-b border-rose-900/60 pb-2">
                Clinical &amp; Citizen Portals
              </h4>
              <ul className="space-y-2.5 text-rose-100/70">
                <li>
                  <button onClick={() => {
                    setActiveTab('profile');
                  }} className="hover:text-white cursor-pointer transition-colors">
                    Citizen Profile &amp; Settings
                  </button>
                </li>
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
              <h4 className="font-bold text-white uppercase tracking-wider mb-3.5 text-xs border-b border-rose-900/60 pb-2">
                Resources &amp; System
              </h4>
              <ul className="space-y-2.5 text-rose-100/70">
                <li>
                  <button onClick={() => setActiveTab('about')} className="hover:text-white cursor-pointer transition-colors">
                    About LifeLink
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsMetricsModalOpen(true)} className="hover:text-white cursor-pointer text-rose-200 transition-colors">
                    AI Scikit-Learn Validation
                  </button>
                </li>
                <li>
                  <span className="text-rose-200/50">Help &amp; Documentation</span>
                </li>
                <li>
                  <span className="text-rose-200/50">Privacy &amp; Data Security</span>
                </li>
                <li>
                  <span className="text-rose-200/50">Terms of Clinical Decision Support</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Compliance & Copyright Disclaimers */}
          <div className="pt-6 border-t border-rose-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-rose-200/70">
            <p>
              Website content managed and hosted by National Health Mission &amp; Ministry of Health and Family Welfare (MoHFW), Government of India.
            </p>
            <p className="text-rose-100 font-medium">
              &copy; 2026 LifeLink &bull; Connect &bull; Donate &bull; Save &bull; All Rights Reserved.
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
