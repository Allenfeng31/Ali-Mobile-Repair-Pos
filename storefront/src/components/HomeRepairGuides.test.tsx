import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    prefetch,
    ...props
  }: {
    children: ReactNode;
    href: string;
    prefetch?: boolean;
  }) => (
    <a href={href} data-prefetch={String(prefetch)} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt, src, ...props }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} {...props} />
  ),
}));

const { default: HomeRepairGuides } = await import("./HomeRepairGuides");

describe("HomeRepairGuides", () => {
  it("renders the approved repair guides in crawlable server HTML", () => {
    const markup = renderToStaticMarkup(<HomeRepairGuides />);

    expect(markup.match(/<h2(?:\s|>)/g)).toHaveLength(1);
    expect(markup.match(/<h3(?:\s|>)/g)).toHaveLength(5);
    expect(markup).toContain("Repair Tips &amp; Guides");
    expect(markup).toContain(
      "Helpful advice from our Ringwood repair team on charging problems, screen repair costs and repair options.",
    );

    const expectedGuides = [
      {
        title: "Why Is My Phone Not Charging?",
        summary:
          "Explore common charging faults, safe first steps and when professional repair may be needed.",
        href: "/blog/why-is-my-phone-not-charging",
        image: "/images/blog/why-is-my-phone-not-charging.webp",
        alt: "Phone on a repair bench while a technician inspects a dusty charging port",
      },
      {
        title: "How Much Does iPhone Screen Repair Cost?",
        summary:
          "Compare screen replacement prices and understand LCD, Soft OLED and Original Screen options.",
        href: "/blog/how-much-does-iphone-screen-repair-cost-australia",
        image: "/images/blog/iphone-screen-repair-cost/iphone-screen-comparison.jpg",
        alt: "Side-by-side comparison of LCD in-cell, Soft OLED and Original iPhone screens",
      },
      {
        title: "MacBook Screen Repair: Prices &amp; Process",
        summary:
          "See MacBook Air screen prices, complete display assembly replacement details and real repair results.",
        href: "/blog/macbook-screen-repair-ringwood",
        image: "/images/blog/macbook-screen-repair/cover.webp",
        alt: "MacBook Air showing a working display after complete screen assembly replacement",
      },
      {
        title: "When Should You Replace Your iPhone Battery?",
        summary:
          "Learn what iPhone Battery Health really means, when battery replacement makes sense and how common battery problems are assessed.",
        href: "/blog/when-should-you-replace-iphone-battery",
        image: "/images/blog/iphone-battery-replacement-repair-assistant.webp",
        alt: "iPhone showing Battery Health beside a replacement battery on a repair workbench",
      },
      {
        title: "How Much Does Samsung Screen Replacement Cost?",
        summary:
          "Compare Samsung Galaxy S screen replacement prices and understand Service Pack and aftermarket display options.",
        href: "/blog/how-much-does-samsung-galaxy-s-screen-replacement-cost-australia",
        image:
          "/images/blog/samsung-screen-repair-cost/samsung-galaxy-s-screen-replacement-cost-guide.webp",
        alt: "Samsung Galaxy S phones on a repair bench showing a damaged display, working display and screen assembly",
      },
    ];

    for (const guide of expectedGuides) {
      expect(markup).toContain(guide.title);
      expect(markup).toContain(guide.summary);
      expect(markup).toContain(`href="${guide.href}"`);
      expect(markup).toContain(`src="${guide.image}"`);
      expect(markup).toContain(`alt="${guide.alt}"`);
    }

    expect(markup.match(/data-prefetch="false"/g)).toHaveLength(6);
    expect(markup.match(/loading="lazy"/g)).toHaveLength(5);
    expect(markup.match(/width="320" height="180"/g)).toHaveLength(5);
    expect(markup).toContain('href="/blog"');
    expect(markup).toContain("View All Repair Guides");
  });
});
