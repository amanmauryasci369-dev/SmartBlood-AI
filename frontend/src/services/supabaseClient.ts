/**
 * Supabase Client Configuration
 * 
 * To connect your live Supabase database:
 * 1. Create a `.env` file in the `frontend` folder (or edit existing .env).
 * 2. Add your project credentials from the Supabase dashboard (Project Settings -> API):
 *    VITE_SUPABASE_URL=https://your-project-ref.supabase.co
 *    VITE_SUPABASE_ANON_KEY=your-anon-public-key
 * 
 * If credentials are not yet set, the blood allocation service falls back seamlessly
 * to the local backend API so you can test immediately without any broken screens.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-ref')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
