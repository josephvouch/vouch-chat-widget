/**
 * User Register Handler
 * Handles user registration logic and API calls
 */

import { registerModule } from '../apis/core/register-module'
import type { IRegisterWidgetRequest } from '../apis/core/types'
import { useUsersStore } from '../../stores/users'
import { generateCustomerCode } from '../../utils/util-string'
import { getUserTimezoneOffset } from '../../utils/util-timezone'

/**
 * Register user with the chat widget
 * Generates customer code, gets timezone, calls API, and stores customer ID
 * @returns Promise<boolean> - Returns true if registration is successful
 */
export async function doUserRegister(): Promise<boolean> {
  try {
    // Step 1 & 2: Generate customer code (16 character random string)
    const customerGeneratedCode = generateCustomerCode()

    // Step 3: Get user timezone offset
    const customerTimezone = getUserTimezoneOffset()

    // Step 1: Prepare payload for register API
    const payload: IRegisterWidgetRequest = {
      customerGeneratedCode,
      customerTimezone,
    }

    // Step 4: Call register API
    const response = await registerModule.register(payload)

    // Step 5: Store customerId in Pinia store
    const usersStore = useUsersStore()
    usersStore.setCustomerId(response.data.customerId)

    // Step 6: Return true for successful registration
    return true
  } catch (error) {
    console.error('[register-handler] User registration failed:', error)
    return false
  }
}
