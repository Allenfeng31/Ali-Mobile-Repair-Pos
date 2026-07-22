import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getRepairOptionIntent, sortRepairOptionsForDisplay } from "./repairOptionDisplayOrder";

type Option = { slug: string; name: string };

const option = (slug: string): Option => ({ slug, name: slug });

describe("sortRepairOptionsForDisplay", () => {
  it("resolves semantic intent from normalized slugs instead of display priorities", () => {
    const source = readFileSync(resolve(process.cwd(), "src/lib/repairOptionDisplayOrder.ts"), "utf8");
    const intentStart = source.indexOf("export function getRepairOptionIntent");
    const intentEnd = source.indexOf("\n}\n\nexport function sortRepairOptionsForDisplay", intentStart) + 2;
    const intentFunction = source.slice(intentStart, intentEnd);

    expect(source).toContain("REPAIR_OPTION_INTENT_BY_SLUG");
    expect(intentFunction).not.toContain("getRepairOptionPriority");
    expect(getRepairOptionIntent("  CAMERA-LENS-REPLACEMENT  ")).toBe("camera-lens");
    expect(getRepairOptionIntent("camera-repair")).toBe("generic");
    expect(getRepairOptionIntent("water-damage")).toBe("water-damage");
    expect(getRepairOptionIntent("water-damage-repair")).toBe("water-damage");
    expect(getRepairOptionIntent("water-damage-cleaning")).toBe("generic");
  });

  it("keeps camera-lens, back-camera and front-camera semantics distinct", () => {
    expect(getRepairOptionIntent("camera-lens-replacement")).toBe("camera-lens");
    expect(getRepairOptionIntent("back-camera-lens-replacement")).toBe("camera-lens");
    expect(getRepairOptionIntent("back-camera-replacement")).toBe("back-camera");
    expect(getRepairOptionIntent("front-camera-replacement")).toBe("front-camera");
  });

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
