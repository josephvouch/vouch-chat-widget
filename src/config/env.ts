// Minimal environment configuration
export const envConfig = {
  isDev: Boolean(import.meta.env.DEV),
  coreServiceHost: import.meta.env.VITE_CORE_SERVICE_HOST || 'http://localhost:3501',
}
