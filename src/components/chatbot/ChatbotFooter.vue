<template>
  <div
    class="chatbot-footer"
    :style="footerBackgroundStyles"
  >
    <form
      class="vc3-relative vc3-mb-2"
      @submit.prevent="handleSubmit"
    >
      <label class="vc3-block">
        <span class="vc3-sr-only">Your message</span>
        <input
          ref="composerEl"
          v-model="draft"
          type="text"
          :style="inputFieldStyles"
          class="
            vc3-w-full
            vc3-rounded-full
            vc3-border
            vc3-border-slate-200
            vc3-pl-4
            vc3-pr-20
            vc3-py-3
            vc3-text-sm
            vc3-shadow-sm
            focus:vc3-outline-none
          "
          placeholder="Type your message."
          @keydown.enter.exact.prevent="handleSubmit"
        />
      </label>

      <!-- Icons inside input (right side) -->
      <div class="vc3-absolute vc3-right-2 vc3-top-1/2 vc3-flex vc3-items-center vc3-gap-1 vc3--translate-y-1/2">
        <!-- Attachment button -->
        <button
          type="button"
          :style="attachmentButtonStyles"
          class="
            vc3-inline-flex
            vc3-items-center
            vc3-justify-center
            vc3-rounded-full
            vc3-p-2
            vc3-transition
            hover:vc3-opacity-80
            focus-visible:vc3-outline
            focus-visible:vc3-outline-2
            focus-visible:vc3-outline-offset-2
            focus-visible:vc3-outline-slate-400
          "
          @click="handleAttachment"
        >
          <span class="vc3-sr-only">Attach file</span>
          <IconAttachment
            aria-hidden="true"
            class="vc3-h-5 vc3-w-5"
          />
        </button>

        <!-- Send button -->
        <button
          type="submit"
          :disabled="composerDisabled"
          :style="sendButtonStyles"
          class="
            vc3-inline-flex
            vc3-items-center
            vc3-justify-center
            vc3-rounded-full
            vc3-p-2
            vc3-cursor-pointer
            vc3-transition
            hover:vc3-opacity-90
            focus-visible:vc3-outline
            focus-visible:vc3-outline-2
            focus-visible:vc3-outline-offset-2
            disabled:vc3-cursor-not-allowed
            disabled:vc3-bg-slate-300
            disabled:vc3-text-slate-500
          "
        >
          <span class="vc3-sr-only">Send message</span>
          <IconSend
            aria-hidden="true"
            class="vc3-h-5 vc3-w-5"
          />
        </button>
      </div>
    </form>

    <!-- Powered by text (right aligned) -->
    <p
      class="vc3-text-right vc3-text-xs vc3-text-slate-400"
      :style="footerTextStyles"
    >
      Powered by Vouch
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import IconAttachment from '../../assets/icon-attachment.vue'
import IconSend from '../../assets/icon-send.vue'
import { useWidgetStylesStore } from '../../stores/widget-styles'

interface IProps {
  open: boolean
}

const props = defineProps<IProps>()

const emit = defineEmits<{
  (event: 'send', payload: { text: string }): void
}>()

const widgetStylesStore = useWidgetStylesStore()
const inputStyles = computed(() => widgetStylesStore.getInputStyles)
const conversationStyles = computed(() => widgetStylesStore.getConversationStyles)
const fontsStyles = computed(() => widgetStylesStore.getFontsStyles)

const composerEl = ref<HTMLInputElement | null>(null)
const draft = ref('')

const composerDisabled = computed<boolean>(() => !draft.value.trim())

const footerBackgroundStyles = computed<Record<string, string>>(() => ({
  backgroundColor: conversationStyles.value.backgroundColor,
}))

const inputFieldStyles = computed<Record<string, string>>(() => ({
  backgroundColor: inputStyles.value.bgColor,
  color: inputStyles.value.textColor,
}))

const attachmentButtonStyles = computed<Record<string, string>>(() => ({
  backgroundColor: inputStyles.value.attachmentButton.bgColor,
  color: inputStyles.value.attachmentButton.iconColor,
}))

const sendButtonStyles = computed<Record<string, string>>(() => ({
  backgroundColor: inputStyles.value.sendButton.bgColor,
  color: inputStyles.value.sendButton.iconColor,
}))

const footerTextStyles = computed<Record<string, string>>(() => {
  const fontFamily = fontsStyles.value.body.replace(/\+/g, ' ')
  return {
    fontFamily: `'${fontFamily}', sans-serif`,
  }
})

const focusComposer = (): void => {
  if (!props.open) return
  void nextTick((): void => {
    composerEl.value?.focus()
  })
}

const handleSubmit = (): void => {
  if (composerDisabled.value) return
  const text = draft.value.trim()
  if (!text) return
  draft.value = ''
  emit('send', { text })
}

const handleAttachment = (): void => {
  // TODO: Implement attachment functionality
  console.info('[ChatbotFooter] Attachment clicked')
}

watch(
  () => props.open,
  (isOpen: boolean) => {
    if (isOpen) {
      focusComposer()
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.chatbot-footer {
  /* Prevent footer from shrinking */
  flex: 0 0 auto;

  /* Styling */
  padding: 0.75rem 1rem;

  /* Ensure footer stays on bottom */
  position: relative;
  z-index: 10;
}
</style>