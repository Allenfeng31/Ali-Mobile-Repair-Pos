/**
 * ESC/POS Command Builder for Thermal Receipt Printers
 * 
 * Lightweight, browser-native utility. Zero dependencies.
 * Builds raw byte arrays (Uint8Array) for direct USB transfer.
 * 
 * Target: SAM4S ELLIX 30IIs (80mm / 48-char line width)
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

/** Default line width for 80mm thermal printers (Font A, 12×24) */
export const LINE_WIDTH = 48;

const encoder = new TextEncoder();

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

  /** Print text followed by a line feed */
  text(text: string): this {
    this.chunks.push(encoder.encode(text + '\n'));
    return this;
  }

  /** Print an empty line */
  blank(): this {
    this.chunks.push(new Uint8Array([LF]));
    return this;
  }

  // ── Layout Helpers ───────────────────────────────────────

  /** Print a dashed separator line */
  separator(char = '-', width = LINE_WIDTH): this {
    return this.text(char.repeat(width));
  }

  /** Print a double-line separator */
  doubleSeparator(width = LINE_WIDTH): this {
    return this.text('='.repeat(width));
  }

  /**
   * Print two strings on the same line: left-aligned and right-aligned.
   * Example: leftRight("Subtotal:", "$12.50")
   */
  leftRight(left: string, right: string, width = LINE_WIDTH): this {
    const gap = width - left.length - right.length;
    if (gap < 1) {
      // Content too long, print on separate lines
      return this.text(left).text(right);
    }
    return this.text(left + ' '.repeat(gap) + right);
  }

  /**
   * Print three columns on the same line.
   * Columns: left (50%), center (20%), right (30%)
   * Example: threeColumns("Widget", "x2", "$24.00")
   */
  threeColumns(left: string, center: string, right: string, width = LINE_WIDTH): this {
    const colLeft = Math.floor(width * 0.50);
    const colCenter = Math.floor(width * 0.20);
    const colRight = width - colLeft - colCenter;

    const l = left.length > colLeft ? left.substring(0, colLeft - 1) + '.' : left.padEnd(colLeft);
    const c = center.length > colCenter ? center.substring(0, colCenter) : center.padStart(colCenter);
    const r = right.length > colRight ? right.substring(0, colRight) : right.padStart(colRight);

    return this.text(l + c + r);
  }

  /**
   * Print centered text with optional padding character.
   */
  centered(text: string, width = LINE_WIDTH, padChar = ' '): this {
    const totalPad = width - text.length;
    if (totalPad <= 0) return this.text(text);
    const leftPad = Math.floor(totalPad / 2);
    const rightPad = totalPad - leftPad;
    return this.text(padChar.repeat(leftPad) + text + padChar.repeat(rightPad));
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
