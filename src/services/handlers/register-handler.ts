import { useUsersStore } from '../../stores/users'
import { getRecaptchaToken } from '../../utils/util-recaptcha'
import { generateCustomerCode } from '../../utils/util-string'
import { getUserTimezoneOffset } from '../../utils/util-timezone'
import { registerModule } from '../apis/chat-microservice/register-module'
import type { IRegisterWidgetRequest } from '../apis/chat-microservice/types'
import { initSocketClient } from '../socket'

/**
 * Register user with the chat widget
 * Generates customer code, gets timezone, calls API, and stores customer ID
 * @param customerId - Optional existing customer identifier to reuse
 * @returns Promise<boolean> - Returns true if registration is successful
 */
export async function doUserRegister(customerId: string | null = null): Promise<boolean> {
  try {
    const usersStore = useUsersStore()
    // Generate customer code (16 character random string)
    const customerGeneratedCode = generateCustomerCode()

    // Get user timezone offset and recaptcha token
    const customerTimezone = getUserTimezoneOffset()
    const recaptchaToken = await getRecaptchaToken('register')

    // Prepare payload for register API
    const payload: IRegisterWidgetRequest = {
      customerGeneratedCode,
      customerTimezone,
      recaptchaToken,
    }

    if (customerId !== null) {
      payload.customerId = customerId
    }

    // Call register API
    const response = await registerModule.register(payload)

    // Store customerId in Pinia store
    usersStore.setCustomerId(response.data.customerId)
    usersStore.setSessionId(response.data.sessionId)

    initSocketClient()

    return true
  } catch (error) {
    console.error('[register-handler] User registration failed:', error)
    return false
  }
}
