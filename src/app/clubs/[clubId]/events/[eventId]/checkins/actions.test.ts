import { beforeEach, describe, expect, it, vi } from "vitest";

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
      checkIns: { findFirst: mocks.findCheckIn },
    },
    insert: () => ({
      values: (values: unknown) => {
        mocks.insertValues(values);
        return { onConflictDoNothing: () => ({ returning: mocks.insertReturning }) };
      },
    }),
  },
}));

import { Permission } from "@/constants/permissions";
import { ActionErrorCode } from "@/constants/action-error-code";
import { createCheckInAction } from "./actions";

const EVENT_ID = "3f1b1c2e-5a4d-4e6f-8a7b-9c0d1e2f3a4b";
const MEMBER_ID = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
const CHECK_IN_ID = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

const HOUR = 3600000;

const event = (overrides = {}) => ({
  id: EVENT_ID,
  clubId: "club-1",
  checkinStartsAt: new Date(Date.now() - HOUR),
  checkinEndsAt: new Date(Date.now() + HOUR),
  ...overrides,
});

const asRole = (...permissions: Permission[]) =>
  mocks.findRole.mockResolvedValue({ id: "role-1", name: "STAFF", permissions });

beforeEach(() => {
  vi.resetAllMocks();
  mocks.headers.mockResolvedValue(new Headers({ "x-app-scope": "club", "x-club-slug": "acm" }));
  mocks.getCurrentUser.mockResolvedValue({ id: "user-1" });
  mocks.findClub.mockResolvedValue({ id: "club-1", slug: "acm" });
  mocks.findMembership.mockResolvedValue({ id: "membership-1", roleId: "role-1" });
  mocks.findEvent.mockResolvedValue(event());
  mocks.insertReturning.mockResolvedValue([{ id: CHECK_IN_ID }]);
  asRole(Permission.EVENTS_CHECK_IN);
});

describe("createCheckInAction", () => {
  const checkIn = () => createCheckInAction({ userId: MEMBER_ID, eventId: EVENT_ID });
  it("records the member as checked in, returns the id of the user who checked them in", async () => {
    expect(await checkIn()).toEqual({ ok: true, data: { id: CHECK_IN_ID } });
    expect(mocks.insertValues).toHaveBeenCalledWith({
      clubId: "club-1",
      eventId: EVENT_ID,
      userId: MEMBER_ID,
      checkedInById: "user-1",
    });
  });

  it("returns the existing check-in if the member is already checked in", async () => {
    mocks.insertReturning.mockResolvedValue([]);
    mocks.findCheckIn.mockResolvedValue({ id: "existing-check-in" });
    expect(await checkIn()).toEqual({ ok: true, data: { id: "existing-check-in" } });
  });

  it("returns FORBIDDEN after the check-in window closes", async () => {
    mocks.findEvent.mockResolvedValue(event({ checkinStartsAt: new Date(Date.now() - 2 * HOUR), checkinEndsAt: new Date(Date.now() - HOUR) }));
    expect(await checkIn()).toMatchObject({ ok: false, error: { code: ActionErrorCode.FORBIDDEN, message: expect.stringContaining("closed") } });
    expect(mocks.insertValues).not.toHaveBeenCalled();
  });

  it("returns FORBIDDEN before the check-in window opens", async () => {
    mocks.findEvent.mockResolvedValue(event({ checkinStartsAt: new Date(Date.now() + HOUR), checkinEndsAt: new Date(Date.now() + 2 * HOUR) }));
    expect(await checkIn()).toMatchObject({ ok: false, error: { code: ActionErrorCode.FORBIDDEN, message: expect.stringContaining("not yet open") } });
    expect(mocks.insertValues).not.toHaveBeenCalled();
  });


  it("returns NOT_FOUND when the event is not in this club", async () => {
    mocks.findEvent.mockResolvedValue(undefined);
    expect(await checkIn()).toMatchObject({ ok: false, error: { code: ActionErrorCode.NOT_FOUND } });
  });

  it("returns FORBIDDEN when the role cannot check members in", async () => {
    asRole(Permission.EVENTS_VIEW);
    expect(await checkIn()).toMatchObject({ ok: false, error: { code: ActionErrorCode.FORBIDDEN } });
    expect(mocks.insertValues).not.toHaveBeenCalled();
  });

  it("returns FORBIDDEN for a user who is not in the club", async () => {
    mocks.findMembership.mockResolvedValue(undefined);
    expect(await checkIn()).toMatchObject({ ok: false, error: { code: ActionErrorCode.FORBIDDEN } });
    expect(mocks.findEvent).not.toHaveBeenCalled();
  });

  it("returns UNAUTHORIZED when signed out", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    expect(await checkIn()).toMatchObject({ ok: false, error: { code: ActionErrorCode.UNAUTHORIZED } });
  });
});

