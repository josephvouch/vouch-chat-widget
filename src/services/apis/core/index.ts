/**
 * Core Service API Client
 * Axios instance with authentication and error handling
 */

import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import axios from 'axios'

import { envConfig } from '../../config/env'

import type { IApiError, IApiResponse } from './types'

/**
 * Create axios instance with base configuration
 */
const coreServiceApi: AxiosInstance = axios.create({
  baseURL: envConfig.coreServiceHost,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor for authentication
 * TODO: Implement JWT token injection from AVA auth system
 */
coreServiceApi.interceptors.request.use(
  (config) => {
    // TODO: Add authentication token to headers
    // const token = getAuthToken() // Implement this based on AVA auth system
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }

    if (envConfig.isDev) {
      console.info('[Core Service API] Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      })
    }

    return config
  },
  (error: AxiosError) => {
    if (envConfig.isDev) {
      console.error('[Core Service API] Request error:', error)
    }
    return Promise.reject(error)
  },
)

/**
 * Response interceptor for error handling
 */
coreServiceApi.interceptors.response.use(
  (response: AxiosResponse) => {
    if (envConfig.isDev) {
      console.info('[Core Service API] Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      })
    }
    return response
  },
  (error: AxiosError<IApiError>) => {
    if (envConfig.isDev) {
      console.error('[Core Service API] Response error:', {
        status: error.response?.status,
        url: error.config?.url,
        error: error.response?.data || error.message,
      })
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      // TODO: Implement auth refresh or redirect to login
      console.warn('[Core Service API] Unauthorized - token may be expired')
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

export default coreServiceApi
