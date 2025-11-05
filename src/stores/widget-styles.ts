/**
 * Widget Styles Store
 * Manages widget styling configuration from remote API
 */

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type {
  IConversationStyles,
  IFontsStyles,
  IFooterStyles,
  IHeaderStyles,
  IInputStyles,
  ILauncherStyles,
  IWelcomeScreenStyles,
  IWidgetStylesData,
} from '../services/apis/core/types'

const createDefaultHeaderStyles = (): IHeaderStyles => ({
  bgColor: '#0D47A1',
  textColor: '#ffffff',
  title: 'Mercure ICON',
  titleFormat: 'centralised',
  titleSize: 22.4,
  font: 'Maven+Pro',
  closeIconColor: '#ffffff',
})

const createDefaultFontsStyles = (): IFontsStyles => ({
  body: 'Hind',
})

const createDefaultLauncherStyles = (): ILauncherStyles => ({
  openIconURL:
    'https://s3.ap-southeast-1.amazonaws.com/files.vouch.sg/0_housekeeping/65f7bb5d421b09001a52b86e/17147332864296511.jpg',
  closeIconURL: 'https://placehold.co/120x120?text=Close',
})

const createDefaultConversationStyles = (): IConversationStyles => ({
  avatarUrl:
    'https://s3.ap-southeast-1.amazonaws.com/files.vouch.sg/0_housekeeping/65f7bb5d421b09001a52b86e/17147332864296511.jpg',
  backgroundColor: '#F9F9F9',
  bubbleRadius: 5,
  leftBubble: {
    bgColor: '#ffffff',
    textColor: '#0D47A1',
  },
  rightBubble: {
    bgColor: '#0D47A1',
    textColor: '#ffffff',
  },
})

const createDefaultInputStyles = (): IInputStyles => ({
  bgColor: '#ffffff',
  textColor: '#131e2e',
  attachmentButton: {
    bgColor: '#ffffff',
    iconColor: '#131e2e',
  },
  sendButton: {
    type: 'img',
    bgColor: '#64B5F6',
    iconColor: '#212121',
    iconUrl: '',
    text: 'Send',
  },
})

const createDefaultWelcomeScreenStyles = (): IWelcomeScreenStyles => ({
  greetings: ['Hello there!'],
  welcomePhrase: 'Welcome to Mercure ICON Singapore',
  bubble: {
    bgColor: '#E3F2FD',
    textColor: '#0D47A1',
  },
  ctaButton: {
    bgColor: '#0D47A1',
    textColor: '#ffffff',
  },
})

const createDefaultFooterStyles = (): IFooterStyles => ({
  textColor: '#94A3B8',
})

export const useWidgetStylesStore = defineStore(
  'widget-styles',
  () => {
    // State - will be populated from API in the future
    const styles = ref<IWidgetStylesData | null>(null)

    // Default styles fallback until API wiring is complete
    const headerStyles = ref<IHeaderStyles>(createDefaultHeaderStyles())
    const fontsStyles = ref<IFontsStyles>(createDefaultFontsStyles())
    const launcherStyles = ref<ILauncherStyles>(createDefaultLauncherStyles())
    const conversationStyles = ref<IConversationStyles>(createDefaultConversationStyles())
    const inputStyles = ref<IInputStyles>(createDefaultInputStyles())
    const welcomeScreenStyles = ref<IWelcomeScreenStyles>(createDefaultWelcomeScreenStyles())
    const footerStyles = ref<IFooterStyles>(createDefaultFooterStyles())

    // Getters
    const getHeaderStyles = computed<IHeaderStyles>(() => {
      // If full styles are loaded, use header from styles
      if (styles.value?.header) {
        return styles.value.header
      }
      // Otherwise, use the local default header styles
      return headerStyles.value
    })

    const getFontsStyles = computed<IFontsStyles>(() => {
      if (styles.value?.fonts) {
        return styles.value.fonts
      }
      return fontsStyles.value
    })

    const getLauncherStyles = computed<ILauncherStyles>(() => {
      if (styles.value?.launcher) {
        return styles.value.launcher
      }
      return launcherStyles.value
    })

    const getConversationStyles = computed<IConversationStyles>(() => {
      if (styles.value?.conversation) {
        return styles.value.conversation
      }
      return conversationStyles.value
    })

    const getInputStyles = computed<IInputStyles>(() => {
      if (styles.value?.input) {
        return styles.value.input
      }
      return inputStyles.value
    })

    const getWelcomeScreenStyles = computed<IWelcomeScreenStyles>(() => {
      if (styles.value?.welcomeScreen) {
        return styles.value.welcomeScreen
      }
      return welcomeScreenStyles.value
    })

    const getFooterStyles = computed<IFooterStyles>(() => {
      if (styles.value?.footer) {
        return styles.value.footer
      }
      return footerStyles.value
    })

    // Actions
    /**
     * Set all widget styles from API
     * @param data - Complete widget styles data from API
     */
    const setStyles = (data: IWidgetStylesData): void => {
      styles.value = data
    }

    /**
     * Clear all widget styles
     */
    const clearStyles = (): void => {
      styles.value = null
      headerStyles.value = createDefaultHeaderStyles()
      fontsStyles.value = createDefaultFontsStyles()
      launcherStyles.value = createDefaultLauncherStyles()
      conversationStyles.value = createDefaultConversationStyles()
      inputStyles.value = createDefaultInputStyles()
      welcomeScreenStyles.value = createDefaultWelcomeScreenStyles()
      footerStyles.value = createDefaultFooterStyles()
    }

    return {
      styles,
      headerStyles,
      fontsStyles,
      launcherStyles,
      conversationStyles,
      inputStyles,
      welcomeScreenStyles,
      footerStyles,
      getHeaderStyles,
      getFontsStyles,
      getLauncherStyles,
      getConversationStyles,
      getInputStyles,
      getWelcomeScreenStyles,
      getFooterStyles,
      setStyles,
      clearStyles,
    }
  },
  {
    persist: {
      key: 'vc_widget_styles',
    },
  },
)
