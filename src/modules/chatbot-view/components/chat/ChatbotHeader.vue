<template>
  <div class="chatbot-header vc3-flex-shrink-0 vc3-border-b vc3-border-slate-200 vc3-px-4 vc3-py-4" :style="headerStyles">
    <template v-if="showWelcome">
      <!-- Welcome layout: taller header with avatar, title, phrase and greetings text -->
      <div class="vc3-flex vc3-flex-col vc3-gap-3 vc3-w-full">
        <!-- Row 1: avatar + close button -->
        <div class="vc3-flex vc3-items-start vc3-justify-between vc3-gap-3">
          <div v-if="avatarUrl" class="vc3-flex-shrink-0">
            <div class="vc3-h-24 vc3-w-24 vc3-rounded-full vc3-overflow-hidden vc3-bg-slate-200">
              <img :src="avatarUrl" :alt="`${displayTitle} avatar`" class="vc3-h-full vc3-w-full vc3-object-cover" />
            </div>
          </div>
          <div class="vc3-flex vc3-items-start vc3-justify-center">
            <button
              type="button"
              class="vc3-cursor-pointer vc3-border-0 vc3-bg-transparent vc3-p-0"
              :style="closeButtonStyles"
              @click="handleClose"
            >
              <span class="vc3-sr-only">Close chat</span>
              <span aria-hidden="true" class="vc3-text-3xl vc3-leading-none"> × </span>
            </button>
          </div>
        </div>

        <!-- Rows 2-4: title, welcome phrase, greetings text -->
        <div class="vc3-min-w-0 vc3-w-full">
          <p :id="titleId" class="vc3-font-semibold vc3-truncate" :style="titleStyles">
            {{ displayTitle }}
          </p>
          <p v-if="welcomePhrase" class="vc3-mt-1 vc3-text-xs vc3-truncate" :style="subtitleStyles">
            {{ welcomePhrase }}
          </p>
          <p v-if="greetingsText" class="vc3-mt-1 vc3-text-[11px] vc3-truncate" :style="subtitleStyles">
            {{ greetingsText }}
          </p>
        </div>
      </div>
    </template>

    <template v-else>
      <!-- Main layout: compact header with smaller avatar and text on the right -->
      <div class="vc3-flex vc3-items-center vc3-justify-between vc3-gap-3 vc3-w-full">
        <div class="vc3-flex vc3-items-center vc3-gap-3 vc3-min-w-0 vc3-w-full">
          <div v-if="avatarUrl" class="vc3-flex-shrink-0">
            <div class="vc3-h-10 vc3-w-10 vc3-rounded-full vc3-overflow-hidden vc3-bg-slate-200">
              <img :src="avatarUrl" :alt="`${displayTitle} avatar`" class="vc3-h-full vc3-w-full vc3-object-cover" />
            </div>
          </div>
          <div class="vc3-min-w-0 vc3-w-full">
            <p :id="titleId" class="vc3-font-semibold vc3-truncate" :style="titleStyles">
              {{ displayTitle }}
            </p>
            <p v-if="welcomePhrase" class="vc3-mt-0.5 vc3-text-xs vc3-truncate" :style="subtitleStyles">
              {{ welcomePhrase }}
            </p>
          </div>
        </div>

        <!-- Right: close button -->
        <div class="vc3-flex vc3-items-center vc3-justify-center vc3-h-full">
          <button
            type="button"
            class="vc3-cursor-pointer vc3-border-0 vc3-bg-transparent vc3-p-0"
            :style="closeButtonStyles"
            @click="handleClose"
          >
            <span class="vc3-sr-only">Close chat</span>
            <span aria-hidden="true" class="vc3-text-3xl vc3-leading-none"> × </span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useWidgetStylesStore } from '@/stores/widget-styles'

interface IProps {
  titleId: string
  showWelcome?: boolean
}

defineProps<IProps>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

// Get header styles from widget-styles store
const widgetStylesStore = useWidgetStylesStore()
const activeStyles = computed(() => widgetStylesStore.getHeaderStyles)
const conversationStyles = computed(() => widgetStylesStore.getConversationStyles)
const welcomeScreenStyles = computed(() => widgetStylesStore.getWelcomeScreenStyles)
const fontsStyles = computed(() => widgetStylesStore.getFontsStyles)

const displayTitle = computed<string>(() => activeStyles.value.title)

const avatarUrl = computed<string>(() => conversationStyles.value.avatarUrl ?? '')
const welcomePhrase = computed<string>(() => welcomeScreenStyles.value.welcomePhrase ?? '')
const greetings = computed<string[]>(() => welcomeScreenStyles.value.greetings ?? [])
const greetingsText = computed<string>(() => (greetings.value && greetings.value.length > 0 ? greetings.value.join(' ') : ''))

const headerStyles = computed<Record<string, string>>(() => ({
  backgroundColor: activeStyles.value.bgColor,
  color: activeStyles.value.textColor,
}))

const titleStyles = computed<Record<string, string>>(() => {
  const styles: Record<string, string> = {
    color: activeStyles.value.textColor,
    fontSize: `${Math.min(activeStyles.value.titleSize, 15)}px`,
    fontWeight: '700',
  }

  // Apply font family if available
  if (activeStyles.value.font) {
    const fontFamily = activeStyles.value.font.replace(/\+/g, ' ')
    styles.fontFamily = `'${fontFamily}', sans-serif`
  }

  // Apply text alignment based on titleFormat
  if (activeStyles.value.titleFormat === 'centralised') {
    styles.textAlign = 'center'
  } else if (activeStyles.value.titleFormat === 'left') {
    styles.textAlign = 'left'
  } else if (activeStyles.value.titleFormat === 'right') {
    styles.textAlign = 'right'
  }

  return styles
})

const subtitleStyles = computed<Record<string, string>>(() => {
  const styles: Record<string, string> = {}
  const bodyFont = fontsStyles.value.body

  if (bodyFont) {
    const fontFamily = bodyFont.replace(/\+/g, ' ')
    styles.fontFamily = `'${fontFamily}', sans-serif`
  }

  styles.color = activeStyles.value.textColor
  styles.opacity = '0.9'
  styles.fontSize = '12px'

  // Align subtitle following header.titleFormat
  if (activeStyles.value.titleFormat === 'centralised') {
    styles.textAlign = 'center'
  } else if (activeStyles.value.titleFormat === 'left') {
    styles.textAlign = 'left'
  } else if (activeStyles.value.titleFormat === 'right') {
    styles.textAlign = 'right'
  }

  return styles
})

const closeButtonStyles = computed<Record<string, string>>(() => ({
  color: activeStyles.value.closeIconColor,
}))

const handleClose = (): void => {
  emit('close')
}
</script>

<style scoped>
.chatbot-header {
  /* Prevent header from shrinking */
  flex: 0 0 auto;

  /* Ensure header stays on top */
  position: relative;
  z-index: 10;

  /* Subtle shadow under header */
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}
</style>
