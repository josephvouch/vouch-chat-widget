<template>
  <Teleport v-if="useTeleport" :to="teleportTarget">
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

      <div v-if="useIframePanel" class="vc3-pointer-events-auto">
        <ChatbotPanel
          v-if="mounted"
          :open="isOpen"
          :aria-label="statusLabel"
          :z-index="zIndex"
          class="vc3-pointer-events-auto"
          @resize="handleResize"
          @close="store.close"
        >
          <iframe
            id="vc-chat-iframe"
            class="vc3-h-full vc3-w-full vc3-border-0"
            :src="chatframeURL"
            allowfullscreen="true"
            webkitallowfullscreen="true"
            mozallowfullscreen="true"
            allow="geolocation *;camera *;microphone *;"
          />
        </ChatbotPanel>
      </div>
      <ChatbotPanel
        v-else-if="mounted"
        :open="isOpen"
        :aria-label="statusLabel"
        class="vc3-pointer-events-auto"
        @resize="handleResize"
        @close="store.close"
      >
        <ChatbotView
          :open="isOpen"
          :messages="messages"
          :loading="isLoading"
          @close="store.close"
          @send="handleSend"
          @ready="handleReady"
        />
      </ChatbotPanel>
    </div>
  </Teleport>
  <div v-else class="chatbot-shell vc3-pointer-events-none">
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

    <div v-if="useIframePanel" class="vc3-pointer-events-auto">
      <ChatbotPanel
        v-if="mounted"
        :open="isOpen"
        :aria-label="statusLabel"
        :z-index="zIndex"
        class="vc3-pointer-events-auto"
        @resize="handleResize"
        @close="store.close"
      >
        <iframe
          id="vc-chat-iframe"
          class="vc3-h-full vc3-w-full vc3-border-0"
          :src="chatframeURL"
          allowfullscreen="true"
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
          allow="geolocation *;camera *;microphone *;"
        />
      </ChatbotPanel>
    </div>
    <ChatbotPanel
      v-else-if="mounted"
      :open="isOpen"
      :aria-label="statusLabel"
      :z-index="zIndex"
      class="vc3-pointer-events-auto"
      @resize="handleResize"
      @close="store.close"
    >
      <ChatbotView
        :open="isOpen"
        :messages="messages"
        :loading="isLoading"
        @close="store.close"
        @send="handleSend"
        @ready="handleReady"
      />
    </ChatbotPanel>
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
import { storeToRefs } from 'pinia'

import { useChatbotWidget } from '../../composables/useChatbotWidget'
import { envConfig } from '../../config/env'
import ChatbotButtonActivator from './ChatbotButtonActivator.vue'
import ChatbotPanel from './ChatbotPanel.vue'
import ChatbotView from './ChatbotView.vue'

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
  // Optional overrides for panel behaviour (takes precedence over env)
  panelMode: {
    type: String as () => 'iframe' | 'component',
    required: false,
    default: undefined,
  },
  iframeURL: {
    type: String,
    required: false,
    default: undefined,
  },
  // Control where shell renders. Default uses Teleport to body for overlays.
  useTeleport: {
    type: Boolean,
    default: true,
  },
  teleportTarget: {
    type: String,
    default: 'body',
  },
})

const { position, offsetBottom, offsetHorizontal, zIndex } = toRefs(props)

const { store, setActivator } = useChatbotWidget()
const { isOpen, messages, unreadCount, isLoading } = storeToRefs(store)

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
const chatframeURL = computed<string>(() => props.iframeURL ?? envConfig.chatframeURL)
const effectivePanelMode = computed<'iframe' | 'component'>(
  () => props.panelMode ?? envConfig.chatbotViewPanel,
)
const useIframePanel = computed<boolean>(
  () => effectivePanelMode.value === 'iframe' && Boolean(chatframeURL.value),
)

const handleSend = (payload: { text: string }): void => {
  void store.sendMessage(payload.text)
}

const handleReady = (): void => {
  if (!isOpen.value) return
  requestAnimationFrame((): void => {
    void store.open()
  })
}

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

<style scoped>
.chatbot-shell__iframe-wrapper {
  background-color: transparent;
}

/* Ensure interactivity without Tailwind utilities in widget builds */
:deep(.vc3-pointer-events-auto) {
  pointer-events: auto;
}
</style>
