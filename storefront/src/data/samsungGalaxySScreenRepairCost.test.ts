import { describe, expect, it } from "vitest";

import {
  SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA,
  SAMSUNG_GALAXY_S_SCREEN_REPAIR_PRICES,
} from "./samsungGalaxySScreenRepairCost";
import { getPostData } from "@/lib/blog";

describe("Samsung Galaxy S screen repair cost article data", () => {
  it("keeps the 25 owner-confirmed selling-price rows in newest-first order", () => {
    expect(SAMSUNG_GALAXY_S_SCREEN_REPAIR_PRICES).toEqual([
      { model: "Galaxy S26 Ultra", servicePackWithFrame: 490, aftermarketWithFrame: null },
      { model: "Galaxy S26+", servicePackWithFrame: 430, aftermarketWithFrame: null },
      { model: "Galaxy S26", servicePackWithFrame: 370, aftermarketWithFrame: null },
      { model: "Galaxy S25 Ultra", servicePackWithFrame: 430, aftermarketWithFrame: 340 },
      { model: "Galaxy S25+", servicePackWithFrame: 360, aftermarketWithFrame: null },
      { model: "Galaxy S25", servicePackWithFrame: 330, aftermarketWithFrame: null },
      { model: "Galaxy S24 Ultra", servicePackWithFrame: 420, aftermarketWithFrame: 320 },
      { model: "Galaxy S24+", servicePackWithFrame: 340, aftermarketWithFrame: null },
      { model: "Galaxy S24", servicePackWithFrame: 310, aftermarketWithFrame: null },
      { model: "Galaxy S24 FE", servicePackWithFrame: 240, aftermarketWithFrame: null },
      { model: "Galaxy S23 Ultra", servicePackWithFrame: 420, aftermarketWithFrame: 298 },
      { model: "Galaxy S23+", servicePackWithFrame: 290, aftermarketWithFrame: null },
      { model: "Galaxy S23", servicePackWithFrame: 310, aftermarketWithFrame: null },
      { model: "Galaxy S23 FE", servicePackWithFrame: 240, aftermarketWithFrame: null },
      { model: "Galaxy S22 Ultra", servicePackWithFrame: 390, aftermarketWithFrame: 298 },
      { model: "Galaxy S22+", servicePackWithFrame: 270, aftermarketWithFrame: null },
      { model: "Galaxy S22", servicePackWithFrame: 290, aftermarketWithFrame: null },
      { model: "Galaxy S21 Ultra", servicePackWithFrame: 350, aftermarketWithFrame: null },
      { model: "Galaxy S21+", servicePackWithFrame: 260, aftermarketWithFrame: null },
      { model: "Galaxy S21", servicePackWithFrame: 240, aftermarketWithFrame: null },
      { model: "Galaxy S21 FE", servicePackWithFrame: 230, aftermarketWithFrame: null },
      { model: "Galaxy S20 Ultra", servicePackWithFrame: 330, aftermarketWithFrame: null },
      { model: "Galaxy S20+", servicePackWithFrame: 290, aftermarketWithFrame: null },
      { model: "Galaxy S20", servicePackWithFrame: 250, aftermarketWithFrame: null },
      { model: "Galaxy S20 FE", servicePackWithFrame: 190, aftermarketWithFrame: null },
    ]);
  });

  it("limits aftermarket display-with-frame prices to the four confirmed Ultra models", () => {
    expect(SAMSUNG_GALAXY_S_SCREEN_REPAIR_PRICES.filter((row) => row.aftermarketWithFrame !== null)).toEqual([
      { model: "Galaxy S25 Ultra", servicePackWithFrame: 430, aftermarketWithFrame: 340 },
      { model: "Galaxy S24 Ultra", servicePackWithFrame: 420, aftermarketWithFrame: 320 },
      { model: "Galaxy S23 Ultra", servicePackWithFrame: 420, aftermarketWithFrame: 298 },
      { model: "Galaxy S22 Ultra", servicePackWithFrame: 390, aftermarketWithFrame: 298 },
    ]);
  });

  it("keeps the article dates manual and truthful", () => {
    expect(SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA).toMatchObject({
      datePublished: "2026-09-08",
      dateModified: "2026-09-08",
      displayDateModified: "8 September 2026",
    });
  });

  it("keeps the static article discoverable through the markdown blog index", async () => {
    const post = await getPostData(SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.slug);

    expect(post.title).toBe(SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.title);
    expect(post.date).toBe("2026-09-08");
    expect(post.updated_at).toBe("2026-09-08");
  });
});
