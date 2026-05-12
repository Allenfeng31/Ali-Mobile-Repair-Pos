/**
 * ESC/POS Command Builder for Thermal Receipt Printers
 * 
 * Lightweight, browser-native utility. Zero dependencies.
 * Builds raw byte arrays (Uint8Array) for direct USB transfer.
 * 
 * Target: SAM4S ELLIX 30IIs (80mm / 42-char line width, Font A)
 * 
 * ESC/POS Reference:
 *   ESC @       = 0x1B 0x40  Initialize printer
 *   ESC a n     = 0x1B 0x61  Alignment (0=left, 1=center, 2=right)
 *   ESC E n     = 0x1B 0x45  Bold on/off
 *   ESC ! n     = 0x1B 0x21  Print mode (bit flags for font size/style)
 *   GS ! n      = 0x1D 0x21  Character size (width × height multiplier)
 *   GS V m      = 0x1D 0x56  Paper cut (0=full, 1=partial)
 *   LF          = 0x0A       Line feed
 */

const ESC = 0x1B;
const GS  = 0x1D;
const LF  = 0x0A;

/**
 * Maximum characters per line for SAM4S ELLIX 30IIs (Font A).
 * All alignment padding math MUST use this number.
 */
export const MAX_CHARS = 42;

const encoder = new TextEncoder();

/**
 * Strip non-ASCII characters (e.g. Chinese, emoji) from text.
 * Replaces them with '?' to avoid garbled output on thermal printers
 * that only support CP437/ASCII code pages.
 */
export function sanitize(text: string): string {
  return text.replace(/[^\x20-\x7E]/g, '?');
}

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
    this.chunks.push(encoder.encode(text));
    return this;
  }

  /** Print text followed by a line feed. Auto-sanitizes non-ASCII. */
  text(text: string): this {
    this.chunks.push(encoder.encode(sanitize(text) + '\n'));
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
    return this.text(char.repeat(width));
  }

  /** Print a double-line separator */
  doubleSeparator(width = MAX_CHARS): this {
    return this.text('='.repeat(width));
  }

  /**
   * Print two strings on the same line: left-aligned and right-aligned.
   * If combined length exceeds MAX_CHARS, truncates leftText with ".."
   * to guarantee rightText stays on the same line.
   * 
   * Example: leftRight("Subtotal:", "$12.50")
   * Output:  "Subtotal:                         $12.50"
   */
  leftRight(left: string, right: string, width = MAX_CHARS): this {
    const safeLeft = sanitize(left);
    const safeRight = sanitize(right);
    const minGap = 1; // At least 1 space between left and right
    const maxLeft = width - safeRight.length - minGap;

    let l = safeLeft;
    if (l.length > maxLeft) {
      // Truncate left side with ".." to prevent wrapping
      l = l.substring(0, Math.max(maxLeft - 2, 0)) + '..';
    }

    const gap = width - l.length - safeRight.length;
    return this.text(l + ' '.repeat(Math.max(gap, 1)) + safeRight);
  }

  /**
   * Print three columns on the same line with strict boundaries.
   * 
   * Layout for 42 CPL:
   *   Col 1 (Item Name): 22 chars max, left-aligned, truncated with ".." if >22
   *   Col 2 (Qty):        8 chars, right-aligned
   *   Col 3 (Price):     12 chars, right-aligned
   *   Total:             42 chars exactly
   * 
   * Example: threeColumns("iPhone 13 Pro Max Screen Repl", "x1", "$120.00")
   * Output:  "iPhone 13 Pro Max Scr.      x1     $120.00"
   */
  threeColumns(left: string, center: string, right: string, width = MAX_CHARS): this {
    const COL_NAME  = 22;
    const COL_QTY   = 8;
    const COL_PRICE = 12;
    // COL_NAME + COL_QTY + COL_PRICE = 42

    const safeLeft = sanitize(left);

    // Col 1: left-aligned, hard truncate at 22 with ".." if over
    let l: string;
    if (safeLeft.length > COL_NAME) {
      l = safeLeft.substring(0, COL_NAME - 2) + '..';
    } else {
      l = safeLeft.padEnd(COL_NAME);
    }

    // Col 2: right-aligned within its 8-char slot
    const c = sanitize(center).padStart(COL_QTY).substring(0, COL_QTY);

    // Col 3: right-aligned within its 12-char slot
    const r = sanitize(right).padStart(COL_PRICE).substring(0, COL_PRICE);

    return this.text(l + c + r);
  }

  /**
   * Print centered text with optional padding character.
   */
  centered(text: string, width = MAX_CHARS, padChar = ' '): this {
    const safe = sanitize(text);
    const totalPad = width - safe.length;
    if (totalPad <= 0) return this.text(safe);
    const leftPad = Math.floor(totalPad / 2);
    const rightPad = totalPad - leftPad;
    return this.text(padChar.repeat(leftPad) + safe + padChar.repeat(rightPad));
  }

  /**
   * Word-wrap long text to fit within MAX_CHARS.
   * Useful for policy text and disclaimers.
   */
  wrapText(text: string, width = MAX_CHARS): this {
    const safe = sanitize(text);
    const words = safe.split(' ');
    let line = '';

    for (const word of words) {
      if (line.length === 0) {
        line = word;
      } else if (line.length + 1 + word.length <= width) {
        line += ' ' + word;
      } else {
        this.text(line);
        line = word;
      }
    }
    if (line.length > 0) {
      this.text(line);
    }
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
