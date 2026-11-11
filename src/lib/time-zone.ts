import { cookies } from "next/headers";

import { DEFAULT_TIME_ZONE, TIME_ZONE_COOKIE } from "@/constants/time-zone";

export function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function resolveTimeZone(cookieValue: string | null | undefined) {
  return cookieValue && isValidTimeZone(cookieValue) ? cookieValue : DEFAULT_TIME_ZONE;
}

export async function getTimeZone() {
  const cookieStore = await cookies();
  return resolveTimeZone(cookieStore.get(TIME_ZONE_COOKIE)?.value);
}

export function formatDateInTimeZone(date: Date, timeZone: string) {
  return date.toLocaleDateString("en-US", { timeZone, year: "numeric", month: "short", day: "numeric" });
}
