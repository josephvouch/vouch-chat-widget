<template>
  <div
    ref="chatBodyRef"
    class="chatbot-body vc3-flex-1 vc3-min-h-0 vc3-overflow-y-auto vc3-px-4 vc3-py-3"
    :style="bodyStyles"
    @scroll.passive="handleScroll"
  >
    <ul v-if="messageList.length > 0" class="vc3-space-y-3">
      <li v-for="message in messageList" :key="message._id">
        <MessageBubble :message="message" />
      </li>
    </ul>
    <p v-else class="vc3-text-center vc3-text-sm vc3-text-slate-500 vc3-mt-6">Ask your first question to start the conversation.</p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, withDefaults } from 'vue'

import type { IMessage } from '@/services/apis/chat-microservice/types'
import { useWidgetStylesStore } from '@/stores/widget-styles'

import MessageBubble from '../MessageBubble.vue'

interface IProps {
  messages: IMessage[]
  canRequestHistory: boolean
}

const emit = defineEmits<{
  (event: 'request-history'): void
}>()

const props = withDefaults(defineProps<IProps>(), {
  canRequestHistory: true,
})

const messageList = computed<IMessage[]>(() => props.messages ?? [])
const chatBodyRef = ref<HTMLDivElement | null>(null)
const isNearTop = ref(false)
const shouldStickToBottom = ref(true)
const lastScrollTop = ref(0)
const wasBodyVisible = ref(false)
let resizeObserver: ResizeObserver | null = null

const widgetStylesStore = useWidgetStylesStore()
const conversationStyles = computed(() => widgetStylesStore.getConversationStyles)

const bodyStyles = computed<Record<string, string>>(() => ({
  backgroundColor: conversationStyles.value.backgroundColor,
}))

const scrollToBottom = (): void => {
  const el = chatBodyRef.value
  if (!el) return
  // Keep the newest messages in view after DOM updates finish rendering.
  requestAnimationFrame(() => {
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  })
}

const setupVisibilityObserver = (): void => {
  const el = chatBodyRef.value
  const canObserve = typeof window !== 'undefined' && 'ResizeObserver' in window && el
  if (!canObserve || !el) return

  resizeObserver = new ResizeObserver((entries) => {
    const [entry] = entries
    if (!entry) return
    const isVisible = entry.contentRect.height > 0
    if (isVisible && !wasBodyVisible.value) {
      wasBodyVisible.value = true
      shouldStickToBottom.value = true
      void nextTick(scrollToBottom)
    } else if (!isVisible) {
      wasBodyVisible.value = false
    }
  })

  resizeObserver.observe(el)
}

onMounted(() => {
  scrollToBottom()
  setupVisibilityObserver()
})

const handleScroll = (): void => {
  if (!props.canRequestHistory) return
  const el = chatBodyRef.value
  if (!el) return
  const currentScrollTop = el.scrollTop
  const nearTop = currentScrollTop <= 40
  const distanceFromBottom = el.scrollHeight - el.clientHeight - currentScrollTop
  shouldStickToBottom.value = distanceFromBottom <= 40
  const isScrollingUp = currentScrollTop < lastScrollTop.value

  if (nearTop && !isNearTop.value && isScrollingUp) {
    isNearTop.value = true
    emit('request-history')
  } else if (!nearTop) {
    isNearTop.value = false
  }

  lastScrollTop.value = currentScrollTop
}

watch(
  messageList,
  () => {
    if (!shouldStickToBottom.value) return
    void nextTick(scrollToBottom)
  },
  { deep: false }
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
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
