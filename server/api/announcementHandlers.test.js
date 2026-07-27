/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from 'vitest';
import announcementHandlers from './announcementHandlers.js';
import fs from 'node:fs';
import path from 'node:path';

const { createAnnouncementHandlers } = announcementHandlers;

function response() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
}

function createSupabase(result) {
  const query = {
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockResolvedValue(result),
  };
  return { from: vi.fn(() => query), query };
}

describe('announcement mutation cache notification boundary', () => {
  it('notifies once only after a successful announcement mutation', async () => {
    const { from } = createSupabase({ data: [{ id: 'announcement-1' }], error: null });
    const notifyStorefrontAnnouncementChange = vi.fn().mockResolvedValue(true);
    const res = response();

    await createAnnouncementHandlers({ supabase: { from }, notifyStorefrontAnnouncementChange }).create({ body: { message: 'Updated' } }, res);

    expect(notifyStorefrontAnnouncementChange).toHaveBeenCalledOnce();
    expect(res.json).toHaveBeenCalledWith({ id: 'announcement-1' });
  });

  it('does not notify when the database mutation fails', async () => {
    const { from } = createSupabase({ data: null, error: new Error('database failure') });
    const notifyStorefrontAnnouncementChange = vi.fn();
    const res = response();

    await createAnnouncementHandlers({ supabase: { from }, notifyStorefrontAnnouncementChange }).update({ body: { is_active: false }, params: { id: 'announcement-1' } }, res);

    expect(notifyStorefrontAnnouncementChange).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('keeps a successful database mutation successful when notification fails', async () => {
    const { from } = createSupabase({ error: null });
    const notifyStorefrontAnnouncementChange = vi.fn().mockRejectedValue(new Error('network failure'));
    const res = response();

    await createAnnouncementHandlers({ supabase: { from }, notifyStorefrontAnnouncementChange }).remove({ params: { id: 'announcement-1' } }, res);

    expect(notifyStorefrontAnnouncementChange).toHaveBeenCalledOnce();
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('keeps notification server-side and requires staff authentication for the POS announcement API', () => {
    const cms = fs.readFileSync(path.resolve(process.cwd(), 'src/views/StorefrontCMS.tsx'), 'utf8');
    const api = fs.readFileSync(path.resolve(process.cwd(), 'src/lib/api.ts'), 'utf8');
    const server = fs.readFileSync(path.resolve(process.cwd(), 'server/api/index.js'), 'utf8');

    expect(cms).toContain('api.createAnnouncement');
    expect(cms).not.toContain(".from('storefront_announcements')");
    expect(api).toContain('const headers = await getStaffAuthHeaders();');
    expect(server).toContain("app.post('/api/announcements', requireStaffAuth, announcementHandlers.create);");
    expect(server).toContain("app.put('/api/announcements/:id', requireStaffAuth, announcementHandlers.update);");
    expect(server).toContain("app.delete('/api/announcements/:id', requireStaffAuth, announcementHandlers.remove);");
  });
});
