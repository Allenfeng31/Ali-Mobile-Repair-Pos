/** @vitest-environment jsdom */
/* eslint-disable @next/next/no-img-element */
import "@testing-library/jest-dom";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import RingwoodSquareMapViewer from "./RingwoodSquareMapViewer";

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    <img src={typeof src === "string" ? src : undefined} alt={alt} {...props} />
  ),
}));

const viewerProps = {
  src: "/images/ali-mobile-repair-ringwood-square-location-map.webp",
  alt: "Ali Mobile & Repair location map inside Ringwood Square Shopping Centre showing Coles and Bunnings entrances",
  sizes: "(max-width: 768px) 100vw, 1152px",
};

beforeEach(() => {
  document.body.style.overflow = "auto";
});

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

describe("RingwoodSquareMapViewer", () => {
  it("opens in-page, locks scrolling, and closes by button, Escape, or backdrop while preserving image clicks", async () => {
    render(<RingwoodSquareMapViewer {...viewerProps} />);

    const trigger = screen.getByRole("button", { name: "Open location map" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Location map viewer" });
    const closeButton = screen.getByRole("button", { name: "Close location map" });
    expect(document.body.style.overflow).toBe("hidden");
    await waitFor(() => expect(closeButton).toHaveFocus());

    fireEvent.click(screen.getByTestId("location-map-zoom-surface"));
    expect(screen.getByRole("dialog", { name: "Location map viewer" })).toBeInTheDocument();

    fireEvent(dialog, new Event("cancel", { bubbles: true, cancelable: true }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(document.body.style.overflow).toBe("auto");
    expect(trigger).toHaveFocus();

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("dialog", { name: "Location map viewer" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Close location map" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("keeps zoom within 1–4, resets after close, and handles pinch pointer cleanup", async () => {
    render(<RingwoodSquareMapViewer {...viewerProps} />);
    const trigger = screen.getByRole("button", { name: "Open location map" });
    fireEvent.click(trigger);

    const surface = screen.getByTestId("location-map-zoom-surface");
    expect(surface).toHaveAttribute("data-scale", "1");
    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    expect(surface).toHaveAttribute("data-scale", "1");

    for (let click = 0; click < 8; click += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    }
    expect(surface).toHaveAttribute("data-scale", "4");
    fireEvent.click(screen.getByRole("button", { name: "Reset zoom" }));
    expect(surface).toHaveAttribute("data-scale", "1");

    fireEvent.pointerDown(surface, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerDown(surface, { pointerId: 2, clientX: 20, clientY: 0 });
    fireEvent.pointerMove(surface, { pointerId: 2, clientX: 80, clientY: 0 });
    expect(Number(surface.getAttribute("data-scale"))).toBeGreaterThan(1);
    fireEvent.pointerUp(surface, { pointerId: 2, clientX: 80, clientY: 0 });
    fireEvent.pointerUp(surface, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerDown(surface, { pointerId: 3, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(surface, { pointerId: 3, clientX: 40, clientY: 20 });
    expect(surface.querySelector("img")).toHaveStyle("transform: translate3d(70px, 20px, 0) scale(4)");
    fireEvent.pointerCancel(surface, { pointerId: 3, clientX: 40, clientY: 20 });

    fireEvent.click(screen.getByRole("button", { name: "Close location map" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.click(trigger);
    expect(screen.getByTestId("location-map-zoom-surface")).toHaveAttribute("data-scale", "1");
  });
});
