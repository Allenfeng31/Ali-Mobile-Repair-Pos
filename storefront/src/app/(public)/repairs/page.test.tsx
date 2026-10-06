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
vi.mock("@/components/seo/ServiceAreas", () => ({
  default: () => <section data-testid="service-areas">Local coverage</section>,
}));

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

  it("keeps metadata while using a semantic Device Repair Services heading", () => {
    render(<RepairsHubPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Device Repair Services" })).toBeInTheDocument();
    expect(screen.getByText(/Pick your device\. Get a clean repair path\./)).toBeInTheDocument();
    expect(screen.getByText(/provided from Ringwood Square for customers across Melbourne's eastern suburbs/i)).toBeInTheDocument();
    expect(metadata.title).toBe("Professional Device Repair Services in Ringwood | Ali Mobile");
    expect(metadata.alternates?.canonical).toBe("/repairs");
    expect(metadata.openGraph?.url).toBe("/repairs");
  });

  it("keeps the hub chooser, policy wording, and phone timing guidance scoped to approved facts", () => {
    render(<RepairsHubPage />);

    expect(screen.getByTestId("service-areas")).toBeInTheDocument();

    const phoneCard = screen.getByRole("link", { name: /Phone Repair/i });
    expect(phoneCard).toHaveAttribute("href", "/repairs/phone");
    expect(within(phoneCard).getByText("15–60 Minutes")).toBeInTheDocument();

    const tabletCard = screen.getByRole("link", { name: /Tablet & iPad Repair/i });
    expect(tabletCard).toHaveAttribute("href", "/repairs/tablet");
    expect(within(tabletCard).getByText("1–2 Hours")).toBeInTheDocument();

    const laptopCard = screen.getByRole("link", { name: /Laptop & MacBook Repair/i });
    expect(laptopCard).toHaveAttribute("href", "/repairs/laptop");
    expect(within(laptopCard).getByText("1–2 Hours")).toBeInTheDocument();
    expect(within(laptopCard).queryByText("Fast turnaround")).not.toBeInTheDocument();

    const watchCard = screen.getByRole("link", { name: /Smart Watch Repair/i });
    expect(watchCard).toHaveAttribute("href", "/repairs/watch");
    expect(within(watchCard).getByText("30–60 Minutes")).toBeInTheDocument();
    expect(within(watchCard).queryByText("2-4 hrs")).not.toBeInTheDocument();

    expect(screen.queryByText("6 mo")).not.toBeInTheDocument();
    expect(screen.queryByText("Warranty on Repairs")).not.toBeInTheDocument();
    expect(screen.getByText("6-Month")).toBeInTheDocument();
    expect(screen.getByText("Warranty on Standard Repairs")).toBeInTheDocument();

    const timingDisclosure = screen.getByText("How long does a phone repair usually take?").closest("details");
    expect(timingDisclosure).not.toBeNull();
    expect(within(timingDisclosure!).getByText(/15–60 minutes/i)).toBeInTheDocument();
    expect(within(timingDisclosure!).getByText(/model, repair type, part availability, device condition and current workload/i)).toBeInTheDocument();
    expect(within(timingDisclosure!).getByText(/Choose your phone model for more specific repair information/i)).toBeInTheDocument();
    expect(within(timingDisclosure!).queryByText(/80%|same day/i)).not.toBeInTheDocument();
  });
});
