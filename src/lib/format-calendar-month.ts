export function formatCalendarMonth(date: Date) {
  return date.toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "short" });
}
