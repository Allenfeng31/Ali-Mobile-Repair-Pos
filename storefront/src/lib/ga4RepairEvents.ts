import { sendGAEvent } from "@next/third-parties/google";

export const GA4_REPAIR_EVENT_NAMES = [
  "repair_cta_click",
  "repair_price_view",
  "repair_quote_view",
  "contact_submit_success",
] as const;

type Ga4RepairEventName = (typeof GA4_REPAIR_EVENT_NAMES)[number];
export type RepairCtaAction = "book_repair" | "call" | "select_model" | "get_directions";
type ContactAction = "message";
type RepairAction = RepairCtaAction | ContactAction;
type RepairPageType = "home" | "repairs_hub" | "category_hub" | "brand_hub" | "model_hub" | "repair_detail" | "booking" | "other";
type RepairPlacement = "header" | "footer" | "hero" | "pricing" | "content" | "chat";
type PricingState = "numeric" | "quote";
type PriceSource = "published_pos";

const REPAIR_CATEGORIES = new Set(["phone", "tablet", "laptop", "watch"]);
const PAGE_TYPES = new Set<RepairPageType>(["home", "repairs_hub", "category_hub", "brand_hub", "model_hub", "repair_detail", "booking", "other"]);
const PLACEMENTS = new Set<RepairPlacement>(["header", "footer", "hero", "pricing", "content", "chat"]);
const ACTIONS = new Set<RepairAction>(["book_repair", "call", "select_model", "get_directions", "message"]);
const PRICING_STATES = new Set<PricingState>(["numeric", "quote"]);

export type RepairPageContext = {
  pageType: RepairPageType;
  repairBrand?: string;
  repairModel?: string;
  repairType?: string;
};

type RepairEventContext = RepairPageContext & {
  action?: RepairAction;
  placement?: RepairPlacement;
  pricingState?: PricingState;
  priceSource?: PriceSource;
};

function normalizeToken(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized) && normalized.length <= 100
    ? normalized
    : undefined;
}

function allowedPageType(value: unknown): RepairPageType {
  return typeof value === "string" && PAGE_TYPES.has(value as RepairPageType)
    ? value as RepairPageType
    : "other";
}

function toGa4Params(context: RepairEventContext) {
  const params: Record<string, string> = { page_type: allowedPageType(context.pageType) };
  const repairBrand = normalizeToken(context.repairBrand);
  const repairModel = normalizeToken(context.repairModel);
  const repairType = normalizeToken(context.repairType);

  if (repairBrand) params.repair_brand = repairBrand;
  if (repairModel) params.repair_model = repairModel;
  if (repairType) params.repair_type = repairType;
  if (context.action && ACTIONS.has(context.action)) params.action = context.action;
  if (context.placement && PLACEMENTS.has(context.placement)) params.placement = context.placement;
  if (context.pricingState && PRICING_STATES.has(context.pricingState)) params.pricing_state = context.pricingState;
  if (context.priceSource === "published_pos") params.price_source = context.priceSource;

  return params;
}

function emit(eventName: Ga4RepairEventName, context: RepairEventContext) {
  sendGAEvent("event", eventName, toGa4Params(context));
}

export function getRepairPageContext(pathname: string): RepairPageContext {
  const segments = pathname.split("?")[0].split("#")[0].split("/").filter(Boolean);
  if (segments.length === 0) return { pageType: "home" };
  if (segments[0] === "book-repair" && segments.length === 1) return { pageType: "booking" };
  if (segments[0] !== "repairs") return { pageType: "other" };
  if (segments.length === 1) return { pageType: "repairs_hub" };

  const category = normalizeToken(segments[1]);
  if (!category || !REPAIR_CATEGORIES.has(category)) return { pageType: "other" };
  if (segments.length === 2) return { pageType: "category_hub" };

  const repairBrand = normalizeToken(segments[2]);
  if (!repairBrand) return { pageType: "other" };
  if (segments.length === 3) return { pageType: "brand_hub", repairBrand };

  const repairModel = normalizeToken(segments[3]);
  if (!repairModel) return { pageType: "other" };
  if (segments.length === 4) return { pageType: "model_hub", repairBrand, repairModel };

  const repairType = normalizeToken(segments[4]);
  return repairType
    ? { pageType: "repair_detail", repairBrand, repairModel, repairType }
    : { pageType: "other" };
}

export function trackRepairCtaClick(context: RepairPageContext & {
  action: RepairCtaAction;
  placement?: RepairPlacement;
}) {
  emit("repair_cta_click", context);
}

export function trackRepairPricingVisibility(
  eventName: "repair_price_view" | "repair_quote_view",
  context: RepairPageContext & {
    placement: RepairPlacement;
    pricingState: PricingState;
    priceSource?: PriceSource;
  },
) {
  emit(eventName, context);
}

export function trackContactSubmitSuccess(context: RepairPageContext & { placement: "chat" }) {
  emit("contact_submit_success", { ...context, action: "message" });
}
