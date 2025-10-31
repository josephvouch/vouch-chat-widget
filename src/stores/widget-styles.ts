/**
 * Widget Styles Store
 * Manages widget styling configuration from remote API
 */

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type {
  IConversationStyles,
  IFontsStyles,
  IHeaderStyles,
  IInputStyles,
  ILauncherStyles,
  IWidgetStylesData,
} from '../services/apis/core/types'

// Mock data for development
const MOCK_HEADER_STYLES: IHeaderStyles = {
  bgColor: '#0D47A1',
  textColor: '#ffffff',
  title: 'Mercure ICON',
  titleFormat: 'centralised',
  titleSize: 22.4,
  font: 'Maven+Pro',
  closeIconColor: '#ffffff',
}

const MOCK_FONTS_STYLES: IFontsStyles = {
  body: 'Hind',
}

const MOCK_LAUNCHER_STYLES: ILauncherStyles = {
  openIconURL:
    'https://s3.ap-southeast-1.amazonaws.com/files.vouch.sg/0_housekeeping/65f7bb5d421b09001a52b86e/17147332864296511.jpg',
  closeIconURL: 'https://placehold.co/120x120?text=Close',
}

const MOCK_CONVERSATION_STYLES: IConversationStyles = {
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
}

const MOCK_INPUT_STYLES: IInputStyles = {
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
}

export const useWidgetStylesStore = defineStore('widget-styles', () => {
  // State - will be populated from API in the future
  const styles = ref<IWidgetStylesData | null>(null)

  // For now, use mock styles
  const headerStyles = ref<IHeaderStyles>(MOCK_HEADER_STYLES)
  const fontsStyles = ref<IFontsStyles>(MOCK_FONTS_STYLES)
  const launcherStyles = ref<ILauncherStyles>(MOCK_LAUNCHER_STYLES)
  const conversationStyles = ref<IConversationStyles>(MOCK_CONVERSATION_STYLES)
  const inputStyles = ref<IInputStyles>(MOCK_INPUT_STYLES)

  // Getters
  const getHeaderStyles = computed<IHeaderStyles>(() => {
    // If full styles are loaded, use header from styles
    if (styles.value?.header) {
      return styles.value.header
    }
    // Otherwise, use mock header styles
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
    headerStyles.value = MOCK_HEADER_STYLES
    fontsStyles.value = MOCK_FONTS_STYLES
    launcherStyles.value = MOCK_LAUNCHER_STYLES
    conversationStyles.value = MOCK_CONVERSATION_STYLES
    inputStyles.value = MOCK_INPUT_STYLES
  }

  return {
    styles,
    headerStyles,
    fontsStyles,
    launcherStyles,
    conversationStyles,
    inputStyles,
    getHeaderStyles,
    getFontsStyles,
    getLauncherStyles,
    getConversationStyles,
    getInputStyles,
    setStyles,
    clearStyles,
  }
})
