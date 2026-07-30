import { describe, expect, it } from "vitest";

import {
  CURRENT_IPHONE_SCREEN_REPAIR_PRICES,
  IPHONE_SCREEN_REPAIR_COST_SLUG,
  IPHONE_SCREEN_REPAIR_PRICES,
  OLDER_IPHONE_SCREEN_REPAIR_PRICES,
  SCREEN_OPTION_SAMPLE,
  SCREEN_OPTION_SAMPLE_TOTAL,
} from "./iphoneScreenRepairCost";
import { getPostData } from "@/lib/blog";

describe("iPhone screen repair cost article data", () => {
  it("contains the supplied 44-model price table exactly once per model", () => {
    expect(IPHONE_SCREEN_REPAIR_PRICES).toEqual([
      { model: "iPhone 17 Pro Max", lcdInCell: 190, softOled: 320, originalScreen: 599 }, { model: "iPhone 17 Pro", lcdInCell: 190, softOled: 290, originalScreen: 540 }, { model: "iPhone 17", lcdInCell: 190, softOled: 250, originalScreen: 470 }, { model: "iPhone 17e", lcdInCell: 139, softOled: 179, originalScreen: 250 }, { model: "iPhone 17 Air", lcdInCell: null, softOled: null, originalScreen: 540 }, { model: "iPhone 16 Pro Max", lcdInCell: 190, softOled: 270, originalScreen: 540 }, { model: "iPhone 16 Plus", lcdInCell: 170, softOled: 240, originalScreen: 350 }, { model: "iPhone 16 Pro", lcdInCell: 190, softOled: 270, originalScreen: 450 }, { model: "iPhone 16", lcdInCell: 170, softOled: 220, originalScreen: 370 }, { model: "iPhone 16e", lcdInCell: 139, softOled: 170, originalScreen: 220 }, { model: "iPhone 15 Pro Max", lcdInCell: 190, softOled: 240, originalScreen: 390 }, { model: "iPhone 15 Plus", lcdInCell: 170, softOled: 220, originalScreen: 350 }, { model: "iPhone 15 Pro", lcdInCell: 170, softOled: 240, originalScreen: 390 }, { model: "iPhone 15", lcdInCell: 150, softOled: 200, originalScreen: 320 }, { model: "iPhone 14 Pro Max", lcdInCell: 170, softOled: 220, originalScreen: 370 }, { model: "iPhone 14 Plus", lcdInCell: 170, softOled: 190, originalScreen: 320 }, { model: "iPhone 14 Pro", lcdInCell: 170, softOled: 220, originalScreen: 290 }, { model: "iPhone 14", lcdInCell: 150, softOled: 190, originalScreen: 240 }, { model: "iPhone SE 3", lcdInCell: 85, softOled: null, originalScreen: null }, { model: "iPhone 13 Pro Max", lcdInCell: 170, softOled: 190, originalScreen: 320 }, { model: "iPhone 13 Pro", lcdInCell: 150, softOled: 190, originalScreen: 270 }, { model: "iPhone 13", lcdInCell: 129, softOled: 169, originalScreen: 240 }, { model: "iPhone 13 mini", lcdInCell: 150, softOled: null, originalScreen: 290 }, { model: "iPhone 12 Pro Max", lcdInCell: 150, softOled: null, originalScreen: null }, { model: "iPhone 12 Pro", lcdInCell: 139, softOled: null, originalScreen: null }, { model: "iPhone 12", lcdInCell: 129, softOled: 169, originalScreen: 199 }, { model: "iPhone 12 mini", lcdInCell: 150, softOled: null, originalScreen: null }, { model: "iPhone SE 2", lcdInCell: null, softOled: null, originalScreen: 85 }, { model: "iPhone 11 Pro Max", lcdInCell: 139, softOled: null, originalScreen: null }, { model: "iPhone 11 Pro", lcdInCell: 129, softOled: null, originalScreen: null }, { model: "iPhone 11", lcdInCell: 120, softOled: null, originalScreen: 150 }, { model: "iPhone XS Max", lcdInCell: 120, softOled: null, originalScreen: null }, { model: "iPhone XS", lcdInCell: 100, softOled: null, originalScreen: 180 }, { model: "iPhone X", lcdInCell: 100, softOled: null, originalScreen: 170 }, { model: "iPhone XR", lcdInCell: 110, softOled: null, originalScreen: 150 }, { model: "iPhone 8 Plus", lcdInCell: 90, softOled: null, originalScreen: null }, { model: "iPhone 8", lcdInCell: null, softOled: null, originalScreen: 85 }, { model: "iPhone 7 Plus", lcdInCell: 85, softOled: null, originalScreen: null }, { model: "iPhone 7", lcdInCell: null, softOled: null, originalScreen: 80 }, { model: "iPhone SE", lcdInCell: null, softOled: null, originalScreen: 85 }, { model: "iPhone 6 Plus", lcdInCell: 70, softOled: null, originalScreen: null }, { model: "iPhone 6S Plus", lcdInCell: 70, softOled: null, originalScreen: null }, { model: "iPhone 6", lcdInCell: 60, softOled: null, originalScreen: null }, { model: "iPhone 6S", lcdInCell: 65, softOled: null, originalScreen: null },
    ]);
    expect(IPHONE_SCREEN_REPAIR_PRICES).toHaveLength(44);
    expect(new Set(IPHONE_SCREEN_REPAIR_PRICES.map(({ model }) => model)).size).toBe(44);
  });

  it("keeps the supplied customer-choice sample accessible and internally consistent", () => {
    expect(SCREEN_OPTION_SAMPLE).toEqual([
      { name: "Soft OLED", customers: 72, colour: "#2563eb", summary: "Most frequently selected balance of display quality and price." },
      { name: "LCD / In-cell", customers: 21, colour: "#0891b2", summary: "Selected mainly where keeping the repair cost lower was the priority." },
      { name: "Original Screen", customers: 7, colour: "#a16207", summary: "Selected by customers prioritising the original screen option." },
    ]);
    expect(SCREEN_OPTION_SAMPLE_TOTAL).toBe(100);
  });

  it("keeps iPhone 11 visible and exposes exactly 13 older models from the same data source", () => {
    expect(CURRENT_IPHONE_SCREEN_REPAIR_PRICES).toHaveLength(31);
    expect(OLDER_IPHONE_SCREEN_REPAIR_PRICES).toHaveLength(13);
    expect([...CURRENT_IPHONE_SCREEN_REPAIR_PRICES, ...OLDER_IPHONE_SCREEN_REPAIR_PRICES]).toEqual(IPHONE_SCREEN_REPAIR_PRICES);
    expect(CURRENT_IPHONE_SCREEN_REPAIR_PRICES.at(-1)?.model).toBe("iPhone 11");
    expect(OLDER_IPHONE_SCREEN_REPAIR_PRICES.map(({ model }) => model)).toEqual([
      "iPhone XS Max", "iPhone XS", "iPhone X", "iPhone XR", "iPhone 8 Plus", "iPhone 8", "iPhone 7 Plus", "iPhone 7", "iPhone SE", "iPhone 6 Plus", "iPhone 6S Plus", "iPhone 6", "iPhone 6S",
    ]);
  });

  it("loads the article through the existing markdown blog source", async () => {
    const post = await getPostData(IPHONE_SCREEN_REPAIR_COST_SLUG);

    expect(post.title).toBe("How Much Does iPhone Screen Repair Cost in Australia?");
    expect(post.seo_title).toBe("How Much Does iPhone Screen Repair Cost in Australia? | Ali Mobile");
    expect(post.image).toBe("/images/blog/iphone-screen-repair-cost/iphone-screen-comparison.jpg");
    expect(post.hero_intro).toContain("current iPhone screen replacement prices range from $60");
  });
});
