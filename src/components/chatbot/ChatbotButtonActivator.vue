<template>
  <div
    class="chatbot-activator-wrapper pointer-events-none fixed"
    :style="positionStyle"
    aria-live="polite"
  >
    <button
      ref="buttonEl"
      type="button"
      class="chatbot-activator pointer-events-auto relative flex items-center justify-center rounded-full shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
      :class="[
        open ? 'bg-sky-600 text-white' : 'bg-white text-sky-600',
        reducedMotion ? 'transition-none' : 'transition duration-200 ease-out'
      ]"
      :aria-expanded="open"
      :aria-pressed="open"
      :aria-label="buttonLabel"
      @click="handleToggle"
      @keydown.space.prevent="handleKeyToggle"
      @keydown.enter.prevent="handleKeyToggle"
    >
      <slot name="icon">
        <svg
          aria-hidden="true"
          class="h-6 w-6"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          viewBox="0 0 24 24"
        >
          <path
            d="M8.25 9.75h7.5m-7.5 3h4.5M21 12c0 1.268-.63 2.548-1.716 3.732-.9.986-2.124 1.986-3.555 2.884-.823.519-1.735.99-2.656 1.33a.75.75 0 0 1-.548 0 17.214 17.214 0 0 1-2.656-1.33c-1.431-.898-2.655-1.898-3.555-2.884C3.63 14.548 3 13.268 3 12c0-4.694 4.398-8.25 9-8.25s9 3.556 9 8.25Z"
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

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  position: {
    type: String as () => 'left' | 'right',
    default: 'right',
    validator: (value: string) => ['left', 'right'].includes(value)
  },
  bottom: {
    type: Number,
    default: 24
  },
  horizontalOffset: {
    type: Number,
    default: 24
  },
  zIndex: {
    type: Number,
    default: 50
  },
  label: {
    type: String,
    default: 'Open chat'
  }
})

const emit = defineEmits<{
  (event: 'open'): void
  (event: 'close'): void
  (event: 'toggle'): void
}>()

const buttonEl = ref<HTMLButtonElement | null>(null)
const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const buttonLabel = computed(() =>
  props.open
    ? `Close chat`
    : props.unreadCount > 0
      ? `Open chat, ${props.unreadCount} new messages`
      : props.label
)

const positionStyle = computed(() => ({
  bottom: `${props.bottom}px`,
  [props.position]: `${props.horizontalOffset}px`,
  zIndex: props.zIndex
}))

const handleToggle = () => {
  emit('toggle')
  emit(props.open ? 'close' : 'open')
}

const handleKeyToggle = () => {
  handleToggle()
}

onMounted(() => {
  if (!buttonEl.value) return
  buttonEl.value.dataset.testid = 'chatbot-activator'
})

defineExpose({
  el: buttonEl,
  focus: () => buttonEl.value?.focus()
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
