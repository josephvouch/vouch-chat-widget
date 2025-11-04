import { createApp } from 'vue'
import { VueReCaptcha } from 'vue-recaptcha-v3'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import './style.css'

import App from './App.vue'
import { IS_DEV, RECAPTCHA_SITE_KEY, WIDGET_API_KEY } from './config/constants'
import { router } from './router'
import { fetchAndSetWidgetStyles } from './services/handlers/widget-styles-handler'
import { setWidgetApiKeyGlobal } from './stores/users'

// Retrieve widget API key on first load (BEFORE creating Pinia)
const appElement = document.getElementById('app')
let apiKey = ''

if (IS_DEV) {
  // In development, use environment variable
  apiKey = WIDGET_API_KEY
} else {
  // In production, get from data-apikey attribute
  apiKey = appElement?.getAttribute('data-apikey') || ''
}

// Validate API key - it's required
if (!apiKey) {
  console.error(
    '[Vouch Chat Widget] FATAL ERROR: Widget API key is required but not provided. ' +
      'Please provide a valid API key via data-apikey attribute or VITE_WIDGET_API_KEY environment variable.',
  )
  // Do not mount the app
  throw new Error('Widget API key is required')
}

// Set the API key globally for store configuration
setWidgetApiKeyGlobal(apiKey)

// Initialize and mount the app
async function initializeApp(): Promise<void> {
  const app = createApp(App)

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)

  app.use(pinia)

  // Fetch widget styles from API (required before mounting)
  const stylesLoaded = await fetchAndSetWidgetStyles()
  if (!stylesLoaded) {
    console.error(
      '[Vouch Chat Widget] FATAL ERROR: Failed to load widget styles from API. ' +
        'Please check your network connection and API configuration.',
    )
    throw new Error('Failed to load widget styles')
  }

  app.use(router)
  app.use(VueReCaptcha, {
    siteKey: RECAPTCHA_SITE_KEY,
    loaderOptions: {
      useRecaptchaNet: true,
      autoHideBadge: true,
    },
  })

  app.mount('#app')
}

// Start app initialization
initializeApp().catch((error) => {
  console.error('[Vouch Chat Widget] Failed to initialize app:', error)
})
