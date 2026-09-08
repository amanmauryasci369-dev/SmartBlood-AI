/**
 * Smart Blood Allocation Service (FEFO - First Expired, First Out)
 * 
 * Supports live Supabase PostgreSQL queries against table `blood_inventory`
 * and local 100-unit synthetic dataset fallback.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { BloodInventoryUnit, INITIAL_100_BLOOD_INVENTORY } from './mockBloodInventoryData';

export interface AllocatedBloodUnit {
  id: string | number;
  unit_code: string;
  blood_group: string;
  rh_type?: 'Positive' | 'Negative' | string;
  component: string;
  quantity_ml: number;
  blood_bank_id?: string | number;
  blood_bank_name: string;
  city: string;
  storage_location?: string;
  expiration_date: string;
  days_until_expiry: number;
  urgency_level: 'Urgent' | 'Use Soon' | 'Normal' | 'Long Shelf-Life';
  status: string;
  screening_status?: string;
  is_allocated: boolean;
}

export interface AllocationResult {
  requested_quantity_ml: number;
  available_quantity_ml: number;
  shortage_quantity_ml: number;
  is_fully_fulfillable: boolean;
  message: string;
  units: AllocatedBloodUnit[];
  source: 'Supabase PostgreSQL' | 'LifeLink Synthetic Database (100 Units)';
}

// In-memory persistent state for local testing (so reservations persist during a demo session)
let localInventoryStore: BloodInventoryUnit[] = [...INITIAL_100_BLOOD_INVENTORY];

/**
 * Calculate days remaining until expiration
 */
export const calculateDaysUntilExpiry = (expirationDateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(expirationDateStr);
  expDate.setHours(0, 0, 0, 0);
  const diffTime = expDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Visual Urgency Badge Helper:
 * - <= 3 days: 'Urgent'
 * - <= 7 days: 'Use Soon'
 * - <= 14 days: 'Normal'
 * - > 14 days: 'Long Shelf-Life'
 */
export const getUrgencyBadge = (daysUntilExpiry: number): 'Urgent' | 'Use Soon' | 'Normal' | 'Long Shelf-Life' => {
  if (daysUntilExpiry <= 3) return 'Urgent';
  if (daysUntilExpiry <= 7) return 'Use Soon';
  if (daysUntilExpiry <= 14) return 'Normal';
  return 'Long Shelf-Life';
};

export const BloodAllocationService = {
  /**
   * Find available blood units prioritized by nearest expiration date (FEFO)
   */
  async getRecommendedUnits(
    bloodGroup: string,
    component: string,
    requiredQuantityMl: number,
    location?: string
  ): Promise<AllocationResult> {
    const today = new Date().toISOString().split('T')[0];

    // PATH A: Live Supabase PostgreSQL Connection
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase
          .from('blood_inventory')
          .select('*')
          .eq('blood_group', bloodGroup)
          .eq('component', component)
          .eq('status', 'available')
          .eq('screening_status', 'cleared')
          .gt('expiration_date', today)
          .order('expiration_date', { ascending: true }); // STRICT FEFO SORT

        if (location && location.trim() && location.toLowerCase() !== 'all locations') {
          query = query.ilike('city', `%${location.trim()}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.warn('Supabase query error, falling back to local 100-unit dataset:', error.message);
        } else if (data) {
          let totalAvailableMl = 0;
          let cumulativeAllocatedMl = 0;

          const units: AllocatedBloodUnit[] = data.map((item: any) => {
            const expDate = item.expiration_date || item.expiry_date;
            const daysLeft = calculateDaysUntilExpiry(expDate);
            const qty = item.quantity_ml || 450;
            totalAvailableMl += qty;

            const isAlloc = cumulativeAllocatedMl < requiredQuantityMl;
            if (isAlloc) {
              cumulativeAllocatedMl += qty;
            }

            return {
              id: item.id,
              unit_code: item.id || item.unit_code || `BL-${item.id}`,
              blood_group: item.blood_group,
              rh_type: item.rh_type || ('Positive'),
              component: item.component,
              quantity_ml: qty,
              blood_bank_id: item.blood_bank_id || item.facility_id,
              blood_bank_name: item.blood_bank_name || 'Demo Blood Bank',
              city: item.city || 'Delhi',
              storage_location: item.storage_location || 'Refrigerator A',
              expiration_date: expDate,
              days_until_expiry: daysLeft,
              urgency_level: getUrgencyBadge(daysLeft),
              status: item.status,
              screening_status: item.screening_status || 'cleared',
              is_allocated: isAlloc,
            };
          });

          const shortageMl = Math.max(0, requiredQuantityMl - totalAvailableMl);
          const isFulfillable = totalAvailableMl >= requiredQuantityMl;

          return {
            requested_quantity_ml: requiredQuantityMl,
            available_quantity_ml: totalAvailableMl,
            shortage_quantity_ml: shortageMl,
            is_fully_fulfillable: isFulfillable,
            message: isFulfillable
              ? `Full requirement of ${requiredQuantityMl} ml satisfied via FEFO allocation.`
              : `Shortage detected: Only ${totalAvailableMl} ml available out of ${requiredQuantityMl} ml required (Deficit: ${shortageMl} ml).`,
            units,
            source: 'Supabase PostgreSQL',
          };
        }
      } catch (err) {
        console.warn('Supabase execution error, using local 100-unit dataset fallback:', err);
      }
    }

    // PATH B: Local 100-Unit High-Fidelity Dataset Fallback
    // Evaluates the exact same SQL logic in memory:
    // 1. blood_group == requested
    // 2. component == requested
    // 3. status == 'available'
    // 4. screening_status == 'cleared'
    // 5. expiration_date > today
    // 6. ORDER BY expiration_date ASC
    let eligible = localInventoryStore.filter(u => {
      if (u.blood_group !== bloodGroup) return false;
      if (u.component !== component) return false;
      if (u.status !== 'available') return false;
      if (u.screening_status !== 'cleared') return false;
      if (u.expiration_date <= today) return false;
      if (location && location.trim() && location.toLowerCase() !== 'all locations') {
        if (!u.city.toLowerCase().includes(location.toLowerCase())) return false;
      }
      return true;
    });

    // Deterministic FEFO sorting: nearest expiration date first
    eligible.sort((a, b) => a.expiration_date.localeCompare(b.expiration_date));

    let totalAvailableMl = 0;
    let cumulativeAllocatedMl = 0;

    const units: AllocatedBloodUnit[] = eligible.map(item => {
      const daysLeft = calculateDaysUntilExpiry(item.expiration_date);
      totalAvailableMl += item.quantity_ml;

      const isAlloc = cumulativeAllocatedMl < requiredQuantityMl;
      if (isAlloc) {
        cumulativeAllocatedMl += item.quantity_ml;
      }

      return {
        id: item.id,
        unit_code: item.id,
        blood_group: item.blood_group,
        rh_type: item.rh_type,
        component: item.component,
        quantity_ml: item.quantity_ml,
        blood_bank_id: item.blood_bank_id,
        blood_bank_name: item.blood_bank_name,
        city: item.city,
        storage_location: item.storage_location,
        expiration_date: item.expiration_date,
        days_until_expiry: daysLeft,
        urgency_level: getUrgencyBadge(daysLeft),
        status: item.status,
        screening_status: item.screening_status,
        is_allocated: isAlloc,
      };
    });

    const shortageMl = Math.max(0, requiredQuantityMl - totalAvailableMl);
    const isFulfillable = totalAvailableMl >= requiredQuantityMl;

    return {
      requested_quantity_ml: requiredQuantityMl,
      available_quantity_ml: totalAvailableMl,
      shortage_quantity_ml: shortageMl,
      is_fully_fulfillable: isFulfillable,
      message: isFulfillable
        ? `Full requirement of ${requiredQuantityMl} ml satisfied via FEFO allocation.`
        : `Shortage detected: Only ${totalAvailableMl} ml available out of ${requiredQuantityMl} ml required (Deficit: ${shortageMl} ml).`,
      units,
      source: 'LifeLink Synthetic Database (100 Units)',
    };
  },

  /**
   * Concurrency-Safe Blood Unit Reservation
   * Changes unit status from 'available' -> 'reserved' atomically.
   */
  async reserveUnit(unitId: string | number, patientName: string = 'Patient'): Promise<{ success: boolean; message: string }> {
    // PATH A: Live Supabase PostgreSQL Connection
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('blood_inventory')
        .update({
          status: 'reserved',
        })
        .eq('id', unitId)
        .eq('status', 'available') // Concurrency check: must currently be available!
        .select();

      if (error) {
        throw new Error(`Supabase reservation failed: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('This blood unit is no longer available or was just reserved by another patient.');
      }

      return {
        success: true,
        message: `Unit ${unitId} successfully reserved in Supabase PostgreSQL database!`,
      };
    }

    // PATH B: Local Dataset Atomic Reservation
    const targetIdx = localInventoryStore.findIndex(u => u.id === String(unitId));
    if (targetIdx === -1) {
      throw new Error(`Unit ${unitId} not found in inventory.`);
    }

    if (localInventoryStore[targetIdx].status !== 'available') {
      throw new Error(`Unit ${unitId} is already marked as ${localInventoryStore[targetIdx].status} and cannot be reserved.`);
    }

    localInventoryStore[targetIdx].status = 'reserved';

    return {
      success: true,
      message: `Unit ${unitId} successfully reserved in local database!`,
    };
  },

  /**
   * Fetch all 100 records for the Inventory Inspector View
   */
  async getAllInventory(): Promise<{ units: BloodInventoryUnit[]; source: string }> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('blood_inventory')
          .select('*')
          .order('id', { ascending: true });

        if (!error && data && data.length > 0) {
          return {
            units: data as BloodInventoryUnit[],
            source: 'Supabase PostgreSQL (Live Table: blood_inventory)',
          };
        }
      } catch (e) {
        console.warn('Supabase fetch failed, falling back to local 100 units');
      }
    }

    return {
      units: [...localInventoryStore],
      source: 'Local Synthetic Database (100 Units: BL-1001 to BL-1100)',
    };
  },

  /**
   * Reset local inventory to initial state (handy for repeated college presentations)
   */
  resetLocalInventory(): void {
    localInventoryStore = [...INITIAL_100_BLOOD_INVENTORY];
  },
};
