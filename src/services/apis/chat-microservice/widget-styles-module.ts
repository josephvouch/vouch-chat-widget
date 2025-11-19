/**
 * Widget Styles Module
 * API calls for widget styles configuration
 */

import type { AxiosResponse } from 'axios'

import chatMicroserviceApi, { handleApiError } from './index'
import type { IGetWidgetStylesResponse } from './types'
import { handle401Wrapper } from './wrappers/handle-401-wrapper'

/**
 * API Path Constants
 */
const API_PATHS = {
  BASE: '/api/v1/chat-widget-config/styles',
} as const

/**
 * Widget Styles Module API Service
 */
export const widgetStylesModule = {
  /**
   * Get widget styles configuration
   * @returns Promise with widget styles configuration
   */
  getStyles: async (): Promise<IGetWidgetStylesResponse> => {
    try {
      return await handle401Wrapper(async () => {
        const response: AxiosResponse<IGetWidgetStylesResponse> =
          await chatMicroserviceApi.get(API_PATHS.BASE)
        return response.data
      })
    } catch (error) {
      const apiError = handleApiError(error)
      throw apiError
    }
  },
}

/**
 * Export as default for convenience
 */
export default widgetStylesModule
