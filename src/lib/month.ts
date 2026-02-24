/**
 * Month utilities. We use UTC for all month boundaries.
 */

export function getCurrentMonth(): { year: number; month: number } {
  const now = new Date();
  return {
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1, // 1-12
  };
}

export function isCurrentMonth(year: number, month: number): boolean {
  const current = getCurrentMonth();
  return current.year === year && current.month === month;
}

export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function getPreviousMonth(
  year: number,
  month: number
): { year: number; month: number } {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }
  return { year, month: month - 1 };
}
