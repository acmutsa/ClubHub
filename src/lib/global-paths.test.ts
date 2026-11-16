import { describe, expect, it } from "vitest";

import { getRootHost, isGlobalPath } from "@/lib/global-paths";

describe("isGlobalPath", () => {
  it("matches global pages and their subpaths", () => {
    expect(isGlobalPath("/profile")).toBe(true);
    expect(isGlobalPath("/settings")).toBe(true);
    expect(isGlobalPath("/settings/notifications")).toBe(true);
  });

  it("ignores club pages and lookalike paths", () => {
    expect(isGlobalPath("/")).toBe(false);
    expect(isGlobalPath("/events")).toBe(false);
    expect(isGlobalPath("/profiles")).toBe(false);
  });
});

describe("getRootHost", () => {
  it("drops the club subdomain on localhost", () => {
    expect(getRootHost("acm.localhost:3000", "localhost:3000")).toBe("localhost:3000");
  });

  it("drops the club subdomain on a real domain", () => {
    expect(getRootHost("acm.clubs.example.com", "localhost:3000")).toBe("clubs.example.com");
  });

  it("keeps the port", () => {
    expect(getRootHost("acm.clubs.example.com:8443", "localhost:3000")).toBe("clubs.example.com:8443");
  });
});
