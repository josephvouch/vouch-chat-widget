import { createApp, h } from 'vue'
import { createPinia } from 'pinia'

import ChatbotWrapper from '../components/chatbot/ChatbotWrapper.vue'

const resolveIframeURL = (): string => {
  const el = document.getElementById('app')
  const dataSrc = el?.getAttribute('data-src') ?? el?.dataset?.src
  if (dataSrc && /^https?:\/\//.test(dataSrc)) return dataSrc
  return new URL('/', window.location.origin).toString()
}

const mount = (): void => {
  const container: HTMLElement =
    document.getElementById('app') ??
    (() => {
      const c = document.createElement('div')
      c.id = 'app'
      document.body.appendChild(c)
      return c
    })()
  const iframeURL = resolveIframeURL()
  const app = createApp({
    render: () =>
      h(ChatbotWrapper, {
        iframeURL,
      }),
  })
  app.use(createPinia())
  app.mount(container)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}
