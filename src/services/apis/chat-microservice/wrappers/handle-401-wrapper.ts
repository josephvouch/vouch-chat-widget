import { isAxiosError } from 'axios'

import { doUserRefreshToken } from '../../../handlers/token-handler'

/**
 * Wraps an API call and retries once when the response is unauthorized (401).
 * Useful for endpoints that require the user to be registered before proceeding.
 */
export async function handle401Wrapper<T>(requestFn: () => Promise<T>): Promise<T> {
  try {
    return await requestFn()
  } catch (error) {
    if (!isUnauthorizedError(error)) {
      throw error
    }

    const refreshed = await doUserRefreshToken()

    if (!refreshed) {
      throw error
    }

    return await requestFn()
  }
}

function isUnauthorizedError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return error.response?.status === 401
  }

  if (typeof error === 'object' && error !== null) {
    const maybeStatus = (error as { status?: number }).status
    if (typeof maybeStatus === 'number') {
      return maybeStatus === 401
    }
  }

  return false
}
