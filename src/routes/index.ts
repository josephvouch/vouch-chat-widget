import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

import { buttonActivatorRoutes } from './button-activator.routes'
import { chatbotViewRoutes } from './chatbot-view.routes'

// Compute a base path that works when the app is served from a subpath
// e.g. /dist/view/index.html -> base "/dist/view/"
const base = typeof window !== 'undefined' ? window.location.pathname.replace(/[^/]*$/, '') : '/'
// Prefer hash history for the widget-view build so it works on static hosts
const useHashHistory =
  import.meta.env.MODE === 'widget-view' || (typeof window !== 'undefined' && /index\.html$/.test(window.location.pathname))

export const router = createRouter({
  history: useHashHistory ? createWebHashHistory() : createWebHistory(base),
  routes: [...chatbotViewRoutes, ...buttonActivatorRoutes],
})
