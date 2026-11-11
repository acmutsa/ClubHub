import { describe, expect, it } from "vitest";

import { getYearOfStudy } from "./get-year-of-study";

const now = new Date("2026-11-01T00:00:00Z");

describe("getYearOfStudy", () => {
  it.each([
    ["2026-05-01", "Graduated"],
    ["2027-05-01", "Senior"],
    ["2028-05-01", "Junior"],
    ["2029-05-01", "Sophomore"],
    ["2030-05-01", "Freshman"],
  ])("graduating %s is %s", (graduation, expected) => {
    expect(getYearOfStudy(new Date(`${graduation}T00:00:00Z`), now)).toBe(expected);
  });

  it("treats exactly one year out as a senior", () => {
    expect(getYearOfStudy(new Date(now.getTime() + 365.25 * 24 * 60 * 60 * 1000), now)).toBe("Senior");
  });
});
