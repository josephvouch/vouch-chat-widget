/**
 * Messaging Module
 * API calls for messaging functionality
 */

import type { AxiosResponse } from 'axios'

import coreServiceApi, { handleApiError } from './index'
import type {
  IRetrieveLastMessagesParams,
  IRetrieveLastMessagesResponse,
  ISendMessageRequest,
  ISendMessageResponse,
} from './types'

/**
 * API Path Constants
 */
const API_PATHS = {
  BASE: '/api/v1/widget/messages',
} as const

/**
 * Messaging Module API Service
 */
export const messagingModule = {
  /**
   * Retrieve last messages from the chat
   * @param params - Query parameters (limit)
   * @returns Promise with array of messages
   */
  retrieveLastMessages: async (
    params?: IRetrieveLastMessagesParams,
  ): Promise<IRetrieveLastMessagesResponse> => {
    try {
      const response: AxiosResponse<IRetrieveLastMessagesResponse> =
        await coreServiceApi.get(API_PATHS.BASE, {
          params: {
            limit: params?.limit || 20,
          },
        })
      return response.data
    } catch (error) {
      const apiError = handleApiError(error)
      throw apiError
    }
  },

  /**
   * Send a message to the chat
   * @param data - Message payload (text, msgType)
   * @returns Promise with send message response
   */
  sendMessage: async (data: ISendMessageRequest): Promise<ISendMessageResponse> => {
    try {
      const response: AxiosResponse<ISendMessageResponse> = await coreServiceApi.post(
        API_PATHS.BASE,
        data,
      )
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
export default messagingModule
