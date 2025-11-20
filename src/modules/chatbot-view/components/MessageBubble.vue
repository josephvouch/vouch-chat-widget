<template>
  <div class="message-bubble-wrapper" :class="wrapperClass">
    <div class="message-bubble-container" :class="containerClass">
      <!-- Avatar for left bubble (only if not fromMe and avatarUrl exists) -->
      <div v-if="!message.fromMe && conversationStyles.avatarUrl" class="vc3-flex-shrink-0 vc3-mr-1 vc3-self-start">
        <img :src="conversationStyles.avatarUrl" :alt="`${message.senderBy} avatar`" class="vc3-h-8 vc3-w-8 vc3-rounded-full" />
      </div>

      <div :class="bubbleWrapperClass">
        <!-- Sender label ('You' for own messages only) -->
        <p
          v-if="message.fromMe"
          class="vc3-mb-1 vc3-text-xs vc3-font-medium vc3-text-slate-600"
          :class="nameAlignmentClass"
          :style="dateStyles"
        >
          You
        </p>

        <div class="message-bubble" :style="bubbleStyles">
          <template v-if="message.fromMe">
            <p class="vc3-whitespace-pre-wrap vc3-break-words" :style="textStyles">
              {{ message.text }}
            </p>
          </template>
          <TypingIndicator v-else-if="isTypingIndicator" />
          <MarkdownText v-else :content="message.text" :style="textStyles" />
        </div>

        <!-- Date outside the bubble -->
        <p class="vc3-mt-1 vc3-text-xs vc3-text-slate-600 vc3-mt-2 vc3-opacity-70" :class="dateAlignmentClass" :style="dateStyles">
          {{ formattedDate }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import MarkdownText from '@/components/MarkdownText.vue'
import TypingIndicator from '@/components/TypingIndicator.vue'
import type { IMessage } from '@/services/apis/chat-microservice/types'
import { useWidgetStylesStore } from '@/stores/widget-styles'

interface IProps {
  message: IMessage
}

const props = defineProps<IProps>()

const widgetStylesStore = useWidgetStylesStore()
const conversationStyles = computed(() => widgetStylesStore.getConversationStyles)
const fontsStyles = computed(() => widgetStylesStore.getFontsStyles)
const isTypingIndicator = computed(() => props.message.msgType === 'typing-indicator')

// Wrapper class for overall alignment
const wrapperClass = computed<string>(() => {
  if (props.message.fromMe) {
    return 'vc3-flex vc3-flex-col vc3-items-end'
  }
  return 'vc3-flex vc3-flex-col vc3-items-start'
})

// Container class based on message direction
const containerClass = computed<string>(() => {
  if (props.message.fromMe) {
    return 'vc3-flex vc3-justify-end vc3-gap-2'
  }
  return 'vc3-flex vc3-justify-start vc3-gap-2'
})

const bubbleWrapperClass = computed<string>(() => {
  if (props.message.fromMe) {
    return 'vc3-flex vc3-flex-col vc3-justify-end vc3-items-end'
  }
  return 'vc3-flex vc3-flex-col vc3-justify-start vc3-items-start'
})

// Date alignment class
const dateAlignmentClass = computed<string>(() => {
  if (props.message.fromMe) {
    return 'vc3-text-right'
  }
  return 'vc3-text-left'
})

// Bubble styles based on message direction
const bubbleStyles = computed<Record<string, string>>(() => {
  const isFromMe = props.message.fromMe
  const bubble = isFromMe ? conversationStyles.value.rightBubble : conversationStyles.value.leftBubble

  return {
    backgroundColor: bubble.bgColor,
    color: bubble.textColor,
    borderRadius: `${conversationStyles.value.bubbleRadius}px`,
    maxWidth: '80%',
    padding: '0.75rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  }
})

// Text styles with font family
const textStyles = computed<Record<string, string>>(() => {
  const fontFamily = fontsStyles.value.body.replace(/\+/g, ' ')
  return {
    fontFamily: `'${fontFamily}', sans-serif`,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  }
})

// Date styles with font family
const dateStyles = computed<Record<string, string>>(() => {
  const fontFamily = fontsStyles.value.body.replace(/\+/g, ' ')
  return {
    fontFamily: `'${fontFamily}', sans-serif`,
  }
})

const nameAlignmentClass = computed<string>(() => {
  if (props.message.fromMe) {
    return 'vc3-text-right'
  }
  return 'vc3-text-left'
})

// Format timestamp
const formattedDate = computed<string>(() => {
  const date = new Date(props.message.createdAt)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
})
</script>

<style lang="scss" scoped>
.message-bubble-wrapper {
  width: 100%;
}

.message-bubble-container {
  display: flex;
  align-items: flex-end;
}
</style>
