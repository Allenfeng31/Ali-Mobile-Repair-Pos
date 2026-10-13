/**
 * Resolves the indefinite article ('a' or 'an') for a device model name or noun phrase.
 * Words starting with vowel sounds ('iPhone', 'iPad', 'Apple Watch', 'Asus', 'A77') use 'an'.
 * Words starting with consonant sounds ('Find X3 Pro', 'Galaxy S24', 'Pixel 8', 'OnePlus') use 'a'.
 */
export function getIndefiniteArticle(phrase: string): 'a' | 'an' {
  const trimmed = phrase.trim();
  if (!trimmed) {
    return 'a';
  }
  // 'One'/'Once'/'OnePlus' has an initial /w/ consonant sound (e.g. 'a OnePlus')
  if (/^(?:one|once)/i.test(trimmed)) {
    return 'a';
  }
  return /^[aeiou]/i.test(trimmed) ? 'an' : 'a';
}
