import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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

interface ScoutParams {
    latitude: number;
    longitude: number;
    postalCode: string;
    searchQueries: string[];
}

interface ScoutResult {
    insertedCount: number;
    blockedCount: number;
}

const AI_BUZZWORD_BLACKLIST = [
    'delve',
    'revolutionary',
    'holistic',
    'comprehensive',
    'transformative',
    'streamline',
    'synergy',
    'testament',
    'bespoke',
];

function containsAiPlasticLanguage(text: string): boolean {
    const normalizedText = text.toLowerCase();
    return AI_BUZZWORD_BLACKLIST.some((word) => normalizedText.includes(word));
}

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

    return await supabase
        .from('seo_keywords')
        .upsert(
            {
                keyword: payload.keyword,
                source: payload.source,
                search_weight: payload.search_weight,
            },
            { onConflict: payload.onConflict }
        );
}

// ---------------------------------------------------------------------------
// CONSTRAINT 4: Recursive AI Word Blacklist Filter
// ---------------------------------------------------------------------------
export function validateJsonLd(schema: unknown): { valid: boolean; violations: string[] } {
    const violations: string[] = [];

    function recursiveScan(obj: unknown) {
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
            for (const value of Object.values(obj)) {
                recursiveScan(value);
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

/**
 * Core SEO Scout Engine.
 * Fetches search suggestions, filters AI buzzwords, and upserts queued keywords with weight accumulation.
 */
export async function runScoutEngine(
    params: ScoutParams,
    injectedSupabase?: SupabaseClient
): Promise<ScoutResult> {
    const routeSupabase = injectedSupabase || createRouteHandlerClient({ cookies });
    let insertedCount = 0;
    let blockedCount = 0;

    for (const baseQuery of params.searchQueries) {
        try {
            const googleSuggestUrl = `https://suggestqueries.google.com/complete/search?client=chrome&hl=en-AU&gl=au&q=${encodeURIComponent(baseQuery)}`;

            const response = await fetch(googleSuggestUrl, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
            });

            if (!response.ok) continue;

            const data = await response.json();
            const googleSuggestions: string[] = Array.isArray(data?.[1]) ? data[1] : [];

            const targetedScoutPayload = Array.from(
                new Set([
                    ...googleSuggestions,
                    `${baseQuery} near me`,
                    `${baseQuery} ${params.postalCode}`,
                    `cheap ${baseQuery} school holidays`,
                ])
            );

            for (const rawKeyword of targetedScoutPayload) {
                const keyword = rawKeyword.trim().toLowerCase();
                if (!keyword || keyword === baseQuery) continue;

                // Risk mitigation interception (Constraint 4)
                if (containsAiPlasticLanguage(keyword)) {
                    blockedCount++;
                    continue;
                }

                // Constraint 3: Native Atomic Upsert via Postgres RPC (CRITICAL CLEAN REPLACE)
                const { error: rpcError } = await routeSupabase.rpc('increment_seo_keyword', {
                    target_keyword: keyword,
                });

                if (!rpcError) {
                    insertedCount++;
                } else {
                    console.error(`[RPC Error] Failed to upsert keyword "${keyword}":`, rpcError);
                }
            }
        } catch (queryError) {
            console.error(`[Engine Individual Query Crash] for "${baseQuery}":`, queryError);
        }
    }

    return { insertedCount, blockedCount };
}
