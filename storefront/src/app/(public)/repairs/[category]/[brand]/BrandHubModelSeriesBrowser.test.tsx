import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import BrandHubModelSeriesBrowser from "./BrandHubModelSeriesBrowser";

describe("BrandHubModelSeriesBrowser", () => {
  it("provides semantic Samsung and OPPO model-link fallback navigation without JavaScript", () => {
    for (const brandSlug of ["samsung", "oppo"]) {
      const html = renderToStaticMarkup(
        <BrandHubModelSeriesBrowser
          brandSlug={brandSlug}
          categorySlug="phone"
          seriesGroups={[{
            key: "test-series",
            label: "Test Series",
            models: [{ model: "Test Model", slug: "test-model", modelCode: "SM-TEST" }],
          }]}
        />,
      );

      expect(html).toContain(`aria-label="${brandSlug} model links without JavaScript"`);
      expect(html).toContain(`<a href="/repairs/phone/${brandSlug}/test-model"`);
    }
  });
});
