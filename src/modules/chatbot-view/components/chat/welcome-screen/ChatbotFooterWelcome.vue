<template>
  <div
    class="chatbot-footer-welcome"
    :style="footerBackgroundStyles"
  >
    <div class="vc3-pb-2">
      <button
        type="button"
        class="
          vc3-inline-flex
          vc3-items-center
          vc3-justify-center
          vc3-rounded-full
          vc3-py-3
          vc3-text-sm
          vc3-font-semibold
          vc3-shadow-sm
          vc3-w-full
          disabled:vc3-cursor-not-allowed
          disabled:vc3-opacity-80
          focus-visible:vc3-outline
          focus-visible:vc3-outline-2
          focus-visible:vc3-outline-offset-2
          hover:vc3-opacity-95
        "
        :class="{ 'vc3-cursor-not-allowed vc3-opacity-80': loading }"
        :disabled="loading"
        :style="ctaButtonStyles"
        @click="handleClick"
      >
        <span v-if="!loading">Get Ready</span>
        <span
          v-else
          class="vc3-flex vc3-items-center vc3-justify-center vc3-gap-2"
        >
          <span class="vc3-h-4 vc3-w-4 vc3-animate-spin vc3-rounded-full vc3-border-2 vc3-border-white/60 vc3-border-t-white" />
          Processing...
        </span>
      </button>
    </div>

    <p
      class="vc3-text-right vc3-text-xs vc3-text-slate-400"
      :style="footerTextStyles"
    >
      Powered by Vouch
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useWidgetStylesStore } from '@/stores/widget-styles'

interface IProps {
  loading?: boolean
}

const props = defineProps<IProps>()

const emit = defineEmits<{
  (event: 'cta-click'): void
}>()

const widgetStylesStore = useWidgetStylesStore()
const loading = computed<boolean>(() => props.loading ?? false)

const conversationStyles = computed(() => widgetStylesStore.getConversationStyles)
const welcomeScreenStyles = computed(() => widgetStylesStore.getWelcomeScreenStyles)
const fontsStyles = computed(() => widgetStylesStore.getFontsStyles)
const footerStyles = computed(() => widgetStylesStore.getFooterStyles)

const footerBackgroundStyles = computed<Record<string, string>>(() => ({
  backgroundColor: conversationStyles.value.backgroundColor,
}))

const ctaButtonStyles = computed<Record<string, string>>(() => {
  const fontFamily = fontsStyles.value.body.replace(/\+/g, ' ')
  return {
    backgroundColor: welcomeScreenStyles.value.ctaButton?.bgColor ?? '#0d47a1',
    color: welcomeScreenStyles.value.ctaButton?.textColor ?? '#ffffff',
    fontFamily: `'${fontFamily}', sans-serif`,
  }
})

const footerTextStyles = computed<Record<string, string>>(() => {
  const fontFamily = fontsStyles.value.body.replace(/\+/g, ' ')
  return {
    fontFamily: `'${fontFamily}', sans-serif`,
    color: footerStyles.value.textColor ?? '#94a3b8',
  }
})

const handleClick = (): void => {
  if (loading.value) return
  emit('cta-click')
}
</script>

<style scoped>
.chatbot-footer-welcome {
  flex: 0 0 auto;
  padding: 0.75rem 1rem;
  position: relative;
  z-index: 10;
}
</style>
