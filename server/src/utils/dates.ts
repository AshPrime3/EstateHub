/**
 * Get the first day of the current month as a Date.
 */
export function getCurrentPaymentMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
}

/**
 * Check if the grace period for a given month has passed.
 */
export function isGracePeriodPassed(paymentMonth: Date, gracePeriodDays: number): boolean {
  const graceDeadline = new Date(paymentMonth);
  graceDeadline.setUTCDate(graceDeadline.getUTCDate() + gracePeriodDays);
  return new Date() > graceDeadline;
}

/**
 * Parse a date string (YYYY-MM-DD) into a UTC Date.
 */
export function parsePaymentMonth(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Get the start of the current week (Monday) in UTC.
 */
export function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
  return monday;
}

/**
 * Get the date 8 weeks ago from now.
 */
export function getEightWeeksAgo(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 56));
}
