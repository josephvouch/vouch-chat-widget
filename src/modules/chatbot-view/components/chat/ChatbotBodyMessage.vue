<template>
  <div
    class="chatbot-body vc3-flex-1 vc3-min-h-0 vc3-overflow-y-auto vc3-px-4 vc3-py-3"
    :style="bodyStyles"
  >
    <ul
      v-if="messageList.length > 0"
      class="vc3-space-y-3"
    >
      <li
        v-for="message in messageList"
        :key="message._id"
      >
        <MessageBubble :message="message" />
      </li>
    </ul>
    <p
      v-else
      class="vc3-text-center vc3-text-sm vc3-text-slate-500 vc3-mt-6"
    >
      Ask your first question to start the conversation.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { IMessage } from '@/services/apis/core/types'
import { useWidgetStylesStore } from '@/stores/widget-styles'

import MessageBubble from '../MessageBubble.vue'

interface IProps {
  messages: IMessage[]
}

const props = defineProps<IProps>()

const messageList = computed<IMessage[]>(() => props.messages ?? [])

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
