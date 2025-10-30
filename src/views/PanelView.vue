<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import ChatbotPanel from '../components/chatbot/ChatbotPanel.vue'
import ChatbotView from '../components/chatbot/ChatbotView.vue'
import { useChatbotStore } from '../stores/chatbot'

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
  if (
    typeof window !== 'undefined' &&
    window.parent &&
    window.parent !== window
  ) {
    window.parent.postMessage({ type: 'vc:close' }, '*')
  }
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
  <ChatbotPanel :open="isOpen" aria-label="Chat">
    <ChatbotView
      class="vc3-pointer-events-auto vc3-flex-1"
      :open="isOpen"
      :messages="messages"
      :loading="isLoading"
      @close="handleClose"
      @send="handleSend"
      @ready="handleReady"
    />
  </ChatbotPanel>
</template>
