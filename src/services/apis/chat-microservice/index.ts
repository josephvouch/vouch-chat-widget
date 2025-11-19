/**
 * Chat Microservice API Client
 * Axios instance with authentication and error handling
 */

import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import axios from 'axios'

import { CHAT_MICROSERVICE_HOST, IS_DEV } from '../../../config/constants'
import { useUsersStore } from '../../../stores/users'
import type { IApiError, IApiResponse } from './types'

/**
 * Create axios instance with base configuration
 */
const chatMicroserviceApi: AxiosInstance = axios.create({
  baseURL: CHAT_MICROSERVICE_HOST,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor for authentication
 * Adds widget API key to all requests
 */
chatMicroserviceApi.interceptors.request.use(
  (config) => {
    // Add widget API key to headers
    const usersStore = useUsersStore()
    const { widgetApiKey } = usersStore

    if (widgetApiKey) {
      config.headers['x-widget-key'] = widgetApiKey
    }

    // TODO: Add JWT token for user authentication if needed
    // const token = getAuthToken() // Implement this based on AVA auth system
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }

    if (IS_DEV) {
      console.info('[Chat Microservice API] Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        headers: {
          'x-widget-key': widgetApiKey ? '***' : 'not set',
        },
      })
    }

    return config
  },
  (error: AxiosError) => {
    if (IS_DEV) {
      console.error('[Chat Microservice API] Request error:', error)
    }
    return Promise.reject(error)
  },
)

/**
 * Response interceptor for error handling
 */
chatMicroserviceApi.interceptors.response.use(
  (response: AxiosResponse) => {
    if (IS_DEV) {
      console.info('[Chat Microservice API] Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      })
    }
    return response
  },
  (error: AxiosError<IApiError>) => {
    if (IS_DEV) {
      console.error('[Chat Microservice API] Response error:', {
        status: error.response?.status,
        url: error.config?.url,
        error: error.response?.data || error.message,
      })
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      // TODO: Implement auth refresh or redirect to login
      console.warn('[Chat Microservice API] Unauthorized - token may be expired')
    }

    return Promise.reject(error)
  },
)

/**
 * Helper function to extract data from API response
 */
export function extractApiData<T>(response: AxiosResponse<IApiResponse<T>>): T {
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'API request failed')
  }
  return response.data.data
}

/**
 * Helper function to handle API errors
 */
export function handleApiError(error: unknown): IApiError {
  // eslint-disable-next-line import/no-named-as-default-member
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<IApiError>
    return (
      axiosError.response?.data || {
        code: 'NETWORK_ERROR',
        message: axiosError.message || 'Network error occurred',
      }
    )
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'An unknown error occurred',
  }
}

export default chatMicroserviceApi
