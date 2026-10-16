import type { AnchorHTMLAttributes, ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";

import PublicLayout from "./layout";
import RepairsHubPage from "./repairs/page";
import BrandHubPage from "./repairs/[category]/[brand]/page";

vi.mock("../ClientChatWidget", () => ({ default: () => null }));
vi.mock("../Header", () => ({ default: () => null }));
vi.mock("@/context/CartContext", () => ({
  CartProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/PageTransition", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/SocialIcon", () => ({
  default: () => <svg aria-hidden="true" />,
}));
vi.mock("@/components/ChatNowButton", () => ({ default: () => null }));
vi.mock("@/components/FloatingJumpCTA", () => ({ default: () => null }));
vi.mock("@/components/repair-results/HubRepairResultsSection", () => ({ default: () => null }));
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ back: vi.fn() })),
  notFound: vi.fn(),
}));
vi.mock("@/lib/api", () => ({
  fetchBrandModels: vi.fn().mockResolvedValue({ brand: { brand: "iPhone" } }),
  fetchRepairCatalog: vi.fn().mockResolvedValue({
    brands: [{
      category: "phone",
      brand: "iPhone",
      slug: "iphone",
      models: [{
        slug: "iphone-15",
        model: "iPhone 15",
        repairTypes: [{ slug: "screen-replacement", name: "Screen Replacement", price: 50 }],
      }],
    }],
  }),
}));
vi.mock("@/components/seo/ServiceAreas", () => ({ default: () => <section>Local coverage</section> }));
vi.mock("next/image", () => ({
  default: () => <span data-next-image="true" />,
}));
vi.mock("next/link", () => ({
  default: ({ children, href, prefetch, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string; prefetch?: boolean }) => {
    void prefetch;
    return <a href={href} {...props}>{children}</a>;
  },
}));

describe("PublicLayout footer", () => {
  it("remains the sole owner of the main landmark for public page content", () => {
    render(<PublicLayout><section aria-label="Category hub content">Phone hub</section></PublicLayout>);

    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("main")).toHaveTextContent("Phone hub");
  });

  it("keeps the Repairs hub inside the PublicLayout main landmark", () => {
    render(<PublicLayout><RepairsHubPage /></PublicLayout>);

    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("main")).toContainElement(screen.getByRole("heading", { level: 1, name: "Device Repair Services" }));
  });

  it("keeps the iPhone Brand Hub inside the PublicLayout's sole main landmark", async () => {
    const page = await BrandHubPage({ params: Promise.resolve({ category: "phone", brand: "iphone" }) });

    render(<PublicLayout>{page}</PublicLayout>);

    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("main")).toContainElement(screen.getByRole("heading", { level: 1, name: "iPhone Repair" }));
  });

  it("renders the standard-repairs warranty label without changing its trust strip", () => {
    render(<PublicLayout><div>Page content</div></PublicLayout>);

    const footer = screen.getByRole("contentinfo");
    const trustStrip = within(footer).getByLabelText("Repair promises");
    const warranty = within(trustStrip).getByText("6-Month Warranty on Standard Repairs");

    expect(warranty).toBeInTheDocument();
    expect(warranty.querySelector("svg")).toBeInTheDocument();
    expect(within(trustStrip).queryByText("180-Day Warranty")).not.toBeInTheDocument();
    expect(within(footer).queryByText(/180 Day|Comprehensive Warranty/i)).not.toBeInTheDocument();
    expect(within(trustStrip).getByText("No Fix, No Charge")).toBeInTheDocument();
    expect(trustStrip).toHaveClass("footer-trust-strip");
    expect(within(footer).getAllByRole("link", { name: "Book Repair" })).toHaveLength(2);
    within(footer).getAllByRole("link", { name: "Book Repair" }).forEach((link) => {
      expect(link).toHaveAttribute("href", "/book-repair");
    });
    expect(within(footer).getByRole("link", { name: "Call 0481 058 514" })).toHaveAttribute("href", "tel:0481058514");
    expect(within(footer).getByText("Mon-Sat, 9am-5pm")).toBeInTheDocument();
    expect(within(footer).queryByText("Mon-Sat, 10am-5pm")).not.toBeInTheDocument();
    expect(within(footer).getByText(/Book online to help us plan your repair visit. Walk-ins are also welcome; call for part availability before visiting./)).toBeInTheDocument();
    expect(within(footer).getByText("Book online to help us plan your repair visit. Walk-ins are also welcome.")).toBeInTheDocument();
    expect(within(footer).getByText("Contact our team to confirm repair options and request a quote.")).toBeInTheDocument();
    expect(within(footer).getByText(/Completed standard repairs include a 6-month warranty covering the replacement part and labour. Water-damage repairs are excluded./)).toBeInTheDocument();
    expect(footer.textContent).not.toMatch(/priority service|online bookings get priority|live quote support|warranty-backed workmanship/i);
  });
});
