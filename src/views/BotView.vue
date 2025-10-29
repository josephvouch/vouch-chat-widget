<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import ChatbotView from '../components/chatbot/ChatbotView.vue'
import { useChatbotStore } from '../stores/chatbot'

const router = useRouter()
const store = useChatbotStore()
const { isOpen, messages, isLoading } = storeToRefs(store)

onMounted(() => {
  store.open()
})

onBeforeUnmount(() => {
  store.close()
})

const handleClose = () => {
  store.close()
  router.push({ name: 'home' })
}

const handleSend = (payload: { text: string }) => {
  store.sendMessage(payload.text)
}

const handleReady = () => {
  if (!isOpen.value) {
    store.open()
  }
}

const handleResize = (_payload: { height: number }) => {
  // Fullscreen layout does not depend on panel height.
}
</script>

<template>
  <section class="bot-view flex min-h-screen flex-col bg-slate-950">
    <ChatbotView
      class="bot-view__chat flex-1"
      :open="isOpen"
      :messages="messages"
      :loading="isLoading"
      @close="handleClose"
      @send="handleSend"
      @ready="handleReady"
      @resize="handleResize"
    />
  </section>
</template>

<style scoped>
:deep(.chatbot-view) {
  position: static;
  inset: auto;
  margin: 0;
  width: 100%;
  max-width: none;
  max-height: none;
  min-height: 100vh;
  border-radius: 0;
  border: none;
  box-shadow: none;
}

:deep(.chatbot-view__header) {
  border-radius: 0;
}
</style>
