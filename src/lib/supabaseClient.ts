import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables in a way that works both on client (Vite) and server (Node)
const supabaseUrl = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' && process.env.VITE_SUPABASE_URL) || 
  '';

const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_SUPABASE_ANON_KEY) || 
  (typeof process !== 'undefined' && process.env.VITE_SUPABASE_ANON_KEY) || 
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL or Anon Key is missing. Ensure you have set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

// Provide dummy values to prevent fatal crash on instantiation when missing
// We use a fast-failing localhost port to avoid long timeouts on DB queries
const finalUrl = supabaseUrl || 'http://localhost:54321';
const finalKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy.dummy';

// Create a single supabase client for interacting with your database
export const supabase = createClient(finalUrl, finalKey);
