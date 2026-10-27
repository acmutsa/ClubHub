import { vi, beforeAll, afterAll, describe, expect, test } from "vitest";
import { signEventPassToken, readEventPassToken } from "./event-pass-token";

const raw = "8b9da1f1-97ea-494a-90d5-0e4bfb97c895"

beforeAll(() => {
  vi.stubEnv('EVENT_PASS_SECRET', 'test-secret-test-secret-changeme');
})

describe("event pass token", () => {
  test("round-trip", () => {
    expect(readEventPassToken(signEventPassToken(raw))).toBe(raw);
  })

  test("reject tampered raw token", () => {
    const [, sig] = signEventPassToken(raw).split(".");
    expect(readEventPassToken(`${raw.replace("8b", "9b")}.${sig}`)).toBeNull();
  })

  test("reject tampered signature", () => {
    const [, sig] = signEventPassToken(raw).split(".");
    expect(readEventPassToken(`${raw}.${sig}x`)).toBeNull();
  })

  test("rejects token signed with another secret", () => {
    const signed = signEventPassToken(raw);
    vi.stubEnv('EVENT_PASS_SECRET', 'test-secret-test-secret-changeme!');
    expect(readEventPassToken(signed)).toBeNull();
    vi.stubEnv('EVENT_PASS_SECRET', 'test-secret-test-secret-changeme');
  })
})

afterAll(() => {
  vi.unstubAllEnvs();
})


