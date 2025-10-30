import type { Component } from 'vue'
import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'

type ViewLoader = () => Promise<Component>

const loadModule = async (
  loader: () => Promise<{ default: Component }>,
): Promise<Component> => {
  const module = await loader()
  return module.default
}

const WidgetView: ViewLoader = () =>
  loadModule(() => import('../views/WidgetView.vue'))
const BotView: ViewLoader = () =>
  loadModule(() => import('../views/BotView.vue'))
const PanelView: ViewLoader = () =>
  loadModule(() => import('../views/PanelView.vue'))

// Compute a base path that works when the app is served from a subpath
// e.g. /dist/view/index.html -> base "/dist/view/"
const base =
  typeof window !== 'undefined'
    ? window.location.pathname.replace(/[^/]*$/, '')
    : '/'
// Prefer hash history for the widget-view build so it works on static hosts
const useHashHistory =
  import.meta.env.MODE === 'widget-view' ||
  (typeof window !== 'undefined' &&
    /index\.html$/.test(window.location.pathname))

export const router = createRouter({
  history: useHashHistory ? createWebHashHistory() : createWebHistory(base),
  routes: [
    { path: '/', name: 'bot', component: BotView },
    { path: '/preview', name: 'preview', component: WidgetView },
    // Panel-only route intended for iframe embedding of the chat panel UI
    { path: '/panel', name: 'panel', component: PanelView },
  ],
})
