/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom";
import { cleanup, render, screen, within } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import RepairsHubPage, { metadata } from "./page";

vi.mock("next/image", () => ({
  default: () => <span data-next-image="true" />,
}));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));
vi.mock("@/components/ChatNowButton", () => ({ default: () => null }));
vi.mock("@/components/seo/ServiceAreas", () => ({ default: () => null }));

afterEach(() => {
  cleanup();
});

describe("RepairsHubPage privacy FAQs", () => {
  it("renders the two closed pre-repair privacy FAQs without adding schema", () => {
    render(<RepairsHubPage />);

    const passcodeQuestion = "Do I need to share my passcode for a repair?";
    const passcodeDisclosure = screen.getByText(passcodeQuestion).closest("details");
    expect(passcodeDisclosure).not.toBeNull();
    expect(passcodeDisclosure).not.toHaveAttribute("open");
    expect(within(passcodeDisclosure!).getByText(/Most repairs do not require your passcode/)).toBeInTheDocument();
    expect(within(passcodeDisclosure!).getByText(/we will ask first/)).toBeInTheDocument();
    expect(within(passcodeDisclosure!).getByText(/test the device with us in person/)).toBeInTheDocument();
    expect(within(passcodeDisclosure!).getByText(/do not browse your photos, messages or other personal content/i)).toBeInTheDocument();

    const backupQuestion = "Should I back up my device before repair?";
    const backupDisclosure = screen.getByText(backupQuestion).closest("details");
    expect(backupDisclosure).not.toBeNull();
    expect(backupDisclosure).not.toHaveAttribute("open");
    expect(within(backupDisclosure!).getByText(/recommend backing up your device/)).toBeInTheDocument();
    expect(within(backupDisclosure!).getByText(/data cannot be guaranteed/)).toBeInTheDocument();
    expect(within(backupDisclosure!).getByText(/Logic-board, liquid-damage, no-power and data-recovery work/)).toBeInTheDocument();

    expect(screen.getAllByText(passcodeQuestion)).toHaveLength(1);
    expect(screen.getAllByText(backupQuestion)).toHaveLength(1);
    expect(document.querySelector('script[type="application/ld+json"]')).toBeNull();
  });

  it("keeps the existing metadata and primary heading unchanged", () => {
    render(<RepairsHubPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Pick your device.Get a clean repair path." })).toBeInTheDocument();
    expect(metadata.title).toBe("Professional Device Repair Services in Ringwood | Ali Mobile");
    expect(metadata.alternates?.canonical).toBe("/repairs");
    expect(metadata.openGraph?.url).toBe("/repairs");
  });
});
