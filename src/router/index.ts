import { createRouter, createWebHistory } from 'vue-router'

const WidgetView = () => import('../views/WidgetView.vue')
const BotView = () => import('../views/BotView.vue')

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: WidgetView
    },
    {
      path: '/bot',
      name: 'bot',
      component: BotView
    }
  ]
})
