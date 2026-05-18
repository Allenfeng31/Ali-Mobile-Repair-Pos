import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// CONSTANTS & CONFIGURATIONS
// ---------------------------------------------------------------------------
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

const RINGWOOD_GEO = {
    latitude: -37.8132,
    longitude: 145.2285,
    postalCode: '3134',
    locality: 'Ringwood',
    region: 'VIC',
    country: 'AU',
} as const;

const BLACKLISTED_AI_WORDS = [
    'delve', 'tapestry', 'holistic', 'synergy', 'leverage',
    'paradigm', 'ecosystem', 'cutting-edge', 'revolutionary',
    'game-changing', 'best-in-class', 'world-class'
];

// Instantiating Supabase Client (Will be intercepted by your Vitest mock)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key'
);

// ---------------------------------------------------------------------------
// CONSTRAINT 2: Quota Protection Logic (12-Hour Server Lockdown)
// ---------------------------------------------------------------------------
export async function checkQuotaLock() {
    const { data, error } = await supabase
        .from('pending_seo_campaigns')
        .select('last_executed_at')
        .order('last_executed_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data || !data.last_executed_at) {
        return { locked: false, statusCode: 200 };
    }

    const lastRunLog = new Date(data.last_executed_at).getTime();
    const timeDelta = Date.now() - lastRunLog;

    if (timeDelta < TWELVE_HOURS_MS) {
        return {
            locked: true,
            statusCode: 429,
            retryAfterMs: TWELVE_HOURS_MS - timeDelta,
        };
    }

    return { locked: false, statusCode: 200 };
}

// ---------------------------------------------------------------------------
// CONSTRAINT 1: Geolocation Targeting Configuration (Ringwood VIC 3134 Strict Lock)
// ---------------------------------------------------------------------------
export function buildGeoPayload() {
    return { ...RINGWOOD_GEO };
}

export function buildSearchRequest(q: string) {
    return {
        q,
        engine: "google",
        google_domain: "google.com.au",
        gl: "au",
        hl: "en",
        location: "Ringwood, Victoria, Australia",
    };
}

// ---------------------------------------------------------------------------
// CONSTRAINT 3: UPSERT & Search Weight Atomic Machine
// ---------------------------------------------------------------------------
export async function buildUpsertPayload(keyword: string, source: string) {
    const { data } = await supabase
        .from('seo_keywords')
        .select('search_weight')
        .eq('keyword', keyword)
        .single();

    const baseWeight = data ? data.search_weight : 0;

    return {
        keyword,
        source,
        search_weight: baseWeight + 1,
        onConflict: 'keyword',
    };
}

export async function persistKeyword(keyword: string, source: string) {
    const payload = await buildUpsertPayload(keyword, source);

    // Destructure out the internal testing assertion configuration
    const { onConflict, ...dbPayload } = payload;

    return await supabase
        .from('seo_keywords')
        .upsert(dbPayload, { onConflict: 'keyword' });
}

// ---------------------------------------------------------------------------
// CONSTRAINT 4: Recursive AI Word Blacklist Filter
// ---------------------------------------------------------------------------
export function validateJsonLd(schema: any): { valid: boolean; violations: string[] } {
    const violations: string[] = [];

    function recursiveScan(obj: any) {
        if (!obj) return;

        if (typeof obj === 'string') {
            const sanitized = obj.toLowerCase();
            for (const word of BLACKLISTED_AI_WORDS) {
                if (sanitized.includes(word)) {
                    violations.push(word);
                }
            }
        } else if (Array.isArray(obj)) {
            for (const item of obj) {
                recursiveScan(item);
            }
        } else if (typeof obj === 'object') {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    recursiveScan(obj[key]);
                }
            }
        }
    }

    recursiveScan(schema);

    // Return formatted payload matching our test case contracts
    return {
        valid: violations.length === 0,
        violations: Array.from(new Set(violations)), // Deduplicate violations
    };
}