/** @vitest-environment jsdom */
import "@testing-library/jest-dom";
import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { trackRepairCtaClick } = vi.hoisted(() => ({ trackRepairCtaClick: vi.fn() }));

vi.mock("@/lib/ga4RepairEvents", () => ({
  trackRepairCtaClick,
  getRepairPageContext: (pathname: string) => pathname === "/repairs/phone/google-pixel"
    ? { pageType: "brand_hub", repairBrand: "google-pixel" }
    : { pageType: "other" },
}));

import CustomerInteractionTracker from "./CustomerInteractionTracker";

describe("CustomerInteractionTracker", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/repairs/phone/google-pixel");
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("tracks a nested Header Book Repair click exactly once", () => {
    const { getByText } = render(<><CustomerInteractionTracker /><header><a href="/book-repair" onClick={(event) => event.preventDefault()}><span>Book Repair</span></a></header></>);
    fireEvent.click(getByText("Book Repair"));

    expect(trackRepairCtaClick).toHaveBeenCalledTimes(1);
    expect(trackRepairCtaClick).toHaveBeenCalledWith(expect.objectContaining({
      pageType: "brand_hub", repairBrand: "google-pixel", action: "book_repair", placement: "header",
    }));
  });

  it("tracks keyboard-generated call clicks and uses semantic Hero placement", () => {
    const { getByRole } = render(<><CustomerInteractionTracker /><section><h1>Google Pixel repairs</h1><a href="tel:0481058514" onClick={(event) => event.preventDefault()}>Call Us</a></section></>);
    const call = getByRole("link", { name: "Call Us" });
    fireEvent.keyDown(call, { key: "Enter" });
    fireEvent.click(call, { detail: 0 });

    expect(trackRepairCtaClick).toHaveBeenCalledWith(expect.objectContaining({ action: "call", placement: "hero" }));
  });

  it("tracks a model selector and directions, but not unrelated navigation", () => {
    const { getByText } = render(<><CustomerInteractionTracker /><footer><a href="#models-list" onClick={(event) => event.preventDefault()}>Choose model</a><a href="https://www.google.com/maps/dir/?api=1&destination=Ringwood" onClick={(event) => event.preventDefault()}>Directions</a><a href="/about-us" onClick={(event) => event.preventDefault()}>About</a></footer></>);
    fireEvent.click(getByText("Choose model"));
    fireEvent.click(getByText("Directions"));
    fireEvent.click(getByText("About"));

    expect(trackRepairCtaClick).toHaveBeenCalledTimes(2);
    expect(trackRepairCtaClick).toHaveBeenNthCalledWith(1, expect.objectContaining({ action: "select_model", placement: "footer" }));
    expect(trackRepairCtaClick).toHaveBeenNthCalledWith(2, expect.objectContaining({ action: "get_directions", placement: "footer" }));
  });
});
