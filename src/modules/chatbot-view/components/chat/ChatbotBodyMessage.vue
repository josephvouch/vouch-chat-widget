<template>
  <div
    class="chatbot-body vc3-flex-1 vc3-min-h-0 vc3-overflow-y-auto vc3-px-4 vc3-py-3"
    :style="bodyStyles"
  >
    <ul class="vc3-space-y-3">
      <li
        v-for="message in mockMessages"
        :key="message._id"
      >
        <MessageBubble :message="message" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import type { IMessage } from '@/services/apis/core/types'
import { useWidgetStylesStore } from '@/stores/widget-styles'

import MessageBubble from '../MessageBubble.vue'

// Mock messages data for development
const mockMessages = ref<IMessage[]>([
  {
    _id: '1',
    fromMe: false,
    msgType: 'text',
    text: 'Hello! Welcome to Mercure ICON Singapore. How can I assist you today?',
    senderBy: 'Bot',
    channel: 'Web',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
  },
  {
    _id: '2',
    fromMe: true,
    msgType: 'text',
    text: "Hi! I'd like to know about the check-in time.",
    senderBy: 'Guest',
    channel: 'Web',
    createdAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(), // 9 minutes ago
  },
  {
    _id: '3',
    fromMe: false,
    msgType: 'text',
    // eslint-disable-next-line max-len
    text: 'Our standard check-in time is 3:00 PM and check-out is at 12:00 PM. Early check-in and late check-out are subject to availability.',
    senderBy: 'Bot',
    channel: 'Web',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 minutes ago
  },
  {
    _id: '4',
    fromMe: true,
    msgType: 'text',
    text: 'Perfect! Thank you for the information.',
    senderBy: 'Guest',
    channel: 'Web',
    createdAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(), // 7 minutes ago
  },
])

const widgetStylesStore = useWidgetStylesStore()
const conversationStyles = computed(() => widgetStylesStore.getConversationStyles)

const bodyStyles = computed<Record<string, string>>(() => ({
  backgroundColor: conversationStyles.value.backgroundColor,
}))
</script>

<style scoped>
.chatbot-body {
  /* Take remaining space and allow scrolling */
  flex: 1 1 0;

  /* Critical: min-height: 0 allows flex item to shrink below content size */
  min-height: 0;

  /* Enable vertical scrolling only */
  overflow-x: hidden;
  overflow-y: auto;

  /* Smooth scrolling experience */
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* Scroll optimization for better performance */
.chatbot-body::-webkit-scrollbar {
  width: 6px;
}

.chatbot-body::-webkit-scrollbar-track {
  background: transparent;
}

.chatbot-body::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

.chatbot-body::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}
</style>
