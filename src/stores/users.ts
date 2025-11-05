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
      key: 'vc_data',
    },
  },
)
