import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ReviewsSection from "./ReviewsSection";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ReviewsSection", () => {
  it("does not force the reviews route to bypass its shared HTTP cache", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reviews: [{ id: "review", authorName: "Customer", rating: 5, text: "Great", relativeTimeDescription: "today" }],
        aggregateRating: { ratingValue: "4.9", reviewCount: "100" },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ReviewsSection />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith("/api/google-reviews", expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(fetchMock.mock.calls[0][1]).not.toHaveProperty("cache", "no-store");
  });
});
