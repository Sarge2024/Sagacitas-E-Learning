import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Tenant ID — Sagacitas E-Learning (mono-tenant default)
// Em produção Multi-Tenant, este valor será resolvido dinamicamente
// via slug do domínio, JWT claim ou contexto de autenticação.
const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

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

/**
 * Resolve o tenant_id atual.
 * Futuramente, isso pode ser baseado em:
 * - Subdomínio (slug.sagacitas.com.br)
 * - JWT claim do Firebase Auth (app_metadata.tenant_id)
 * - LocalStorage após login multi-tenant
 */
export function getCurrentTenantId(): string {
  // 1. Verificar localStorage (definido no login)
  try {
    const stored = localStorage.getItem('sagacitas_tenant_id');
    if (stored) return stored;
  } catch {
    // SSR/Node — ignore
  }

  // 2. Fallback para tenant default
  return DEFAULT_TENANT_ID;
}

export function getCurrentCompanyId(): string | null {
  try {
    const authStorage = localStorage.getItem('sagacitas-auth-store');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.oauthUser?.company_id || null;
    }
  } catch {
    // ignore
  }
  return null;
}

export function getCurrentUserRole(): string | null {
  try {
    const authStorage = localStorage.getItem('sagacitas-auth-store');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.oauthUser?.role || null;
    }
  } catch {
    // ignore
  }
  return null;
}

// Create a single supabase client with tenant context injection
export const supabase: SupabaseClient = createClient(finalUrl, finalKey, {
  global: {
    fetch: (url, options) => {
      const headers = new Headers(options?.headers);
      headers.set('x-tenant-id', getCurrentTenantId());
      
      const companyId = getCurrentCompanyId();
      if (companyId) headers.set('x-company-id', companyId);
      
      const role = getCurrentUserRole();
      if (role) headers.set('x-user-role', role);

      return fetch(url, { ...options, headers });
    }
  },
  db: {
    schema: 'public',
  },
});

// Exportar constantes úteis
export { DEFAULT_TENANT_ID };
