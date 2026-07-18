import 'server-only';

import { createClient } from '@supabase/supabase-js';

export function resolveServerSupabaseKey(environment = process.env) {
  return environment.SUPABASE_SECRET_KEY || environment.SUPABASE_SERVICE_ROLE_KEY || '';
}

// Server-only helper for guarded admin/API paths. Never import this from client components.
export function createServiceRoleClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = resolveServerSupabaseKey();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing server-only Supabase service role configuration.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
