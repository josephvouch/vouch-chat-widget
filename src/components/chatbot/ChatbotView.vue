<template>
  <transition
    enter-active-class="duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    enter-to-class="opacity-100 translate-y-0 sm:scale-100"
    leave-active-class="duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0 sm:scale-100"
    leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
  >
    <div
      v-show="open"
      ref="panelEl"
      class="chatbot-view fixed inset-x-3 bottom-24 z-[60] mx-auto flex max-h-[80vh] w-auto max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl sm:inset-auto sm:right-6 sm:bottom-[104px]"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      @keydown.esc.prevent="handleClose"
    >
      <header
        class="chatbot-view__header flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3"
      >
        <div class="min-w-0">
          <p
            :id="titleId"
            class="truncate text-base font-semibold text-slate-900"
          >
            {{ title }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            {{ subtitle }}
          </p>
        </div>
        <button
          type="button"
          class="inline-flex shrink-0 items-center rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          @click="handleClose"
        >
          <span class="sr-only">Close chat</span>
          <svg
            aria-hidden="true"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </header>

      <div
        ref="scrollContainer"
        class="flex-1 overflow-auto bg-slate-50 px-4 py-3"
      >
        <template v-if="messages.length === 0">
          <div
            class="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center"
          >
            <p class="text-sm font-medium text-slate-800">
              Start the conversation
            </p>
            <p class="mt-1 text-sm text-slate-500">
              Ask a question and we’ll respond shortly.
            </p>
          </div>
        </template>
        <template v-else>
          <ul class="space-y-3">
            <li
              v-for="message in messages"
              :key="message.id"
              class="flex gap-2"
            >
              <div
                :class="[
                  'max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-5 shadow-sm',
                  message.role === 'assistant'
                    ? 'bg-white text-slate-800 border border-slate-200'
                    : message.role === 'system'
                      ? 'mx-auto max-w-[70%] bg-slate-200 text-slate-600 text-xs uppercase tracking-wide'
                      : 'ml-auto bg-sky-600 text-white'
                ]"
              >
                <p class="whitespace-pre-wrap break-words">
                  {{ message.text }}
                </p>
                <p
                  v-if="message.role !== 'system'"
                  class="mt-1 text-xs text-slate-400"
                >
                  {{ formatTimestamp(message.ts) }}
                </p>
              </div>
            </li>
          </ul>
        </template>
        <div
          v-if="loading"
          class="mt-4 flex items-center gap-2 text-sm text-slate-500"
        >
          <span class="relative inline-flex h-2 w-2">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"
            />
            <span
              class="relative inline-flex h-2 w-2 rounded-full bg-sky-500"
            />
          </span>
          Typing…
        </div>
      </div>

      <footer class="border-t border-slate-200 bg-white px-4 py-3">
        <form class="flex items-end gap-2" @submit.prevent="handleSubmit">
          <label class="grow text-sm">
            <span class="sr-only">Your message</span>
            <textarea
              ref="composerEl"
              v-model="draft"
              class="h-11 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              placeholder="Ask us anything…"
              rows="1"
              @keydown.enter.exact.prevent="handleSubmit"
            />
          </label>
          <button
            type="submit"
            :disabled="composerDisabled"
            class="inline-flex shrink-0 items-center rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import type { ChatbotMessage } from '../../types/chatbot'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Live support'
  },
  subtitle: {
    type: String,
    default: 'Typically replies in under 5 minutes'
  },
  messages: {
    type: Array as () => ChatbotMessage[],
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'send', payload: { text: string }): void
  (event: 'ready'): void
  (event: 'resize', payload: { height: number }): void
}>()

const panelEl = ref<HTMLDivElement | null>(null)
const scrollContainer = ref<HTMLDivElement | null>(null)
const composerEl = ref<HTMLTextAreaElement | null>(null)
const draft = ref('')
const resizeObserver = ref<ResizeObserver | null>(null)
const titleId = `chatbot-view-title-${Math.random().toString(36).slice(2)}`

const composerDisabled = computed(() => !draft.value.trim() || props.loading)

const focusComposer = () => {
  if (!props.open) return
  nextTick(() => {
    composerEl.value?.focus()
    composerEl.value?.setSelectionRange(draft.value.length, draft.value.length)
  })
}

const handleClose = () => {
  emit('close')
}

const handleSubmit = () => {
  if (composerDisabled.value) return
  const text = draft.value.trim()
  if (!text) return
  draft.value = ''
  emit('send', { text })
}

const handleScrollToBottom = () => {
  nextTick(() => {
    const container = scrollContainer.value
    if (!container) return
    container.scrollTop = container.scrollHeight
  })
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      focusComposer()
      handleScrollToBottom()
    }
  },
  { immediate: true }
)

watch(
  () => props.messages.length,
  () => {
    handleScrollToBottom()
  }
)

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

onMounted(() => {
  emit('ready')
  if (!panelEl.value) return

  const canObserveResize =
    typeof window !== 'undefined' && 'ResizeObserver' in window
  if (canObserveResize && !resizeObserver.value) {
    resizeObserver.value = new ResizeObserver((entries) => {
      const entry = entries.at(0)
      if (!entry) return
      emit('resize', { height: Math.round(entry.contentRect.height) })
    })
    resizeObserver.value.observe(panelEl.value)
  } else if (panelEl.value) {
    emit('resize', { height: Math.round(panelEl.value.offsetHeight) })
  }
})

onUnmounted(() => {
  resizeObserver.value?.disconnect()
})
</script>

<style scoped>
.chatbot-view {
  max-height: min(640px, 80vh);
}

@media (max-width: 640px) {
  .chatbot-view {
    inset: auto 0 0 0;
    border-radius: 1.5rem 1.5rem 0 0;
  }
}
</style>
