import { getTopAnnouncements } from '@/lib/topAnnouncements';

export async function GET() {
  const announcements = await getTopAnnouncements();
  return Response.json(announcements, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
