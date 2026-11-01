import 'server-only';

import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

import { createServiceRoleClient } from '@/utils/supabase/service-role';

export type RepairResultsAdminAuthorization =
  | { authorized: true; userId: string }
  | { authorized: false; status: 401 | 403; error: 'Unauthorized' | 'Forbidden' };

async function getAuthenticatedUserId(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('authorization') || '';
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);

  if (tokenMatch) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase authentication is not configured.');
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await authClient.auth.getUser(tokenMatch[1]);
    if (error || !data.user) return null;
    return data.user.id;
  }

  const cookieStore = await cookies();
  const sessionClient = createRouteHandlerClient({
    cookies: (() => cookieStore) as unknown as typeof cookies,
  });
  const { data, error } = await sessionClient.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

export async function authorizeRepairResultsAdminRequest(
  request: Request,
): Promise<RepairResultsAdminAuthorization> {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return { authorized: false, status: 401, error: 'Unauthorized' };

  const serviceRoleClient = createServiceRoleClient();
  const { data, error } = await serviceRoleClient
    .from('employee_permissions')
    .select('is_super_admin')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (data?.is_super_admin !== true) {
    return { authorized: false, status: 403, error: 'Forbidden' };
  }

  return { authorized: true, userId };
}
