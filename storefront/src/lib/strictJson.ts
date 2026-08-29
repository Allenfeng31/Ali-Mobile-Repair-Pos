/**
 * Parses JSON after a small recursive-descent structural pass rejects duplicate
 * object keys. JSON.parse alone silently retains the last duplicate key.
 */
function assertNoDuplicateJsonKeys(input: string) {
  let index = 0;

  const whitespace = () => {
    while (/\s/.test(input[index] ?? '')) index += 1;
  };
  const expect = (character: string) => {
    whitespace();
    if (input[index] !== character) throw new Error('invalid JSON');
    index += 1;
  };
  const string = (): string => {
    whitespace();
    if (input[index] !== '"') throw new Error('invalid JSON');
    const start = index;
    index += 1;
    while (index < input.length) {
      const character = input[index++];
      if (character === '"') return JSON.parse(input.slice(start, index));
      if (character === '\\') {
        if (index >= input.length) throw new Error('invalid JSON');
        index += 1;
      } else if (character.charCodeAt(0) < 0x20) {
        throw new Error('invalid JSON');
      }
    }
    throw new Error('invalid JSON');
  };
  const primitive = () => {
    whitespace();
    const start = index;
    while (index < input.length && !/[\s,\]}]/.test(input[index])) index += 1;
    if (start === index) throw new Error('invalid JSON');
  };
  const value = (): void => {
    whitespace();
    if (input[index] === '{') {
      index += 1;
      whitespace();
      const keys = new Set<string>();
      if (input[index] === '}') { index += 1; return; }
      while (true) {
        const key = string();
        if (keys.has(key)) throw new Error('duplicate JSON key');
        keys.add(key);
        expect(':');
        value();
        whitespace();
        if (input[index] === '}') { index += 1; return; }
        expect(',');
      }
    }
    if (input[index] === '[') {
      index += 1;
      whitespace();
      if (input[index] === ']') { index += 1; return; }
      while (true) {
        value();
        whitespace();
        if (input[index] === ']') { index += 1; return; }
        expect(',');
      }
    }
    if (input[index] === '"') { string(); return; }
    primitive();
  };

  value();
  whitespace();
  if (index !== input.length) throw new Error('invalid JSON');
}

export function parseStrictJson(input: string): unknown {
  assertNoDuplicateJsonKeys(input);
  return JSON.parse(input);
}
