/** @vitest-environment jsdom */
/* eslint-disable @next/next/no-img-element */
import "@testing-library/jest-dom";
import { cleanup, render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import RingwoodSquareLocationMap from "./RingwoodSquareLocationMap";

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    <img src={typeof src === "string" ? src : undefined} alt={alt} {...props} />
  ),
}));

afterEach(cleanup);

describe("RingwoodSquareLocationMap", () => {
  it("uses the shared lazy WebP map with a centred introduction and accessible viewer trigger", () => {
    render(
      <RingwoodSquareLocationMap
        heading="Find our kiosk inside the centre"
        description="Enter via Coles or Bunnings and use the map below to find Ali Mobile & Repair."
        sizes="(max-width: 768px) 100vw, 1152px"
      />,
    );

    const heading = screen.getByRole("heading", { name: "Find our kiosk inside the centre" });
    const section = screen.getByTestId("location-map-section");
    const introduction = screen.getByTestId("location-map-introduction");
    expect(heading).toBeInTheDocument();
    expect(screen.getByText("Enter via Coles or Bunnings and use the map below to find Ali Mobile & Repair.")).toBeInTheDocument();
    expect(section).toHaveClass("mx-auto", "w-full", "max-w-[1152px]", "flex", "flex-col", "items-center");
    expect(introduction).toHaveClass("mx-auto", "w-full", "max-w-[42rem]", "flex", "flex-col", "items-center", "text-center");

    expect(screen.getByRole("button", { name: "Open location map" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Open full-size centre map" })).not.toBeInTheDocument();
    expect(screen.queryByText("Open full-size centre map")).not.toBeInTheDocument();
    expect(screen.getByText("Tap map to enlarge")).toBeInTheDocument();

    const image = screen.getByAltText("Ali Mobile & Repair location map inside Ringwood Square Shopping Centre showing Coles and Bunnings entrances");
    expect(image).toHaveAttribute("src", "/images/ali-mobile-repair-ringwood-square-location-map.webp");
    expect(image.getAttribute("src")).not.toContain(".png");
    expect(image).toHaveAttribute("width", "1448");
    expect(image).toHaveAttribute("height", "1086");
    expect(image).toHaveAttribute("loading", "lazy");
    expect(image).not.toHaveAttribute("priority");
    expect(image).not.toHaveAttribute("preload");
    expect(image).not.toHaveAttribute("fetchpriority", "high");
  });

  it.each([
    ["homepage", "homepage"],
    ["booking confirmation", "booking-confirmation"],
  ] as const)("keeps the %s introduction centred at every breakpoint", (_label, variant) => {
    render(
      <RingwoodSquareLocationMap
        heading="Find our kiosk inside the centre"
        description="Enter via Coles or Bunnings and use the map below to find Ali Mobile & Repair."
        sizes="(max-width: 768px) 100vw, 1152px"
        variant={variant}
      />,
    );

    const heading = screen.getByRole("heading", { name: "Find our kiosk inside the centre" });
    const section = screen.getByTestId("location-map-section");
    const introduction = screen.getByTestId("location-map-introduction");
    const description = screen.getByText("Enter via Coles or Bunnings and use the map below to find Ali Mobile & Repair.");

    expect(section).toHaveClass("mx-auto", "w-full", "max-w-[1152px]", "flex", "flex-col", "items-center");
    expect(introduction).toHaveClass("mx-auto", "w-full", "flex", "flex-col", "items-center", "text-center");
    expect(introduction).toHaveClass("max-w-[42rem]");
    expect(section.className).not.toMatch(/(?:^|\\s)(?:text-left|sm:text-left|md:text-left|lg:text-left|sm:mx-0|md:mx-0|lg:mx-0|items-start|mr-auto|self-start)(?:\\s|$)/);
    expect(introduction.className).not.toMatch(/(?:^|\\s)(?:text-left|sm:text-left|md:text-left|lg:text-left|sm:mx-0|md:mx-0|lg:mx-0|items-start|mr-auto|self-start)(?:\\s|$)/);
    expect(heading.className).not.toMatch(/(?:^|\\s)(?:text-left|sm:text-left|md:text-left|lg:text-left|mr-auto|self-start)(?:\\s|$)/);
    expect(description.className).toContain("text-center");
    expect(description.className).not.toMatch(/(?:^|\\s)(?:text-left|sm:text-left|md:text-left|lg:text-left|mr-auto|self-start)(?:\\s|$)/);
  });

  it("is reused after the homepage Google Map and by the booking success view without adding a directions CTA", () => {
    const homepageSource = readFileSync(join(process.cwd(), "src/app/(public)/page.tsx"), "utf8");
    const bookingSource = readFileSync(join(process.cwd(), "src/app/(public)/book-repair/page.tsx"), "utf8");

    expect(homepageSource.indexOf("<iframe")).toBeLessThan(homepageSource.indexOf("<RingwoodSquareLocationMap"));
    expect(homepageSource).toContain('import RingwoodSquareLocationMap from "@/components/RingwoodSquareLocationMap"');
    expect(bookingSource).toContain('import RingwoodSquareLocationMap from "@/components/RingwoodSquareLocationMap"');
    expect(bookingSource.indexOf("<RingwoodSquareLocationMap")).toBeGreaterThan(bookingSource.indexOf("<div className=\"booking-success-grid\">"));
    expect(homepageSource.match(/>\s*Get Directions\s*</g)).toHaveLength(1);
  });
});
