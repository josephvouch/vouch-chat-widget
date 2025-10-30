<template>
  <div
    v-show="open"
    ref="panelEl"
    class="vc-widget-panel vc3-pointer-events-auto vc3-rounded-3xl vc3-border vc3-border-slate-200 vc3-bg-white vc3-shadow-2xl"
    :style="{ zIndex }"
    role="dialog"
    aria-modal="true"
    :aria-label="ariaLabel"
    @keydown.esc.prevent="emitClose"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

defineProps({
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
})

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'resize', payload: { height: number }): void
}>()

const panelEl = ref<HTMLDivElement | null>(null)
let resizeObserver: ResizeObserver | null = null

const emitClose = (): void => {
  emit('close')
}

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
  width: 35%;
  min-width: 350px;
  height: calc(100% - 100px);
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
</style>
