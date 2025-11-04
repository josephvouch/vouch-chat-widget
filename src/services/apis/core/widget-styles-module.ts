/**
 * Widget Styles Module
 * API calls for widget styles configuration
 */

import type { AxiosResponse } from 'axios'

import coreServiceApi, { handleApiError } from './index'
import type { IGetWidgetStylesResponse } from './types'

/**
 * API Path Constants
 */
const API_PATHS = {
  BASE: '/api/v3/widget/styles',
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
      const response: AxiosResponse<IGetWidgetStylesResponse> =
        await coreServiceApi.get(API_PATHS.BASE)
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
export default widgetStylesModule
