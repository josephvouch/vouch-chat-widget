/**
 * Timezone Utility Functions
 */

/**
 * Get the user's timezone offset in hours
 * @returns Timezone offset in hours (e.g., 7 for UTC+7, -5 for UTC-5)
 */
export function getUserTimezoneOffset(): number {
  const offsetMinutes = new Date().getTimezoneOffset()
  // getTimezoneOffset returns negative for UTC+ and positive for UTC-
  // We need to invert it to get the standard UTC offset
  const offsetHours = -offsetMinutes / 60
  return offsetHours
}

/**
 * Get the user's timezone name
 * @returns Timezone name (e.g., "Asia/Bangkok", "America/New_York")
 */
export function getUserTimezoneName(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (error) {
    // Fallback if Intl API is not available
    return 'UTC'
  }
}
