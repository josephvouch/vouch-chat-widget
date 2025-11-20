import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { ITypingIndicatorConfig, ITypingIndicatorDot } from '@/types/messaging'
import { createTypingIndicator } from '@/utils/typing-indicator'

export const useMessagingUtilStore = defineStore('messaging-util', () => {
  const dotCount = ref(3)
  const delayStep = ref(0.18)
  const typingIndicatorLabel = ref('Assistant is typing')

  const typingIndicatorDots = computed<ITypingIndicatorDot[]>(() => createTypingIndicator(dotCount.value, delayStep.value))

  const configureTypingIndicator = ({ dots, delayStepSeconds, label }: ITypingIndicatorConfig = {}): void => {
    if (typeof dots === 'number') {
      dotCount.value = Math.max(0, Math.floor(dots))
    }
    if (typeof delayStepSeconds === 'number') {
      delayStep.value = Math.max(0, delayStepSeconds)
    }
    if (label) {
      typingIndicatorLabel.value = label
    }
  }

  return {
    dotCount,
    delayStep,
    typingIndicatorDots,
    typingIndicatorLabel,
    configureTypingIndicator,
  }
})
