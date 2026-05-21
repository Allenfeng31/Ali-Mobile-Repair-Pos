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

type KeywordOccurrenceResult = 'inserted' | 'existing';

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

export function isWithin15KmOfRingwood(keyword: string): boolean {
    const lower = keyword.toLowerCase();

    const interstateLocationNames = [
        'adelaide',
        'sydney',
        'brisbane',
        'perth',
        'geelong',
        'frankston',
        'australia',
    ];
    const interstateStateCodes = [
        'nsw',
        'qld',
        'sa',
        'wa',
    ];

    if (interstateLocationNames.some((city) => lower.includes(city))) return false;
    if (interstateStateCodes.some((state) => new RegExp(`\\b${state}\\b`).test(lower))) return false;

    const localSuburbs = [
        'ringwood',
        '3134',
        'mitcham',
        'croydon',
        'heathmont',
        'wantirna',
        'vermont',
        'nunawading',
        'donvale',
        'warrandyte',
        'blackburn',
        'box hill',
        'forest hill',
        'bayswater',
        'boronia',
        'chirnside',
        'lilydale',
        'doncaster',
        'near me',
        'local',
    ];

    return localSuburbs.some((suburb) => lower.includes(suburb));
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
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    const lastRunAt = data?.created_at || (data as { last_executed_at?: string } | null)?.last_executed_at;

    if (error || !data || !lastRunAt) {
        return { locked: false, statusCode: 200 };
    }

    const lastRunLog = new Date(lastRunAt).getTime();
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

async function loadGeneratedKeywordTexts(client: SupabaseClient) {
    const { data, error } = await client
        .from('pending_seo_campaigns')
        .select('keyword');

    if (error) {
        console.warn('[SEO Scout] Could not load generated campaign keywords for duplicate suppression:', error.message);
        return new Set<string>();
    }

    return new Set(
        ((data || []) as Array<{ keyword?: string | null }>)
            .map((row) => row.keyword?.trim().toLowerCase())
            .filter(Boolean) as string[]
    );
}

async function incrementExistingKeywordOccurrence(client: SupabaseClient, keyword: string) {
    const { data: existingKeyword, error: lookupError } = await client
        .from('seo_keywords')
        .select('id, search_weight')
        .eq('keyword', keyword)
        .maybeSingle<{ id: string; search_weight?: number | null }>();

    if (lookupError) {
        throw lookupError;
    }

    if (!existingKeyword) {
        return false;
    }

    const { error: updateError } = await client
        .from('seo_keywords')
        .update({
            search_weight: (existingKeyword.search_weight || 0) + 1,
            updated_at: new Date().toISOString(),
        })
        .eq('id', existingKeyword.id);

    if (updateError) {
        throw updateError;
    }

    return true;
}

async function persistKeywordOccurrence(client: SupabaseClient, keyword: string, source: string): Promise<KeywordOccurrenceResult> {
    const incrementedExisting = await incrementExistingKeywordOccurrence(client, keyword);

    if (incrementedExisting) {
        return 'existing';
    }

    const { error: insertError } = await client
        .from('seo_keywords')
        .insert({
            keyword,
            source,
            search_weight: 1,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

    if (insertError) {
        throw insertError;
    }

    return 'inserted';
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
    const generatedKeywordTexts = await loadGeneratedKeywordTexts(routeSupabase as SupabaseClient);
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

                if (!isWithin15KmOfRingwood(keyword)) continue;

                // Risk mitigation interception (Constraint 4)
                if (containsAiPlasticLanguage(keyword)) {
                    blockedCount++;
                    continue;
                }

                if (generatedKeywordTexts.has(keyword)) {
                    await incrementExistingKeywordOccurrence(routeSupabase as SupabaseClient, keyword);
                    continue;
                }

                const occurrenceResult = await persistKeywordOccurrence(
                    routeSupabase as SupabaseClient,
                    keyword,
                    'Google Suggest Scraper'
                );

                if (occurrenceResult === 'inserted') {
                    insertedCount++;
                }
            }
        } catch (queryError) {
            console.error(`[Engine Individual Query Crash] for "${baseQuery}":`, queryError);
        }
    }

    return { insertedCount, blockedCount };
}
