/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomeFAQ from "./HomeFAQ";

describe("HomeFAQ", () => {
  it("renders the approved seven-question homepage FAQ without unsupported legacy claims", () => {
    const { container } = render(<HomeFAQ />);
    const faqText = container.textContent ?? "";

    expect(screen.getAllByRole("button")).toHaveLength(7);
    expect(screen.getByRole("button", { name: /Do I need an appointment, or can I walk in\?/i })).toBeInTheDocument();
    expect(screen.getByText(/Walk-ins are welcome at Ali Mobile & Repair/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Can I check the repair price before coming in\?/i })).toBeInTheDocument();
    expect(faqText).toContain("available repair prices through our online booking flow");
    expect(faqText).toContain("provide a quote before repair work starts");
    expect(faqText).toContain("15–60 minutes");
    expect(faqText).toContain("1–2 hours");
    expect(faqText).toContain("around 45 minutes");
    expect(faqText).toContain("Standard repairs include a 6-month warranty");
    expect(faqText).toContain("Water-damage repairs have no warranty");
    expect(screen.getByRole("button", { name: /What if my device is not working or has water damage\?/i })).toBeInTheDocument();
    expect(faqText).toContain("Recovery or successful repair cannot be guaranteed");
    expect(screen.getByRole("button", { name: /Where is Ali Mobile & Repair located\?/i })).toBeInTheDocument();
    expect(faqText).toContain("Kiosk C1 inside Ringwood Square Shopping Centre, Ringwood VIC");

    expect(faqText).not.toContain("online bookings get priority");
    expect(faqText).not.toContain("Same-day repair may be available");
    expect(faqText).not.toContain("Eligible repairs include warranty support");
    expect(faqText).not.toContain("Do you repair screens, batteries, and charging ports?");
    expect(faqText).not.toMatch(/Ringwood East|Heathmont|Mitcham|Croydon/);
  });
});
