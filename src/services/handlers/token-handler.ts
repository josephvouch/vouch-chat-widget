import { useUsersStore } from '../../stores/users'
import { tokenModule } from '../apis/chat-microservice/token-module'
import { initSocketClient } from '../socket'

/**
 * Refresh token for an already registered user.
 * Returns true if both identifiers exist and refresh succeeds.
 */
export async function doUserRefreshToken(): Promise<boolean> {
  try {
    const usersStore = useUsersStore()
    const existingCustomerId = usersStore.customerId
    const existingSessionId = usersStore.sessionId

    if (!existingCustomerId || !existingSessionId) {
      return false
    }

    await tokenModule.refreshToken({
      customerId: existingCustomerId,
      sessionId: existingSessionId,
    })

    initSocketClient()

    return true
  } catch (error) {
    console.error('[token-handler] Failed to refresh user token:', error)
    return false
  }
}
