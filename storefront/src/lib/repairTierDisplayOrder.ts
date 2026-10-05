const SCREEN_TIER_PRIORITY = new Map([
  ['budget', 0],
  ['standard', 1],
  ['premium', 2],
  ['genuine', 3],
]);

export function orderRepairVariantsForDisplay<T extends { quality_grade: string }>(
  repairName: string,
  variants: readonly T[],
): T[] {
  if (repairName.toLowerCase().trim() !== 'screen replacement') return [...variants];

  return variants
    .map((variant, sourceIndex) => ({
      variant,
      sourceIndex,
      priority: SCREEN_TIER_PRIORITY.get(variant.quality_grade.toLowerCase().trim()),
    }))
    .sort((left, right) => {
      if (left.priority === undefined && right.priority === undefined) return left.sourceIndex - right.sourceIndex;
      if (left.priority === undefined) return 1;
      if (right.priority === undefined) return -1;
      return left.priority - right.priority || left.sourceIndex - right.sourceIndex;
    })
    .map(({ variant }) => variant);
}
