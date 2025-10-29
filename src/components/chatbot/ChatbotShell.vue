<template>
  <Teleport to="body">
    <div class="chatbot-shell pointer-events-none">
      <ChatbotButtonActivator
        ref="activatorComponent"
        class="pointer-events-auto"
        :open="isOpen"
        :unread-count="unreadCount"
        :position="position"
        :bottom="offsetBottom"
        :horizontal-offset="offsetHorizontal"
        :z-index="zIndex"
        @toggle="store.toggle"
      />

      <ChatbotView
        v-show="mounted"
        class="pointer-events-auto"
        :open="isOpen"
        :messages="messages"
        :loading="isLoading"
        @close="store.close"
        @send="handleSend"
        @ready="handleReady"
        @resize="handleResize"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, toRefs, watch } from 'vue'
import { storeToRefs } from 'pinia'

import ChatbotButtonActivator from './ChatbotButtonActivator.vue'
import ChatbotView from './ChatbotView.vue'
import { useChatbotWidget } from '../../composables/useChatbotWidget'

const props = defineProps({
  position: {
    type: String as () => 'left' | 'right',
    default: 'right'
  },
  offsetBottom: {
    type: Number,
    default: 24
  },
  offsetHorizontal: {
    type: Number,
    default: 24
  },
  zIndex: {
    type: Number,
    default: 60
  }
})

const { position, offsetBottom, offsetHorizontal, zIndex } = toRefs(props)

const { store, setActivator } = useChatbotWidget()
const { isOpen, messages, unreadCount, isLoading, lastMessage } =
  storeToRefs(store)

const mounted = ref(false)
const activatorComponent = ref<{
  el?: { value: HTMLElement | null }
  focus?: () => void
} | null>(null)
const lastPanelHeight = ref<number | null>(null)

const handleSend = (payload: { text: string }) => {
  store.sendMessage(payload.text)
}

const handleReady = () => {
  if (!isOpen.value) return
  requestAnimationFrame(() => {
    store.open()
  })
}

const handleResize = (payload: { height: number }) => {
  lastPanelHeight.value = payload.height
}

const statusLabel = computed(() => {
  const message = lastMessage.value
  if (!message) return 'Chat ready'
  return `Last update ${new Date(message.ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
})

onMounted(() => {
  mounted.value = true
  store.close()
  nextTick(() => {
    const element = activatorComponent.value?.el?.value ?? null
    setActivator(element)
  })
})

watch(
  () => activatorComponent.value?.el?.value ?? null,
  (element) => {
    setActivator(element)
  },
  { immediate: true }
)

defineExpose({
  statusLabel,
  lastPanelHeight
})
</script>

<style scoped>
.chatbot-shell {
  position: fixed;
  inset: 0;
  pointer-events: none;
}
</style>
