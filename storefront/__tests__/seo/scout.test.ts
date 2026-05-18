/**
 * TDD Red Stage — /api/seo/scout (Module 1: The Scout)
 *
 * These tests assert the 4 core architectural constraints before
 * any production code exists. They MUST fail on first run.
 *
 * Constraint 1: GEO Target — Ringwood, VIC 3134, Australia
 * Constraint 2: Quota Protection — 12-hour server-side lockdown
 * Constraint 3: UPSERT & Weight Logic — increment, never duplicate
 * Constraint 4: Payload Integrity — no blacklisted AI words in JSON-LD
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock: Supabase client
// We intercept createClient so no real DB calls fire during tests.
// ---------------------------------------------------------------------------
const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseSingle = vi.fn();
const mockSupabaseUpsert = vi.fn();
const mockSupabaseInsert = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockSupabaseFrom.mockReturnValue({
      select: mockSupabaseSelect.mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            single: mockSupabaseSingle,
          }),
        }),
        eq: vi.fn().mockReturnValue({
          single: mockSupabaseSingle,
        }),
      }),
      upsert: mockSupabaseUpsert,
      insert: mockSupabaseInsert,
    }),
  })),
}));

// ---------------------------------------------------------------------------
// Import: The production module under test.
// This path does NOT exist yet — the import itself guarantees Red Stage.
// ---------------------------------------------------------------------------
// We use a dynamic import wrapper so vitest can still parse the file
// even though the module is missing. Each test will attempt resolution.
const SCOUT_MODULE_PATH = '@/lib/seo/scout';

// Helper: attempt to load the scout module
async function loadScoutModule() {
  return await import(SCOUT_MODULE_PATH);
}

// ---------------------------------------------------------------------------
// CONSTANTS: Shared across test cases
// ---------------------------------------------------------------------------
const RINGWOOD_GEO = {
  latitude: -37.8132,
  longitude: 145.2285,
  postalCode: '3134',
  locality: 'Ringwood',
  region: 'VIC',
  country: 'AU',
} as const;

const BLACKLISTED_AI_WORDS = [
  'delve',
  'tapestry',
  'holistic',
  'synergy',
  'leverage',
  'paradigm',
  'ecosystem',
  'cutting-edge',
  'revolutionary',
  'game-changing',
  'best-in-class',
  'world-class',
] as const;

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// TEST SUITE
// ---------------------------------------------------------------------------
describe('/api/seo/scout — Module 1: The Scout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  // =========================================================================
  // CONSTRAINT 2: Quota Protection — 12-hour lockdown
  // =========================================================================
  describe('Quota Protection', () => {
    it('should return 429 Too Many Requests if checked against a recent Supabase timestamp', async () => {
      // Arrange: Simulate a last-run timestamp that is only 2 hours old
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

      mockSupabaseSingle.mockResolvedValueOnce({
        data: { last_executed_at: twoHoursAgo },
        error: null,
      });

      // Act: Load the scout module and invoke the quota check
      const scout = await loadScoutModule();
      const result = await scout.checkQuotaLock();

      // Assert: Must be locked out with a 429-equivalent response
      expect(result.locked).toBe(true);
      expect(result.statusCode).toBe(429);
      expect(result.retryAfterMs).toBeGreaterThan(0);
      expect(result.retryAfterMs).toBeLessThanOrEqual(TWELVE_HOURS_MS);
    });

    it('should allow execution if the last timestamp is older than 12 hours', async () => {
      // Arrange: Last run was 13 hours ago
      const thirteenHoursAgo = new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString();

      mockSupabaseSingle.mockResolvedValueOnce({
        data: { last_executed_at: thirteenHoursAgo },
        error: null,
      });

      const scout = await loadScoutModule();
      const result = await scout.checkQuotaLock();

      expect(result.locked).toBe(false);
      expect(result.statusCode).toBe(200);
    });

    it('should allow execution if no previous timestamp exists (first run)', async () => {
      // Arrange: No record in pending_seo_campaigns
      mockSupabaseSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const scout = await loadScoutModule();
      const result = await scout.checkQuotaLock();

      expect(result.locked).toBe(false);
      expect(result.statusCode).toBe(200);
    });
  });

  // =========================================================================
  // CONSTRAINT 1: GEO Target — Ringwood, VIC 3134
  // =========================================================================
  describe('Geolocation Targeting', () => {
    it('should structure the mock API payload with precise geolocation parameters targeting postal code 3134', async () => {
      const scout = await loadScoutModule();
      const geoPayload = scout.buildGeoPayload();

      // Must target Ringwood specifically — NOT Sydney defaults
      expect(geoPayload.postalCode).toBe(RINGWOOD_GEO.postalCode);
      expect(geoPayload.locality).toBe(RINGWOOD_GEO.locality);
      expect(geoPayload.region).toBe(RINGWOOD_GEO.region);
      expect(geoPayload.country).toBe(RINGWOOD_GEO.country);

      // Latitude/longitude must be within 0.05° of Ringwood center
      expect(geoPayload.latitude).toBeCloseTo(RINGWOOD_GEO.latitude, 1);
      expect(geoPayload.longitude).toBeCloseTo(RINGWOOD_GEO.longitude, 1);

      // Must NOT contain Sydney coordinates (lat ~-33.87, lng ~151.21)
      expect(Math.abs(geoPayload.latitude - (-33.8688))).toBeGreaterThan(1);
      expect(Math.abs(geoPayload.longitude - 151.2093)).toBeGreaterThan(1);
    });

    it('should include the geo target in the search API request configuration', async () => {
      const scout = await loadScoutModule();
      const requestConfig = scout.buildSearchRequest('mobile phone repair ringwood');

      expect(requestConfig.gl).toBe('au');
      expect(requestConfig.location).toContain('Ringwood');
      expect(requestConfig.location).toContain('Victoria');
    });
  });

  // =========================================================================
  // CONSTRAINT 3: UPSERT & Weight Logic — increment count, no duplicates
  // =========================================================================
  describe('UPSERT & Weight Incrementing', () => {
    it('should parse raw search data into an incrementing payload configuration', async () => {
      // Arrange: Simulate a keyword that already exists with weight 3
      const existingKeyword = {
        keyword: 'iphone screen repair ringwood',
        search_weight: 3,
        source: 'google_suggest',
      };

      mockSupabaseSingle.mockResolvedValueOnce({
        data: existingKeyword,
        error: null,
      });

      const scout = await loadScoutModule();
      const upsertPayload = await scout.buildUpsertPayload(existingKeyword.keyword, 'google_suggest');

      // Weight must INCREMENT, not reset
      expect(upsertPayload.search_weight).toBe(4);
      expect(upsertPayload.keyword).toBe(existingKeyword.keyword);

      // Must use onConflict strategy — never throw duplicate error
      expect(upsertPayload.onConflict).toBe('keyword');
    });

    it('should initialize weight to 1 for brand-new keywords', async () => {
      // Arrange: Keyword does not exist
      mockSupabaseSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const scout = await loadScoutModule();
      const upsertPayload = await scout.buildUpsertPayload('new keyword test', 'google_suggest');

      expect(upsertPayload.search_weight).toBe(1);
      expect(upsertPayload.keyword).toBe('new keyword test');
      expect(upsertPayload.onConflict).toBe('keyword');
    });

    it('should call supabase upsert with correct table and conflict key', async () => {
      mockSupabaseSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });
      mockSupabaseUpsert.mockResolvedValueOnce({ data: [{}], error: null });

      const scout = await loadScoutModule();
      await scout.persistKeyword('samsung repair ringwood', 'google_suggest');

      expect(mockSupabaseFrom).toHaveBeenCalledWith('seo_keywords');
      expect(mockSupabaseUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: 'samsung repair ringwood',
          search_weight: 1,
        }),
        expect.objectContaining({
          onConflict: 'keyword',
        })
      );
    });
  });

  // =========================================================================
  // CONSTRAINT 4: Payload Integrity — no blacklisted AI words
  // =========================================================================
  describe('Payload Integrity — AI Word Blacklist', () => {
    it('should reject JSON-LD schema containing blacklisted AI words', async () => {
      const scout = await loadScoutModule();

      const taintedSchema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Ali Mobile Repair',
        description:
          'We delve into the holistic ecosystem of mobile repair with cutting-edge synergy.',
      };

      const validation = scout.validateJsonLd(taintedSchema);

      expect(validation.valid).toBe(false);
      expect(validation.violations).toEqual(
        expect.arrayContaining(['delve', 'holistic', 'ecosystem', 'cutting-edge', 'synergy'])
      );
    });

    it('should accept clean JSON-LD schema with no blacklisted words', async () => {
      const scout = await loadScoutModule();

      const cleanSchema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Ali Mobile Repair',
        description:
          'Professional mobile phone and tablet repair service in Ringwood, VIC 3134. Same-day screen replacements and battery swaps.',
      };

      const validation = scout.validateJsonLd(cleanSchema);

      expect(validation.valid).toBe(true);
      expect(validation.violations).toHaveLength(0);
    });

    it('should scan all string fields recursively in nested JSON-LD', async () => {
      const scout = await loadScoutModule();

      const nestedSchema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Ali Mobile Repair',
        description: 'Fast repair service.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '123 Maroondah Hwy',
          addressLocality: 'Ringwood',
          description: 'A revolutionary approach to address management.',
        },
      };

      const validation = scout.validateJsonLd(nestedSchema);

      expect(validation.valid).toBe(false);
      expect(validation.violations).toContain('revolutionary');
    });
  });
});