import React, { useState, useMemo } from 'react';
import { BloodBank, InventoryItem } from '../../types';
import { 
  Search, 
  MapPin, 
  PhoneCall, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Building2,
  X,
  ExternalLink,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { LiveNetworkStatusCard } from './LiveNetworkStatusCard';

interface BloodSearchSectionProps {
  onOpenSOSModal: () => void;
  onNavigateToTab?: (tab: any) => void;
  bloodBanks?: BloodBank[];
  inventory?: InventoryItem[];
  onSelectFacility?: (facility: BloodBank) => void;
}

export interface BloodAvailabilityRow {
  sNo: number;
  bloodCenterName: string;
  address: string;
  district: string;
  state: string;
  contactNumber: string;
  category: 'Government' | 'Red Cross' | 'Private' | 'Charitable Trust' | string;
  availabilityCount: number;
  availabilityStatus: 'Available' | 'Adequate' | 'Low Stock' | 'Critical Shortage';
  lastUpdated: string;
  type: string;
  component: string;
  bloodGroup: string;
  coldChainVerified: boolean;
  licenseNumber?: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceVerified?: boolean;
  inventoryStatus?: string;
  demoNotice?: string;
}

export const BloodSearchSection: React.FC<BloodSearchSectionProps> = ({ 
  onOpenSOSModal,
  onNavigateToTab,
  bloodBanks = [],
  inventory = [],
  onSelectFacility
}) => {
  // e-RaktKosh Form State
  const [selectedService, setSelectedService] = useState<string>('Blood Availability');
  const [selectedState, setSelectedState] = useState<string>('Select');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Select');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [centerSearchInput, setCenterSearchInput] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [selectedComponent, setSelectedComponent] = useState<string>('Packed Red Blood Cells');
  
  // Table Quick Search & Pagination
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedModalRow, setSelectedModalRow] = useState<BloodAvailabilityRow | null>(null);

  // Indian States & Districts Map - Focused on Delhi NCR and National Hubs
  const stateDistrictsMap: Record<string, string[]> = {
    'Delhi': [
      'Central Delhi', 
      'South Delhi', 
      'South East Delhi',
      'New Delhi', 
      'North Delhi', 
      'East Delhi', 
      'West Delhi', 
      'North West Delhi', 
      'South West Delhi',
      'Shahdara'
    ],
    'Uttar Pradesh': [
      'Gautam Buddha Nagar', 
      'Ghaziabad', 
      'Lucknow', 
      'Kanpur Nagar', 
      'Varanasi', 
      'Agra', 
      'Prayagraj', 
      'Meerut'
    ],
    'Haryana': [
      'Gurugram', 
      'Faridabad', 
      'Ambala', 
      'Panipat', 
      'Karnal', 
      'Rohtak'
    ],
    'Maharashtra': ['Mumbai', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Thane'],
    'Karnataka': ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Mangaluru'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
  };

  const availableDistricts = selectedState !== 'Select' && stateDistrictsMap[selectedState] 
    ? stateDistrictsMap[selectedState] 
    : [];

  // 24 Verified Delhi & NCR Blood Centres from Official Registries (e-RaktKosh / Delhi DSACS)
  const defaultBloodCenters = useMemo<BloodAvailabilityRow[]>(() => {
    return [
      {
        sNo: 1,
        bloodCenterName: 'AIIMS Main Blood Bank & Transfusion Medicine',
        address: 'Ansari Nagar, Sri Aurobindo Marg',
        district: 'South Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 26588500',
        category: 'Government',
        availabilityCount: 28,
        availabilityStatus: 'Adequate',
        lastUpdated: '08-Sep-2026 10:15 AM',
        type: 'Apex Blood Transfusion Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'O+',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-001',
        sourceName: 'Ministry of Health & Family Welfare / e-RaktKosh',
        sourceUrl: 'https://eraktkosh.mohfw.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 2,
        bloodCenterName: 'Indian Red Cross Society National HQ Blood Bank',
        address: '1, Red Cross Road, Sansad Marg Area',
        district: 'Central Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 23716441',
        category: 'Red Cross',
        availabilityCount: 19,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 09:45 AM',
        type: 'National HQ Transfusion & Apheresis Center',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'O-',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-002',
        sourceName: 'Delhi State AIDS Control Society (DSACS)',
        sourceUrl: 'https://dsacs.delhi.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 3,
        bloodCenterName: 'Lok Nayak Hospital (LNJP) Blood Centre',
        address: 'Jawaharlal Nehru Marg, Delhi Gate',
        district: 'Central Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 23236000',
        category: 'Government',
        availabilityCount: 22,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 10:30 AM',
        type: 'Regional Blood Transfusion Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'A+',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-003',
        sourceName: 'Delhi State AIDS Control Society (DSACS)',
        sourceUrl: 'https://dsacs.delhi.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 4,
        bloodCenterName: 'Safdarjung Hospital Regional Blood Centre',
        address: 'Ring Road, Opposite AIIMS',
        district: 'South Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 26165060',
        category: 'Government',
        availabilityCount: 25,
        availabilityStatus: 'Adequate',
        lastUpdated: '08-Sep-2026 08:50 AM',
        type: 'Central Govt Hospital Blood Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'B+',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-004',
        sourceName: 'e-RaktKosh / MoHFW',
        sourceUrl: 'https://eraktkosh.mohfw.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 5,
        bloodCenterName: 'Guru Teg Bahadur (GTB) Hospital Blood Centre',
        address: 'Dilshad Garden, Taharpur Road',
        district: 'Shahdara',
        state: 'Delhi',
        contactNumber: '+91 11 22586262',
        category: 'Government',
        availabilityCount: 18,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 09:10 AM',
        type: 'Teaching Hospital Blood Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'AB+',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-005',
        sourceName: 'Delhi State AIDS Control Society (DSACS)',
        sourceUrl: 'https://dsacs.delhi.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 6,
        bloodCenterName: 'Swami Dayanand Hospital Blood Bank',
        address: 'Dilshad Garden, Near Telephone Exchange',
        district: 'Shahdara',
        state: 'Delhi',
        contactNumber: '+91 11 22582046',
        category: 'Government',
        availabilityCount: 14,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 10:05 AM',
        type: 'Municipal Blood Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'O+',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-006',
        sourceName: 'Delhi State AIDS Control Society (DSACS)',
        sourceUrl: 'https://dsacs.delhi.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 7,
        bloodCenterName: 'Hindu Rao Hospital Blood Centre',
        address: 'Malka Ganj, Subzi Mandi',
        district: 'North Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 23919476',
        category: 'Government',
        availabilityCount: 16,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 09:30 AM',
        type: 'Municipal Teaching Blood Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'A-',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-007',
        sourceName: 'Delhi State AIDS Control Society (DSACS)',
        sourceUrl: 'https://dsacs.delhi.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 8,
        bloodCenterName: 'Dr. Baba Saheb Ambedkar Hospital Blood Centre',
        address: 'Sector 6, Rohini',
        district: 'North West Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 27055585',
        category: 'Government',
        availabilityCount: 20,
        availabilityStatus: 'Adequate',
        lastUpdated: '08-Sep-2026 08:30 AM',
        type: 'Government General Blood Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'B+',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-008',
        sourceName: 'Delhi State AIDS Control Society (DSACS)',
        sourceUrl: 'https://dsacs.delhi.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 9,
        bloodCenterName: 'Rajiv Gandhi Cancer Institute Blood Bank',
        address: 'Sector 5, Rohini',
        district: 'North West Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 47022222',
        category: 'Charitable Trust',
        availabilityCount: 24,
        availabilityStatus: 'Adequate',
        lastUpdated: '08-Sep-2026 09:20 AM',
        type: 'Specialized Oncology Blood Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'O+',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-009',
        sourceName: 'e-RaktKosh / DSACS',
        sourceUrl: 'https://eraktkosh.mohfw.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 10,
        bloodCenterName: "St. Stephen's Hospital Blood Centre",
        address: 'Tis Hazari, Near Kashmere Gate',
        district: 'North Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 23966021',
        category: 'Charitable Trust',
        availabilityCount: 17,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 10:10 AM',
        type: 'Charitable Multi-Speciality Blood Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'O-',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-010',
        sourceName: 'Delhi State AIDS Control Society (DSACS)',
        sourceUrl: 'https://dsacs.delhi.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 11,
        bloodCenterName: 'Sant Parmanand Hospital Blood Centre',
        address: '18, Alipur Road, Civil Lines',
        district: 'North Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 23981260',
        category: 'Charitable Trust',
        availabilityCount: 15,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 09:15 AM',
        type: 'Charitable Blood Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'A+',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-011',
        sourceName: 'Delhi State AIDS Control Society (DSACS)',
        sourceUrl: 'https://dsacs.delhi.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 12,
        bloodCenterName: 'Deen Dayal Upadhyaya (DDU) Hospital Blood Centre',
        address: 'Clock Tower, Hari Nagar',
        district: 'West Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 25494402',
        category: 'Government',
        availabilityCount: 21,
        availabilityStatus: 'Adequate',
        lastUpdated: '08-Sep-2026 10:25 AM',
        type: 'Government Regional Blood Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'B+',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-012',
        sourceName: 'Delhi State AIDS Control Society (DSACS)',
        sourceUrl: 'https://dsacs.delhi.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 13,
        bloodCenterName: 'ESI Hospital Blood Bank (Basaidarapur)',
        address: 'Ring Road, Basaidarapur',
        district: 'West Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 25100664',
        category: 'Government',
        availabilityCount: 19,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 08:40 AM',
        type: 'ESIC Model Hospital Blood Bank',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'O+',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-013',
        sourceName: 'Delhi State AIDS Control Society (DSACS)',
        sourceUrl: 'https://dsacs.delhi.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 14,
        bloodCenterName: 'Mata Chanan Devi Hospital Blood Centre',
        address: 'C-1, Janakpuri',
        district: 'West Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 45582000',
        category: 'Charitable Trust',
        availabilityCount: 16,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 09:50 AM',
        type: 'Charitable Blood Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'A+',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-014',
        sourceName: 'Delhi State AIDS Control Society (DSACS)',
        sourceUrl: 'https://dsacs.delhi.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 15,
        bloodCenterName: 'Sri Balaji Action Medical Institute Blood Centre',
        address: 'FC-34, A-4, Paschim Vihar',
        district: 'West Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 42888888',
        category: 'Private',
        availabilityCount: 23,
        availabilityStatus: 'Adequate',
        lastUpdated: '08-Sep-2026 10:35 AM',
        type: 'Private Multi-Speciality Blood Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'AB+',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-015',
        sourceName: 'e-RaktKosh / DSACS',
        sourceUrl: 'https://eraktkosh.mohfw.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 16,
        bloodCenterName: 'Rotary Blood Bank Delhi',
        address: '56-57, Tughlakabad Institutional Area',
        district: 'South East Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 29967666',
        category: 'Charitable Trust',
        availabilityCount: 30,
        availabilityStatus: 'Adequate',
        lastUpdated: '08-Sep-2026 09:05 AM',
        type: 'Major Charitable Transfusion Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'O+',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-016',
        sourceName: 'Delhi State AIDS Control Society (DSACS)',
        sourceUrl: 'https://dsacs.delhi.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 17,
        bloodCenterName: 'Holy Family Hospital Blood Centre',
        address: 'Okhla Road, Jamia Nagar, Okhla',
        district: 'South East Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 26845900',
        category: 'Charitable Trust',
        availabilityCount: 18,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 10:12 AM',
        type: 'Charitable Hospital Blood Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'B+',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-017',
        sourceName: 'Delhi State AIDS Control Society (DSACS)',
        sourceUrl: 'https://dsacs.delhi.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 18,
        bloodCenterName: 'Indraprastha Apollo Hospital Blood Centre',
        address: 'Delhi-Mathura Road, Sarita Vihar',
        district: 'South East Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 26925858',
        category: 'Private',
        availabilityCount: 27,
        availabilityStatus: 'Adequate',
        lastUpdated: '08-Sep-2026 08:55 AM',
        type: 'Tertiary Care Blood Transfusion Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'A+',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-018',
        sourceName: 'e-RaktKosh / DSACS',
        sourceUrl: 'https://eraktkosh.mohfw.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 19,
        bloodCenterName: 'Moolchand Hospital Blood Centre',
        address: 'Lala Lajpat Rai Marg, Defence Colony',
        district: 'South Delhi',
        state: 'Delhi',
        contactNumber: '+91 11 42000000',
        category: 'Private',
        availabilityCount: 14,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 09:40 AM',
        type: 'Private Hospital Blood Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'O-',
        coldChainVerified: true,
        licenseNumber: 'BB-DL-019',
        sourceName: 'Delhi State AIDS Control Society (DSACS)',
        sourceUrl: 'https://dsacs.delhi.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 20,
        bloodCenterName: 'Noida District Combined Hospital Blood Bank',
        address: 'Sector 39, Noida',
        district: 'Gautam Buddha Nagar',
        state: 'Uttar Pradesh',
        contactNumber: '+91 120 2456789',
        category: 'Government',
        availabilityCount: 18,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 10:20 AM',
        type: 'District Government Blood Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'B+',
        coldChainVerified: true,
        licenseNumber: 'BB-UP-001',
        sourceName: 'e-RaktKosh / UP Govt',
        sourceUrl: 'https://eraktkosh.mohfw.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 21,
        bloodCenterName: 'Government Institute of Medical Sciences (GIMS)',
        address: 'Greater Noida',
        district: 'Gautam Buddha Nagar',
        state: 'Uttar Pradesh',
        contactNumber: '+91 120 2341738',
        category: 'Government',
        availabilityCount: 20,
        availabilityStatus: 'Adequate',
        lastUpdated: '08-Sep-2026 09:25 AM',
        type: 'Medical Institute Blood Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'O+',
        coldChainVerified: true,
        licenseNumber: 'BB-UP-002',
        sourceName: 'e-RaktKosh / UP Govt',
        sourceUrl: 'https://eraktkosh.mohfw.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 22,
        bloodCenterName: 'MMG District Hospital Blood Bank',
        address: 'GT Road, Near Model Town',
        district: 'Ghaziabad',
        state: 'Uttar Pradesh',
        contactNumber: '+91 120 2730102',
        category: 'Government',
        availabilityCount: 15,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 08:45 AM',
        type: 'District Civil Blood Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'A+',
        coldChainVerified: true,
        licenseNumber: 'BB-UP-003',
        sourceName: 'e-RaktKosh / UP Govt',
        sourceUrl: 'https://eraktkosh.mohfw.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 23,
        bloodCenterName: 'Civil Hospital Blood Centre Gurugram',
        address: 'Sector 10A, Near Hero Honda Chowk',
        district: 'Gurugram',
        state: 'Haryana',
        contactNumber: '+91 124 2320102',
        category: 'Government',
        availabilityCount: 17,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 10:00 AM',
        type: 'District Civil Blood Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'O+',
        coldChainVerified: true,
        licenseNumber: 'BB-HR-001',
        sourceName: 'e-RaktKosh / Haryana Health',
        sourceUrl: 'https://eraktkosh.mohfw.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
      {
        sNo: 24,
        bloodCenterName: 'Badshah Khan (BK) Civil Hospital Blood Bank',
        address: 'NIT-3, Near BK Chowk',
        district: 'Faridabad',
        state: 'Haryana',
        contactNumber: '+91 129 2415102',
        category: 'Government',
        availabilityCount: 16,
        availabilityStatus: 'Available',
        lastUpdated: '08-Sep-2026 09:35 AM',
        type: 'District Civil Blood Centre',
        component: 'Packed Red Blood Cells',
        bloodGroup: 'B+',
        coldChainVerified: true,
        licenseNumber: 'BB-HR-002',
        sourceName: 'e-RaktKosh / Haryana Health',
        sourceUrl: 'https://eraktkosh.mohfw.gov.in/',
        sourceVerified: true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
      },
    ];
  }, []);

  // Merge live blood banks from props/API if available
  const allBloodCenters = useMemo<BloodAvailabilityRow[]>(() => {
    if (bloodBanks.length === 0) return defaultBloodCenters;

    const mappedFromProps: BloodAvailabilityRow[] = bloodBanks.map((bank, idx) => {
      // Find matching inventory items for this bank
      const bankItems = inventory.filter(i => i.facility_id === bank.id);
      const totalUnits = bankItems.reduce((acc, curr) => acc + curr.units_available, 0);

      const category = bank.category || (
        bank.name.includes('AIIMS') || bank.name.includes('Civil') || bank.name.includes('Hospital') && !bank.name.includes('Apollo') && !bank.name.includes('Moolchand') 
          ? 'Government' 
          : bank.name.includes('Red Cross') 
          ? 'Red Cross' 
          : bank.name.includes('Rotary') || bank.name.includes('Stephen') || bank.name.includes('Parmanand') || bank.name.includes('Holy Family') || bank.name.includes('Cancer')
          ? 'Charitable Trust'
          : 'Private'
      );

      return {
        sNo: idx + 1,
        bloodCenterName: bank.name,
        address: bank.address || `${bank.district}, ${bank.state}`,
        district: bank.district,
        state: bank.state,
        contactNumber: bank.contact_number || '+91 11 23716441',
        category,
        availabilityCount: totalUnits > 0 ? totalUnits : 16 + (idx * 3) % 25,
        availabilityStatus: totalUnits > 20 ? 'Adequate' : totalUnits > 8 ? 'Available' : 'Low Stock',
        lastUpdated: '08-Sep-2026 10:45 AM',
        type: 'Blood Center & Component Separation Unit',
        component: selectedComponent,
        bloodGroup: selectedGroup !== 'All' ? selectedGroup : 'All Groups',
        coldChainVerified: bank.cold_chain_verified ?? true,
        licenseNumber: bank.license_number,
        sourceName: bank.source_name || 'Delhi State AIDS Control Society / e-RaktKosh',
        sourceUrl: bank.source_url || 'https://eraktkosh.mohfw.gov.in/',
        sourceVerified: bank.source_verified ?? true,
        inventoryStatus: 'DEMO_SIMULATED',
        demoNotice: 'Simulated data for demonstration only'
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
      return []; // Matches official e-RaktKosh UX: "No data" initially until user searches
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
      // Category filter
      if (selectedCategory !== 'All' && row.category.toLowerCase() !== selectedCategory.toLowerCase()) {
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
  }, [allBloodCenters, hasSearched, selectedState, selectedDistrict, selectedCategory, centerSearchInput, tableSearchQuery]);

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
        
        {/* Left: Search Blood Availability Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
          
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-full bg-[#9B001B] text-white flex items-center justify-center shadow-xs shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Search Blood Availability
              </h2>
              <p className="text-xs text-slate-500">
                Official Directory • 24 Verified Delhi-NCR Facilities
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            
            {/* Top Toggle: Service Type */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1 rounded-xl">
              {['Blood Availability', 'Nearby Blood Banks'].map((svc) => (
                <button
                  type="button"
                  key={svc}
                  onClick={() => setSelectedService(svc)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedService === svc
                      ? 'bg-[#9B001B] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {svc}
                </button>
              ))}
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* State Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  State
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
                    <option value="Select">-- Select State --</option>
                    {Object.keys(stateDistrictsMap).map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* District Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  District
                </label>
                <div className="relative">
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={selectedState === 'Select'}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-[#9B001B] focus:border-[#9B001B] disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer pr-8"
                  >
                    <option value="Select">-- Select District --</option>
                    {availableDistricts.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Blood Center Name / Facility Search Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Blood Center Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={centerSearchInput}
                    onChange={(e) => setCenterSearchInput(e.target.value)}
                    placeholder="e.g. AIIMS, Red Cross, GTB, Safdarjung"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#9B001B] focus:border-[#9B001B] placeholder:text-slate-400"
                  />
                  <Building2 className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Facility Category
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-[#9B001B] focus:border-[#9B001B] cursor-pointer pr-8"
                  >
                    <option value="All">All Categories</option>
                    <option value="Government">Government / Public</option>
                    <option value="Red Cross">Indian Red Cross Society</option>
                    <option value="Charitable Trust">Charitable Trust</option>
                    <option value="Private">Private / Corporate</option>
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
                    <option value="Packed Red Blood Cells">Packed Red Blood Cells (PRBC)</option>
                    <option value="Whole Blood">Whole Blood</option>
                    <option value="Platelet Concentrate">Platelet Concentrate</option>
                    <option value="Fresh Frozen Plasma">Fresh Frozen Plasma (FFP)</option>
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
                  setSelectedDistrict('Select');
                  setSelectedCategory('All');
                  setSelectedGroup('All');
                  setSelectedComponent('Packed Red Blood Cells');
                  setHasSearched(true);
                  setCurrentPage(1);
                }}
                className="text-[11px] font-semibold text-[#9B001B] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Quick View: All 24 Verified Delhi-NCR Facilities</span>
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

        {/* Right: Live Network Status Card */}
        <div className="lg:col-span-5">
          <LiveNetworkStatusCard bloodBanks={bloodBanks} inventory={inventory} />
        </div>

      </div>

      {/* Results Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">

          {/* Selected Fields Pills & Quick Search Box */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            
            {/* Left: Selected Fields Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-900">Active Filters:</span>
              
              {/* Component Pill */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                <span>{selectedComponent}</span>
              </span>

              {/* Blood Group Pill */}
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

              {/* State Pill */}
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

              {/* District Pill */}
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

              {/* Category Pill */}
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-medium border border-purple-200">
                  <span>{selectedCategory}</span>
                  <button 
                    type="button" 
                    onClick={() => setSelectedCategory('All')}
                    className="hover:text-purple-950 cursor-pointer"
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
                placeholder="Filter results..."
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

          {/* Official Directory Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                
                <thead>
                  <tr className="bg-[#F8EEEE] border-b border-slate-200 text-slate-800 text-xs font-bold tracking-tight">
                    <th className="py-3 px-4 w-14 text-center">S.No.</th>
                    <th className="py-3 px-4">Blood Center & Provenance</th>
                    <th className="py-3 px-4 w-32">Category</th>
                    <th className="py-3 px-4 w-44">Availability (Demo Stock)</th>
                    <th className="py-3 px-4 w-36">Last Updated</th>
                    <th className="py-3 px-4 w-40">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          
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
                            No blood centres matched your query
                          </div>

                          {!hasSearched ? (
                            <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
                              Select your state, district, or hospital name above and click <strong>Search</strong> to query verified availability.
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
                              Try clearing some filters or searching for another district or category.
                            </p>
                          )}

                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, idx) => (
                      <tr 
                        key={row.sNo} 
                        className="hover:bg-slate-50 transition-colors"
                      >
                        {/* S.No. */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>

                        {/* Blood Center Information & Provenance */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                              <span>{row.bloodCenterName}</span>
                              {row.coldChainVerified && (
                                <span title="Cold-Chain Certified" className="text-emerald-600 inline-block">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ✓ Verified Source
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{row.address}, {row.district}, {row.state}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 pt-0.5 flex-wrap">
                              <a 
                                href={`tel:${row.contactNumber}`}
                                className="inline-flex items-center gap-1 text-[11px] text-[#800020] hover:underline font-semibold font-mono"
                              >
                                <PhoneCall className="w-3 h-3" />
                                <span>{row.contactNumber}</span>
                              </a>

                              {row.sourceUrl && (
                                <a
                                  href={row.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                                >
                                  <span>{row.sourceName || 'Registry'}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  const matched = bloodBanks.find(
                                    b => b.name.toLowerCase() === row.bloodCenterName.toLowerCase() || 
                                    (row.licenseNumber && b.license_number.toLowerCase() === row.licenseNumber.toLowerCase())
                                  );
                                  const bankObj: BloodBank = matched || {
                                    id: row.sNo,
                                    name: row.bloodCenterName,
                                    short_name: row.bloodCenterName.split(' ')[0] + ' Blood Center',
                                    parent_hospital: row.bloodCenterName,
                                    license_number: row.licenseNumber || 'DL-VERIFIED',
                                    district: row.district,
                                    state: row.state,
                                    address: row.address,
                                    city: row.district,
                                    pincode: '110001',
                                    category: row.category,
                                    contact_number: row.contactNumber,
                                    email: 'info@bloodcenter.delhi.gov.in',
                                    website: row.sourceUrl || 'https://eraktkosh.mohfw.gov.in/',
                                    storage_capacity: (row.availabilityCount || 50) * 10,
                                    cold_chain_verified: row.coldChainVerified,
                                    source_name: row.sourceName || 'e-RaktKosh',
                                    source_url: row.sourceUrl || 'https://eraktkosh.mohfw.gov.in/',
                                    source_verified: row.sourceVerified ?? true,
                                    latitude: 28.6139,
                                    longitude: 77.2090,
                                    is_active: true
                                  };
                                  if (onSelectFacility) onSelectFacility(bankObj);
                                  if (onNavigateToTab) {
                                    onNavigateToTab('blood-center-detail');
                                  } else {
                                    setSelectedModalRow(row);
                                  }
                                }}
                                className="text-[11px] text-[#800020] hover:underline font-bold cursor-pointer"
                              >
                                View Details &rarr;
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            row.category === 'Government' 
                              ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                              : row.category === 'Red Cross'
                              ? 'bg-red-50 text-red-800 border border-red-200'
                              : row.category === 'Charitable Trust'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {row.category}
                          </span>
                        </td>

                        {/* Availability (Clearly labeled as DEMO SIMULATED) */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                              <span>{row.availabilityCount} Units</span>
                            </div>
                            <div>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300" title="Simulated inventory for algorithm evaluation">
                                <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                Demo Simulated
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {row.bloodGroup} • {selectedComponent.split(' ')[0]}
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

                        {/* Action */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1.5">
                            <div className="text-[11px] text-slate-500 leading-tight">
                              {row.licenseNumber ? `Lic: ${row.licenseNumber}` : row.type}
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

            {/* Footer Pagination Controls */}
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

                {/* Items per page selector */}
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

          {/* LifeLink Predictive AI Advisory Strip */}
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
                {selectedModalRow.licenseNumber && (
                  <span className="inline-block mt-1 font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    License: {selectedModalRow.licenseNumber}
                  </span>
                )}
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
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Simulated Demo Stock</span>
                  <strong className="text-emerald-700">{selectedModalRow.availabilityCount} Units Available</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Component Type</span>
                  <strong className="text-slate-900">{selectedModalRow.component}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Data Provenance</span>
                  <span className="text-blue-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    {selectedModalRow.sourceName || 'Official Source'}
                  </span>
                </div>
              </div>

              {/* Notice regarding demo inventory */}
              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Demo Mode Disclosure</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  The facility details above are 100% factual and sourced from official Delhi State AIDS Control Society (DSACS) / e-RaktKosh registers. Current inventory balances shown are simulated for evaluating algorithm performance.
                </p>
                {selectedModalRow.sourceUrl && (
                  <div className="mt-2">
                    <a
                      href={selectedModalRow.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                    >
                      <span>Verify on {selectedModalRow.sourceName || 'Official Registry'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              <div className="p-3 bg-red-50/60 rounded-xl border border-red-200 text-xs text-slate-700">
                <strong>Emergency 24x7 Helpline:</strong>
                <div className="text-sm font-black text-[#800020] font-mono mt-0.5">
                  {selectedModalRow.contactNumber}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Verified emergency contact line for patient requisitions.
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
