import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createMessage } from '@/utils/message-factory'

import type { IMessage } from '../../services/apis/chat-microservice/types'
import * as messageStreamHandler from '../../services/handlers/message-stream-handler'
import { useChatbotStore } from '../chatbot'

vi.mock('@/utils/message-factory', () => ({
  createMessage: vi.fn((props) => ({
    _id: `msg-${Date.now()}-${Math.random()}`,
    text: props.text,
    fromMe: props.fromMe,
    senderBy: props.senderBy,
    msgType: 'text',
    channel: 'chat-widget',
    createdAt: new Date().toISOString()
  })),
  createTypingIndicatorMessage: vi.fn((props) => ({
    _id: `typing-${Date.now()}-${Math.random()}`,
    text: '',
    fromMe: props.fromMe,
    senderBy: props.senderBy,
    msgType: 'typing-indicator',
    channel: 'chat-widget',
    createdAt: new Date().toISOString()
  }))
}))

vi.mock('../../services/handlers/message-stream-handler', () => ({
  sendMessageWithStream: vi.fn(),
  STREAMING_EVENT_AI_ANSWER: 'ai_answer',
  STREAMING_EVENT_CHAIN_RESULT: 'chain_result',
  STREAMING_EVENT_TYPING_INDICATOR: 'typing_indicator',
  STREAMING_EVENT_BOT_DISABLED: 'bot_disabled'
}))

describe('useChatbotStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('initializes with default values', () => {
      const store = useChatbotStore()

      expect(store.isOpen).toBe(false)
      expect(store.isLoading).toBe(false)
      expect(store.messages).toEqual([])
      expect(store.unreadCount).toBe(0)
      expect(store.lastMessage).toBeNull()
      expect(store.latestChatMessageId).toBeNull()
    })
  })

  describe('open/close/toggle', () => {
    it('opens the chatbot and resets unread count', () => {
      const store = useChatbotStore()
      store.unreadCount = 5

      store.open()

      expect(store.isOpen).toBe(true)
      expect(store.unreadCount).toBe(0)
    })

    it('closes the chatbot', () => {
      const store = useChatbotStore()
      store.isOpen = true

      store.close()

      expect(store.isOpen).toBe(false)
    })

    it('toggles chatbot state', () => {
      const store = useChatbotStore()

      store.toggle()
      expect(store.isOpen).toBe(true)

      store.toggle()
      expect(store.isOpen).toBe(false)
    })
  })

  describe('message management', () => {
    it('appends message and increments unread count when closed', () => {
      const store = useChatbotStore()
      store.isOpen = false

      const message: IMessage = {
        _id: 'msg-1',
        text: 'Hello',
        fromMe: false,
        senderBy: 'Assistant',
        msgType: 'text',
        channel: 'chat-widget',
        createdAt: new Date().toISOString()
      }

      store.appendMessage(message)

      expect(store.messages).toHaveLength(1)
      expect(store.messages[0]).toEqual(message)
      expect(store.unreadCount).toBe(1)
    })

    it('appends message without incrementing unread count when open', () => {
      const store = useChatbotStore()
      store.isOpen = true

      const message: IMessage = {
        _id: 'msg-1',
        text: 'Hello',
        fromMe: false,
        senderBy: 'Assistant',
        msgType: 'text',
        channel: 'chat-widget',
        createdAt: new Date().toISOString()
      }

      store.appendMessage(message)

      expect(store.messages).toHaveLength(1)
      expect(store.unreadCount).toBe(0)
    })

    it('does not increment unread count for user messages', () => {
      const store = useChatbotStore()
      store.isOpen = false

      const message: IMessage = {
        _id: 'msg-1',
        text: 'Hello',
        fromMe: true,
        senderBy: 'You',
        msgType: 'text',
        channel: 'chat-widget',
        createdAt: new Date().toISOString()
      }

      store.appendMessage(message)

      expect(store.messages).toHaveLength(1)
      expect(store.unreadCount).toBe(0)
    })

    it('sets messages replacing existing ones', () => {
      const store = useChatbotStore()
      store.messages = [
        {
          _id: 'msg-1',
          text: 'Old',
          fromMe: false,
          senderBy: 'Assistant',
          msgType: 'text',
          channel: 'chat-widget',
          createdAt: new Date().toISOString()
        }
      ]

      const newMessages: IMessage[] = [
        {
          _id: 'msg-2',
          text: 'New',
          fromMe: false,
          senderBy: 'Assistant',
          msgType: 'text',
          channel: 'chat-widget',
          createdAt: new Date().toISOString()
        }
      ]

      store.setMessages(newMessages)

      expect(store.messages).toHaveLength(1)
      expect(store.messages[0]._id).toBe('msg-2')
    })

    it('prepends messages without duplicates', () => {
      const store = useChatbotStore()
      store.messages = [
        {
          _id: 'msg-2',
          text: 'Second',
          fromMe: false,
          senderBy: 'Assistant',
          msgType: 'text',
          channel: 'chat-widget',
          createdAt: new Date().toISOString()
        }
      ]

      const oldMessages: IMessage[] = [
        {
          _id: 'msg-1',
          text: 'First',
          fromMe: false,
          senderBy: 'Assistant',
          msgType: 'text',
          channel: 'chat-widget',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'msg-2',
          text: 'Duplicate',
          fromMe: false,
          senderBy: 'Assistant',
          msgType: 'text',
          channel: 'chat-widget',
          createdAt: new Date().toISOString()
        }
      ]

      store.prependMessages(oldMessages)

      expect(store.messages).toHaveLength(2)
      expect(store.messages[0]._id).toBe('msg-1')
      expect(store.messages[1]._id).toBe('msg-2')
      expect(store.messages[1].text).toBe('Second')
    })

    it('clears all messages', () => {
      const store = useChatbotStore()
      store.messages = [
        {
          _id: 'msg-1',
          text: 'Message',
          fromMe: false,
          senderBy: 'Assistant',
          msgType: 'text',
          channel: 'chat-widget',
          createdAt: new Date().toISOString()
        }
      ]

      store.clearMessages()

      expect(store.messages).toEqual([])
    })

    it('patches message by id', () => {
      const store = useChatbotStore()
      store.messages = [
        {
          _id: 'msg-1',
          text: 'Original',
          fromMe: false,
          senderBy: 'Assistant',
          msgType: 'text',
          channel: 'chat-widget',
          createdAt: new Date().toISOString()
        }
      ]

      store.patchMessage('msg-1', { text: 'Updated' })

      expect(store.messages[0].text).toBe('Updated')
    })
  })

  describe('lastMessage computed', () => {
    it('returns null when no messages', () => {
      const store = useChatbotStore()

      expect(store.lastMessage).toBeNull()
    })

    it('returns the last message', () => {
      const store = useChatbotStore()
      const message1: IMessage = {
        _id: 'msg-1',
        text: 'First',
        fromMe: false,
        senderBy: 'Assistant',
        msgType: 'text',
        channel: 'chat-widget',
        createdAt: new Date().toISOString()
      }
      const message2: IMessage = {
        _id: 'msg-2',
        text: 'Last',
        fromMe: false,
        senderBy: 'Assistant',
        msgType: 'text',
        channel: 'chat-widget',
        createdAt: new Date().toISOString()
      }

      store.messages = [message1, message2]

      expect(store.lastMessage).toEqual(message2)
    })
  })

  describe('sendMessage', () => {
    it('does nothing if already loading', async () => {
      const store = useChatbotStore()
      store.isLoading = true

      await store.sendMessage('Hello')

      expect(createMessage).not.toHaveBeenCalled()
      expect(store.messages).toHaveLength(0)
    })

    it('does nothing if message is empty or whitespace', async () => {
      const store = useChatbotStore()

      await store.sendMessage('   ')

      expect(createMessage).not.toHaveBeenCalled()
      expect(store.messages).toHaveLength(0)
    })

    it('sends message and handles streaming response', async () => {
      const store = useChatbotStore()
      const mockCancel = vi.fn()

      let onEventCallback:
        | ((event: messageStreamHandler.IMessageStreamEvent) => void)
        | null = null
      let onCompleteCallback: (() => void) | null = null

      vi.mocked(messageStreamHandler.sendMessageWithStream).mockImplementation(
        async (_data, callbacks) => {
          onEventCallback = callbacks.onEvent
          onCompleteCallback = callbacks.onComplete
          return { cancel: mockCancel }
        }
      )

      const sendPromise = store.sendMessage('Hello')

      // Wait for the user message to be added
      await vi.waitFor(() => {
        expect(store.messages).toHaveLength(1)
      })

      expect(store.messages[0].fromMe).toBe(true)
      expect(store.messages[0].text).toBe('Hello')
      expect(store.isLoading).toBe(true)

      // Simulate AI answer event
      onEventCallback?.({
        event: messageStreamHandler.STREAMING_EVENT_AI_ANSWER,
        data: 'Hi there!'
      })

      await vi.waitFor(() => {
        expect(store.messages).toHaveLength(2)
      })

      // Complete the stream
      onCompleteCallback?.()

      await sendPromise

      expect(store.isLoading).toBe(false)
      expect(store.messages).toHaveLength(2)
      expect(store.messages[1].fromMe).toBe(false)
      expect(store.messages[1].text).toBe('Hi there!')
    })

    it('handles streaming error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const store = useChatbotStore()
      const mockError = new Error('Network error')

      let onErrorCallback: ((error: unknown) => void) | null = null

      vi.mocked(messageStreamHandler.sendMessageWithStream).mockImplementation(
        async (_data, callbacks) => {
          onErrorCallback = callbacks.onError
          return { cancel: vi.fn() }
        }
      )

      const sendPromise = store.sendMessage('Hello')

      await vi.waitFor(() => {
        expect(store.messages).toHaveLength(1)
      })

      // Simulate error
      onErrorCallback?.(mockError)

      await sendPromise

      expect(store.isLoading).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('handles typing indicator event', async () => {
      const store = useChatbotStore()

      let onEventCallback:
        | ((event: messageStreamHandler.IMessageStreamEvent) => void)
        | null = null
      let onCompleteCallback: (() => void) | null = null

      vi.mocked(messageStreamHandler.sendMessageWithStream).mockImplementation(
        async (_data, callbacks) => {
          onEventCallback = callbacks.onEvent
          onCompleteCallback = callbacks.onComplete
          return { cancel: vi.fn() }
        }
      )

      const sendPromise = store.sendMessage('Hello')

      await vi.waitFor(() => {
        expect(store.messages).toHaveLength(1)
      })

      // Simulate typing indicator active
      onEventCallback?.({
        event: messageStreamHandler.STREAMING_EVENT_TYPING_INDICATOR,
        data: { active: true }
      })

      await vi.waitFor(() => {
        expect(store.messages).toHaveLength(2)
        expect(store.messages[1].msgType).toBe('typing-indicator')
      })

      // Simulate typing indicator inactive
      onEventCallback?.({
        event: messageStreamHandler.STREAMING_EVENT_TYPING_INDICATOR,
        data: { active: false }
      })

      await vi.waitFor(() => {
        expect(store.messages).toHaveLength(1)
      })

      onCompleteCallback?.()
      await sendPromise
    })

    it('handles bot disabled event', async () => {
      const store = useChatbotStore()

      let onEventCallback:
        | ((event: messageStreamHandler.IMessageStreamEvent) => void)
        | null = null
      let onCompleteCallback: (() => void) | null = null

      vi.mocked(messageStreamHandler.sendMessageWithStream).mockImplementation(
        async (_data, callbacks) => {
          onEventCallback = callbacks.onEvent
          onCompleteCallback = callbacks.onComplete
          return { cancel: vi.fn() }
        }
      )

      const sendPromise = store.sendMessage('Hello')

      await vi.waitFor(() => {
        expect(store.messages).toHaveLength(1)
      })

      // Add assistant message
      onEventCallback?.({
        event: messageStreamHandler.STREAMING_EVENT_AI_ANSWER,
        data: 'Response'
      })

      await vi.waitFor(() => {
        expect(store.messages).toHaveLength(2)
      })

      // Simulate bot disabled
      onEventCallback?.({
        event: messageStreamHandler.STREAMING_EVENT_BOT_DISABLED,
        data: null
      })

      await vi.waitFor(() => {
        expect(store.messages).toHaveLength(1)
      })

      onCompleteCallback?.()
      await sendPromise
    })
  })

  describe('latestChatMessageId', () => {
    it('sets latest chat message id', () => {
      const store = useChatbotStore()

      store.setLatestChatMessageId('msg-123')

      expect(store.latestChatMessageId).toBe('msg-123')
    })

    it('clears latest chat message id', () => {
      const store = useChatbotStore()
      store.setLatestChatMessageId('msg-123')

      store.setLatestChatMessageId(null)

      expect(store.latestChatMessageId).toBeNull()
    })
  })
})
