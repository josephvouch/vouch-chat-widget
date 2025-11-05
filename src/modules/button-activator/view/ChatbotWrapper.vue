<template>
  <div>
    <ChatbotButtonActivator
      ref="activatorComponent"
      class="vc3-pointer-events-auto"
      :open="isOpen"
      :unread-count="unreadCount"
      :position="position"
      :bottom="offsetBottom"
      :horizontal-offset="offsetHorizontal"
      :z-index="zIndex"
      @toggle="store.toggle"
    />

    <ChatbotPanel
      v-if="mounted"
      :open="isOpen"
      :aria-label="statusLabel"
      :z-index="zIndex"
      :iframe-url="chatframeURL"
      @resize="handleResize"
      @close="store.close"
    />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  toRefs,
  watch,
} from 'vue'
import ChatbotButtonActivator from '@modules/button-activator/components/ChatbotButtonActivator.vue'
import { useChatbotWidget } from '@modules/button-activator/composeables/useChatbotWidget'
import ChatbotPanel from '@modules/chatbot-view/components/ChatbotPanel.vue'
import { storeToRefs } from 'pinia'

const props = defineProps({
  position: {
    type: String as () => 'left' | 'right',
    default: 'right',
  },
  offsetBottom: {
    type: Number,
    default: 24,
  },
  offsetHorizontal: {
    type: Number,
    default: 24,
  },
  zIndex: {
    type: Number,
    default: 60,
  },
  iframeURL: {
    type: String,
    required: false,
    default: undefined,
  },
})

const { position, offsetBottom, offsetHorizontal, zIndex } = toRefs(props)

const { store, setActivator } = useChatbotWidget()
const { isOpen, unreadCount } = storeToRefs(store)

interface IActivatorExpose {
  el?: { value: HTMLElement | null }
  focus?: () => void
}

interface IWidgetMessage {
  type?: string
}

interface IWidgetWindow extends Window {
  vcOnMessage?: (event: MessageEvent<unknown>) => void
}

const getWidgetWindow = (): IWidgetWindow | null =>
  typeof window === 'undefined' ? null : (window as IWidgetWindow)

const isWidgetMessage = (value: unknown): value is IWidgetMessage =>
  typeof value === 'object' && value !== null && 'type' in value

const mounted = ref(false)
const activatorComponent = ref<IActivatorExpose | null>(null)
const lastPanelHeight = ref<number | null>(null)
const chatframeURL = computed<string>(() => {
  if (props.iframeURL && props.iframeURL.length > 0) return props.iframeURL
  if (typeof window === 'undefined') return '/'
  return new URL('/', window.location.origin).toString()
})

const handleResize = (payload: { height: number }): void => {
  lastPanelHeight.value = payload.height
}

const statusLabel = computed<string>(() => {
  const message = store.lastMessage
  if (!message) return 'Chat ready'
  const timestamp = new Date(message.ts)
  const formattedTime = timestamp.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
  return `Last update ${formattedTime}`
})

onMounted((): void => {
  mounted.value = true
  void store.close()
  void nextTick((): void => {
    const element = activatorComponent.value?.el?.value ?? null
    setActivator(element)
  })
  // Listen for messages from iframe content (e.g., close requests)
  const onMessage = (event: MessageEvent<unknown>): void => {
    const { data } = event
    if (!isWidgetMessage(data)) return
    if (data.type === 'vc:close') {
      void store.close()
    }
  }
  const targetWindow = getWidgetWindow()
  if (!targetWindow) return
  targetWindow.addEventListener('message', onMessage)
  targetWindow.vcOnMessage = onMessage
})

watch(
  () => activatorComponent.value?.el?.value ?? null,
  (element: HTMLElement | null) => {
    setActivator(element)
  },
  { immediate: true },
)

defineExpose({
  statusLabel,
  lastPanelHeight,
})

onUnmounted((): void => {
  const targetWindow = getWidgetWindow()
  if (!targetWindow) return
  const { vcOnMessage } = targetWindow
  if (!vcOnMessage) return
  targetWindow.removeEventListener('message', vcOnMessage)
  delete targetWindow.vcOnMessage
})
</script>
