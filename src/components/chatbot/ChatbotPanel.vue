<template>
  <div
    v-show="isVisible"
    ref="panelEl"
    class="vc-widget-panel vc3-pointer-events-auto vc3-bg-white vc3-shadow-2xl"
    :class="{
      'vc-widget-panel--opening': open && isAnimating,
      'vc-widget-panel--closing': !open && isAnimating,
    }"
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
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
const isAnimating = ref(false)
const isVisible = ref(false)
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

// Watch for open prop changes to handle animations
watch(
  () => props.open,
  (newOpen: boolean) => {
    if (newOpen) {
      // Opening: show immediately and trigger enter animation
      isVisible.value = true
      isAnimating.value = true
      setTimeout(() => {
        isAnimating.value = false
      }, 300)
    } else {
      // Closing: trigger exit animation, then hide after animation completes
      isAnimating.value = true
      setTimeout(() => {
        isVisible.value = false
        isAnimating.value = false
      }, 200)
    }
  },
  { immediate: true },
)

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
  transform-origin: bottom right;
}

/* Opening animation - scale up + fade in */
.vc-widget-panel--opening {
  animation: panelOpen 300ms ease-out forwards;
}

/* Closing animation - scale down + fade out */
.vc-widget-panel--closing {
  animation: panelClose 200ms ease-in forwards;
}

/* Keyframes: Panel opening animation */
@keyframes panelOpen {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Keyframes: Panel closing animation */
@keyframes panelClose {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.95);
  }
}
</style>
