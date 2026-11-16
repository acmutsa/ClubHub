import { describe, expect, it } from "vitest";

import { toLocalDate, toUtcDate } from "./calendar-date";

describe("calendar dates", () => {
  it("keeps the same calendar day when converting to local time", () => {
    const local = toLocalDate(new Date("2027-05-01T00:00:00.000Z"));
    expect([local.getFullYear(), local.getMonth(), local.getDate()]).toEqual([2027, 4, 1]);
  });

  it("stores a picked local day as UTC midnight", () => {
    expect(toUtcDate(new Date(2027, 4, 1)).toISOString()).toBe("2027-05-01T00:00:00.000Z");
  });

  it("round-trips", () => {
    const stored = new Date("2003-05-22T00:00:00.000Z");
    expect(toUtcDate(toLocalDate(stored)).getTime()).toBe(stored.getTime());
  });
});
