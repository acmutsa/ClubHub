import { describe, expect, it } from "vitest";
import {  DEFAULT_TIME_ZONE } from "@/constants/time-zone";
import {
  formatDateInTimeZone,
  isValidTimeZone,
  resolveTimeZone,
} from "@/lib/time-zone";

describe("isValidTimeZone", () => {
  it("accepts IANA time zones", () => {
    expect(isValidTimeZone("America/New_York")).toBe(true);
    expect(isValidTimeZone("UTC")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isValidTimeZone("Not/AZone")).toBe(false);
    expect(isValidTimeZone("<script>")).toBe(false);
  });
});

describe("resolveTimeZone", () => {
  it("uses the cookie when it holds a valid time zone", () => {
    expect(resolveTimeZone("Asia/Tokyo")).toBe("Asia/Tokyo");
  });

  it("falls back when the cookie is missing or invalid", () => {
    expect(resolveTimeZone(undefined)).toBe(DEFAULT_TIME_ZONE);
    expect(resolveTimeZone(null)).toBe(DEFAULT_TIME_ZONE);
    expect(resolveTimeZone("")).toBe(DEFAULT_TIME_ZONE);
    expect(resolveTimeZone("Not/AZone")).toBe(DEFAULT_TIME_ZONE);
  });
});

describe("formatDateInTimeZone", () => {
  const lateEveningInChicago = new Date("2026-03-02T04:30:00Z");

  it("shows the date as it is in the given time zone", () => {
    expect(formatDateInTimeZone(lateEveningInChicago, "America/Chicago")).toBe("Mar 1, 2026");
    expect(formatDateInTimeZone(lateEveningInChicago, "UTC")).toBe("Mar 2, 2026");
  });
});
