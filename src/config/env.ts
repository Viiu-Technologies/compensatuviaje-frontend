// ============================================
// Centralized Environment Configuration
// ============================================
// Single source of truth for all environment variables.
// Import this instead of using import.meta.env directly.

export const API_URL: string =
  import.meta.env.VITE_APP_API_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3001/api';

export const SUPABASE_URL: string =
  import.meta.env.VITE_SUPABASE_URL || '';

export const SUPABASE_ANON_KEY: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_DEVELOPMENT = import.meta.env.DEV;

// Log config at startup (dev only)
if (IS_DEVELOPMENT) {
  console.log('[Config] API_URL:', API_URL);
  console.log('[Config] SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
}
