export const LEGACY_LOGIC_BOARD_REPAIR_SLUG = 'logic-board';
export const CANONICAL_LOGIC_BOARD_REPAIR_SLUG = 'logic-board-repair';

type LogicBoardRouteParams = {
  category: string;
  brand: string;
  model: string;
  requestedRepairSlug: string;
  modelExists: boolean;
  canonicalLogicBoardServiceExists: boolean;
};

export type LogicBoardRouteDecision =
  | { type: 'continue' }
  | { type: 'not-found'; status: 404 }
  | { type: 'redirect'; status: 308; destination: string };

export function resolveLegacyLogicBoardRoute({
  category,
  brand,
  model,
  requestedRepairSlug,
  modelExists,
  canonicalLogicBoardServiceExists,
}: LogicBoardRouteParams): LogicBoardRouteDecision {
  if (requestedRepairSlug !== LEGACY_LOGIC_BOARD_REPAIR_SLUG) {
    return { type: 'continue' };
  }

  if (!modelExists || !canonicalLogicBoardServiceExists) {
    return { type: 'not-found', status: 404 };
  }

  return {
    type: 'redirect',
    status: 308,
    destination: `/repairs/${category}/${brand}/${model}/${CANONICAL_LOGIC_BOARD_REPAIR_SLUG}`,
  };
}
