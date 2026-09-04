/**
 * @vitest-environment jsdom
 */
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import ServiceAreas from "./ServiceAreas";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const featuredAreaSlugs = [
  "ringwood",
  "ringwood-east",
  "heathmont",
  "mitcham",
  "croydon",
  "nunawading",
  "wantirna",
  "bayswater",
  "boronia",
] as const;

const featuredAreaNames = [
  "Ringwood",
  "Ringwood East",
  "Heathmont",
  "Mitcham",
  "Croydon",
  "Nunawading",
  "Wantirna",
  "Bayswater",
  "Boronia",
] as const;

describe("ServiceAreas", () => {
  it("renders only the approved nine featured areas in SSR markup without a hidden remainder", () => {
    const markup = renderToStaticMarkup(<ServiceAreas />);
    const document = new DOMParser().parseFromString(markup, "text/html");
    const locationLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="/locations/"]'));

    expect(locationLinks).toHaveLength(9);
    expect(locationLinks.map((link) => link.getAttribute("href"))).toEqual(
      featuredAreaSlugs.map((slug) => `/locations/${slug}`),
    );
    expect(locationLinks.map((link) => link.querySelector("span")?.textContent)).toEqual(featuredAreaNames);

    expect(markup).not.toContain("Box Hill");
    expect(markup).not.toContain("Glen Waverley");
    expect(markup).not.toContain("Doncaster");
    expect(markup).not.toContain("Ringwood North");
    expect(markup).not.toContain("Show More Suburbs");
    expect(markup).not.toContain("Show Less");
    expect(markup).not.toContain("21 more areas");

    for (const link of locationLinks) {
      expect(link.className).not.toMatch(/hidden/);
      expect(link.getAttribute("style") ?? "").not.toMatch(/display\s*:\s*none/i);
      expect(link.getAttribute("aria-hidden")).toBeNull();
    }
  });
});
