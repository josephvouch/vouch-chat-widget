/**
 * Users Store
 * Manages user registration and customer data
 */

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * Global widget API key (set before Pinia initialization)
 */
let globalWidgetApiKey = ''

/**
 * Set the global widget API key
 * Must be called before creating the Pinia store
 */
export function setWidgetApiKeyGlobal(apiKey: string): void {
  globalWidgetApiKey = apiKey
}

/**
 * Get the persistence key based on widget API key
 * API key is required and validated in main.ts before store initialization
 */
function getPersistenceKey(): string {
  return `${globalWidgetApiKey}__vc_data`
}

export const useUsersStore = defineStore(
  'users',
  () => {
    const customerId = ref<string | null>(null)
    const widgetApiKey = ref<string>(globalWidgetApiKey)

    const isRegistered = computed<boolean>(() => customerId.value !== null)

    /**
     * Set customer ID (auto-persisted by Pinia plugin)
     * @param id - Customer ID from registration
     */
    const setCustomerId = (id: string): void => {
      customerId.value = id
    }

    /**
     * Clear customer ID (auto-persisted by Pinia plugin)
     */
    const clearCustomerId = (): void => {
      customerId.value = null
    }

    return {
      customerId,
      widgetApiKey,
      isRegistered,
      setCustomerId,
      clearCustomerId,
    }
  },
  {
    persist: {
      key: getPersistenceKey(),
    },
  },
)
