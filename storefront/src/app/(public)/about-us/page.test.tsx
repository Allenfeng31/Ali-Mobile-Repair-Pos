/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom";
import { cleanup, render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import AboutUsPage, { metadata } from "./page";
import { getLocalBusinessSchemaData } from "@/components/seo/SchemaOrg";

vi.mock("next/image", () => ({
  default: () => <span data-next-image="true" />,
}));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

afterEach(cleanup);

describe("AboutUsPage factual entity content", () => {
  it("keeps the approved entity, history, warranty, location, and metadata facts", () => {
    const { container } = render(<AboutUsPage />);

    expect(screen.getByRole("heading", { level: 1, name: "About Ali Mobile & Repair" })).toBeInTheDocument();
    expect(screen.getByText("Quietly technical. Seriously local.")).toBeInTheDocument();
    expect(screen.getByText("Serving Ringwood since 2014")).toBeInTheDocument();
    expect(screen.getByText("Kiosk C1")).toBeInTheDocument();
    expect(screen.getByText("$0")).toBeInTheDocument();
    expect(screen.getByText("Ali Mobile & Repair helps Ringwood customers with phone, tablet, laptop and Apple Watch repairs, clear quotes, practical repair guidance, and everyday accessories such as phone cases and screen protectors.")).toBeInTheDocument();
    expect(screen.getByText("Standard repairs include a 6-month warranty. Water-damage repairs have no warranty.")).toBeInTheDocument();
    expect(screen.getAllByText(/Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134/).length).toBeGreaterThan(0);

    expect(container.textContent).not.toMatch(/10\+|0\$|more than a decade|priority service|same-day repair may be available|inflated chain-store pricing/i);
    expect(metadata.title).toBe("About Ali Mobile & Repair | Ringwood Repair Team");
    expect(metadata.description).toBe("Learn about Ali Mobile & Repair in Ringwood Square, our repair approach, No Fix, No Charge policy, and how we help local customers with phones, tablets, and laptops.");
    expect(metadata.alternates?.canonical).toBe("/about-us");
  });

  it("uses the canonical local business facts and preserves About breadcrumbs", () => {
    const { container } = render(<AboutUsPage />);
    const schemas = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
      .map((script) => JSON.parse(script.textContent ?? ""));
    const localBusiness = schemas.find((schema) => schema["@type"] === "MobilePhoneStore");
    const breadcrumb = schemas.find((schema) => schema["@type"] === "BreadcrumbList");

    expect(localBusiness).toEqual(getLocalBusinessSchemaData());
    expect(breadcrumb).toMatchObject({
      itemListElement: [
        { name: "Home", item: "https://www.alimobile.com.au/" },
        { name: "About Us", item: "https://www.alimobile.com.au/about-us" },
      ],
    });
  });
});
