/**
 * Smart Blood Allocation Service (FEFO - First Expired, First Out)
 * 
 * Implements deterministic sorting and reservation directly with Supabase
 * or the local FastAPI backend fallback.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface AllocatedBloodUnit {
  id: number;
  unit_code: string;
  blood_group: string;
  component: string;
  quantity_ml: number;
  blood_bank_id?: number;
  blood_bank_name: string;
  city: string;
  expiration_date: string;
  days_until_expiry: number;
  urgency_level: 'Urgent' | 'Use Soon' | 'Normal';
  status: string;
  is_allocated: boolean;
}

export interface AllocationResult {
  requested_quantity_ml: number;
  available_quantity_ml: number;
  shortage_quantity_ml: number;
  is_fully_fulfillable: boolean;
  message: string;
  units: AllocatedBloodUnit[];
  source: 'Supabase PostgreSQL' | 'LifeLink Local Database';
}

/**
 * Helper to calculate days remaining until expiration
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
 * - <= 2 days: 'Urgent'
 * - <= 7 days: 'Use Soon'
 * - >= 14 days: 'Normal'
 */
export const getUrgencyBadge = (daysUntilExpiry: number): 'Urgent' | 'Use Soon' | 'Normal' => {
  if (daysUntilExpiry <= 2) return 'Urgent';
  if (daysUntilExpiry <= 7) return 'Use Soon';
  return 'Normal';
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
          console.warn('Supabase query error, falling back to local API:', error.message);
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
              unit_code: item.unit_code || item.batch_number || `BL-${item.id}`,
              blood_group: item.blood_group,
              component: item.component,
              quantity_ml: qty,
              blood_bank_id: item.blood_bank_id || item.facility_id,
              blood_bank_name: item.blood_bank_name || 'Regional Blood Center',
              city: item.city || 'Delhi NCR',
              expiration_date: expDate,
              days_until_expiry: daysLeft,
              urgency_level: getUrgencyBadge(daysLeft),
              status: item.status,
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
        console.warn('Supabase execution error, trying API fallback:', err);
      }
    }

    // PATH B: Backend API Fallback
    const response = await fetch('http://127.0.0.1:8000/api/v1/allocation/fefo-recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blood_group: bloodGroup,
        component: component,
        required_quantity_ml: Number(requiredQuantityMl),
        location: location || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blood allocation: ${response.statusText}`);
    }

    const json = await response.json();
    return {
      ...json,
      source: 'LifeLink Local Database',
    };
  },

  /**
   * Concurrency-Safe Blood Unit Reservation
   * Changes unit status from 'available' -> 'reserved' atomically.
   */
  async reserveUnit(unitId: number, patientName: string = 'Patient'): Promise<{ success: boolean; message: string }> {
    // PATH A: Live Supabase PostgreSQL Connection
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('blood_inventory')
        .update({
          status: 'reserved',
          updated_at: new Date().toISOString(),
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
        message: `Unit ${data[0].unit_code || unitId} successfully reserved!`,
      };
    }

    // PATH B: Backend API Fallback
    const response = await fetch('http://127.0.0.1:8000/api/v1/allocation/reserve-unit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unit_id: unitId,
        patient_name: patientName,
      }),
    });

    if (response.status === 409) {
      throw new Error('This blood unit is no longer available or was just reserved by another patient.');
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ detail: 'Reservation failed' }));
      throw new Error(errData.detail || 'Failed to reserve blood unit.');
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message,
    };
  },
};
