/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom";
import { cleanup, render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import CategoryHubPage, { generateMetadata } from "./page";

vi.mock("next/image", () => ({
  default: () => <span data-next-image="true" />,
}));
vi.mock("next/link", () => ({
  default: ({ children, href, prefetch, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string; prefetch?: boolean }) => {
    void prefetch;
    return <a href={href} {...props}>{children}</a>;
  },
}));
vi.mock("next/navigation", () => ({ notFound: vi.fn() }));
vi.mock("@/components/services/ServiceSchema", () => ({
  ServiceSchema: ({ serviceName }: { serviceName: string }) => <output data-testid="service-schema" data-service-name={serviceName} />,
}));
vi.mock("@/components/services/LivePricingGrid", () => ({ default: () => null }));
vi.mock("@/components/ScrollReveal", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/FloatingJumpCTA", () => ({ default: () => null }));
vi.mock("@/components/repair-results/HubRepairResultsSection", () => ({ default: () => null }));
vi.mock("@/lib/api", () => ({
  fetchRepairCatalog: vi.fn().mockResolvedValue({ brands: [] }),
}));

const tabletWarrantyAnswer = "Completed standard tablet repairs include a 6-month warranty covering the replacement part and labour. New damage, new or repeated liquid exposure, third-party work and unrelated faults are excluded.";

async function renderCategory(category: string) {
  render(await CategoryHubPage({ params: Promise.resolve({ category }) }));
}

afterEach(() => {
  cleanup();
});

describe("category warranty content", () => {
  it.each([
    ["phone", "Mobile Phone Repair Services by Brand and Model"],
    ["tablet", "Tablet Repair Services by Brand and Model"],
  ])("renders the approved standard-repairs warranty feature for %s", async (category, serviceName) => {
    await renderCategory(category);

    expect(screen.getByRole("heading", { level: 3, name: "6-Month Warranty on Standard Repairs" })).toBeInTheDocument();
    expect(screen.queryByText("180-Day Comprehensive Warranty")).not.toBeInTheDocument();
    expect(screen.queryByText("180-Day Comprehensive Warranty Coverage")).not.toBeInTheDocument();
    expect(screen.getByTestId("service-schema")).toHaveAttribute("data-service-name", serviceName);
  });

  it("uses the scoped six-month policy in the existing tablet FAQ", async () => {
    await renderCategory("tablet");

    expect(screen.getByRole("heading", { level: 3, name: "What is your warranty policy for tablet repairs?" })).toBeInTheDocument();
    expect(screen.getByText(tabletWarrantyAnswer)).toBeInTheDocument();
    expect(tabletWarrantyAnswer).toContain("6-month");
    expect(tabletWarrantyAnswer).toContain("replacement part and labour");
    expect(tabletWarrantyAnswer).not.toContain("comprehensive warranty");
  });

  it.each([
    ["laptop", "Windows and MacBook repair pathways"],
    ["watch", "Water-resistance limitations"],
  ])("keeps the %s category feature configuration unchanged", async (category, unchangedFeature) => {
    await renderCategory(category);

    expect(screen.getByRole("heading", { level: 3, name: unchangedFeature })).toBeInTheDocument();
  });

  it("keeps category metadata canonicals and Open Graph URLs unchanged", async () => {
    for (const category of ["phone", "tablet", "laptop", "watch"]) {
      const metadata = await generateMetadata({ params: Promise.resolve({ category }) });

      expect(metadata.alternates?.canonical).toBe(`/repairs/${category}`);
      expect(metadata.openGraph?.url).toBe(`/repairs/${category}`);
    }
  });
});
