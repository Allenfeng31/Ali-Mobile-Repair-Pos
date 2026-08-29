/** Locale- and ICU-independent order for persisted integrity contracts. */
export function compareDeterministicStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
