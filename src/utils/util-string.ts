/**
 * String Utility Functions
 */

/**
 * Generate a random alphanumeric string
 * @param length - Length of the string to generate
 * @returns Random string with uppercase, lowercase, and numbers
 */
export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }

  return result
}

/**
 * Generate a 16-character random customer code
 * @returns 16-character random alphanumeric string
 */
export function generateCustomerCode(): string {
  return generateRandomString(16)
}
