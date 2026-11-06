import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  headers: vi.fn(),
  findClub: vi.fn(),
  findMembership: vi.fn(),
  findRole: vi.fn(),
  findEvent: vi.fn(),
  findPass: vi.fn(),
  findCheckIn: vi.fn(),
  insertValues: vi.fn(),
  insertReturning: vi.fn(),
  updateSet: vi.fn(),
  updateReturning: vi.fn(),
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
  db: {
    query: {
      clubs: { findFirst: mocks.findClub },
      clubMemberships: { findFirst: mocks.findMembership },
      clubRoles: { findFirst: mocks.findRole },
      events: { findFirst: mocks.findEvent },
      eventPasses: { findFirst: mocks.findPass },
      checkIns: { findFirst: mocks.findCheckIn },
    },
    insert: () => ({
      values: (values: unknown) => {
        mocks.insertValues(values);
        return { onConflictDoNothing: () => ({ returning: mocks.insertReturning }) };
      },
    }),
    update: () => ({
      set: (values: unknown) => {
        mocks.updateSet(values);
        return { where: () => ({ returning: mocks.updateReturning }) };
      },
    }),
  },
}));

import { Permission } from "@/constants/permissions";
import { ActionErrorCode } from "@/constants/action-error-code";
import { createEventPassAction, scanEventPassAction } from "./actions";
import { readEventPassToken, signEventPassToken } from "./lib/event-pass-token";

const EVENT_ID = "3f1b1c2e-5a4d-4e6f-8a7b-9c0d1e2f3a4b";
const OTHER_EVENT_ID = "5d2e8f4a-6b7c-4d8e-9f0a-1b2c3d4e5f60";
const MEMBER_ID = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
const PASS_ID = "0b8c7e2a-1d3f-4a5b-9c6d-7e8f9a0b1c2d";
const RAW_TOKEN = "8b9da1f1-97ea-494a-90d5-0e4bfb97c895";
const CHECK_IN_ID = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

const HOUR = 3600000;

const event = (overrides = {}) => ({
  id: EVENT_ID,
  clubId: "club-1",
  checkinStartsAt: new Date(Date.now() - HOUR),
  checkinEndsAt: new Date(Date.now() + HOUR),
  ...overrides,
});

const pass = (overrides = {}) => ({
  id: PASS_ID,
  token: RAW_TOKEN,
  userId: MEMBER_ID,
  clubId: "club-1",
  eventId: EVENT_ID,
  checkInId: null,
  createdAt: new Date(),
  usedAt: null,
  expiryDate: new Date(Date.now() + HOUR),
  ...overrides,
});

const asRole = (...permissions: Permission[]) =>
  mocks.findRole.mockResolvedValue({ id: "role-1", name: "STAFF", permissions });


let signedToken: string;
beforeAll(() => {
  vi.stubEnv('EVENT_PASS_SECRET', 'test-secret-test-secret-changeme');
  signedToken = signEventPassToken(RAW_TOKEN);
});

beforeEach(() => {
  vi.resetAllMocks();
  mocks.headers.mockResolvedValue(new Headers({ "x-app-scope": "club", "x-club-slug": "acm" }));
  mocks.getCurrentUser.mockResolvedValue({ id: "user-1" });
  mocks.findClub.mockResolvedValue({ id: "club-1", slug: "acm" });
  mocks.findMembership.mockResolvedValue({ id: "membership-1", roleId: "role-1" });
  mocks.findEvent.mockResolvedValue(event());
  mocks.findPass.mockResolvedValue(pass());
  mocks.insertReturning.mockResolvedValue([{ id: CHECK_IN_ID }]);
  mocks.updateReturning.mockResolvedValue([{ id: PASS_ID }]);
});

describe("createEventPassAction", () => {
  const create = () => createEventPassAction({ eventId: EVENT_ID });
  beforeEach(() => asRole(Permission.EVENTS_VIEW));

  it("creates a pass on the first request and returns a signed token", async () => {
    const created = pass();
    mocks.insertReturning.mockResolvedValue([created]);

    const result = await create();
    if (!result.ok) {
      throw new Error("expected success");
    }

    expect(result.data).toMatchObject({ eventId: EVENT_ID, used: false, expiryDate: created.expiryDate });
    expect(readEventPassToken(result.data.token)).toBe(RAW_TOKEN);
  });

  it("returns the existing pass if create is called again", async () => {
    mocks.insertReturning.mockResolvedValue([]);
    mocks.findPass.mockResolvedValue(pass({ usedAt: new Date() }));

    const result = await create();
    if (!result.ok) {
      throw new Error("expected success");
    }

    expect(result.data.used).toBe(true);
    expect(readEventPassToken(result.data.token)).toBe(RAW_TOKEN);
  });

  it("returns NOT_FOUND when the event is not in this club", async () => {
    mocks.findEvent.mockResolvedValue(undefined);
    expect(await create()).toMatchObject({ ok: false, error: { code: ActionErrorCode.NOT_FOUND } });
    expect(mocks.insertValues).not.toHaveBeenCalled();
  });

  it("returns FORBIDDEN for a user who is not in the club", async () => {
    mocks.findMembership.mockResolvedValue(undefined);
    expect(await create()).toMatchObject({ ok: false, error: { code: ActionErrorCode.FORBIDDEN } });
    expect(mocks.insertValues).not.toHaveBeenCalled();
  });

  it("returns FORBIDDEN when the role cannot view events", async () => {
    asRole();
    expect(await create()).toMatchObject({ ok: false, error: { code: ActionErrorCode.FORBIDDEN } });
    expect(mocks.insertValues).not.toHaveBeenCalled();
  });
});

describe("scanEventPassAction", () => {
  const scan = (token = signedToken) => scanEventPassAction({ eventId: EVENT_ID, token });
  beforeEach(() => asRole(Permission.EVENTS_CHECK_IN));

  it("checks the member in, credits the scanner, and marks the pass used", async () => {
    expect(await scan()).toEqual({ ok: true, data: { checkInId: CHECK_IN_ID } });
    expect(mocks.insertValues).toHaveBeenCalledWith({
      clubId: "club-1",
      eventId: EVENT_ID,
      userId: MEMBER_ID,
      checkedInById: "user-1",
    });
    expect(mocks.updateSet).toHaveBeenCalledWith({ usedAt: expect.any(Date), checkInId: CHECK_IN_ID });
  });

  it("does not record a second check-in for a used pass", async () => {
    mocks.findPass.mockResolvedValue(pass({ usedAt: new Date() }));
    await scan();
    expect(mocks.insertValues).not.toHaveBeenCalled();
  });

  it("returns FORBIDDEN after the check-in window closes", async () => {
    mocks.findEvent.mockResolvedValue(event({ checkinStartsAt: new Date(Date.now() - 2 * HOUR), checkinEndsAt: new Date(Date.now() - HOUR) }));
    expect(await scan()).toMatchObject({ ok: false, error: { code: ActionErrorCode.FORBIDDEN, message: expect.stringContaining("closed") } });
    expect(mocks.insertValues).not.toHaveBeenCalled();
  });

  it("returns FORBIDDEN before the check-in window opens", async () => {
    mocks.findEvent.mockResolvedValue(event({ checkinStartsAt: new Date(Date.now() + HOUR), checkinEndsAt: new Date(Date.now() + 2 * HOUR) }));
    expect(await scan()).toMatchObject({ ok: false, error: { code: ActionErrorCode.FORBIDDEN, message: expect.stringContaining("not yet open") } });
    expect(mocks.insertValues).not.toHaveBeenCalled();
  });

  it("returns FORBIDDEN for a pass that belongs to a different event", async () => {
    mocks.findPass.mockResolvedValue(pass({ eventId: OTHER_EVENT_ID }));
    expect(await scan()).toMatchObject({ ok: false, error: { code: ActionErrorCode.FORBIDDEN } });
    expect(mocks.insertValues).not.toHaveBeenCalled();
  });

  it("returns NOT_FOUND when the event is not in this club", async () => {
    mocks.findEvent.mockResolvedValue(undefined);
    expect(await scan()).toMatchObject({ ok: false, error: { code: ActionErrorCode.NOT_FOUND } });
  });

  it("returns FORBIDDEN when the role cannot check members in", async () => {
    asRole(Permission.EVENTS_VIEW);
    expect(await scan()).toMatchObject({ ok: false, error: { code: ActionErrorCode.FORBIDDEN } });
    expect(mocks.findEvent).not.toHaveBeenCalled();
    expect(mocks.insertValues).not.toHaveBeenCalled();
  });

  it("returns FORBIDDEN for a user who is not in the club", async () => {
    mocks.findMembership.mockResolvedValue(undefined);
    expect(await scan()).toMatchObject({ ok: false, error: { code: ActionErrorCode.FORBIDDEN } });
    expect(mocks.findEvent).not.toHaveBeenCalled();
  });

  it("returns UNAUTHORIZED when signed out", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    expect(await scan()).toMatchObject({ ok: false, error: { code: ActionErrorCode.UNAUTHORIZED } });
  });
});

afterAll(() => {
  vi.unstubAllEnvs();
});
