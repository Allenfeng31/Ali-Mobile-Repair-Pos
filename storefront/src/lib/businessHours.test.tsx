import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { BUSINESS_HOURS, LOCAL_BUSINESS_OPENING_HOURS } from "./businessHours";
import { getLocalBusinessSchemaData } from "@/components/seo/SchemaOrg";
import { getServiceLocalBusinessSchema } from "@/components/services/ServiceSchema";

describe("business hours", () => {
  it("defines the single Monday-Saturday 09:00-17:00 authority and booking starts", () => {
    expect(BUSINESS_HOURS.days).toEqual([
      "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
    ]);
    expect(BUSINESS_HOURS.opens).toBe("09:00");
    expect(BUSINESS_HOURS.closes).toBe("17:00");
    expect(BUSINESS_HOURS.compactDisplay).toBe("Mon-Sat, 9am-5pm");
    expect(BUSINESS_HOURS.sentenceDisplay).toBe("9am to 5pm, Monday to Saturday");
    expect(BUSINESS_HOURS.bookingStartSlots).toEqual([
      "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
    ]);
    expect(BUSINESS_HOURS.bookingStartSlots).not.toContain("17:00");
    expect(LOCAL_BUSINESS_OPENING_HOURS).toMatchObject({
      opens: "09:00",
      closes: "17:00",
      dayOfWeek: BUSINESS_HOURS.days,
    });
  });

  it("builds 09:00-17:00 LocalBusiness JSON-LD for homepage and service schemas", () => {
    expect(getLocalBusinessSchemaData()).toMatchObject({
      openingHoursSpecification: [{ opens: "09:00", closes: "17:00" }],
    });
    expect(getServiceLocalBusinessSchema("Screen repair")).toMatchObject({
      openingHoursSpecification: [{ opens: "09:00", closes: "17:00" }],
    });
  });

  it("keeps the location FAQ, about schema, booking exclusions, and SEO worker tied to the authority", () => {
    const storefrontRoot = process.cwd();
    const locationPage = readFileSync(resolve(storefrontRoot, "src/app/(public)/locations/[suburb]/page.tsx"), "utf8");
    const aboutPage = readFileSync(resolve(storefrontRoot, "src/app/(public)/about-us/page.tsx"), "utf8");
    const bookingPage = readFileSync(resolve(storefrontRoot, "src/app/(public)/book-repair/page.tsx"), "utf8");
    const worker = readFileSync(resolve(storefrontRoot, "../scripts/seo-worker.ts"), "utf8");

    expect(locationPage).toContain("BUSINESS_HOURS.sentenceDisplay");
    expect(locationPage).not.toContain("open from 10am to 5pm");
    expect(aboutPage).toContain("[LOCAL_BUSINESS_OPENING_HOURS]");
    expect(aboutPage).not.toContain('opens: "10:00"');
    expect(bookingPage).toContain("const TIME_SLOTS = BUSINESS_HOURS.bookingStartSlots;");
    expect(bookingPage).toContain("const isSunday = d.getDay() === 0;");
    expect(bookingPage).toContain("const isHoliday = VIC_PUBLIC_HOLIDAYS.includes(dayStr);");
    expect(bookingPage).toContain("60 * 60 * 1000");
    expect(worker).toContain("shop hours (9am-5pm)");
    expect(worker).not.toContain("shop hours (10am-5pm)");
  });
});
