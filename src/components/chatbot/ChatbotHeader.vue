<template>
  <div
    class="
      chatbot-header
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
    :style="headerStyles"
  >
    <div class="vc3-min-w-0 vc3-flex-1">
      <p
        :id="titleId"
        class="vc3-truncate vc3-font-semibold"
        :style="titleStyles"
      >
        {{ displayTitle }}
      </p>
    </div>
    <div class="vc3-flex vc3-items-center vc3-justify-center vc3-h-full">
      <button
        type="button"
        class="vc3-cursor-pointer vc3-border-0 vc3-bg-transparent vc3-p-0"
        :style="closeButtonStyles"
        @click="handleClose"
      >
        <span class="vc3-sr-only">Close chat</span>
        <IconMinimize
          aria-hidden="true"
          class="vc3-h-6 vc3-w-6"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import IconMinimize from '../../assets/icon-minimize.vue'
import { useWidgetStylesStore } from '../../stores/widget-styles'

interface IProps {
  titleId: string
}

defineProps<IProps>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

// Get header styles from widget-styles store
const widgetStylesStore = useWidgetStylesStore()
const activeStyles = computed(() => widgetStylesStore.getHeaderStyles)

const displayTitle = computed<string>(() => activeStyles.value.title)

const headerStyles = computed<Record<string, string>>(() => ({
  backgroundColor: activeStyles.value.bgColor,
  color: activeStyles.value.textColor,
}))

const titleStyles = computed<Record<string, string>>(() => {
  const styles: Record<string, string> = {
    color: activeStyles.value.textColor,
    fontSize: `${activeStyles.value.titleSize}px`,
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
}
</style>
