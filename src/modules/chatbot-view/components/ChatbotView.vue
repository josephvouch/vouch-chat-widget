<template>
  <div
    class="chatbot-view"
    :aria-labelledby="titleId"
  >
    <!-- Fixed Header -->
    <ChatbotHeader
      :title-id="titleId"
      :show-welcome="showWelcome"
      @close="handleClose"
    />

    <!-- Scrollable Body -->
    <ChatbotBodyWelcome v-if="showWelcome" />
    <ChatbotBodyMessage
      v-else
      :messages="props.messages"
      :can-request-history="canRequestHistory"
      @request-history="handleLoadOlderMessages"
    />

    <!-- Fixed Footer -->
    <ChatbotFooterWelcome
      v-if="showWelcome"
      :loading="isRegistering"
      @cta-click="handleCtaClick"
    />
    <ChatbotFooterInput
      v-else
      :open="props.open"
      :loading="props.loading"
      @send="handleSend"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import type { IMessage } from '@/services/apis/chat-microservice/types'
import {
  loadInitialChatHistory,
  loadOlderChatHistory,
} from '@/services/handlers/message-handler'
import { doUserRegister } from '@/services/handlers/register-handler'
import { doUserRefreshToken } from '@/services/handlers/token-handler'
import { useUsersStore } from '@/stores/users'
import { initializeRecaptcha } from '@/utils/util-recaptcha'

import ChatbotBodyMessage from './chat/ChatbotBodyMessage.vue'
import ChatbotFooterInput from './chat/ChatbotFooterInput.vue'
import ChatbotHeader from './chat/ChatbotHeader.vue'
import ChatbotBodyWelcome from './chat/welcome-screen/ChatbotBodyWelcome.vue'
import ChatbotFooterWelcome from './chat/welcome-screen/ChatbotFooterWelcome.vue'

const props = defineProps<{
  open: boolean
  messages: IMessage[]
  loading: boolean
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'send', payload: { text: string }): void
  (event: 'ready'): void
  (event: 'cta-click'): void
}>()

const usersStore = useUsersStore()
const { isRegistered, customerId } = storeToRefs(usersStore)
const isRegistering = ref(false)
const isHistoryLoading = ref(false)
const hasLoadedHistory = ref(false)
const hasMoreHistory = ref(true)
const canRequestHistory = computed(
  () => hasMoreHistory.value && !isHistoryLoading.value,
)

initializeRecaptcha()

const titleId = `chatbot-view-title-${Math.random().toString(36).slice(2)}`

const handleClose = (): void => {
  emit('close')
}

const handleSend = (payload: { text: string }): void => {
  emit('send', payload)
}

const showWelcome = computed<boolean>(() => !isRegistered.value)

const loadChatHistory = async (mode: 'initial' | 'older'): Promise<boolean> => {
  if (isHistoryLoading.value) return false
  if (mode === 'initial') {
    hasLoadedHistory.value = false
    hasMoreHistory.value = true
  }
  if (mode === 'older' && (!hasLoadedHistory.value || !hasMoreHistory.value)) {
    return false
  }

  isHistoryLoading.value = true

  try {
    const loader = mode === 'initial' ? loadInitialChatHistory : loadOlderChatHistory
    const result = await loader()
    if (!result.success) {
      const context =
        mode === 'initial' ? 'load chat history' : 'load older chat history'
      console.error(`[ChatbotView] Failed to ${context}`)
      return false
    }

    if (mode === 'initial') {
      hasLoadedHistory.value = true
      hasMoreHistory.value = result.hasMore
    } else if (!result.hasMore) {
      hasMoreHistory.value = false
    }

    return true
  } catch (error) {
    const context =
      mode === 'initial'
        ? 'loading chat history'
        : 'loading older chat history'
    console.error(`[ChatbotView] Unexpected error ${context}`, error)
    return false
  } finally {
    isHistoryLoading.value = false
  }
}

onMounted(async (): Promise<void> => {
  initializeRecaptcha()
  if (customerId.value !== null) {
    try {
      const success = await doUserRefreshToken()
      if (!success) {
        console.error('[ChatbotView] Failed to refresh user token on mount')
      } else {
        await loadChatHistory('initial')
      }
    } catch (error) {
      console.error('[ChatbotView] Unexpected error refreshing user token on mount', error)
    }
  }
  emit('ready')
})

const handleCtaClick = async (): Promise<void> => {
  if (isRegistering.value) return

  isRegistering.value = true
  const success = await doUserRegister(null)
  isRegistering.value = false

  if (success) {
    await loadChatHistory('initial')
    emit('cta-click')
  } else {
    console.error('[ChatbotView] Failed to register user from welcome CTA')
  }
}

const handleLoadOlderMessages = async (): Promise<void> => {
  if (!isRegistered.value) return
  await loadChatHistory('older')
}
</script>

<style scoped>
/**
 * Fixed Header/Footer Layout Architecture
 *
 * This layout uses flexbox to create a fixed header and footer
 * with a scrollable body that fills the remaining space.
 *
 * Key architectural principles:
 * 1. Root element takes full height of parent (iframe)
 * 2. Flexbox column layout with no gaps/padding on root
 * 3. Header/footer use flex-shrink: 0 (never shrink)
 * 4. Body uses flex: 1 1 0 with min-height: 0 (allows proper scrolling)
 * 5. Overflow-y: auto on body enables scrolling
 */

.chatbot-view {
  /* Fill parent container (iframe) completely */
  height: 100%;
  width: 100%;

  /* Flexbox column layout */
  display: flex;
  flex-direction: column;

  /* Remove any default spacing */
  margin: 0;
  padding: 0;

  /* Prevent layout shifts */
  overflow: hidden;
}

</style>
