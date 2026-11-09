const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

export function getYearOfStudy(expectedGraduationDate: Date, now: Date) {
  const yearsUntilGraduation = (expectedGraduationDate.getTime() - now.getTime()) / MS_PER_YEAR;

  if (yearsUntilGraduation < 0) return "Graduated";
  if (yearsUntilGraduation <= 1) return "Senior";
  if (yearsUntilGraduation <= 2) return "Junior";
  if (yearsUntilGraduation <= 3) return "Sophomore";
  return "Freshman";
}
