import { describe, expect, it } from "vitest";
import { formatCalendarMonth } from "@/lib/format-calendar-month";

describe("formatCalendarMonth", () => {
  it("shows the short month and year", () => {
    expect(formatCalendarMonth(new Date("2027-05-15T00:00:00Z"))).toBe("May 2027");
  });

  it("keeps a UTC-midnight date in its own month", () => {
    expect(formatCalendarMonth(new Date("2027-05-01T00:00:00Z"))).toBe("May 2027");
  });
});
