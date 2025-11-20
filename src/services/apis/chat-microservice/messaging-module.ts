/**
 * Messaging Module
 * API calls for messaging functionality
 */

import type { AxiosResponse } from 'axios'

import { CHAT_MICROSERVICE_HOST } from '../../../config/constants'
import { useUsersStore } from '../../../stores/users'
import chatMicroserviceApi, { handleApiError } from './index'
import type { IApiError, IRetrieveLastMessagesParams, IRetrieveLastMessagesResponse, ISendMessageRequest } from './types'
import { handle401Wrapper } from './wrappers/handle-401-wrapper'

/**
 * API Path Constants
 */
const API_PATHS = {
  BASE: '/api/v1/chat-widgets/messages',
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
  retrieveLastMessages: async (params?: IRetrieveLastMessagesParams): Promise<IRetrieveLastMessagesResponse> => {
    try {
      return await handle401Wrapper(async () => {
        const queryParams: Record<string, string | number> = {
          limit: params?.limit || 20,
        }

        if (params?.latestChatMessageId) {
          queryParams.latestChatMessageId = params.latestChatMessageId
        }

        const response: AxiosResponse<IRetrieveLastMessagesResponse> = await chatMicroserviceApi.get(`${API_PATHS.BASE}/latest`, {
          params: queryParams,
        })
        return response.data
      })
    } catch (error) {
      const apiError = handleApiError(error)
      throw apiError
    }
  },

  /**
   * Send a message to the chat via SSE stream
   * @param data - Message payload
   * @param signal - Optional abort signal to cancel the stream
   * @returns Promise with the raw fetch response (contains readable stream)
   */
  sendMessage: async (data: ISendMessageRequest, signal?: AbortSignal): Promise<Response> => {
    try {
      return await handle401Wrapper(async () => {
        const usersStore = useUsersStore()
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        }

        if (usersStore.widgetApiKey) {
          headers['x-widget-key'] = usersStore.widgetApiKey
        }

        const response = await fetch(`${CHAT_MICROSERVICE_HOST}${API_PATHS.BASE}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
          credentials: 'include',
          signal,
        })

        if (!response.ok) {
          let errorPayload: unknown
          try {
            errorPayload = await response.json()
          } catch {
            errorPayload = await response.text()
          }

          const message =
            typeof errorPayload === 'object' &&
            errorPayload !== null &&
            'message' in errorPayload &&
            typeof (errorPayload as Record<string, unknown>).message === 'string'
              ? String((errorPayload as Record<string, unknown>).message)
              : typeof errorPayload === 'string' && errorPayload.trim().length > 0
                ? errorPayload
                : `Failed to send message (status ${response.status})`

          const apiError = {
            status: response.status,
            code:
              typeof errorPayload === 'object' &&
              errorPayload !== null &&
              'code' in errorPayload &&
              typeof (errorPayload as Record<string, unknown>).code === 'string'
                ? String((errorPayload as Record<string, unknown>).code)
                : 'STREAM_ERROR',
            message,
            details: typeof errorPayload === 'object' && errorPayload !== null ? (errorPayload as Record<string, unknown>) : undefined,
          }

          throw apiError
        }

        if (!response.body) {
          throw new Error('Streaming response is not available for the messages endpoint')
        }

        return response
      })
    } catch (error) {
      if (isApiError(error)) {
        throw error
      }

      const apiError = handleApiError(error)
      throw apiError
    }
  },
}

/**
 * Export as default for convenience
 */
export default messagingModule

function isApiError(error: unknown): error is IApiError {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as Record<string, unknown>).code === 'string' &&
    typeof (error as Record<string, unknown>).message === 'string'
  ) {
    return true
  }

  return false
}
