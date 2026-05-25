import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { format, startOfWeek, subYears } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

const MELBOURNE_TZ = "Australia/Melbourne";
const MIN_REPAIR_VIEWS = 5;

type DbRecord = Record<string, any>;

export type ReportWindow = {
  label: string;
  startUTC: string;
  endUTC: string;
};

export type RevenueSummary = {
  current: number;
  previous: number;
  lastYear: number;
  vsPreviousPct: number | null;
  vsLastYearPct: number | null;
};

export type RepairConversionItem = {
  name: string;
  category: DeviceCategory;
  views: number;
  bookings: number;
  rate: number;
};

type DeviceCategory = "Phones" | "Tablets" | "Computers" | "Watches";

export type WeeklyReportJson = {
  generatedAt: string;
  windows: {
    current: ReportWindow;
    previous: ReportWindow;
    lastYear: ReportWindow;
  };
  revenue: RevenueSummary;
  arrival: {
    bookingRequests: number;
    confirmed: number;
    arrived: number;
    arrivalRate: number;
  };
  repairConversions: Record<DeviceCategory, { top: RepairConversionItem[]; bottom: RepairConversionItem[] }>;
  suburbConversions: Array<{ suburb: string; views: number; homepageClicks: number; rate: number }>;
  seoKeywordVisits: {
    top: Array<{ keyword: string; visits: number }>;
    bottom: Array<{ keyword: string; visits: number }>;
  };
  aiRecommendations: string;
};

export type WeeklyReport = {
  periodStart: string;
  periodEnd: string;
  markdown: string;
  json: WeeklyReportJson;
  aiModel: string;
  stored?: boolean;
  storageError?: string;
};

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase service credentials for weekly report.");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function formatPct(value: number | null) {
  if (value === null || Number.isNaN(value)) return "n/a";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

function classifyDevice(name: string): DeviceCategory {
  const lower = name.toLowerCase();
  if (lower.includes("ipad") || lower.includes("tab") || lower.includes("tablet")) return "Tablets";
  if (lower.includes("mac") || lower.includes("pc") || lower.includes("laptop") || lower.includes("surface") || lower.includes("imac")) return "Computers";
  if (lower.includes("watch")) return "Watches";
  return "Phones";
}

function buildWindow(now = new Date()) {
  const melbourneNow = toZonedTime(now, MELBOURNE_TZ);
  const localStart = startOfWeek(melbourneNow, { weekStartsOn: 1 });
  const currentStart = fromZonedTime(localStart, MELBOURNE_TZ);
  const currentEnd = now;
  const durationMs = currentEnd.getTime() - currentStart.getTime();
  const previousEnd = new Date(currentStart.getTime());
  const previousStart = new Date(previousEnd.getTime() - durationMs);
  const lastYearStart = subYears(currentStart, 1);
  const lastYearEnd = new Date(lastYearStart.getTime() + durationMs);

  const toWindow = (label: string, start: Date, end: Date): ReportWindow => ({
    label,
    startUTC: start.toISOString(),
    endUTC: end.toISOString(),
  });

  return {
    current: toWindow("Current week", currentStart, currentEnd),
    previous: toWindow("Previous week", previousStart, previousEnd),
    lastYear: toWindow("Same period last year", lastYearStart, lastYearEnd),
  };
}

async function fetchOrders(supabase: SupabaseClient, window: ReportWindow) {
  const query = await supabase
    .from("orders")
    .select("id, timestamp, total, status")
    .gte("timestamp", window.startUTC)
    .lt("timestamp", window.endUTC);

  if (!query.error) return query.data || [];

  const fallback = await supabase
    .from("orders")
    .select("id, timestamp, total")
    .gte("timestamp", window.startUTC)
    .lt("timestamp", window.endUTC);

  if (fallback.error) throw fallback.error;
  return fallback.data || [];
}

async function fetchRefundedIds(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "ali_pos_refunded_orders")
    .maybeSingle();

  try {
    const parsed = JSON.parse(data?.value || "[]");
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set<string>();
  }
}

function sumRevenue(orders: DbRecord[], refundedIds: Set<string>) {
  return orders.reduce((total, order) => {
    if (String(order.status || "").toLowerCase() === "refunded") return total;
    if (refundedIds.has(String(order.id))) return total;
    return total + Number(order.total || 0);
  }, 0);
}

async function fetchAnalyticsEvents(supabase: SupabaseClient, window: ReportWindow) {
  const { data, error } = await supabase
    .from("analytics_events")
    .select("*")
    .gte("created_at", window.startUTC)
    .lt("created_at", window.endUTC);

  if (error) throw error;
  return data || [];
}

async function fetchAppointments(supabase: SupabaseClient, window: ReportWindow) {
  const { data, error } = await supabase
    .from("appointments")
    .select("id, status, datetime, created_at")
    .gte("datetime", window.startUTC)
    .lt("datetime", window.endUTC);

  if (error) {
    console.warn("[weekly-report] appointments query skipped:", error.message);
    return [];
  }
  return data || [];
}

function aggregateRepairConversions(events: DbRecord[]) {
  const map = new Map<string, RepairConversionItem>();

  for (const event of events) {
    const modelName = String(event.model_name || "").trim();
    const repairCategory = String(event.metadata?.repairCategory || "").trim();
    if (!modelName || !repairCategory) continue;

    const name = `${modelName} - ${repairCategory}`;
    const existing = map.get(name) || {
      name,
      category: classifyDevice(name),
      views: 0,
      bookings: 0,
      rate: 0,
    };

    if (event.event_name === "repair_view") existing.views += 1;
    if (event.event_name === "book_repair") existing.bookings += 1;
    map.set(name, existing);
  }

  const items = Array.from(map.values())
    .filter((item) => item.views >= MIN_REPAIR_VIEWS)
    .map((item) => ({
      ...item,
      rate: item.views > 0 ? (item.bookings / item.views) * 100 : 0,
    }));

  const empty = { top: [], bottom: [] } as { top: RepairConversionItem[]; bottom: RepairConversionItem[] };
  const result: Record<DeviceCategory, { top: RepairConversionItem[]; bottom: RepairConversionItem[] }> = {
    Phones: { ...empty },
    Tablets: { ...empty },
    Computers: { ...empty },
    Watches: { ...empty },
  };

  (Object.keys(result) as DeviceCategory[]).forEach((category) => {
    const categoryItems = items.filter((item) => item.category === category);
    result[category] = {
      top: [...categoryItems].sort((a, b) => b.rate - a.rate || b.views - a.views).slice(0, 10),
      bottom: [...categoryItems].sort((a, b) => a.rate - b.rate || b.views - a.views).slice(0, 10),
    };
  });

  return result;
}

function aggregateArrival(appointments: DbRecord[]) {
  const normalized = appointments.map((appointment) => String(appointment.status || "").toLowerCase().trim());
  const bookingRequests = normalized.filter((status) => status !== "declined").length;
  const confirmed = normalized.filter((status) => status === "confirmed" || status === "arrived").length;
  const arrived = normalized.filter((status) => status === "arrived").length;

  return {
    bookingRequests,
    confirmed,
    arrived,
    arrivalRate: confirmed > 0 ? (arrived / confirmed) * 100 : 0,
  };
}

function aggregateSuburbs(events: DbRecord[]) {
  const map = new Map<string, { suburb: string; views: number; homepageClicks: number; rate: number }>();

  for (const event of events) {
    if (event.event_name !== "suburb_page_view" && event.event_name !== "suburb_home_click") continue;
    const suburb = String(event.metadata?.suburb || event.model_name || "Unknown").trim();
    if (!suburb) continue;

    const row = map.get(suburb) || { suburb, views: 0, homepageClicks: 0, rate: 0 };
    if (event.event_name === "suburb_page_view") row.views += 1;
    if (event.event_name === "suburb_home_click") row.homepageClicks += 1;
    map.set(suburb, row);
  }

  return Array.from(map.values())
    .map((row) => ({ ...row, rate: row.views > 0 ? (row.homepageClicks / row.views) * 100 : 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20);
}

function aggregateKeywordVisits(events: DbRecord[]) {
  const map = new Map<string, number>();

  for (const event of events) {
    if (event.event_name !== "seo_keyword_view") continue;
    const keyword = String(event.metadata?.keyword || event.model_name || "Unknown keyword").trim();
    if (!keyword) continue;
    map.set(keyword, (map.get(keyword) || 0) + 1);
  }

  const all = Array.from(map.entries())
    .map(([keyword, visits]) => ({ keyword, visits }))
    .sort((a, b) => b.visits - a.visits || a.keyword.localeCompare(b.keyword));

  return {
    top: all.slice(0, 10),
    bottom: [...all].sort((a, b) => a.visits - b.visits || a.keyword.localeCompare(b.keyword)).slice(0, 10),
  };
}

function buildAnalystFallback(json: Omit<WeeklyReportJson, "aiRecommendations">) {
  const suggestions: string[] = [];
  const lowRepair = Object.values(json.repairConversions)
    .flatMap((category) => category.bottom)
    .find((item) => item.views >= MIN_REPAIR_VIEWS && item.rate < 2);

  if (lowRepair) {
    suggestions.push(`- Review ${lowRepair.name}: it has ${lowRepair.views} views but only ${lowRepair.bookings} bookings. Check price clarity, tier copy, and the first CTA.`);
  }

  const topKeyword = json.seoKeywordVisits.top[0];
  if (topKeyword) {
    suggestions.push(`- Double down on "${topKeyword.keyword}" because it is currently the strongest SEO entry page with ${topKeyword.visits} visits.`);
  }

  if (json.arrival.confirmed > 0 && json.arrival.arrivalRate < 75) {
    suggestions.push(`- Arrival rate is ${json.arrival.arrivalRate.toFixed(1)}%. Confirm SMS timing and reminder coverage before the next busy day.`);
  }

  if (suggestions.length === 0) {
    suggestions.push("- Keep collecting data this week. The current sample is still small, so avoid large price or page-layout decisions until the top pages cross the minimum view threshold.");
  }

  return suggestions.join("\n");
}

async function callGeminiWeeklyAnalyst(json: Omit<WeeklyReportJson, "aiRecommendations">) {
  const apiKey = process.env.WEEKLY_REPORT_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY;
  const model = process.env.WEEKLY_REPORT_GEMINI_MODEL || process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

  if (!apiKey) {
    return { text: buildAnalystFallback(json), model: "rules-fallback" };
  }

  const prompt = [
    "You are an isolated weekly operations analyst for Ali Mobile & Repair in Ringwood.",
    "Do not write SEO articles. Do not use SEO writer prompts. Do not create campaigns.",
    "News aggregation skill context has been provided separately from the SEO writer: follow its discipline of using only supplied source data, never inventing external news, separating signals by source and time, and keeping claims traceable.",
    "No live news JSON is supplied in this run, so do not mention market news or competitor news. Use the business dataset only.",
    "Analyze only the numeric weekly dataset below and return constructive, practical recommendations in concise Markdown.",
    "Focus on revenue movement, repair-page demand, weak conversion repair items, appointment arrival leakage, suburb page movement, and SEO keyword landing-page visit demand.",
    "Keep advice specific and commercially useful. Mention when sample sizes are too small.",
    "",
    JSON.stringify(json, null, 2),
  ].join("\n");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 900,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini analyst responded ${response.status}`);
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim();

    return { text: text || buildAnalystFallback(json), model };
  } catch (error) {
    console.error("[weekly-report] Gemini analyst failed:", error);
    return { text: buildAnalystFallback(json), model: `${model} (fallback)` };
  }
}

function markdownList(items: RepairConversionItem[]) {
  if (items.length === 0) return "- Not enough data yet.";
  return items
    .map((item) => `- ${item.name}: ${item.rate.toFixed(1)}% (${item.bookings}/${item.views})`)
    .join("\n");
}

function buildMarkdown(json: WeeklyReportJson) {
  const lines = [
    `# Ali Mobile Weekly Report`,
    "",
    `Period: ${format(new Date(json.windows.current.startUTC), "dd MMM yyyy HH:mm")} - ${format(new Date(json.windows.current.endUTC), "dd MMM yyyy HH:mm")} (Melbourne)`,
    "",
    "## Revenue",
    "",
    `- Current week: ${formatMoney(json.revenue.current)}`,
    `- Previous week comparison: ${formatPct(json.revenue.vsPreviousPct)} (${formatMoney(json.revenue.previous)})`,
    `- Same period last year: ${formatPct(json.revenue.vsLastYearPct)} (${formatMoney(json.revenue.lastYear)})`,
    "",
    "## Appointment Arrival",
    "",
    `- Booking requests: ${json.arrival.bookingRequests}`,
    `- Confirmed appointments: ${json.arrival.confirmed}`,
    `- Arrived: ${json.arrival.arrived}`,
    `- Arrival rate: ${json.arrival.arrivalRate.toFixed(1)}%`,
    "",
    "## Repair Page Conversion",
    "",
  ];

  (Object.keys(json.repairConversions) as DeviceCategory[]).forEach((category) => {
    lines.push(`### ${category} - Top 10`, "", markdownList(json.repairConversions[category].top), "");
    lines.push(`### ${category} - Bottom 10`, "", markdownList(json.repairConversions[category].bottom), "");
  });

  lines.push("## Suburb Page to Homepage", "");
  if (json.suburbConversions.length === 0) {
    lines.push("- Not enough suburb page data yet.", "");
  } else {
    json.suburbConversions.slice(0, 10).forEach((suburb) => {
      lines.push(`- ${suburb.suburb}: ${suburb.rate.toFixed(1)}% (${suburb.homepageClicks}/${suburb.views})`);
    });
    lines.push("");
  }

  lines.push("## SEO Keyword Landing Page Visits", "", "### Top 10", "");
  lines.push(json.seoKeywordVisits.top.length ? json.seoKeywordVisits.top.map((item) => `- ${item.keyword}: ${item.visits} visits`).join("\n") : "- Not enough keyword visit data yet.");
  lines.push("", "### Bottom 10", "");
  lines.push(json.seoKeywordVisits.bottom.length ? json.seoKeywordVisits.bottom.map((item) => `- ${item.keyword}: ${item.visits} visits`).join("\n") : "- Not enough keyword visit data yet.");
  lines.push("", "## AI Analyst Recommendations", "", json.aiRecommendations, "");

  return lines.join("\n");
}

export async function generateWeeklyReport(now = new Date()): Promise<WeeklyReport> {
  const supabase = getServiceClient();
  const windows = buildWindow(now);
  const refundedIds = await fetchRefundedIds(supabase);

  const [currentOrders, previousOrders, lastYearOrders, currentEvents, appointments] = await Promise.all([
    fetchOrders(supabase, windows.current),
    fetchOrders(supabase, windows.previous),
    fetchOrders(supabase, windows.lastYear),
    fetchAnalyticsEvents(supabase, windows.current),
    fetchAppointments(supabase, windows.current),
  ]);

  const revenue = {
    current: sumRevenue(currentOrders, refundedIds),
    previous: sumRevenue(previousOrders, refundedIds),
    lastYear: sumRevenue(lastYearOrders, refundedIds),
    vsPreviousPct: null as number | null,
    vsLastYearPct: null as number | null,
  };
  revenue.vsPreviousPct = pctChange(revenue.current, revenue.previous);
  revenue.vsLastYearPct = pctChange(revenue.current, revenue.lastYear);

  const baseJson = {
    generatedAt: new Date().toISOString(),
    windows,
    revenue,
    arrival: aggregateArrival(appointments),
    repairConversions: aggregateRepairConversions(currentEvents),
    suburbConversions: aggregateSuburbs(currentEvents),
    seoKeywordVisits: aggregateKeywordVisits(currentEvents),
  };

  const analyst = await callGeminiWeeklyAnalyst(baseJson);
  const json: WeeklyReportJson = {
    ...baseJson,
    aiRecommendations: analyst.text,
  };

  return {
    periodStart: windows.current.startUTC,
    periodEnd: windows.current.endUTC,
    markdown: buildMarkdown(json),
    json,
    aiModel: analyst.model,
  };
}

export async function storeWeeklyReport(report: WeeklyReport) {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("weekly_reports")
    .upsert(
      {
        period_start: report.periodStart,
        period_end: report.periodEnd,
        generated_at: report.json.generatedAt,
        report_markdown: report.markdown,
        report_json: report.json,
        ai_model: report.aiModel,
      },
      { onConflict: "period_start,period_end" }
    );

  if (error) throw error;
}

export async function getRecentWeeklyReports(limit = 6) {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("weekly_reports")
    .select("id, period_start, period_end, generated_at, report_markdown, report_json, ai_model")
    .order("period_end", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[weekly-report] Could not load stored reports:", error.message);
    return [];
  }

  return data || [];
}

export function shouldRunSundayNineMelbourne(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: MELBOURNE_TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;

  return weekday === "Sun" && hour === "09" && Number(minute) <= 10;
}
