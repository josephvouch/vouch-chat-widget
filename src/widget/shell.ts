import { createApp, h } from 'vue'
import { createPinia } from 'pinia'

// Option A: use the app's full Tailwind + base styles for visual parity
import '../style.css'

import ChatbotShell from '../components/chatbot/ChatbotShell.vue'
import { envConfig } from '../config/env'

const resolveMountTarget = (): HTMLElement => {
  const el = document.querySelector<HTMLElement>('#app')
  if (el) return el
  const container = document.createElement('div')
  container.id = 'vc-chat-widget'
  document.body.appendChild(container)
  return container
}

const resolveIframeURL = (): string => {
  const appEl = document.querySelector<HTMLElement>('#app')
  const urlFromData = appEl?.getAttribute('data-src') ?? appEl?.dataset?.src
  if (urlFromData && /^https?:\/\//.test(urlFromData)) return urlFromData
  // Build-time fallback (lets activator be configured via Vite env when no data-src provided)
  const envUrl = envConfig.chatframeURL
  if (envUrl && /^https?:\/\//.test(envUrl)) return envUrl
  try {
    // Default to same-origin /bot if not provided
    return new URL('/bot', window.location.origin).toString()
  } catch {
    return '/bot'
  }
}

const mount = (): void => {
  const target = resolveMountTarget()
  const iframeURL = resolveIframeURL()
  const app = createApp({
    render: () =>
      h(ChatbotShell, {
        panelMode: 'iframe',
        iframeURL,
        useTeleport: true,
        teleportTarget: '#app',
      }),
  })
  app.use(createPinia())
  app.mount(target)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}

export {}
