import { TopAnnouncementBarClient } from './TopAnnouncementBarClient';

interface Announcement {
  id: string;
  message: string;
}

export async function TopAnnouncementBar() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const announcementsUrl = new URL('/rest/v1/storefront_announcements', supabaseUrl);
  announcementsUrl.searchParams.set('select', 'id,message');
  announcementsUrl.searchParams.set('is_active', 'eq.true');
  announcementsUrl.searchParams.set('order', 'display_order.asc');

  const response = await fetch(announcementsUrl, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    next: { revalidate: 300 },
  }).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  const announcements: Announcement[] = await response.json();

  if (announcements.length === 0) {
    return null;
  }

  return <TopAnnouncementBarClient announcements={announcements} />;
}
