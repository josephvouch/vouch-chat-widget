/**
 * Users Store
 * Manages user registration and customer data
 */

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getWidgetApiKey } from './widget-api-key'

export { setWidgetApiKeyGlobal } from './widget-api-key'

export const useUsersStore = defineStore(
  'users',
  () => {
    const customerId = ref<string | null>(null)
    const sessionId = ref<string | null>(null)
    const widgetApiKey = ref<string>(getWidgetApiKey())

    const isRegistered = computed<boolean>(() => customerId.value !== null)

    /**
     * Set customer ID (auto-persisted by Pinia plugin)
     * @param id - Customer ID from registration
     */
    const setCustomerId = (id: string): void => {
      customerId.value = id
    }

    /**
     * Set session ID to maintain chat session state
     */
    const setSessionId = (id: string): void => {
      sessionId.value = id
    }

    /**
     * Clear session ID when user logs out or session expires
     */
    const clearSessionId = (): void => {
      sessionId.value = null
    }

    /**
     * Clear customer ID (auto-persisted by Pinia plugin)
     */
    const clearCustomerId = (): void => {
      customerId.value = null
      sessionId.value = null
    }

    return {
      customerId,
      sessionId,
      widgetApiKey,
      isRegistered,
      setCustomerId,
      setSessionId,
      clearCustomerId,
      clearSessionId,
    }
  },
  {
    persist: {
      key: 'vc_data',
    },
  }
)
