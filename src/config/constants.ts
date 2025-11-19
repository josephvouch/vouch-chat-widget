/**
 * Application Constants
 */

export const IS_DEV = Boolean(import.meta.env.DEV)

export const CHAT_MICROSERVICE_HOST =
  import.meta.env.VITE_CHAT_MICROSERVICE_HOST || 'http://localhost:3501'

export const SOCKET_SERVER_URL =
  (import.meta.env.VITE_SOCKET_SERVER_URL as string) || CHAT_MICROSERVICE_HOST

export const RECAPTCHA_SITE_KEY = (import.meta.env.VITE_RECAPTCHA_SITE_KEY as string) || ''

export const WIDGET_API_KEY = (import.meta.env.VITE_WIDGET_API_KEY as string) || ''
