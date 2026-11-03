import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  findClub: vi.fn(),
  findMembership: vi.fn(),
  findRole: vi.fn(),
  headers: vi.fn(),
}));

vi.mock("react", () => ({ cache: <T>(fn: T) => fn }));
vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("next/navigation", () => ({
  forbidden: () => { throw new Error("FORBIDDEN"); },
  notFound: () => { throw new Error("NOT_FOUND"); },
}));
vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/auth/sign-in-redirect", () => ({
  redirectToSignIn: () => { throw new Error("SIGN_IN"); },
}));
vi.mock("@/db", () => ({
  db: { query: {
    clubs: { findFirst: mocks.findClub },
    clubMemberships: { findFirst: mocks.findMembership },
    clubRoles: { findFirst: mocks.findRole },
  } },
}));

import { Permission } from "@/constants/permissions";
import { ActionErrorCode } from "@/constants/action-error-code";
import { createSafeAction } from "@/lib/actions/create-safe-action";
import { getAuthContext, requireAuthContext } from "@/lib/auth/get-auth-context";
import { getClubContext, requireClubContext } from "./get-club-context";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.headers.mockResolvedValue(new Headers({ "x-app-scope": "club", "x-club-slug": "acm" }));
  mocks.getCurrentUser.mockResolvedValue({ id: "user-1" });
  mocks.findClub.mockResolvedValue({ id: "club-1", slug: "acm" });
  mocks.findMembership.mockResolvedValue({ id: "membership-1", roleId: "role-1" });
  mocks.findRole.mockResolvedValue({ id: "role-1", name: "MEMBER", permissions: [Permission.EVENTS_VIEW] });
});

describe("club context access", () => {
  it("returns null for a signed-out optional context without querying the database", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    expect(await getClubContext()).toBeNull();
    expect(await getAuthContext()).toBeNull();
    expect(mocks.findClub).not.toHaveBeenCalled();
  });

  it("redirects a signed-out required context before looking up a club", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    await expect(requireClubContext()).rejects.toThrow("SIGN_IN");
    await expect(requireAuthContext()).rejects.toThrow("SIGN_IN");
    expect(mocks.findClub).not.toHaveBeenCalled();
  });

  it("returns null outside club scope", async () => {
    mocks.headers.mockResolvedValue(new Headers({ "x-app-scope": "platform" }));
    expect(await getClubContext()).toBeNull();
    expect(mocks.findClub).not.toHaveBeenCalled();
  });

  it("looks up a subdomain club by its slug, skipping deleted clubs", async () => {
    await getClubContext();
    const { SQLiteSyncDialect } = await import("drizzle-orm/sqlite-core");
    const query = new SQLiteSyncDialect().sqlToQuery(mocks.findClub.mock.calls[0][0].where);
    expect(query.params).toEqual(["acm"]);
    expect(query.sql).toContain('"slug" = ?');
    expect(query.sql).toContain('"deleted_at" is null');
  });

  it("looks up a path club by its id, skipping deleted clubs", async () => {
    mocks.headers.mockResolvedValue(new Headers({ "x-app-scope": "club", "x-club-id": "club-1" }));
    await getClubContext();
    const { SQLiteSyncDialect } = await import("drizzle-orm/sqlite-core");
    const query = new SQLiteSyncDialect().sqlToQuery(mocks.findClub.mock.calls[0][0].where);
    expect(query.params).toEqual(["club-1"]);
    expect(query.sql).toContain('"id" = ?');
    expect(query.sql).toContain('"deleted_at" is null');
  });

  it("returns null in club scope when no club id or slug header is present", async () => {
    mocks.headers.mockResolvedValue(new Headers({ "x-app-scope": "club" }));
    expect(await getClubContext()).toBeNull();
    expect(mocks.findClub).not.toHaveBeenCalled();
  });

  it("returns null for a missing club, while required access returns not found", async () => {
    mocks.findClub.mockResolvedValue(undefined);
    expect(await getClubContext()).toBeNull();
    await expect(requireClubContext()).rejects.toThrow("NOT_FOUND");
    expect(mocks.findMembership).not.toHaveBeenCalled();
  });

  it("returns null for missing membership, while required access is forbidden", async () => {
    mocks.findMembership.mockResolvedValue(undefined);
    expect(await getClubContext()).toBeNull();
    await expect(requireClubContext()).rejects.toThrow("FORBIDDEN");
    expect(mocks.findRole).not.toHaveBeenCalled();
  });

  it("returns null for a missing role, while required access is forbidden", async () => {
    mocks.findRole.mockResolvedValue(undefined);
    expect(await getClubContext()).toBeNull();
    await expect(requireClubContext()).rejects.toThrow("FORBIDDEN");
  });

  it("looks up the membership role only within the current club", async () => {
    await getClubContext();
    const { SQLiteSyncDialect } = await import("drizzle-orm/sqlite-core");
    const query = new SQLiteSyncDialect().sqlToQuery(mocks.findRole.mock.calls[0][0].where);
    expect(query.params).toEqual(["role-1", "club-1"]);
  });

  it("retains the active, approved, non-deleted membership filters for this tenant and user", async () => {
    await getClubContext();
    const { SQLiteSyncDialect } = await import("drizzle-orm/sqlite-core");
    const query = new SQLiteSyncDialect().sqlToQuery(mocks.findMembership.mock.calls[0][0].where);
    expect(query.params).toEqual(["club-1", "user-1", "approved", "active"]);
    expect(query.sql).toContain('"deleted_at" is null');
  });

  it("returns member context and enforces permissions only when required", async () => {
    mocks.findRole.mockResolvedValue({ id: "role-1", name: "MEMBER", permissions: [Permission.EVENTS_VIEW, "invalid"] });
    mocks.headers.mockResolvedValue(new Headers({
      "x-app-scope": "club",
      "x-club-slug": "acm",
      "x-forwarded-for": "203.0.113.5, 10.0.0.1",
    }));
    const context = await requireClubContext();
    expect(context.clubId).toBe("club-1");
    expect(context.role.name).toBe("MEMBER");
    expect(context.ipAddress).toBe("203.0.113.5");
    expect(context.permissions).toEqual([Permission.EVENTS_VIEW]);
    expect(context.hasPermission(Permission.EVENTS_CREATE)).toBe(false);
    expect(() => context.requirePermission(Permission.EVENTS_CREATE)).toThrow("FORBIDDEN");
    expect(() => context.requirePermission(Permission.EVENTS_VIEW)).not.toThrow();
  });
});

describe("club safe action failures", () => {
  const handler = vi.fn(async () => "saved");
  const action = createSafeAction({ schema: z.object({}), permission: Permission.EVENTS_VIEW }, handler);

  it.each([
    ["signed out", ActionErrorCode.UNAUTHORIZED],
    ["missing club", ActionErrorCode.NOT_FOUND],
    ["missing membership", ActionErrorCode.FORBIDDEN],
    ["missing role", ActionErrorCode.FORBIDDEN],
    ["missing permission", ActionErrorCode.FORBIDDEN],
  ])("returns a structured error for %s without invoking the handler", async (scenario, code) => {
    if (scenario === "signed out") mocks.getCurrentUser.mockResolvedValue(null);
    if (scenario === "missing club") mocks.findClub.mockResolvedValue(undefined);
    if (scenario === "missing membership") mocks.findMembership.mockResolvedValue(undefined);
    if (scenario === "missing role") mocks.findRole.mockResolvedValue(undefined);
    if (scenario === "missing permission") mocks.findRole.mockResolvedValue({ id: "role-1", name: "MEMBER", permissions: [] });
    expect(await action({})).toMatchObject({ ok: false, error: { code } });
    expect(handler).not.toHaveBeenCalled();
  });

  it("runs the handler for an authorized member", async () => {
    expect(await action({})).toEqual({ ok: true, data: "saved" });
  });
});
