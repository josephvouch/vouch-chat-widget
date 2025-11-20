/**
 * Register Module
 * API calls for widget registration functionality
 */

import type { AxiosResponse } from 'axios'

import chatMicroserviceApi, { handleApiError } from './index'
import type { IRegisterWidgetRequest, IRegisterWidgetResponse } from './types'

/**
 * API Path Constants
 */
const API_PATHS = {
  REGISTERS: '/api/v1/chat-widgets/customers/register',
} as const

/**
 * Register Module API Service
 */
export const registerModule = {
  /**
   * Register a customer widget
   * @param data - Registration payload (customerGeneratedCode, customerTimezone)
   * @returns Promise with customer registration response
   */
  register: async (data: IRegisterWidgetRequest): Promise<IRegisterWidgetResponse> => {
    try {
      const response: AxiosResponse<IRegisterWidgetResponse> = await chatMicroserviceApi.post(API_PATHS.REGISTERS, data)
      return response.data
    } catch (error) {
      const apiError = handleApiError(error)
      throw apiError
    }
  },
}

/**
 * Export as default for convenience
 */
export default registerModule
