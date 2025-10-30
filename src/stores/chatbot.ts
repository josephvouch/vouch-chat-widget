import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import {
  createUserMessage,
  loadPersistedMessages,
  persistMessages,
  seedMessages,
  sendMockAssistantReply,
} from '../services/chatbot/mockService'
import type { ChatbotMessage } from '../types/chatbot'

export const useChatbotStore = defineStore('chatbot', () => {
  const isOpen = ref(false)
  const isLoading = ref(false)
  const messages = ref<ChatbotMessage[]>([])
  const unreadCount = ref(0)

  const lastMessage = computed<ChatbotMessage | null>(() => {
    if (messages.value.length === 0) return null
    return messages.value[messages.value.length - 1] ?? null
  })

  const hydrate = (): void => {
    if (messages.value.length > 0) return
    const persisted = loadPersistedMessages()
    if (persisted.length > 0) {
      messages.value = persisted
      return
    }
    messages.value = seedMessages()
  }

  const open = (): void => {
    isOpen.value = true
    unreadCount.value = 0
  }

  const close = (): void => {
    isOpen.value = false
  }

  const toggle = (): void => {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  const appendMessage = (message: ChatbotMessage): void => {
    messages.value = [...messages.value, message]
    persistMessages(messages.value)
    if (!isOpen.value && message.role === 'assistant') {
      unreadCount.value += 1
    }
  }

  const sendMessage = async (text: string): Promise<void> => {
    if (!text.trim()) return
    const trimmed = text.trim()
    const userMessage = createUserMessage(trimmed)
    appendMessage(userMessage)
    try {
      isLoading.value = true
      const assistantMessage = await sendMockAssistantReply(trimmed)
      appendMessage(assistantMessage)
    } catch (error) {
      console.error('[chatbot] failed to send message', error)
    } finally {
      isLoading.value = false
    }
  }

  watch(
    () => isOpen.value,
    (openState: boolean) => {
      if (openState) {
        unreadCount.value = 0
      }
    },
  )

  hydrate()

  return {
    isOpen,
    isLoading,
    messages,
    unreadCount,
    lastMessage,
    open,
    close,
    toggle,
    sendMessage,
  }
})
