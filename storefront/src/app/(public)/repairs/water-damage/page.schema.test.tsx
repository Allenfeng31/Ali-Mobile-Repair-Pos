/**
 * @vitest-environment jsdom
 */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import WaterDamagePage from "./page";

afterEach(() => {
  cleanup();
});

describe("WaterDamagePage service schema", () => {
  it("references the canonical LocalBusiness entity without duplicating provider fields", () => {
    const { container } = render(<WaterDamagePage />);
    const serviceSchema = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
      .map((script) => JSON.parse(script.textContent || "{}"))
      .find((schema) => schema["@id"] === "https://www.alimobile.com.au/repairs/water-damage#service");

    expect(serviceSchema?.["@type"]).toBe("Service");
    expect(serviceSchema?.provider).toBeDefined();
    expect(serviceSchema?.provider).toMatchObject({
      "@id": "https://www.alimobile.com.au/#localbusiness",
    });
    expect(serviceSchema?.provider).not.toHaveProperty("name");
    expect(serviceSchema?.provider).not.toHaveProperty("telephone");
    expect(serviceSchema?.provider).not.toHaveProperty("address");
  });
});
