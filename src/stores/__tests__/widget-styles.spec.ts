import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import type { IWidgetStylesData } from '@/services/apis/chat-microservice/types'
import { useWidgetStylesStore } from '@/stores/widget-styles'

const createStylesPayload = (): IWidgetStylesData => ({
  header: {
    bgColor: '#111111',
    textColor: '#ffffff',
    title: 'Custom Header',
    titleFormat: 'centered',
    titleSize: 18,
    font: 'Roboto',
    closeIconColor: '#ffffff',
  },
  fonts: {
    body: 'Lato',
  },
  launcher: {
    openIconURL: 'https://example.com/open.png',
    closeIconURL: 'https://example.com/close.png',
  },
  conversation: {
    avatarUrl: 'https://example.com/avatar.png',
    backgroundColor: '#000000',
    bubbleRadius: 8,
    leftBubble: {
      bgColor: '#dddddd',
      textColor: '#111111',
    },
    rightBubble: {
      bgColor: '#111111',
      textColor: '#dddddd',
    },
  },
  input: {
    bgColor: '#ffffff',
    textColor: '#222222',
    attachmentButton: {
      bgColor: '#ffffff',
      iconColor: '#222222',
    },
    sendButton: {
      type: 'text',
      bgColor: '#333333',
      iconColor: '#ffffff',
      iconUrl: '',
      text: 'Send',
    },
  },
  welcomeScreen: {
    greetings: ['Welcome!'],
    welcomePhrase: 'Custom welcome',
    bubble: {
      bgColor: '#000000',
      textColor: '#ffffff',
    },
    ctaButton: {
      bgColor: '#ff0000',
      textColor: '#ffffff',
    },
  },
  footer: {
    textColor: '#888888',
  },
  advanced: {
    galleryButtonTextColor: '#ff00ff',
    stopStreamingButtonTextColor: '#00ff00',
  },
})

describe('useWidgetStylesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('returns default launcher styles before API data is set', () => {
    const store = useWidgetStylesStore()

    expect(store.styles).toBeNull()
    expect(store.getLauncherStyles.openIconURL).toBe(store.launcherStyles.openIconURL)
  })

  it('prioritizes remote styles after setStyles', () => {
    const store = useWidgetStylesStore()
    const payload = createStylesPayload()

    store.setStyles(payload)

    expect(store.styles).toEqual(payload)
    expect(store.getLauncherStyles.openIconURL).toBe(payload.launcher.openIconURL)
    expect(store.getHeaderStyles.title).toBe(payload.header.title)
  })

  it('clears styles and restores defaults when clearStyles is called', () => {
    const store = useWidgetStylesStore()
    store.setStyles(createStylesPayload())

    store.clearStyles()

    expect(store.styles).toBeNull()
    expect(store.getLauncherStyles.openIconURL).toBe(store.launcherStyles.openIconURL)
    expect(store.getFontsStyles.body).toBe(store.fontsStyles.body)
  })
})
