import type { AnchorHTMLAttributes, ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";

import PublicLayout from "./layout";

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
  });
});
