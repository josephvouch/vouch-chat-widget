<template>
  <div
    class="chatbot-body-welcome vc3-flex-1 vc3-min-h-0 vc3-overflow-y-auto vc3-px-4 vc3-py-6"
    :style="bodyStyles"
  >
    <!-- If greetings exist, show them as left-aligned message bubbles -->
    <template v-if="hasGreetings">
      <div class="vc3-flex vc3-h-full vc3-flex-col vc3-justify-start vc3-gap-3">
        <div
          v-for="(greeting, index) in greetings"
          :key="`welcome-greeting-bubble-${index}`"
          class="vc3-flex vc3-items-start vc3-gap-2"
        >
          <!-- Avatar only for the first bubble, keep alignment for the rest -->
          <div class="vc3-flex-shrink-0">
            <template v-if="index === 0 && avatarUrl">
              <img
                :src="avatarUrl"
                :alt="`${headerTitle} avatar`"
                class="vc3-h-8 vc3-w-8 vc3-rounded-full vc3-object-cover"
              />
            </template>
            <template v-else>
              <span class="vc3-inline-block vc3-h-8 vc3-w-8" />
            </template>
          </div>

          <div>
            <p
              class="vc3-inline-block vc3-max-w-[18rem] vc3-text-sm vc3-font-medium vc3-px-3 vc3-py-2"
              :style="leftBubbleStyles"
            >
              {{ greeting }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- If greetings are empty, fall back to the original welcome hero layout -->
    <template v-else>
      <div class="vc3-flex vc3-h-full vc3-flex-col vc3-items-center vc3-justify-center vc3-gap-6 vc3-text-center">
        <div
          v-if="greetings.length > 0"
          class="vc3-flex vc3-flex-col vc3-gap-2"
        >
          <p
            v-for="(greeting, index) in greetings"
            :key="`welcome-greeting-${index}`"
            class="vc3-inline-block vc3-max-w-[18rem] vc3-rounded-full vc3-px-4 vc3-py-2 vc3-text-sm vc3-font-medium"
            :style="bubbleStyles"
          >
            {{ greeting }}
          </p>
        </div>

        <div
          v-if="avatarUrl"
          class="vc3-flex vc3-items-center vc3-justify-center"
        >
          <img
            :src="avatarUrl"
            :alt="`${headerTitle} welcome illustration`"
            class="vc3-h-32 vc3-w-32 vc3-rounded-full vc3-object-cover vc3-shadow-md"
          />
        </div>

        <p
          v-if="welcomePhrase"
          class="vc3-text-base vc3-font-semibold"
          :style="welcomePhraseStyles"
        >
          {{ welcomePhrase }}
        </p>

        <p
          class="vc3-text-sm vc3-text-slate-600"
          :style="nameStyles"
        >
          {{ headerTitle }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useWidgetStylesStore } from '@/stores/widget-styles'

const widgetStylesStore = useWidgetStylesStore()

const conversationStyles = computed(() => widgetStylesStore.getConversationStyles)
const headerStyles = computed(() => widgetStylesStore.getHeaderStyles)
const welcomeScreenStyles = computed(() => widgetStylesStore.getWelcomeScreenStyles)
const fontsStyles = computed(() => widgetStylesStore.getFontsStyles)

const greetings = computed<string[]>(() => welcomeScreenStyles.value.greetings ?? [])
const avatarUrl = computed<string>(() => conversationStyles.value.avatarUrl)
const welcomePhrase = computed<string>(() => welcomeScreenStyles.value.welcomePhrase ?? '')
const headerTitle = computed<string>(() => headerStyles.value.title)

const bodyStyles = computed<Record<string, string>>(() => ({
  backgroundColor: conversationStyles.value.backgroundColor,
}))

const hasGreetings = computed<boolean>(() => greetings.value.length > 0)

const bubbleStyles = computed<Record<string, string>>(() => ({
  backgroundColor: welcomeScreenStyles.value.bubble?.bgColor ?? '#ffffff',
  color: welcomeScreenStyles.value.bubble?.textColor ?? '#1f2937',
  borderRadius: `${conversationStyles.value.bubbleRadius}px`,
}))

const leftBubbleStyles = computed<Record<string, string>>(() => ({
  backgroundColor: conversationStyles.value.leftBubble.bgColor,
  color: conversationStyles.value.leftBubble.textColor,
  borderRadius: `${conversationStyles.value.bubbleRadius}px`,
}))

const welcomePhraseStyles = computed<Record<string, string>>(() => {
  const fontFamily = fontsStyles.value.body.replace(/\+/g, ' ')
  return {
    fontFamily: `'${fontFamily}', sans-serif`,
    color: '#0f172a',
  }
})

const nameStyles = computed<Record<string, string>>(() => {
  const fontFamily = fontsStyles.value.body.replace(/\+/g, ' ')
  return {
    fontFamily: `'${fontFamily}', sans-serif`,
    color: '#0f172a',
    fontSize: '1rem',
    fontWeight: '600',
  }
})
</script>

<style scoped>
.chatbot-body-welcome {
  flex: 1 1 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}
</style>
