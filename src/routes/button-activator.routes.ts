import type { RouteRecordRaw } from 'vue-router'

export const buttonActivatorRoutes: RouteRecordRaw[] = [
  {
    path: '/preview',
    name: 'preview',
    component: () =>
      import('@modules/button-activator/view/LandingPagePreview.vue').then(
        (module) => module.default,
      ),
  },
]
