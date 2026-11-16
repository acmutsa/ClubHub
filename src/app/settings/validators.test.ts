import { describe, expect, it } from "vitest";
import { updateSettingsSchema } from "./validators";

const valid = {
  firstName: "Sarah",
  lastName: "Johnson",
  phoneNumber: "5125550123",
  pronouns: "she/her",
  birthDate: new Date("2003-05-22T00:00:00.000Z"),
  school: undefined as unknown,
  expectedGraduationDate: new Date("2020-05-15T00:00:00.000Z"),
  major: undefined as unknown,
  country: "US",
  race: [] as string[],
  gender: undefined as unknown,
  ethnicity: undefined as unknown,
  shirtSize: undefined as unknown,
  eventAnnouncementEmail: true,
  eventAnnouncementPhone: false,
};

function fieldsWithErrors(input: object) {
  const result = updateSettingsSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => String(issue.path[0]));
}

describe("updateSettingsSchema", () => {
  it("rejects a phone number that is not 10 digits", () => {
    expect(fieldsWithErrors({ ...valid, phoneNumber: "+1-512-555-0123" })).toContain("phoneNumber");
  });

  it("does not flag a past graduation date", () => {
    expect(fieldsWithErrors(valid)).not.toContain("expectedGraduationDate");
  });

  it("rejects a birth date in the future", () => {
    expect(fieldsWithErrors({ ...valid, birthDate: new Date("2999-01-01") })).toContain("birthDate");
  });

  it("requires at least one race option", () => {
    expect(fieldsWithErrors(valid)).toContain("race");
  });
});
