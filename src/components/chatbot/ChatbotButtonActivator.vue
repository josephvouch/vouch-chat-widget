<template>
  <div class="chatbot-activator-wrapper vc3-pointer-events-none vc3-fixed" :style="positionStyle" aria-live="polite">
    <button
      ref="buttonEl"
      type="button"
      class="
        chatbot-activator
        vc3-pointer-events-auto
        vc3-relative
        vc3-flex
        vc3-items-center
        vc3-justify-center
        vc3-rounded-full
        vc3-shadow-lg
        focus:vc3-outline-none
        focus-visible:vc3-ring-2
        focus-visible:vc3-ring-sky-500
        focus-visible:vc3-ring-offset-2
        hover:vc3-shadow-xl
        hover:vc3--translate-y-0.5
      "
      :class="[
        hasIconURL
          ? 'vc3-bg-transparent vc3-overflow-hidden'
          : open
            ? 'vc3-bg-sky-600 vc3-text-white hover:vc3-bg-sky-500'
            : 'vc3-bg-white vc3-text-sky-600 hover:vc3-bg-sky-50',
        reducedMotion
          ? 'vc3-transition-none'
          : 'vc3-transition vc3-duration-200 vc3-ease-out',
      ]"
      :aria-expanded="open"
      :aria-pressed="open"
      :aria-label="buttonLabel"
      @click="handleToggle"
      @keydown.space.prevent="handleKeyToggle"
      @keydown.enter.prevent="handleKeyToggle"
    >
      <slot name="icon">
        <!-- Show image if iconURL is provided -->
        <img
          v-if="hasIconURL"
          :src="currentIconURL"
          :alt="open ? 'Close chat icon' : 'Open chat icon'"
          class="vc3-absolute vc3-inset-0 vc3-h-full vc3-w-full vc3-object-cover"
        >
        <!-- Show default SVG icon as fallback -->
        <svg
          v-else
          aria-hidden="true"
          class="vc3-h-6 vc3-w-6"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          viewBox="0 0 24 24"
        >
          <path
            d="
              M8.25 9.75h7.5m-7.5 3h4.5
              M21 12c0 1.268-.63 2.548-1.716 3.732
              -.9.986-2.124 1.986-3.555 2.884
              -.823.519-1.735.99-2.656 1.33a.75.75 0 0 1-.548 0
              17.214 17.214 0 0 1-2.656-1.33c-1.431-.898-2.655-1.898-3.555-2.884
              C3.63 14.548 3 13.268 3 12c0-4.694 4.398-8.25 9-8.25s9 3.556 9 8.25Z
            "
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </slot>
      <span v-if="unreadCount > 0" class="chatbot-activator-badge">{{
        unreadCount
      }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useWidgetStylesStore } from '../../stores/widget-styles'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  unreadCount: {
    type: Number,
    default: 0,
  },
  position: {
    type: String as () => 'left' | 'right',
    default: 'right',
    validator: (value: string) => ['left', 'right'].includes(value),
  },
  bottom: {
    type: Number,
    default: 24,
  },
  horizontalOffset: {
    type: Number,
    default: 24,
  },
  zIndex: {
    type: Number,
    default: 50,
  },
  label: {
    type: String,
    default: 'Open chat',
  },
})

const emit = defineEmits<{
  (event: 'open'): void
  (event: 'close'): void
  (event: 'toggle'): void
}>()

const widgetStylesStore = useWidgetStylesStore()
const launcherStyles = computed(() => widgetStylesStore.getLauncherStyles)

const buttonEl = ref<HTMLButtonElement | null>(null)
const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const buttonLabel = computed<string>(() => {
  if (props.open) return 'Close chat'
  if (props.unreadCount > 0) {
    return `Open chat, ${props.unreadCount} new messages`
  }
  return props.label
})

const currentIconURL = computed<string>(() => {
  if (props.open) {
    return launcherStyles.value.closeIconURL
  }
  return launcherStyles.value.openIconURL
})

const hasIconURL = computed<boolean>(() => {
  return Boolean(currentIconURL.value)
})

const positionStyle = computed<Record<string, string>>(() => ({
  bottom: `${props.bottom}px`,
  [props.position]: `${props.horizontalOffset}px`,
  zIndex: String(props.zIndex),
}))

const handleToggle = (): void => {
  emit('toggle')
  if (props.open) {
    emit('close')
    return
  }
  emit('open')
}

const handleKeyToggle = (): void => {
  handleToggle()
}

onMounted((): void => {
  if (!buttonEl.value) return
  buttonEl.value.dataset.testid = 'chatbot-activator'
})

defineExpose({
  el: buttonEl,
  focus: (): void => {
    buttonEl.value?.focus()
  },
})
</script>

<style scoped>
.chatbot-activator {
  height: 56px;
  width: 56px;
}

.chatbot-activator-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 22px;
  padding: 0 6px;
  border-radius: 9999px;
  background: #ef4444;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 22px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.15);
}
</style>
