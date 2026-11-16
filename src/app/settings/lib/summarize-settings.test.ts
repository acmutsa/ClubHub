import { describe, expect, it } from "vitest";

import {
  summarizeDemographics,
  summarizeNotifications,
  summarizePersonal,
  summarizeSchool,
} from "./summarize-settings";

describe("summarizePersonal", () => {
  it("joins name, pronouns and phone", () => {
    expect(summarizePersonal({ firstName: "Sarah", lastName: "Johnson", pronouns: "she/her", phoneNumber: "5125550123" })).toBe(
      "Sarah Johnson · she/her · 5125550123",
    );
  });

  it("skips fields that are empty", () => {
    expect(summarizePersonal({ firstName: "Sarah", lastName: "", pronouns: "" })).toBe("Sarah");
  });

  it("is empty when nothing is set", () => {
    expect(summarizePersonal({})).toBe("");
  });
});

describe("summarizeSchool", () => {
  it("lists major before school", () => {
    expect(summarizeSchool({ major: "Computer Science", school: "UTSA" })).toBe("Computer Science · UTSA");
  });
});

describe("summarizeDemographics", () => {
  it("lists gender and ethnicity", () => {
    expect(summarizeDemographics({ gender: "Female", ethnicity: "Asian" })).toBe("Female · Asian");
  });
});

describe("summarizeNotifications", () => {
  it("shows each channel as on or off", () => {
    expect(summarizeNotifications({ eventAnnouncementEmail: true, eventAnnouncementPhone: false })).toBe("Email on · Text off");
  });
});
