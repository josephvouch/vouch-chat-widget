<template>
  <div
    class="chatbot-view"
    :aria-labelledby="titleId"
  >
    <!-- Fixed Header -->
    <div
      class="
        chatbot-view__header
        vc3-bg-white
        vc3-flex
        vc3-flex-shrink-0
        vc3-items-start
        vc3-justify-between
        vc3-gap-3
        vc3-border-b
        vc3-border-slate-200
        vc3-px-4
        vc3-py-3
      "
    >
      <div class="vc3-min-w-0 vc3-flex-1">
        <p
          :id="titleId"
          class="vc3-truncate vc3-text-base vc3-font-semibold vc3-text-slate-900"
        >
          {{ title }}
        </p>
        <p class="vc3-mt-1 vc3-text-xs vc3-text-slate-500">
          {{ subtitle }}
        </p>
      </div>
      <button
        type="button"
        class="
          vc3-inline-flex
          vc3-flex-shrink-0
          vc3-items-center
          vc3-rounded-md
          vc3-p-1
          vc3-text-slate-400
          vc3-transition
          hover:vc3-bg-slate-100
          hover:vc3-text-slate-600
          focus-visible:vc3-outline
          focus-visible:vc3-outline-2
          focus-visible:vc3-outline-offset-2
          focus-visible:vc3-outline-sky-500
        "
        @click="handleClose"
      >
        <span class="vc3-sr-only">Close chat</span>
        <svg
          aria-hidden="true"
          class="vc3-h-5 vc3-w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="
              M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414
              L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414
              L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414Z
            "
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- Scrollable Body -->
    <div
      ref="scrollContainer"
      class="
        chatbot-view__body
        vc3-flex-1
        vc3-min-h-0
        vc3-overflow-y-auto
        vc3-bg-slate-50
        vc3-px-4
        vc3-py-3
      "
    >
      <template v-if="messages.length === 0">
        <div
          class="
            vc3-rounded-xl
            vc3-border
            vc3-border-dashed
            vc3-border-slate-300
            vc3-bg-white
            vc3-px-4
            vc3-py-6
            vc3-text-center
          "
        >
          <p class="vc3-text-sm vc3-font-medium vc3-text-slate-800">
            Start the conversation
          </p>
          <p class="vc3-mt-1 vc3-text-sm vc3-text-slate-500">
            Ask a question and we'll respond shortly.
          </p>
        </div>
      </template>
      <template v-else>
        <ul class="vc3-space-y-3">
          <li
            v-for="message in messages"
            :key="message.id"
            class="vc3-flex vc3-gap-2"
          >
            <div
              :class="[
                baseBubbleClass,
                message.role === 'assistant'
                  ? assistantBubbleClass
                  : message.role === 'system'
                    ? systemBubbleClass
                    : userBubbleClass,
              ]"
            >
              <p class="vc3-whitespace-pre-wrap vc3-break-words">
                {{ message.text }}
              </p>
              <p
                v-if="message.role !== 'system'"
                class="vc3-mt-1 vc3-text-xs vc3-text-slate-400"
              >
                {{ formatTimestamp(message.ts) }}
              </p>
            </div>
          </li>
        </ul>
      </template>
      <div
        v-if="loading"
        class="vc3-mt-4 vc3-flex vc3-items-center vc3-gap-2 vc3-text-sm vc3-text-slate-500"
      >
        <span class="vc3-relative vc3-inline-flex vc3-h-2 vc3-w-2">
          <span
            class="vc3-absolute vc3-inline-flex vc3-h-full vc3-w-full vc3-animate-ping vc3-rounded-full vc3-bg-sky-400 vc3-opacity-75"
          />
          <span
            class="vc3-relative vc3-inline-flex vc3-h-2 vc3-w-2 vc3-rounded-full vc3-bg-sky-500"
          />
        </span>
        Typing…
      </div>
    </div>

    <!-- Fixed Footer -->
    <div
      class="
        chatbot-view__footer
        vc3-flex-shrink-0
        vc3-border-t
        vc3-border-slate-200
        vc3-bg-white
        vc3-px-4
        vc3-py-3
      "
    >
      <form
        class="vc3-flex vc3-items-end vc3-gap-2"
        @submit.prevent="handleSubmit"
      >
        <label class="vc3-flex-1 vc3-text-sm">
          <span class="vc3-sr-only">Your message</span>
          <textarea
            ref="composerEl"
            v-model="draft"
            class="
              vc3-h-11
              vc3-w-full
              vc3-resize-none
              vc3-rounded-xl
              vc3-border
              vc3-border-slate-200
              vc3-px-3
              vc3-py-2
              vc3-text-sm
              vc3-text-slate-900
              vc3-shadow-inner
              focus:vc3-border-sky-400
              focus:vc3-outline-none
              focus:vc3-ring-2
              focus:vc3-ring-sky-100
            "
            placeholder="Ask us anything…"
            rows="1"
            @keydown.enter.exact.prevent="handleSubmit"
          />
        </label>
        <button
          type="submit"
          :disabled="composerDisabled"
          class="
            vc3-inline-flex
            vc3-flex-shrink-0
            vc3-items-center
            vc3-rounded-xl
            vc3-bg-sky-600
            vc3-px-3
            vc3-py-2
            vc3-text-sm
            vc3-font-semibold
            vc3-text-white
            vc3-shadow-sm
            vc3-transition
            hover:vc3-bg-sky-500
            focus-visible:vc3-outline
            focus-visible:vc3-outline-2
            focus-visible:vc3-outline-offset-2
            focus-visible:vc3-outline-sky-500
            disabled:vc3-cursor-not-allowed
            disabled:vc3-bg-slate-300
            disabled:vc3-text-slate-600
          "
        >
          Send
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import type { ChatbotMessage } from '../../types/chatbot'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Live support',
  },
  subtitle: {
    type: String,
    default: 'Typically replies in under 5 minutes',
  },
  messages: {
    type: Array as () => ChatbotMessage[],
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'send', payload: { text: string }): void
  (event: 'ready'): void
}>()

const scrollContainer = ref<HTMLDivElement | null>(null)
const composerEl = ref<HTMLTextAreaElement | null>(null)
const draft = ref('')
const titleId = `chatbot-view-title-${Math.random().toString(36).slice(2)}`

const composerDisabled = computed<boolean>(
  () => !draft.value.trim() || props.loading,
)

const baseBubbleClass = [
  'vc3-max-w-[80%]',
  'vc3-rounded-2xl',
  'vc3-px-3',
  'vc3-py-2',
  'vc3-text-sm',
  'vc3-leading-5',
  'vc3-shadow-sm',
].join(' ')

const assistantBubbleClass = [
  'vc3-bg-white',
  'vc3-text-slate-800',
  'vc3-border',
  'vc3-border-slate-200',
].join(' ')

const systemBubbleClass = [
  'vc3-mx-auto',
  'vc3-max-w-[70%]',
  'vc3-bg-slate-200',
  'vc3-text-slate-600',
  'vc3-text-xs',
  'vc3-uppercase',
  'vc3-tracking-wide',
].join(' ')

const userBubbleClass = [
  'vc3-ml-auto',
  'vc3-bg-sky-600',
  'vc3-text-white',
].join(' ')

const focusComposer = (): void => {
  if (!props.open) return
  void nextTick((): void => {
    composerEl.value?.focus()
    composerEl.value?.setSelectionRange(draft.value.length, draft.value.length)
  })
}

const handleClose = (): void => {
  emit('close')
}

const handleSubmit = (): void => {
  if (composerDisabled.value) return
  const text = draft.value.trim()
  if (!text) return
  draft.value = ''
  emit('send', { text })
}

const handleScrollToBottom = (): void => {
  void nextTick((): void => {
    const container = scrollContainer.value
    if (!container) return
    container.scrollTop = container.scrollHeight
  })
}

watch(
  () => props.open,
  (isOpen: boolean) => {
    if (isOpen) {
      focusComposer()
      handleScrollToBottom()
    }
  },
  { immediate: true },
)

watch(
  () => props.messages.length,
  () => {
    handleScrollToBottom()
  },
)

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

onMounted((): void => {
  emit('ready')
})
</script>

<style scoped>
/**
 * Fixed Header/Footer Layout Architecture
 *
 * This layout uses flexbox to create a fixed header and footer
 * with a scrollable body that fills the remaining space.
 *
 * Key architectural principles:
 * 1. Root element takes full height of parent (iframe)
 * 2. Flexbox column layout with no gaps/padding on root
 * 3. Header/footer use flex-shrink: 0 (never shrink)
 * 4. Body uses flex: 1 1 0 with min-height: 0 (allows proper scrolling)
 * 5. Overflow-y: auto on body enables scrolling
 */

.chatbot-view {
  /* Fill parent container (iframe) completely */
  height: 100%;
  width: 100%;

  /* Flexbox column layout */
  display: flex;
  flex-direction: column;

  /* Remove any default spacing */
  margin: 0;
  padding: 0;

  /* Prevent layout shifts */
  overflow: hidden;
}

.chatbot-view__header {
  /* Prevent header from shrinking */
  flex: 0 0 auto;

  /* Ensure header stays on top */
  position: relative;
  z-index: 10;
}

.chatbot-view__body {
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

.chatbot-view__footer {
  /* Prevent footer from shrinking */
  flex: 0 0 auto;

  /* Ensure footer stays on bottom */
  position: relative;
  z-index: 10;
}

/**
 * Scroll optimization for better performance
 */
.chatbot-view__body::-webkit-scrollbar {
  width: 6px;
}

.chatbot-view__body::-webkit-scrollbar-track {
  background: transparent;
}

.chatbot-view__body::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

.chatbot-view__body::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}
</style>
