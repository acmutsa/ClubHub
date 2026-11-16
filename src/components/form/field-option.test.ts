import { describe, expect, it } from "vitest";

import { matchesQuery, toFieldOptions } from "./field-option";

describe("toFieldOptions", () => {
  it("uses each value as its own label", () => {
    expect(toFieldOptions(["S", "M"])).toEqual([
      { value: "S", label: "S" },
      { value: "M", label: "M" },
    ]);
  });
});

describe("matchesQuery", () => {
  const option = { value: "US", label: "United States" };

  it("ignores case and surrounding spaces", () => {
    expect(matchesQuery(option, "  united ")).toBe(true);
  });

  it("matches anywhere in the label", () => {
    expect(matchesQuery(option, "states")).toBe(true);
  });

  it("rejects a label that does not contain the query", () => {
    expect(matchesQuery(option, "canada")).toBe(false);
  });

  it("matches everything for an empty query", () => {
    expect(matchesQuery(option, "")).toBe(true);
  });
});
