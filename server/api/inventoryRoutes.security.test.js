/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8');

describe('inventory route security contract', () => {
  it('exposes the allowlisted public handler and protects the internal read', () => {
    expect(source).toContain("app.get('/api/public/inventory', inventoryHandlers.listPublic)");
    expect(source).toContain(`app.get('/api/inventory', (req, res) => {
  if (!req.headers.authorization) return inventoryHandlers.listPublic(req, res);
  return requireStaffAuth(req, res, () => inventoryHandlers.listInternal(req, res));
});`);
  });

  it.each([
    "app.post('/api/inventory', requireStaffAuth, requireInventoryWritePermission",
    "app.post('/api/inventory/bulk', requireStaffAuth, requireInventoryWritePermission",
    "app.put('/api/inventory/:id', requireStaffAuth, requireInventoryWritePermission",
    "app.delete('/api/inventory/:id', requireStaffAuth, requireInventoryWritePermission",
  ])('requires staff auth and inventory permission: %s', (registration) => {
    expect(source).toContain(registration);
  });
});
