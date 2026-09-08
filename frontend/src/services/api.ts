import { 
  User, 
  UserRole, 
  BloodBank, 
  Hospital, 
  InventoryItem, 
  StockSummary, 
  EmergencySOSResponse, 
  DemandPrediction, 
  ExpiryRiskAssessment, 
  RebalanceProposal,
  FEFOItem,
  ExpiryRiskSummary,
  WastageAnalytics,
  WastageRecommendation,
  HospitalBloodRequest,
  HospitalRequestMessage,
  HospitalNetworkOverview,
  ComponentShelfLifeRule,
  SystemConfigItem,
  ExchangeSearchResult,
  ExchangeRequestCard,
  WastagePreventionDashboard
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export class ApiService {
  private static tokenKey = 'smartblood_jwt_token';

  static setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  static clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorBody.detail || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Auth
  static async login(email: string, password: string): Promise<{ access_token: string; role: UserRole; user_id: number; email: string; full_name: string; facility_id?: number }> {
    const res = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.access_token);
    return res;
  }

  static async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Facilities
  static async getBloodBanks(district?: string): Promise<BloodBank[]> {
    const query = district ? `?district=${encodeURIComponent(district)}` : '';
    return this.request<BloodBank[]>(`/facilities/blood-banks${query}`);
  }

  static async getHospitals(district?: string): Promise<Hospital[]> {
    const query = district ? `?district=${encodeURIComponent(district)}` : '';
    return this.request<Hospital[]>(`/facilities/hospitals${query}`);
  }

  // Inventory
  static async getInventory(params?: { facility_id?: number; blood_group?: string; component?: string; status?: string }): Promise<InventoryItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.facility_id) searchParams.append('facility_id', params.facility_id.toString());
    if (params?.blood_group) searchParams.append('blood_group', params.blood_group);
    if (params?.component) searchParams.append('component', params.component);
    if (params?.status) searchParams.append('status', params.status);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<InventoryItem[]>(`/inventory${query}`);
  }

  static async getStockSummary(): Promise<StockSummary> {
    return this.request<StockSummary>('/inventory/summary');
  }

  static async syncERaktKosh(district: string = 'Central Delhi', state: string = 'Delhi'): Promise<any> {
    return this.request<any>(`/inventory/sync-eraktkosh?district=${encodeURIComponent(district)}&state=${encodeURIComponent(state)}`, {
      method: 'POST',
    });
  }

  static async confirmInventory(itemId: number, unitsVerified?: number, tempVerified?: number): Promise<InventoryItem> {
    return this.request<InventoryItem>(`/inventory/${itemId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({
        units_verified: unitsVerified,
        temperature_verified_celsius: tempVerified,
      }),
    });
  }

  // Emergency SOS
  static async triggerEmergencySOS(data: {
    hospital_id: number;
    blood_group: string;
    component: string;
    units_required: number;
    urgency_level: string;
    clinical_notes?: string;
  }): Promise<EmergencySOSResponse> {
    return this.request<EmergencySOSResponse>('/emergency/sos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async acceptEmergencyRecommendation(requestId: number, bloodBankId: number, units: number): Promise<any> {
    return this.request<any>(`/emergency/${requestId}/accept`, {
      method: 'POST',
      body: JSON.stringify({
        selected_blood_bank_id: bloodBankId,
        allocated_units: units,
      }),
    });
  }

  // Predictions & ML
  static async getDemandForecast(params: {
    component: string;
    blood_group: string;
    has_trauma_center: boolean;
    bed_capacity: number;
    rolling_7d_avg: number;
    current_stock: number;
    dengue_outbreak_factor?: number;
  }): Promise<DemandPrediction> {
    const searchParams = new URLSearchParams();
    searchParams.append('component', params.component);
    searchParams.append('blood_group', params.blood_group);
    searchParams.append('has_trauma_center', String(params.has_trauma_center));
    searchParams.append('bed_capacity', String(params.bed_capacity));
    searchParams.append('rolling_7d_avg', String(params.rolling_7d_avg));
    searchParams.append('current_stock', String(params.current_stock));
    if (params.dengue_outbreak_factor !== undefined) {
      searchParams.append('dengue_outbreak_factor', String(params.dengue_outbreak_factor));
    }

    return this.request<DemandPrediction>(`/predictions/demand?${searchParams.toString()}`);
  }

  static async getExpiryRisk(params: {
    days_until_expiry: number;
    component: string;
    current_stock: number;
    temperature_deviation?: number;
  }): Promise<ExpiryRiskAssessment> {
    const searchParams = new URLSearchParams();
    searchParams.append('days_until_expiry', String(params.days_until_expiry));
    searchParams.append('component', params.component);
    searchParams.append('current_stock', String(params.current_stock));
    if (params.temperature_deviation !== undefined) {
      searchParams.append('temperature_deviation', String(params.temperature_deviation));
    }

    return this.request<ExpiryRiskAssessment>(`/predictions/expiry-risk?${searchParams.toString()}`);
  }

  static async getModelMetrics(): Promise<any> {
    return this.request<any>('/predictions/model-metrics');
  }

  static async getRebalanceProposals(): Promise<RebalanceProposal[]> {
    return this.request<RebalanceProposal[]>('/transfers/rebalance-proposals');
  }

  static async getTransferLogs(): Promise<any[]> {
    return this.request<any[]>('/transfers/logs');
  }

  // Shelf-Life & FEFO Methods (Steps 2, 3, 4)
  static async getInventoryFEFO(params?: {
    blood_bank_id?: number;
    blood_group?: string;
    component?: string;
    include_expired?: boolean;
  }): Promise<FEFOItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.blood_bank_id) searchParams.append('blood_bank_id', String(params.blood_bank_id));
    if (params?.blood_group) searchParams.append('blood_group', params.blood_group);
    if (params?.component) searchParams.append('component', params.component);
    if (params?.include_expired) searchParams.append('include_expired', 'true');

    return this.request<FEFOItem[]>(`/inventory/fefo?${searchParams.toString()}`);
  }

  static async getExpiryRiskSummary(blood_bank_id?: number): Promise<ExpiryRiskSummary> {
    const query = blood_bank_id ? `?blood_bank_id=${blood_bank_id}` : '';
    return this.request<ExpiryRiskSummary>(`/expiry-risk${query}`);
  }

  static async getShelfLifeRules(): Promise<ComponentShelfLifeRule[]> {
    return this.request<ComponentShelfLifeRule[]>('/shelf-life-rules');
  }

  static async updateShelfLifeRule(rule: Partial<ComponentShelfLifeRule>): Promise<ComponentShelfLifeRule> {
    return this.request<ComponentShelfLifeRule>('/shelf-life-rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  }

  // Wastage Analytics & Reduction Methods (Steps 6, 7, 8, 9)
  static async getWastageAnalytics(params?: {
    blood_bank_id?: number;
    state?: string;
    district?: string;
    blood_group?: string;
    component?: string;
  }): Promise<WastageAnalytics> {
    const searchParams = new URLSearchParams();
    if (params?.blood_bank_id) searchParams.append('blood_bank_id', String(params.blood_bank_id));
    if (params?.state) searchParams.append('state', params.state);
    if (params?.district) searchParams.append('district', params.district);
    if (params?.blood_group) searchParams.append('blood_group', params.blood_group);
    if (params?.component) searchParams.append('component', params.component);

    return this.request<WastageAnalytics>(`/wastage/analytics?${searchParams.toString()}`);
  }

  static async getWastageRecommendations(blood_bank_id?: number): Promise<WastageRecommendation[]> {
    const query = blood_bank_id ? `?blood_bank_id=${blood_bank_id}` : '';
    return this.request<WastageRecommendation[]>(`/wastage/recommendations${query}`);
  }

  static async recordDiscard(discard: {
    blood_bank_id: number;
    blood_group: string;
    component: string;
    quantity: number;
    reason: string;
    reference_inventory_id?: number;
    notes?: string;
  }): Promise<any> {
    return this.request<any>('/wastage/record', {
      method: 'POST',
      body: JSON.stringify(discard),
    });
  }

  // Hospital-to-Hospital Network Methods (Steps 10, 11, 12, 13)
  static async getHospitalNetworkOverview(): Promise<HospitalNetworkOverview> {
    return this.request<HospitalNetworkOverview>('/hospital-network/overview');
  }

  static async getHospitalRequests(hospital_id?: number, status?: string): Promise<HospitalBloodRequest[]> {
    const searchParams = new URLSearchParams();
    if (hospital_id) searchParams.append('hospital_id', String(hospital_id));
    if (status) searchParams.append('status', status);
    return this.request<HospitalBloodRequest[]>(`/hospital-requests?${searchParams.toString()}`);
  }

  static async getHospitalRequestDetail(id: number): Promise<HospitalBloodRequest & { messages: HospitalRequestMessage[] }> {
    return this.request<HospitalBloodRequest & { messages: HospitalRequestMessage[] }>(`/hospital-requests/${id}`);
  }

  static async createHospitalRequest(req: {
    requesting_hospital_id: number;
    blood_group: string;
    component: string;
    quantity: number;
    emergency_level?: string;
    target_hospital_id?: number;
    notes?: string;
    location?: string;
  }): Promise<HospitalBloodRequest> {
    return this.request<HospitalBloodRequest>('/hospital-requests', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  static async acceptHospitalRequest(id: number, accepting_hospital_id: number, notes?: string): Promise<any> {
    return this.request<any>(`/hospital-requests/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify({ accepting_hospital_id, notes }),
    });
  }

  static async rejectHospitalRequest(id: number, rejecting_hospital_id: number, reason: string): Promise<any> {
    return this.request<any>(`/hospital-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejecting_hospital_id, reason }),
    });
  }

  static async confirmHospitalRequest(id: number, notes?: string): Promise<any> {
    return this.request<any>(`/hospital-requests/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  static async fulfillHospitalRequest(id: number, notes?: string): Promise<any> {
    return this.request<any>(`/hospital-requests/${id}/fulfill`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  static async getHospitalCommunications(requestId: number): Promise<HospitalRequestMessage[]> {
    return this.request<HospitalRequestMessage[]>(`/hospital-communications/${requestId}`);
  }

  static async sendHospitalCommunication(requestId: number, sender_hospital_id: number, message: string): Promise<any> {
    return this.request<any>(`/hospital-communications/${requestId}/message`, {
      method: 'POST',
      body: JSON.stringify({ sender_hospital_id, message }),
    });
  }

  // Emergency Unified Multi-Source Ranking (Steps 14, 15)
  static async getEmergencySourceRanking(params: {
    hospital_id: number;
    blood_group: string;
    component: string;
    units_required: number;
    emergency_level?: string;
  }): Promise<any> {
    const searchParams = new URLSearchParams();
    searchParams.append('hospital_id', String(params.hospital_id));
    searchParams.append('blood_group', params.blood_group);
    searchParams.append('component', params.component);
    searchParams.append('units_required', String(params.units_required));
    if (params.emergency_level) searchParams.append('emergency_level', params.emergency_level);

    return this.request<any>(`/emergency/source-ranking?${searchParams.toString()}`);
  }

  // Admin Configuration Methods (Step 18)
  static async getSystemConfigurations(): Promise<Record<string, SystemConfigItem>> {
    return this.request<Record<string, SystemConfigItem>>('/admin/configuration');
  }

  static async updateSystemConfigurations(configs: Array<{ key: string; value: string; description?: string }>): Promise<any> {
    return this.request<any>('/admin/configuration', {
      method: 'PUT',
      body: JSON.stringify({ configs }),
    });
  }

  // ---------------------------------------------------------------------------
  // Hospital Blood Exchange Methods (H2H FEFO Module)
  // ---------------------------------------------------------------------------

  static async verifyHospitalAccess(): Promise<any> {
    return this.request<any>('/hospital-exchange/verify-access');
  }

  static async searchHospitalExchange(params: {
    blood_group: string;
    component: string;
    required_quantity: number;
    search_location?: string;
  }): Promise<ExchangeSearchResult> {
    const searchParams = new URLSearchParams();
    searchParams.append('blood_group', params.blood_group);
    searchParams.append('component', params.component);
    searchParams.append('required_quantity', String(params.required_quantity));
    if (params.search_location && params.search_location.trim()) {
      searchParams.append('search_location', params.search_location.trim());
    }
    return this.request<ExchangeSearchResult>(`/hospital-exchange/search?${searchParams.toString()}`);
  }

  static async createHospitalExchangeRequest(payload: {
    providing_hospital_id: number;
    providing_hospital_name: string;
    blood_group: string;
    component: string;
    quantity_requested: number;
    required_by?: string;
    search_location?: string;
    selected_unit_ids: number[];
  }): Promise<any> {
    return this.request<any>('/hospital-exchange/request', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async getIncomingExchangeRequests(): Promise<ExchangeRequestCard[]> {
    return this.request<ExchangeRequestCard[]>('/hospital-exchange/incoming-requests');
  }

  static async getMyExchangeRequests(): Promise<ExchangeRequestCard[]> {
    return this.request<ExchangeRequestCard[]>('/hospital-exchange/my-requests');
  }

  static async acceptExchangeRequest(requestId: number): Promise<any> {
    return this.request<any>(`/hospital-exchange/requests/${requestId}/accept`, {
      method: 'POST',
    });
  }

  static async rejectExchangeRequest(requestId: number): Promise<any> {
    return this.request<any>(`/hospital-exchange/requests/${requestId}/reject`, {
      method: 'POST',
    });
  }

  static async getExchangeWastageOverview(): Promise<WastagePreventionDashboard> {
    return this.request<WastagePreventionDashboard>('/hospital-exchange/inventory-overview');
  }
}
