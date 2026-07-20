import { describe, expect, it } from "vitest";
import { sortRepairOptionsForDisplay } from "./repairOptionDisplayOrder";

type Option = { slug: string; name: string };

const option = (slug: string): Option => ({ slug, name: slug });

describe("sortRepairOptionsForDisplay", () => {
  it("applies the complete requested repair-option sequence to shuffled services", () => {
    const options = [
      "logic-board-repair", "volume-button-replacement", "water-damage-repair",
      "back-camera-lens-replacement", "front-camera-replacement", "back-camera-replacement",
      "back-glass-replacement", "charging-port-replacement", "battery-replacement",
      "screen-replacement", "power-button-replacement", "earpiece-speaker-replacement",
      "loudspeaker-replacement",
    ].map(option);

    expect(sortRepairOptionsForDisplay(options).map(({ slug }) => slug)).toEqual([
      "screen-replacement", "battery-replacement", "charging-port-replacement",
      "back-glass-replacement", "back-camera-replacement", "front-camera-replacement",
      "back-camera-lens-replacement", "water-damage-repair", "loudspeaker-replacement",
      "earpiece-speaker-replacement", "power-button-replacement", "volume-button-replacement",
      "logic-board-repair",
    ]);
  });

  it("assigns existing aliases to their intended repair groups", () => {
    const options = [
      "logic-board-replacement", "earpiece-replacement", "loud-speaker-replacement",
      "water-damage-cleaning", "camera-lens-replacement", "front-camera-replacement",
      "back-housing-replacement", "charging-port-repair", "battery-repair",
      "screen-repair",
    ].map(option);

    expect(sortRepairOptionsForDisplay(options).map(({ slug }) => slug)).toEqual([
      "screen-repair", "battery-repair", "charging-port-repair", "back-housing-replacement",
      "front-camera-replacement", "camera-lens-replacement",
      "water-damage-cleaning", "loud-speaker-replacement", "earpiece-replacement",
      "logic-board-replacement",
    ]);
  });

  it("does not add missing repair options", () => {
    const options = [option("screen-replacement"), option("custom-service")];

    expect(sortRepairOptionsForDisplay(options)).toHaveLength(2);
    expect(sortRepairOptionsForDisplay(options).map(({ slug }) => slug)).toEqual([
      "screen-replacement", "custom-service",
    ]);
  });

  it("returns a sorted copy without mutating the source array", () => {
    const options = [option("battery-replacement"), option("screen-replacement")];
    const sorted = sortRepairOptionsForDisplay(options);

    expect(sorted).not.toBe(options);
    expect(options.map(({ slug }) => slug)).toEqual(["battery-replacement", "screen-replacement"]);
  });

  it("keeps unknown repair options after known groups in their original order", () => {
    const options = [option("diagnostic"), option("battery-replacement"), option("keyboard-repair"), option("screen-replacement")];

    expect(sortRepairOptionsForDisplay(options).map(({ slug }) => slug)).toEqual([
      "screen-replacement", "battery-replacement", "diagnostic", "keyboard-repair",
    ]);
  });

  it("treats generic camera-repair as an unclassified stable-tail option without mutating the source", () => {
    const options = [
      option("camera-repair"),
      option("battery-replacement"),
      option("diagnostic"),
      option("screen-replacement"),
      option("keyboard-repair"),
      option("logic-board-repair"),
    ];

    expect(sortRepairOptionsForDisplay(options).map(({ slug }) => slug)).toEqual([
      "screen-replacement", "battery-replacement", "logic-board-repair", "camera-repair", "diagnostic", "keyboard-repair",
    ]);
    expect(options.map(({ slug }) => slug)).toEqual([
      "camera-repair", "battery-replacement", "diagnostic", "screen-replacement", "keyboard-repair", "logic-board-repair",
    ]);
  });
});
