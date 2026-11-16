import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: mocks.headers }));

import { getRequestIpAddress } from "./get-request-ip-address";

function mockRequestHeaders(init: Record<string, string>) {
  mocks.headers.mockResolvedValue(new Headers(init));
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("getRequestIpAddress", () => {
  it("returns the client from a single x-forwarded-for entry", async () => {
    mockRequestHeaders({ "x-forwarded-for": "203.0.113.5" });
    expect(await getRequestIpAddress()).toBe("203.0.113.5");
  });

  it("returns the first entry of an x-forwarded-for proxy chain", async () => {
    mockRequestHeaders({ "x-forwarded-for": "203.0.113.5, 10.0.0.1, 10.0.0.2" });
    expect(await getRequestIpAddress()).toBe("203.0.113.5");
  });

  it("trims whitespace around the first x-forwarded-for entry", async () => {
    mockRequestHeaders({ "x-forwarded-for": "  203.0.113.5  ,10.0.0.1" });
    expect(await getRequestIpAddress()).toBe("203.0.113.5");
  });

  it("prefers x-forwarded-for over x-real-ip", async () => {
    mockRequestHeaders({
      "x-forwarded-for": "203.0.113.5",
      "x-real-ip": "198.51.100.7",
    });
    expect(await getRequestIpAddress()).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip when x-forwarded-for is missing", async () => {
    mockRequestHeaders({ "x-real-ip": "198.51.100.7" });
    expect(await getRequestIpAddress()).toBe("198.51.100.7");
  });

  it("falls back to x-real-ip when the first x-forwarded-for entry is empty", async () => {
    mockRequestHeaders({ "x-forwarded-for": " , 10.0.0.1", "x-real-ip": "198.51.100.7" });
    expect(await getRequestIpAddress()).toBe("198.51.100.7");
  });

  it("returns null when no IP header is present", async () => {
    mockRequestHeaders({});
    expect(await getRequestIpAddress()).toBeNull();
  });
});
