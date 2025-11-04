<template>
  <div
    class="chatbot-view"
    :aria-labelledby="titleId"
  >
    <!-- Fixed Header -->
    <ChatbotHeader
      :title-id="titleId"
      @close="handleClose"
    />

    <!-- Scrollable Body -->
    <ChatbotBody />

    <!-- Fixed Footer -->
    <ChatbotFooter
      :open="open"
      @send="handleSend"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import ChatbotBody from './ChatbotBody.vue'
import ChatbotFooter from './ChatbotFooter.vue'
import ChatbotHeader from './ChatbotHeader.vue'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'send', payload: { text: string }): void
  (event: 'ready'): void
}>()

const titleId = `chatbot-view-title-${Math.random().toString(36).slice(2)}`

const handleClose = (): void => {
  emit('close')
}

const handleSend = (payload: { text: string }): void => {
  emit('send', payload)
}

onMounted((): void => {
  emit('ready')
})
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
