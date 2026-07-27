export const TOP_ANNOUNCEMENT_TAG = 'top-announcement';
export const TOP_ANNOUNCEMENT_REVALIDATE_SECONDS = 60 * 60 * 24 * 30;

export interface TopAnnouncement {
  id: string;
  message: string;
}

export async function getTopAnnouncements(fetchImpl: typeof fetch = fetch): Promise<TopAnnouncement[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return [];

  const announcementsUrl = new URL('/rest/v1/storefront_announcements', supabaseUrl);
  announcementsUrl.searchParams.set('select', 'id,message');
  announcementsUrl.searchParams.set('is_active', 'eq.true');
  announcementsUrl.searchParams.set('order', 'display_order.asc');

  try {
    const response = await fetchImpl(announcementsUrl, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      next: {
        revalidate: TOP_ANNOUNCEMENT_REVALIDATE_SECONDS,
        tags: [TOP_ANNOUNCEMENT_TAG],
      },
    });

    return response.ok ? await response.json() : [];
  } catch {
    return [];
  }
}
