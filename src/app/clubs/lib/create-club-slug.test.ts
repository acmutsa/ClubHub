import { describe, expect, it } from "vitest";
import { createClubSlug } from "./create-club-slug";

describe("createClubSlug", () => {
  it.each([
    [" ACM UTSA ", "acm-utsa"],
    ["ACM & Friends!!", "acm-friends"],
    ["Club---Hub", "club-hub"],
    ["", ""],
    ["!!!", ""],
  ])("converts %j into %j", (name, expected) => {
    expect(createClubSlug(name)).toBe(expected);
  });

  it("caps the base slug so the action can append a collision suffix", () => {
    expect(createClubSlug("A".repeat(100))).toBe("a".repeat(48));
  });
});
