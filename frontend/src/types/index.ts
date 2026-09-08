export type UserRole = 'ADMIN' | 'BLOOD_BANK' | 'HOSPITAL' | 'DONOR' | 'PATIENT';

export type AvailabilityStatus = 
  | 'REPORTED_AVAILABILITY'
  | 'PREDICTED_AVAILABILITY'
  | 'RECOMMENDED_ACTION'
  | 'CONFIRMED_AVAILABILITY';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type ComponentType = 
  | 'WHOLE_BLOOD'
  | 'PACKED_RED_BLOOD_CELLS'
  | 'FRESH_FROZEN_PLASMA'
  | 'PLATELET_CONCENTRATE'
  | 'CRYOPRECIPITATE';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  phone_masked?: string;
  facility_type?: string;
  facility_id?: number;
  created_at: string;
}

export interface BloodBank {
  id: number;
  name: string;
  short_name?: string;
  parent_hospital?: string;
  license_number: string;
  district: string;
  state: string;
  address?: string;
  city?: string;
  pincode?: string;
  region?: string;
  category?: string;
  organization_type?: string;
  latitude: number;
  longitude: number;
  contact_number: string;
  email?: string;
  website?: string;
  storage_capacity: number;
  cold_chain_verified: boolean;
  source_name?: string;
  source_url?: string;
  source_type?: string;
  source_verified?: boolean;
  last_verified_at?: string;
  data_status?: string;
  is_active: boolean;
}

export interface Hospital {
  id: number;
  name: string;
  license_number: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  contact_number: string;
  has_trauma_center: boolean;
  bed_capacity: number;
  is_active: boolean;
}

export interface InventoryItem {
  id: number;
  facility_id: number;
  blood_group: BloodGroup;
  component: ComponentType;
  units_available: number;
  batch_number: string;
  status: AvailabilityStatus;
  collected_date: string;
  expiry_date: string;
  temperature_celsius: number;
  source_tag: string;
  last_verified_by_user_id?: number;
  verified_at?: string;
  created_at: string;
  inventory_status?: 'DEMO_SIMULATED' | 'OFFICIAL_LIVE' | 'REPORTED' | string;
  demo_notice?: string;
  critical_threshold?: number;
  days_to_expiry?: number;
  expiry_risk?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  stock_source?: string;
  stock_source_url?: string;
  stock_last_updated?: string;
}

export interface FacilityRecommendation {
  rank: number;
  blood_bank_id: number;
  blood_bank_name: string;
  district: string;
  distance_km: number;
  estimated_transit_mins: number;
  confirmed_units: number;
  reported_units: number;
  cold_chain_verified: boolean;
  shelf_life_status: string;
  overall_match_score: number;
  explanation: string;
  recommended_action: string;
}

export interface EmergencySOSResponse {
  emergency_request_id: number;
  hospital_id: number;
  blood_group: BloodGroup;
  component: ComponentType;
  units_required: number;
  urgency_level: string;
  status: string;
  recommendations: FacilityRecommendation[];
  clinical_decision_support_disclaimer: string;
  created_at: string;
}

export interface DemandPrediction {
  predicted_7d_demand_units: number;
  recommended_safety_stock_units: number;
  availability_classification: string;
  current_stock_units: number;
  projected_deficit: number;
  model_metrics: {
    mean_absolute_error: number;
    root_mean_squared_error: number;
    r2_score: number;
  };
  explainability: {
    top_drivers: string[];
    feature_importance_snapshot: Record<string, number>;
    clinical_advisory: string;
  };
}

export interface ExpiryRiskAssessment {
  risk_tier: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  confidence: number;
  days_remaining: number;
  recommended_action: string;
  explainability: {
    primary_factors: string[];
    probabilities: Record<string, number>;
    evaluation_metrics: {
      accuracy: number;
      precision_macro: number;
      recall_macro: number;
      f1_macro: number;
    };
  };
}

export interface RebalanceProposal {
  rebalance_id: string;
  source_bank_id: number;
  source_bank_name: string;
  destination_hospital_id: number;
  destination_hospital_name: string;
  blood_group: BloodGroup;
  component: ComponentType;
  units_to_transfer: number;
  days_until_expiry: number;
  distance_km: number;
  estimated_transit_mins: number;
  wastage_prevention_score: number;
  explanation: string;
  recommended_action: string;
}

export interface StockSummary {
  total_reported_units: number;
  total_confirmed_units: number;
  total_expiring_within_48h: number;
  breakdown_by_group: {
    blood_group: BloodGroup;
    reported_units: number;
    confirmed_units: number;
    expiring_within_48h: number;
  }[];
  compliance_disclosure: string;
}

export interface BloodSearchResultItem {
  blood_bank_id: number;
  blood_bank_name: string;
  district: string;
  state: string;
  blood_group: BloodGroup;
  component: ComponentType;
  available_units: number;
  status: AvailabilityStatus;
  distance_km: number;
  estimated_transit_minutes: number;
  last_updated: string;
  cold_chain_verified: boolean;
  contact_desk: string;
  availability_disclaimer: string;
}

export interface DonorMatchItem {
  rank: number;
  donor_id: number;
  public_donor_tag: string;
  blood_group: BloodGroup;
  district: string;
  distance_km: number;
  is_eligible: boolean;
  response_probability: number;
  overall_match_score: number;
  score_breakdown: Record<string, number>;
  contact_proxy_channel: string;
}

export interface AIInsightCard {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'ATTENTION' | 'OPPORTUNITY';
  title: string;
  explanation: string;
  recommended_action: string;
  confidence: string;
  timestamp: string;
  data_sources_used: string[];
}

export interface AnalyticsTrendData {
  dates: string[];
  collections: number[];
  issues: number[];
  predicted_demand: number[];
  expiries: number[];
  blood_group_distribution: Record<string, number>;
}

// Advanced Shelf-Life & FEFO Types (Steps 2, 3, 4)
export interface FEFOItem {
  id: number;
  blood_bank_id: number;
  blood_bank: string;
  blood_group: string;
  component: string;
  batch_number: string;
  available_units: number;
  reserved_units: number;
  issued_units: number;
  expired_units: number;
  collection_date: string;
  processing_date?: string;
  expiry_date: string;
  days_to_expiry: number;
  status: 'SAFE' | 'APPROACHING_EXPIRY' | 'HIGH_EXPIRY_RISK' | 'EXPIRED';
  priority: number;
  reason: string;
  recommended_action: string;
  last_updated?: string;
}

export interface ExpiryRiskSummary {
  summary: {
    total_inventory: number;
    expiring_soon_units: number;
    high_risk_units: number;
    expired_units: number;
  };
  by_blood_group: Record<string, { SAFE: number; APPROACHING: number; HIGH: number; EXPIRED: number; total: number }>;
  by_component: Record<string, { SAFE: number; APPROACHING: number; HIGH: number; EXPIRED: number; total: number }>;
  by_blood_bank: Record<string, { SAFE: number; APPROACHING: number; HIGH: number; EXPIRED: number; total: number }>;
  days_distribution: Record<string, number>;
  items: FEFOItem[];
}

export interface ComponentShelfLifeRule {
  id: number;
  component: string;
  storage_method: string;
  shelf_life_value: number;
  shelf_life_unit: string;
  regulatory_reference: string;
  active: boolean;
}

// Wastage Analytics & Reduction Types (Steps 6, 7, 8, 9)
export interface WastageAnalytics {
  kpis: {
    total_collected: number;
    total_issued: number;
    total_discarded: number;
    expiry_related_wastage: number;
    other_wastage: number;
    utilization_rate_pct: number;
    wastage_rate_pct: number;
    units_at_expiry_risk: number;
    current_stock: number;
  };
  by_discard_reason: Record<string, number>;
  by_component: Record<string, number>;
  by_blood_group: Record<string, number>;
  by_blood_bank: Record<string, number>;
  monthly_trend: Array<{
    month: string;
    collected: number;
    issued: number;
    discarded: number;
    expiry_discarded: number;
  }>;
  research_reference_data?: {
    disclaimer: string;
    citations: Array<{
      metric: string;
      value: string;
      source: string;
      year: string;
    }>;
  };
}

export interface WastageRecommendation {
  id: string;
  inventory_id: number;
  blood_bank_id: number;
  blood_bank: string;
  blood_group: string;
  component: string;
  available_units: number;
  days_to_expiry: number;
  expiry_date: string;
  urgency: 'URGENT_REVIEW' | 'HIGH_EXPIRY_RISK' | 'MONITOR';
  action_type: string;
  recommendation: string;
  risk_prediction: {
    model_type: string;
    model_version: string;
    risk: string;
    risk_score: number;
    explanation: string;
    recommendation: string;
    methodology_disclaimer: string;
  };
  safety_disclaimer: string;
}

// Hospital-to-Hospital Network & Communication Types (Steps 10, 11, 12, 13)
export interface HospitalBloodRequest {
  id: number;
  request_id: string;
  requesting_hospital_id: number;
  requesting_hospital_name: string;
  requesting_hospital_district: string;
  target_hospital_id?: number;
  target_hospital_name?: string;
  blood_group: string;
  component: string;
  quantity: number;
  emergency_level: string;
  location?: string;
  notes?: string;
  status: 'PENDING' | 'SEARCHING' | 'MATCH_FOUND' | 'VERIFICATION_REQUIRED' | 'ACCEPTED' | 'REJECTED' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED';
  created_at: string;
  updated_at?: string;
  fulfilled_at?: string;
}

export interface HospitalRequestMessage {
  id: number;
  sender_hospital_id: number;
  sender_hospital_name: string;
  message: string;
  message_type: string;
  created_at: string;
}

export interface HospitalNetworkOverview {
  hospitals: Array<{
    id: number;
    name: string;
    license_number: string;
    type: 'HOSPITAL';
    district: string;
    state: string;
    latitude: number;
    longitude: number;
    contact_number: string;
    has_trauma_center: boolean;
    bed_capacity: number;
    availability_tier: string;
    reported_units: number;
    confirmed_units: number;
    reserved_units: number;
  }>;
  blood_banks: Array<{
    id: number;
    name: string;
    license_number: string;
    type: 'BLOOD_BANK';
    district: string;
    state: string;
    latitude: number;
    longitude: number;
    contact_number: string;
    storage_capacity: number;
    cold_chain_verified: boolean;
    availability_tier: string;
    total_units: number;
    confirmed_units: number;
    reported_units: number;
    reserved_units: number;
  }>;
  requests: HospitalBloodRequest[];
  source_types: string[];
  availability_states: string[];
}

export interface SystemConfigItem {
  key: string;
  value: string;
  data_type: string;
  category: string;
  description: string;
  updated_at?: string;
}

// ---------------------------------------------------------------------------
// Hospital Blood Exchange (H2H FEFO Module)
// ---------------------------------------------------------------------------

export interface ExchangeUnitCard {
  id: number;
  unit_code: string;
  blood_group: string;
  component: string;
  quantity_ml: number;
  providing_hospital_id?: number;
  providing_hospital_name: string;
  city: string;
  collection_date: string;
  expiration_date: string;
  days_until_expiry: number;
  urgency_label: string; // "Critical Expiry", "Expiring Soon", "Use Soon", "Normal"
  urgency_color: string;
  status: string;
  is_recommended_allocation: boolean;
}

export interface ExchangeSearchResult {
  requested_blood_group: string;
  requested_component: string;
  requested_quantity: number;
  available_units_count: number;
  shortage_units_count: number;
  is_fully_fulfillable: boolean;
  wastage_prevention_message: string;
  recommended_units: ExchangeUnitCard[];
  all_eligible_units: ExchangeUnitCard[];
}

export interface RequestItemDetail {
  id: number;
  blood_inventory_id: number;
  unit_code: string;
  expiration_date: string;
  days_until_expiry: number;
}

export interface ExchangeRequestCard {
  id: number;
  requesting_hospital_id: number;
  requesting_hospital_name: string;
  providing_hospital_id?: number;
  providing_hospital_name?: string;
  blood_group: string;
  component: string;
  quantity_requested: number;
  required_by?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'fulfilled';
  created_at: string;
  allocated_units: RequestItemDetail[];
}

export interface WastagePreventionDashboard {
  total_available_units: number;
  expiring_within_3_days: number;
  expiring_within_7_days: number;
  expiring_within_30_days: number;
  prioritized_early_utilization_units: number;
  headline: string;
}

