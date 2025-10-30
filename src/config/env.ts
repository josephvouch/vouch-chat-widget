// Centralized environment configuration for the chatbot widget
// Normalizes Vite and non-prefixed env vars, with light validation.

type ChatbotPanelMode = 'iframe' | 'component'

const readEnv = (keys: string[], fallback = ''): string => {
  // Vite exposes import.meta.env as a typed object; use index access cautiously
  const env = import.meta.env as Record<string, string | boolean | undefined>
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(env, key)) continue
    const val = Reflect.get(env, key) as unknown
    if (typeof val === 'string' && val.length > 0) return val
  }
  return fallback
}

const rawPanel = readEnv(
  ['VITE_CHATBOT_VIEW_PANEL', 'CHATBOT_VIEW_PANEL'],
  '',
).toLowerCase()

const chatbotViewPanel: ChatbotPanelMode =
  rawPanel === 'iframe' ? 'iframe' : 'component'

const chatframeURL = readEnv(
  ['VITE_CHATBOT_VIEW_PANEL_IFRAME_URL', 'CHATBOT_VIEW_PANEL_IFRAME_URL'],
  '',
)

export const envConfig = {
  isDev: Boolean(import.meta.env.DEV),
  chatbotViewPanel,
  chatframeURL,
}

export const useIframePanel =
  envConfig.chatbotViewPanel === 'iframe' && Boolean(envConfig.chatframeURL)

if (envConfig.chatbotViewPanel === 'iframe' && !envConfig.chatframeURL) {
  // Non-fatal warning to aid debugging misconfiguration.
  console.warn(
    '[env] CHATBOT_VIEW_PANEL set to "iframe" but CHATBOT_VIEW_PANEL_IFRAME_URL is empty.',
  )
}
