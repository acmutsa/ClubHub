import { describe, expect, it } from "vitest";

import { formatRoleName } from "./format-role-name";

describe("formatRoleName", () => {
  it("turns an uppercase role into sentence case", () => {
    expect(formatRoleName("OWNER")).toBe("Owner");
  });

  it("replaces underscores with spaces", () => {
    expect(formatRoleName("VICE_PRESIDENT")).toBe("Vice president");
  });

  it("collapses repeated underscores and spaces", () => {
    expect(formatRoleName("  SOCIAL__MEDIA   CHAIR ")).toBe("Social media chair");
  });

  it("returns an empty string for an empty role", () => {
    expect(formatRoleName("")).toBe("");
  });
});
