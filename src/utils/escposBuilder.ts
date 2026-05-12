/**
 * ESC/POS Command Builder for Thermal Receipt Printers
 * 
 * Lightweight, browser-native utility. Zero dependencies.
 * Builds raw byte arrays (Uint8Array) for direct USB transfer.
 * Supports ASCII + Chinese (CJK) via GB18030 encoding.
 * 
 * Target: SAM4S ELLIX 30IIs (80mm / 42-char line width, Font A)
 * 
 * ESC/POS Reference:
 *   ESC @       = 0x1B 0x40  Initialize printer
 *   ESC a n     = 0x1B 0x61  Alignment (0=left, 1=center, 2=right)
 *   ESC E n     = 0x1B 0x45  Bold on/off
 *   GS ! n      = 0x1D 0x21  Character size (width × height multiplier)
 *   GS V m      = 0x1D 0x56  Paper cut (0=full, 1=partial)
 *   FS &        = 0x1C 0x26  Enter Chinese character mode
 *   FS .        = 0x1C 0x2E  Exit Chinese character mode
 *   LF          = 0x0A       Line feed
 */

const ESC = 0x1B;
const FS  = 0x1C;
const GS  = 0x1D;
const LF  = 0x0A;

/**
 * Maximum columns per line for SAM4S ELLIX 30IIs (Font A).
 * CJK characters consume 2 columns each, ASCII consumes 1.
 */
export const MAX_CHARS = 42;

const utf8Encoder = new TextEncoder();

// ── GB18030 Encoding Support ─────────────────────────────────

/**
 * Lazy-initialized reverse lookup: Unicode codepoint → GB18030 byte pair.
 * Built at runtime from TextDecoder('gb18030') to avoid bundling a 200KB table.
 */
let _gb18030Map: Map<number, number[]> | null = null;

function getGB18030Map(): Map<number, number[]> {
  if (_gb18030Map) return _gb18030Map;

  const map = new Map<number, number[]>();
  const decoder = new TextDecoder('gb18030');

  // Iterate all valid GBK 2-byte sequences (covers CJK Unified Ideographs)
  // First byte: 0x81-0xFE, Second byte: 0x40-0x7E and 0x80-0xFE
  for (let b1 = 0x81; b1 <= 0xFE; b1++) {
    for (let b2 = 0x40; b2 <= 0xFE; b2++) {
      if (b2 === 0x7F) continue; // 0x7F is not a valid second byte
      const bytes = new Uint8Array([b1, b2]);
      const char = decoder.decode(bytes);
      if (char.length === 1 && char.charCodeAt(0) !== 0xFFFD) {
        map.set(char.charCodeAt(0), [b1, b2]);
      }
    }
  }

  _gb18030Map = map;
  return map;
}

/**
 * Check if a character is in the CJK double-width range.
 * These characters occupy 2 columns on thermal printers.
 */
function isCJK(code: number): boolean {
  return (
    (code >= 0x2E80 && code <= 0x9FFF) ||  // CJK Radicals, Kangxi, Ideographs
    (code >= 0xF900 && code <= 0xFAFF) ||  // CJK Compatibility Ideographs
    (code >= 0xFE30 && code <= 0xFE4F) ||  // CJK Compatibility Forms
    (code >= 0xFF00 && code <= 0xFFEF) ||  // Fullwidth Forms
    (code >= 0x3000 && code <= 0x303F) ||  // CJK Symbols and Punctuation
    (code >= 0x3040 && code <= 0x309F) ||  // Hiragana
    (code >= 0x30A0 && code <= 0x30FF) ||  // Katakana
    (code >= 0xAC00 && code <= 0xD7AF)     // Hangul
  );
}

/**
 * Check if a string contains any non-ASCII characters.
 */
function hasNonASCII(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 0x7E) return true;
  }
  return false;
}

/**
 * Calculate the print width of a string in columns.
 * ASCII = 1 column, CJK = 2 columns.
 */
export function printWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    const code = char.codePointAt(0) || 0;
    width += isCJK(code) ? 2 : 1;
  }
  return width;
}

/**
 * Encode a string to GB18030 bytes for the printer.
 * ASCII bytes pass through directly; CJK characters are looked up
 * in the reverse GB18030 table. Unmappable chars become '?'.
 */
function encodeGB18030(text: string): Uint8Array {
  const map = getGB18030Map();
  const result: number[] = [];

  for (const char of text) {
    const code = char.codePointAt(0) || 0;
    if (code < 0x80) {
      result.push(code);
    } else {
      const bytes = map.get(code);
      if (bytes) {
        result.push(...bytes);
      } else {
        result.push(0x3F); // '?' for unmapped characters
      }
    }
  }

  return new Uint8Array(result);
}

/**
 * Encode text for the printer. If it contains CJK, wraps with
 * FS & (enable Chinese mode) and FS . (disable Chinese mode)
 * and encodes as GB18030. Otherwise encodes as ASCII/UTF-8.
 */
function encodeForPrinter(text: string): Uint8Array {
  if (!hasNonASCII(text)) {
    // Pure ASCII — encode directly
    return utf8Encoder.encode(text);
  }

  // Mixed or CJK text — wrap with Chinese mode commands
  const encoded = encodeGB18030(text);
  const result = new Uint8Array(2 + encoded.length + 2);
  result.set([FS, 0x26], 0);          // FS & — enable Chinese mode
  result.set(encoded, 2);             // GB18030 encoded text
  result.set([FS, 0x2E], 2 + encoded.length); // FS . — disable Chinese mode
  return result;
}

/**
 * Truncate a string to fit within a target print-width (column count).
 * Appends ".." if truncation occurs. Accounts for CJK double-width.
 */
function truncateToWidth(text: string, maxWidth: number): string {
  let width = 0;
  let result = '';
  const suffixWidth = 2; // ".." is 2 columns

  for (const char of text) {
    const code = char.codePointAt(0) || 0;
    const charWidth = isCJK(code) ? 2 : 1;

    if (width + charWidth > maxWidth - suffixWidth) {
      return result + '..';
    }
    result += char;
    width += charWidth;
  }

  // No truncation needed
  return text;
}

/**
 * Pad a string with spaces on the right to reach a target print-width.
 */
function padEndWidth(text: string, targetWidth: number): string {
  const currentWidth = printWidth(text);
  const needed = targetWidth - currentWidth;
  if (needed <= 0) return text;
  return text + ' '.repeat(needed);
}

/**
 * Pad a string with spaces on the left to reach a target print-width.
 */
function padStartWidth(text: string, targetWidth: number): string {
  const currentWidth = printWidth(text);
  const needed = targetWidth - currentWidth;
  if (needed <= 0) return text;
  return ' '.repeat(needed) + text;
}

// ── Builder Class ────────────────────────────────────────────

export class EscPosBuilder {
  private chunks: Uint8Array[] = [];

  // ── Printer Control ──────────────────────────────────────

  /** Initialize printer (reset all settings) */
  init(): this {
    this.chunks.push(new Uint8Array([ESC, 0x40]));
    return this;
  }

  /** Feed n blank lines */
  feed(lines = 1): this {
    for (let i = 0; i < lines; i++) {
      this.chunks.push(new Uint8Array([LF]));
    }
    return this;
  }

  /** Full paper cut */
  fullCut(): this {
    this.chunks.push(new Uint8Array([GS, 0x56, 0x00]));
    return this;
  }

  /** Partial paper cut */
  partialCut(): this {
    this.chunks.push(new Uint8Array([GS, 0x56, 0x01]));
    return this;
  }

  // ── Chinese Mode ─────────────────────────────────────────

  /** Enable Chinese character mode (FS &) */
  enableChinese(): this {
    this.chunks.push(new Uint8Array([FS, 0x26]));
    return this;
  }

  /** Disable Chinese character mode (FS .) */
  disableChinese(): this {
    this.chunks.push(new Uint8Array([FS, 0x2E]));
    return this;
  }

  // ── Text Formatting ──────────────────────────────────────

  /** Set text alignment: 'left' | 'center' | 'right' */
  align(alignment: 'left' | 'center' | 'right'): this {
    const n = alignment === 'left' ? 0 : alignment === 'center' ? 1 : 2;
    this.chunks.push(new Uint8Array([ESC, 0x61, n]));
    return this;
  }

  /** Enable bold text */
  boldOn(): this {
    this.chunks.push(new Uint8Array([ESC, 0x45, 0x01]));
    return this;
  }

  /** Disable bold text */
  boldOff(): this {
    this.chunks.push(new Uint8Array([ESC, 0x45, 0x00]));
    return this;
  }

  /** Set character size multiplier (1-8 for width and height) */
  size(width: number = 1, height: number = 1): this {
    const w = Math.min(Math.max(width, 1), 8) - 1;
    const h = Math.min(Math.max(height, 1), 8) - 1;
    this.chunks.push(new Uint8Array([GS, 0x21, (w << 4) | h]));
    return this;
  }

  /** Reset to normal size */
  normalSize(): this {
    return this.size(1, 1);
  }

  /** Set double-width double-height */
  doubleSize(): this {
    return this.size(2, 2);
  }

  // ── Text Output ──────────────────────────────────────────

  /** Print a raw text string (no line feed appended) */
  raw(text: string): this {
    this.chunks.push(encodeForPrinter(text));
    return this;
  }

  /**
   * Print text followed by a line feed.
   * Automatically enables Chinese mode for CJK characters
   * and encodes as GB18030.
   */
  text(text: string): this {
    this.chunks.push(encodeForPrinter(text));
    this.chunks.push(new Uint8Array([LF]));
    return this;
  }

  /** Print an empty line */
  blank(): this {
    this.chunks.push(new Uint8Array([LF]));
    return this;
  }

  // ── Layout Helpers ───────────────────────────────────────

  /** Print a dashed separator line */
  separator(char = '-', width = MAX_CHARS): this {
    this.chunks.push(utf8Encoder.encode(char.repeat(width)));
    this.chunks.push(new Uint8Array([LF]));
    return this;
  }

  /** Print a double-line separator */
  doubleSeparator(width = MAX_CHARS): this {
    this.chunks.push(utf8Encoder.encode('='.repeat(width)));
    this.chunks.push(new Uint8Array([LF]));
    return this;
  }

  /**
   * Print two strings on the same line: left-aligned and right-aligned.
   * If combined print-width exceeds MAX_CHARS, truncates leftText with "..".
   * Correctly accounts for CJK double-width characters.
   */
  leftRight(left: string, right: string, width = MAX_CHARS): this {
    const rightW = printWidth(right);
    const minGap = 1;
    const maxLeftW = width - rightW - minGap;

    let l = left;
    if (printWidth(l) > maxLeftW) {
      l = truncateToWidth(l, maxLeftW);
    }

    const leftW = printWidth(l);
    const gap = width - leftW - rightW;
    const line = l + ' '.repeat(Math.max(gap, 1)) + right;
    return this.text(line);
  }

  /**
   * Print three columns on the same line with strict boundaries.
   * Correctly accounts for CJK double-width in the name column.
   * 
   * Layout for 42 CPL:
   *   Col 1 (Item Name): 22 cols max, left-aligned, truncated with ".."
   *   Col 2 (Qty):        8 cols, right-aligned
   *   Col 3 (Price):     12 cols, right-aligned
   */
  threeColumns(left: string, center: string, right: string, width = MAX_CHARS): this {
    const COL_NAME  = 22;
    const COL_QTY   = 8;
    const COL_PRICE = 12;

    // Col 1: left-aligned, truncate if print-width exceeds limit
    let l: string;
    if (printWidth(left) > COL_NAME) {
      l = truncateToWidth(left, COL_NAME);
      l = padEndWidth(l, COL_NAME);
    } else {
      l = padEndWidth(left, COL_NAME);
    }

    // Col 2: right-aligned within its slot
    const c = padStartWidth(center, COL_QTY);

    // Col 3: right-aligned within its slot
    const r = padStartWidth(right, COL_PRICE);

    return this.text(l + c + r);
  }

  /**
   * Print centered text with optional padding character.
   * Accounts for CJK double-width.
   */
  centered(text: string, width = MAX_CHARS, padChar = ' '): this {
    const textW = printWidth(text);
    const totalPad = width - textW;
    if (totalPad <= 0) return this.text(text);
    const leftPad = Math.floor(totalPad / 2);
    const rightPad = totalPad - leftPad;
    return this.text(padChar.repeat(leftPad) + text + padChar.repeat(rightPad));
  }

  /**
   * Word-wrap long text to fit within MAX_CHARS.
   * Accounts for CJK double-width characters.
   * CJK characters can be broken at any point (no word boundaries).
   */
  wrapText(text: string, width = MAX_CHARS): this {
    let line = '';
    let lineW = 0;

    for (const char of text) {
      const code = char.codePointAt(0) || 0;

      // Handle explicit spaces as word separators for ASCII
      if (char === ' ') {
        if (lineW + 1 <= width) {
          line += ' ';
          lineW += 1;
        } else {
          this.text(line);
          line = '';
          lineW = 0;
        }
        continue;
      }

      const charW = isCJK(code) ? 2 : 1;

      if (lineW + charW > width) {
        this.text(line);
        line = char;
        lineW = charW;
      } else {
        line += char;
        lineW += charW;
      }
    }

    if (line.length > 0) {
      this.text(line);
    }
    return this;
  }

  // ── QR Code (native ESC/POS via GS ( k ) ─────────────────

  /**
   * Print a native QR code using the printer's hardware renderer.
   * Uses the standard ESC/POS GS ( k command set (5-step sequence).
   * 
   * @param data - The string to encode (URL, ID, etc.)
   * @param size - Module size in dots (1-16, default 6)
   * @param errorCorrection - Error correction level:
   *   48 = L (7%), 49 = M (15%), 50 = Q (25%), 51 = H (30%)
   */
  qrCode(data: string, size = 6, errorCorrection = 48): this {
    const hdr = [0x1D, 0x28, 0x6B];

    // Step 1: Select QR Code model (Model 2)
    this.chunks.push(new Uint8Array([...hdr, 4, 0, 49, 65, 50, 0]));

    // Step 2: Set module size
    this.chunks.push(new Uint8Array([...hdr, 3, 0, 49, 67, size]));

    // Step 3: Set error correction level
    this.chunks.push(new Uint8Array([...hdr, 3, 0, 49, 69, errorCorrection]));

    // Step 4: Store QR data in symbol storage area
    const dataBytes = utf8Encoder.encode(data);
    const storeLen = dataBytes.length + 3;
    const pL = storeLen & 0xFF;
    const pH = (storeLen >> 8) & 0xFF;
    const storeCmd = new Uint8Array(3 + 2 + 3 + dataBytes.length);
    storeCmd.set([...hdr, pL, pH, 49, 80, 48], 0);
    storeCmd.set(dataBytes, 8);
    this.chunks.push(storeCmd);

    // Step 5: Print the QR code from symbol storage
    this.chunks.push(new Uint8Array([...hdr, 3, 0, 49, 81, 48]));

    return this;
  }

  // ── Build ────────────────────────────────────────────────

  /** Concatenate all chunks into a single Uint8Array for transfer */
  build(): Uint8Array {
    const totalLength = this.chunks.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of this.chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }
}

/** Convenience factory */
export function escpos(): EscPosBuilder {
  return new EscPosBuilder();
}
