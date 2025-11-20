import type { ITypingIndicatorDot } from '@/types/messaging'

/**
 * Create a reusable typing indicator descriptor that can be rendered with v-for.
 * The generated dots share the same animation but stagger their delays so the
 * indicator feels dynamic.
 */
export const createTypingIndicator = (dots = 3, delayStepSeconds = 0.18): ITypingIndicatorDot[] => {
  if (dots <= 0) {
    return []
  }

  return Array.from({ length: dots }, (_, index) => ({
    id: `typing-dot-${index}`,
    style: Object.freeze({
      animationDelay: `${(index * delayStepSeconds).toFixed(2)}s`,
    }),
  }))
}
