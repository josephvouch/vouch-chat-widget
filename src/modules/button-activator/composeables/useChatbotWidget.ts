import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useChatbotStore } from '@/stores/chatbot'

const GLOBAL_SHORTCUT: Readonly<{
  key: string
  ctrlKey: boolean
  shiftKey: boolean
}> = Object.freeze({ key: 'l', ctrlKey: true, shiftKey: true })

type ChatbotStore = ReturnType<typeof useChatbotStore>

interface IChatbotWidgetHook {
  store: ChatbotStore
  setActivator: (el: HTMLElement | null) => void
  restoreFocus: () => void
}

export const useChatbotWidget = (): IChatbotWidgetHook => {
  const store = useChatbotStore()
  const activatorEl = ref<HTMLElement | null>(null)
  const lastFocusedEl = ref<HTMLElement | null>(null)

  const setActivator = (el: HTMLElement | null): void => {
    activatorEl.value = el
  }

  const restoreFocus = (): void => {
    if (typeof document === 'undefined') return
    if (!(lastFocusedEl.value instanceof HTMLElement)) {
      activatorEl.value?.focus()
      return
    }
    const element = lastFocusedEl.value
    if (document.contains(element)) {
      element.focus()
    } else {
      activatorEl.value?.focus()
    }
  }

  const handleVisibilityChange = (isOpen: boolean): void => {
    if (typeof document === 'undefined') return
    if (isOpen) {
      const { activeElement } = document
      lastFocusedEl.value = activeElement instanceof HTMLElement ? activeElement : null
      return
    }
    restoreFocus()
  }

  const { isOpen } = storeToRefs(store)
  watch(
    isOpen,
    (val) => {
      handleVisibilityChange(val)
    },
    { immediate: true }
  )

  const handleGlobalShortcut = (event: KeyboardEvent): void => {
    if (
      event.key.toLowerCase() === GLOBAL_SHORTCUT.key &&
      event.ctrlKey === GLOBAL_SHORTCUT.ctrlKey &&
      event.shiftKey === GLOBAL_SHORTCUT.shiftKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      event.preventDefault()
      void store.toggle()
    }
  }

  onMounted((): void => {
    document.addEventListener('keydown', handleGlobalShortcut)
  })

  onBeforeUnmount((): void => {
    document.removeEventListener('keydown', handleGlobalShortcut)
    if (store.isOpen) {
      handleVisibilityChange(false)
    }
  })

  return {
    store,
    setActivator,
    restoreFocus,
  }
}
