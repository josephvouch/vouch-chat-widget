import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useChatbotStore } from '../stores/chatbot'

const GLOBAL_SHORTCUT = { key: 'l', ctrlKey: true, shiftKey: true }

export const useChatbotWidget = () => {
  const store = useChatbotStore()
  const activatorEl = ref<HTMLElement | null>(null)
  const lastFocusedEl = ref<Element | null>(null)
  const previousOverflow = ref<string | null>(null)

  const setActivator = (el: HTMLElement | null) => {
    activatorEl.value = el
  }

  const restoreFocus = () => {
    if (typeof document === 'undefined') return
    if (!(lastFocusedEl.value instanceof HTMLElement)) {
      activatorEl.value?.focus()
      return
    }
    const element = lastFocusedEl.value as HTMLElement
    if (document.contains(element)) {
      element.focus()
    } else {
      activatorEl.value?.focus()
    }
  }

  const handleVisibilityChange = (isOpen: boolean) => {
    if (typeof document === 'undefined') return
    if (isOpen) {
      lastFocusedEl.value = document.activeElement
      previousOverflow.value = document.body.style.overflow || null
      document.body.style.overflow = 'hidden'
    } else {
      if (previousOverflow.value !== null) {
        document.body.style.overflow = previousOverflow.value
      } else {
        document.body.style.removeProperty('overflow')
      }
      restoreFocus()
    }
  }

  watch(
    store.isOpen,
    (isOpen) => {
      handleVisibilityChange(isOpen)
    },
    { immediate: true }
  )

  const handleGlobalShortcut = (event: KeyboardEvent) => {
    if (
      event.key.toLowerCase() === GLOBAL_SHORTCUT.key &&
      event.ctrlKey === GLOBAL_SHORTCUT.ctrlKey &&
      event.shiftKey === GLOBAL_SHORTCUT.shiftKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      event.preventDefault()
      store.toggle()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleGlobalShortcut)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleGlobalShortcut)
    if (store.isOpen) {
      handleVisibilityChange(false)
    }
  })

  return {
    store,
    setActivator,
    restoreFocus
  }
}
