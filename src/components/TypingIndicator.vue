<template>
  <div
    class="typing-indicator vc3-flex vc3-items-center vc3-gap-2 vc3-text-sm"
    role="status"
    aria-live="polite"
  >
    <span
      v-for="dot in typingIndicatorDots"
      :key="dot.id"
      class="typing-indicator__dot vc3-inline-block vc3-rounded-full vc3-bg-current"
      :style="dot.style"
    />
    <span class="vc3-sr-only">{{ typingIndicatorLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useMessagingUtilStore } from '@/stores/messaging-util.store'

const messagingUtilStore = useMessagingUtilStore()
const { typingIndicatorDots, typingIndicatorLabel } = storeToRefs(messagingUtilStore)
</script>

<style scoped>
.typing-indicator__dot {
  height: 0.6rem;
  width: 0.6rem;
  opacity: 0.25;
  animation: vc3-typing-indicator 1s infinite ease-in-out;
}

@keyframes vc3-typing-indicator {
  0%,
  80%,
  100% {
    opacity: 0.2;
    transform: scale(0.75);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
