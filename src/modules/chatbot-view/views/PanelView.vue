<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import { useChatbotStore } from '@/stores/chatbot'

import ChatbotView from '../components/ChatbotView.vue'

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
  // Notify parent iframe to close the panel
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
  <div class="panel-view">
    <ChatbotView
      :open="isOpen"
      :messages="messages"
      :loading="isLoading"
      @close="handleClose"
      @send="handleSend"
      @ready="handleReady"
    />
  </div>
</template>

<style scoped>
/**
 * PanelView: Full-height container for iframe embedding
 * This view is loaded inside the iframe when using panelMode='iframe'
 * Ensures ChatbotView fills the entire iframe height
 */
.panel-view {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

/**
 * Ensure ChatbotView takes full height within PanelView
 */
.panel-view :deep(.chatbot-view) {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
