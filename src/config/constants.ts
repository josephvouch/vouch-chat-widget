/**
 * Application Constants
 */

export const IS_DEV = Boolean(import.meta.env.DEV)

export const CORE_SERVICE_HOST =
  import.meta.env.VITE_CORE_SERVICE_HOST || 'http://localhost:3501'

export const RECAPTCHA_SITE_KEY = (import.meta.env.VITE_RECAPTCHA_SITE_KEY as string) || ''

export const WIDGET_API_KEY = (import.meta.env.VITE_WIDGET_API_KEY as string) || ''
