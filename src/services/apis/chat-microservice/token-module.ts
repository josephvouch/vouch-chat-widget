/**
 * Token Module
 * API calls for widget token lifecycle
 */

import type { AxiosResponse } from 'axios'

import chatMicroserviceApi, { handleApiError } from './index'
import type { IRefreshTokenRequest, IRefreshTokenResponse } from './types'

const API_BASE_PATH = '/api/v1/chat-widgets/tokens' as const

const API_PATHS = {
  REFRESH: `${API_BASE_PATH}/refresh`,
} as const

export const tokenModule = {
  refreshToken: async (payload: IRefreshTokenRequest): Promise<IRefreshTokenResponse> => {
    try {
      const response: AxiosResponse<IRefreshTokenResponse> = await chatMicroserviceApi.post(
        API_PATHS.REFRESH,
        payload,
      )
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

export default tokenModule
