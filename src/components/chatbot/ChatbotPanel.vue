<template>
  <div
    v-show="open"
    ref="panelEl"
    class="vc-widget-panel vc3-pointer-events-auto vc3-bg-white vc3-shadow-2xl"
    :style="{ zIndex }"
    role="dialog"
    aria-modal="true"
    :aria-label="ariaLabel"
    @keydown.esc.prevent="emitClose"
  >
    <iframe
      id="vc-chat-iframe"
      class="vc3-h-full vc3-w-full"
      :src="resolvedIframeUrl"
      allowfullscreen="true"
      webkitallowfullscreen="true"
      mozallowfullscreen="true"
      allow="geolocation *;camera *;microphone *;"
    />
  </div>

</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
// no store usage in iframe-only mode

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  ariaLabel: {
    type: String,
    default: 'Chat',
  },
  zIndex: {
    type: Number,
    default: 60,
  },
  iframeUrl: {
    type: String,
    default: '',
  },
})

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'resize', payload: { height: number }): void
}>()

const panelEl = ref<HTMLDivElement | null>(null)
let resizeObserver: ResizeObserver | null = null

const resolvedIframeUrl = computed<string>(() => {
  if (props.iframeUrl && props.iframeUrl.length > 0) return props.iframeUrl
  if (typeof window === 'undefined') return '/'
  // Default to current origin + bot route at '/'
  return new URL('/', window.location.origin).toString()
})

const emitClose = (): void => {
  emit('close')
}

//

onMounted((): void => {
  const el = panelEl.value
  if (!el) return
  const canObserveResize =
    typeof window !== 'undefined' && 'ResizeObserver' in window
  if (canObserveResize) {
    resizeObserver = new ResizeObserver((entries) => {
      const [entry] = entries
      if (!entry) return
      const { height } = entry.contentRect
      emit('resize', { height: Math.round(height) })
    })
    resizeObserver.observe(el)
  } else {
    emit('resize', { height: Math.round(el.offsetHeight) })
  }
})

onUnmounted((): void => {
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.vc-widget-panel {
  position: fixed;
  bottom: 80px;
  right: 24px;
  max-height: 810px;
  width: 30em;
  height: calc(100% - 100px);
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  border-radius: 1.5rem;
}
</style>
