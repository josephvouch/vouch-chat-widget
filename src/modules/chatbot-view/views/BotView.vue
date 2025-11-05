<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useChatbotStore } from '@/stores/chatbot'

import ChatbotView from '../components/ChatbotView.vue'

const router = useRouter()
const store = useChatbotStore()
const { isOpen, messages, isLoading } = storeToRefs(store)

onMounted((): void => {
  void store.open()
})

onBeforeUnmount((): void => {
  void store.close()
})

const handleClose = (): void => {
  void store.close()
  // If embedded in an iframe, request the host to close the panel instead of navigating.
  if (
    typeof window !== 'undefined' &&
    window.parent &&
    window.parent !== window
  ) {
    window.parent.postMessage({ type: 'vc:close' }, '*')
    return
  }
  // Fallback when running standalone: navigate to the preview route
  void router.push({ name: 'preview' })
}

const handleSend = (payload: { text: string }): void => {
  void store.sendMessage(payload.text)
}

const handleReady = (): void => {
  if (!isOpen.value) {
    void store.open()
  }
}
</script>

<template>
  <section class="bot-view">
    <ChatbotView
      :open="isOpen"
      :messages="messages"
      :loading="isLoading"
      @close="handleClose"
      @send="handleSend"
      @ready="handleReady"
    />
  </section>
</template>

<style scoped>
/**
 * BotView: Full-height container for standalone chat view
 * Used when accessing the root route (/)
 */
.bot-view {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

/**
 * Ensure ChatbotView takes full height within BotView
 */
.bot-view :deep(.chatbot-view) {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
