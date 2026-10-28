import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUser } = vi.hoisted(() => ({ getCurrentUser: vi.fn() }));
vi.mock("react", () => ({ cache: <T>(fn: T) => fn }));
vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser }));
vi.mock("@/lib/auth/sign-in-redirect", () => ({
  redirectToSignIn: () => { throw new Error("SIGN_IN"); },
}));

import { getPlatformContext, requirePlatformContext } from "./get-platform-context";

beforeEach(() => vi.resetAllMocks());

describe("platform context access", () => {
  it("returns null for optional signed-out access", async () => {
    getCurrentUser.mockResolvedValue(null);
    expect(await getPlatformContext()).toBeNull();
  });

  it("redirects required signed-out access", async () => {
    getCurrentUser.mockResolvedValue(null);
    await expect(requirePlatformContext()).rejects.toThrow("SIGN_IN");
  });

  it.each(["ADMIN", "USER"])("returns the signed-in %s user's actual admin status", async (role) => {
    const user = { id: "user-1", role };
    getCurrentUser.mockResolvedValue(user);
    const expected = { user, isAdmin: role === "ADMIN" };
    expect(await getPlatformContext()).toEqual(expected);
    expect(await requirePlatformContext()).toEqual(expected);
  });
});
