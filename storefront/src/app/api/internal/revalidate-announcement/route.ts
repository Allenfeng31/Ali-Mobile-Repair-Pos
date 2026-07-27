import { isAuthorizedAnnouncementRevalidation, revalidateTopAnnouncement } from '@/lib/announcementRevalidation';

export async function POST(request: Request) {
  const providedSecret = request.headers.get('x-announcement-revalidation-secret');
  const expectedSecret = process.env.ANNOUNCEMENT_REVALIDATION_SECRET;

  if (!isAuthorizedAnnouncementRevalidation(providedSecret, expectedSecret)) {
    return new Response(null, { status: 401 });
  }

  revalidateTopAnnouncement();
  return Response.json({ revalidated: true });
}
