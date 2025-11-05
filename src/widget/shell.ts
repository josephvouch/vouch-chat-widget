import { createApp, h } from 'vue'
import ChatbotWrapper from '@modules/button-activator/view/ChatbotWrapper.vue'
import { createPinia } from 'pinia'

// Option A: use the app's full Tailwind + base styles for visual parity
import '../style.css'

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
  try {
    // Default to same-origin root (bot route is at "/")
    return new URL('/', window.location.origin).toString()
  } catch {
    return '/'
  }
}

const mount = (): void => {
  const target = resolveMountTarget()
  const iframeURL = resolveIframeURL()
  const app = createApp({
    render: () =>
      h(ChatbotWrapper, {
        iframeURL,
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
