import type { RouteRecordRaw } from 'vue-router'

export const chatbotViewRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'bot',
    component: () => import('@modules/chatbot-view/views/BotView.vue').then((module) => module.default),
  },
]
