import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PhoneScreenBlackArticle } from "./PhoneScreenBlackArticle";

const priceTable = {
  fetchedAt: "2026-11-17T01:00:00Z",
  rows: [
    { brand: "Apple iPhone", href: "/repairs/phone/iphone", range: { min: 149, max: 399 } },
    { brand: "Samsung Galaxy", href: "/repairs/phone/samsung", range: { min: 179, max: 349 } },
    { brand: "Google Pixel", href: "/repairs/phone/google", range: { min: 199, max: 329 } },
    { brand: "OPPO", href: "/repairs/phone/oppo", range: { min: 159, max: 159 } },
  ],
};

describe("PhoneScreenBlackArticle", () => {
  it("server-renders the answer, five-step workflow and qualified repair claims", () => {
    const html = renderToStaticMarkup(<PhoneScreenBlackArticle priceTable={priceTable} />);

    expect(html).toContain("ring, vibrate or trigger alarms");
    expect(html).toContain("Check the response");
    expect(html).toContain("Check charging and power");
    expect(html).toContain("Test with a known-good display");
    expect(html).toContain("Inspect the display and connection");
    expect(html).toContain("Reconnect, replace or investigate further");
    expect(html).toContain("usually charges <strong>$35</strong>");
    expect(html).toContain("not a universal diagnostic fee or a guaranteed solution");
    expect(html).toContain("30–60 minutes");
    expect(html).toContain("six-month parts and labour warranty");
    expect(html).toContain("Australian Consumer Law");
    expect(html).not.toContain('"@type":"FAQPage"');
  });

  it("uses the infographic and six genuine repair images with accurate descriptions", () => {
    const html = renderToStaticMarkup(<PhoneScreenBlackArticle priceTable={priceTable} />);
    const imagePaths = [
      "ali-mobile-no-display-diagnostic-process.webp",
      "samsung-galaxy-a15-screen-before.webp",
      "samsung-galaxy-a15-screen-after.webp",
      "google-pixel-7-screen-before.webp",
      "google-pixel-7-screen-after.webp",
      "iphone-17-screen-before.webp",
      "iphone-17-screen-after.webp",
    ];

    for (const filename of imagePaths) {
      expect(html).toContain(filename);
      expect(existsSync(resolve(process.cwd(), "public/images/blog/phone-screen-black", filename))).toBe(true);
    }
    expect(html).toContain("owner-confirmed Pixel 7");
    expect(html).toContain("temporary screen-protection label");
    expect(html).toContain("not photographic evidence of an individual repair");
    expect(html.match(/<figure/g)).toHaveLength(7);
  });

  it("shows four dynamic brand ranges and a safe unavailable state", () => {
    const html = renderToStaticMarkup(<PhoneScreenBlackArticle priceTable={priceTable} />);
    expect(html).toContain("Apple iPhone");
    expect(html).toContain("$149–$399");
    expect(html).toContain("Samsung Galaxy");
    expect(html).toContain("Google Pixel");
    expect(html).toContain("OPPO");
    expect(html).toContain('href="/repairs/phone/google"');
    expect(html).not.toContain("[DYNAMIC");

    const unavailable = renderToStaticMarkup(<PhoneScreenBlackArticle priceTable={null} />);
    expect(unavailable).toContain("Current published screen prices are temporarily unavailable");
    expect(unavailable).not.toMatch(/\$149|\$399/);
  });

  it("stays server-only and keeps the 390px layout free of horizontal scrolling", () => {
    const source = readFileSync(resolve(process.cwd(), "src/components/blog/PhoneScreenBlackArticle.tsx"), "utf8");
    const css = readFileSync(resolve(process.cwd(), "src/components/blog/PhoneScreenBlackArticle.module.css"), "utf8");
    expect(source).not.toContain('"use client"');
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(css).toContain("@media (max-width: 480px)");
    expect(css).not.toContain("overflow-x: auto");
  });
});
