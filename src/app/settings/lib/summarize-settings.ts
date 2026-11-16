import type { UpdateSettingsInput } from "../validators";

type Values = Partial<UpdateSettingsInput>;

const joinParts = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(" · ");

export const summarizePersonal = (v: Values) =>
  joinParts([v.firstName, v.lastName].filter(Boolean).join(" "), v.pronouns, v.phoneNumber);

export const summarizeSchool = (v: Values) => joinParts(v.major, v.school);

export const summarizeDemographics = (v: Values) => joinParts(v.gender, v.ethnicity);

export const summarizeNotifications = (v: Values) =>
  `Email ${v.eventAnnouncementEmail ? "on" : "off"} · Text ${v.eventAnnouncementPhone ? "on" : "off"}`;
