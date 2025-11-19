import type { Socket } from 'socket.io-client'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useChatbotStore } from '@/stores/chatbot'

import type { IMessage } from '../../apis/chat-microservice/types'
import type { ITypingEventPayload } from '../socket.types'
import { registerSocketEventHandlers } from '../socket-event-handlers'

vi.mock('@/utils/message-factory', () => ({
  createTypingIndicatorMessage: vi.fn((props) => ({
    _id: `typing-${Date.now()}-${Math.random()}`,
    text: '',
    fromMe: props.fromMe,
    senderBy: props.senderBy,
    msgType: 'typing-indicator',
    channel: 'chat-widget',
    createdAt: new Date().toISOString(),
  })),
}))

describe('socket-event-handlers', () => {
  let mockSocket: Partial<Socket>
  let eventHandlers: Record<string, ((...args: unknown[]) => void)[]>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.useFakeTimers()

    eventHandlers = {}

    mockSocket = {
      id: 'socket-123',
      on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
        if (!eventHandlers[event]) {
          eventHandlers[event] = []
        }
        eventHandlers[event].push(handler)
        return mockSocket as Socket
      }),
      off: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
        if (eventHandlers[event]) {
          eventHandlers[event] = eventHandlers[event].filter((h) => h !== handler)
        }
        return mockSocket as Socket
      }),
      io: {
        on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
          if (!eventHandlers[event]) {
            eventHandlers[event] = []
          }
          eventHandlers[event].push(handler)
        }),
        off: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
          if (eventHandlers[event]) {
            eventHandlers[event] = eventHandlers[event].filter((h) => h !== handler)
          }
        }),
      },
    } as Partial<Socket>
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const emitEvent = (event: string, ...args: unknown[]): void => {
    const handlers = eventHandlers[event]
    if (handlers) {
      handlers.forEach((handler) => handler(...args))
    }
  }

  describe('registerSocketEventHandlers', () => {
    it('registers all required event handlers', () => {
      registerSocketEventHandlers(mockSocket as Socket)

      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('typing', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('chat:messages:received', expect.any(Function))
      expect(mockSocket.io.on).toHaveBeenCalledWith('reconnect', expect.any(Function))
    })

    it('returns cleanup function that removes all handlers', () => {
      const cleanup = registerSocketEventHandlers(mockSocket as Socket)

      cleanup()

      expect(mockSocket.off).toHaveBeenCalledWith('connect', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('disconnect', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('connect_error', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('error', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('typing', expect.any(Function))
      expect(mockSocket.off).toHaveBeenCalledWith('chat:messages:received', expect.any(Function))
      expect(mockSocket.io.off).toHaveBeenCalledWith('reconnect', expect.any(Function))
    })
  })

  describe('connect event', () => {
    it('logs connection when socket connects', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      registerSocketEventHandlers(mockSocket as Socket)

      emitEvent('connect')

      expect(consoleSpy).toHaveBeenCalledWith('[socket] connected guys', { id: 'socket-123' })
    })
  })

  describe('disconnect event', () => {
    it('logs warning when socket disconnects', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      registerSocketEventHandlers(mockSocket as Socket)

      emitEvent('disconnect', 'transport close')

      expect(consoleSpy).toHaveBeenCalledWith('[socket] disconnected guys', {
        reason: 'transport close',
      })
    })
  })

  describe('reconnect event', () => {
    it('logs reconnection with attempt number', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      registerSocketEventHandlers(mockSocket as Socket)

      emitEvent('reconnect', 3)

      expect(consoleSpy).toHaveBeenCalledWith('[socket] reconnected', { attempt: 3 })
    })
  })

  describe('error events', () => {
    it('logs error on connect_error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Connection failed')
      registerSocketEventHandlers(mockSocket as Socket)

      emitEvent('connect_error', error)

      expect(consoleSpy).toHaveBeenCalledWith('[socket] error', error)
    })

    it('logs error on error event', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Socket error')
      registerSocketEventHandlers(mockSocket as Socket)

      emitEvent('error', error)

      expect(consoleSpy).toHaveBeenCalledWith('[socket] error', error)
    })
  })

  describe('typing event', () => {
    it('adds typing indicator when agent starts typing', () => {
      const store = useChatbotStore()
      registerSocketEventHandlers(mockSocket as Socket)

      const payload: ITypingEventPayload = {
        source: 'agent',
        isTyping: true,
      }

      emitEvent('typing', payload)

      expect(store.messages).toHaveLength(1)
      expect(store.messages[0].msgType).toBe('typing-indicator')
      expect(store.messages[0].fromMe).toBe(false)
      expect(store.messages[0].senderBy).toBe('Assistant')
    })

    it('removes typing indicator when agent stops typing', () => {
      const store = useChatbotStore()
      registerSocketEventHandlers(mockSocket as Socket)

      // Agent starts typing
      emitEvent('typing', { source: 'agent', isTyping: true })
      expect(store.messages).toHaveLength(1)

      // Agent stops typing
      emitEvent('typing', { source: 'agent', isTyping: false })

      expect(store.messages).toHaveLength(0)
    })

    it('does not add duplicate typing indicators', () => {
      const store = useChatbotStore()
      registerSocketEventHandlers(mockSocket as Socket)

      // Agent starts typing twice
      emitEvent('typing', { source: 'agent', isTyping: true })
      emitEvent('typing', { source: 'agent', isTyping: true })

      expect(store.messages).toHaveLength(1)
      expect(store.messages[0].msgType).toBe('typing-indicator')
    })

    it('ignores typing events from non-agent sources', () => {
      const store = useChatbotStore()
      registerSocketEventHandlers(mockSocket as Socket)

      emitEvent('typing', { source: 'customer', isTyping: true })

      expect(store.messages).toHaveLength(0)
    })

    it('auto-removes typing indicator after 5 seconds', () => {
      const store = useChatbotStore()
      registerSocketEventHandlers(mockSocket as Socket)

      emitEvent('typing', { source: 'agent', isTyping: true })
      expect(store.messages).toHaveLength(1)

      // Fast-forward time by 5 seconds
      vi.advanceTimersByTime(5000)

      expect(store.messages).toHaveLength(0)
    })

    it('cancels auto-removal if agent types again within timeout', () => {
      const store = useChatbotStore()
      registerSocketEventHandlers(mockSocket as Socket)

      // Agent starts typing
      emitEvent('typing', { source: 'agent', isTyping: true })
      expect(store.messages).toHaveLength(1)

      // Fast-forward 3 seconds
      vi.advanceTimersByTime(3000)

      // Agent types again
      emitEvent('typing', { source: 'agent', isTyping: true })
      expect(store.messages).toHaveLength(1)

      // Fast-forward another 3 seconds (total 6 seconds, but timeout should reset)
      vi.advanceTimersByTime(3000)
      expect(store.messages).toHaveLength(1)

      // Fast-forward 2 more seconds (total 5 seconds from last typing event)
      vi.advanceTimersByTime(2000)
      expect(store.messages).toHaveLength(0)
    })
  })

  describe('chat:messages:received event', () => {
    it('appends incoming employee message to chat', () => {
      const store = useChatbotStore()
      registerSocketEventHandlers(mockSocket as Socket)

      const payload = {
        _id: 'msg-123',
        text: 'How can I help you?',
        msgType: 'text',
        senderBy: 'Employee',
        channel: 'chat-widget',
        createdAt: new Date().toISOString(),
      }

      emitEvent('chat:messages:received', payload)

      expect(store.messages).toHaveLength(1)
      expect(store.messages[0]._id).toBe('msg-123')
      expect(store.messages[0].text).toBe('How can I help you?')
      expect(store.messages[0].senderBy).toBe('Employee')
      expect(store.messages[0].fromMe).toBe(false)
    })

    it('appends incoming customer message (echo of own message)', () => {
      const store = useChatbotStore()
      registerSocketEventHandlers(mockSocket as Socket)

      const payload = {
        _id: 'msg-456',
        text: 'I need help',
        msgType: 'text',
        senderBy: 'Customer',
        channel: 'chat-widget',
        createdAt: new Date().toISOString(),
      }

      emitEvent('chat:messages:received', payload)

      expect(store.messages).toHaveLength(1)
      expect(store.messages[0]._id).toBe('msg-456')
      expect(store.messages[0].text).toBe('I need help')
      expect(store.messages[0].senderBy).toBe('You')
      expect(store.messages[0].fromMe).toBe(true)
    })

    it('skips assistant messages (handled via SSE)', () => {
      const store = useChatbotStore()
      registerSocketEventHandlers(mockSocket as Socket)

      const payload = {
        _id: 'msg-789',
        text: 'Bot response',
        msgType: 'text',
        senderBy: 'Assistant',
        channel: 'chat-widget',
        createdAt: new Date().toISOString(),
      }

      emitEvent('chat:messages:received', payload)

      // Should not add assistant messages from socket
      expect(store.messages).toHaveLength(0)
    })

    it('patches existing message if ID matches', () => {
      const store = useChatbotStore()
      registerSocketEventHandlers(mockSocket as Socket)

      // Add existing message
      const existingMessage: IMessage = {
        _id: 'msg-123',
        text: 'Old text',
        fromMe: false,
        msgType: 'text',
        senderBy: 'Employee',
        channel: 'chat-widget',
        createdAt: new Date().toISOString(),
      }
      store.appendMessage(existingMessage)

      // Receive updated message
      const payload = {
        _id: 'msg-123',
        text: 'Updated text',
        msgType: 'text',
        senderBy: 'Employee',
        channel: 'chat-widget',
        createdAt: new Date().toISOString(),
      }

      emitEvent('chat:messages:received', payload)

      expect(store.messages).toHaveLength(1)
      expect(store.messages[0].text).toBe('Updated text')
    })

    it('patches placeholder customer message with server-confirmed message', () => {
      const store = useChatbotStore()
      registerSocketEventHandlers(mockSocket as Socket)

      // Add placeholder message (sent by user)
      const placeholderMessage: IMessage = {
        _id: 'temp-123',
        text: 'Hello',
        fromMe: true,
        msgType: 'text',
        senderBy: 'You',
        channel: 'chat-widget',
        createdAt: new Date().toISOString(),
      }
      store.appendMessage(placeholderMessage)

      // Receive confirmed message from server
      const payload = {
        _id: 'msg-server-456',
        text: 'Hello',
        msgType: 'text',
        senderBy: 'Customer',
        channel: 'chat-widget',
        createdAt: new Date().toISOString(),
      }

      emitEvent('chat:messages:received', payload)

      expect(store.messages).toHaveLength(1)
      expect(store.messages[0]._id).toBe('msg-server-456')
      expect(store.messages[0].text).toBe('Hello')
    })

    it('ignores messages without text', () => {
      const store = useChatbotStore()
      registerSocketEventHandlers(mockSocket as Socket)

      const payload = {
        _id: 'msg-123',
        text: '',
        msgType: 'text',
        senderBy: 'Employee',
        channel: 'chat-widget',
        createdAt: new Date().toISOString(),
      }

      emitEvent('chat:messages:received', payload)

      expect(store.messages).toHaveLength(0)
    })

    it('ignores invalid payload', () => {
      const store = useChatbotStore()
      registerSocketEventHandlers(mockSocket as Socket)

      emitEvent('chat:messages:received', null)
      emitEvent('chat:messages:received', undefined)
      emitEvent('chat:messages:received', 'invalid')

      expect(store.messages).toHaveLength(0)
    })

    it('increments unread count when chatbot is closed', () => {
      const store = useChatbotStore()
      store.isOpen = false
      registerSocketEventHandlers(mockSocket as Socket)

      const payload = {
        _id: 'msg-123',
        text: 'New message',
        msgType: 'text',
        senderBy: 'Employee',
        channel: 'chat-widget',
        createdAt: new Date().toISOString(),
      }

      emitEvent('chat:messages:received', payload)

      expect(store.unreadCount).toBe(1)
    })

    it('does not increment unread count when chatbot is open', () => {
      const store = useChatbotStore()
      store.open()
      registerSocketEventHandlers(mockSocket as Socket)

      const payload = {
        _id: 'msg-123',
        text: 'New message',
        msgType: 'text',
        senderBy: 'Employee',
        channel: 'chat-widget',
        createdAt: new Date().toISOString(),
      }

      emitEvent('chat:messages:received', payload)

      expect(store.unreadCount).toBe(0)
    })
  })

  describe('custom handlers', () => {
    it('allows overriding default handlers', () => {
      const customConnectHandler = vi.fn()
      registerSocketEventHandlers(mockSocket as Socket, {
        connect: customConnectHandler,
      })

      emitEvent('connect')

      expect(customConnectHandler).toHaveBeenCalledWith(mockSocket)
    })

    it('merges custom handlers with default handlers', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      const customDisconnectHandler = vi.fn()

      registerSocketEventHandlers(mockSocket as Socket, {
        disconnect: customDisconnectHandler,
      })

      emitEvent('connect')
      emitEvent('disconnect', 'io server disconnect')

      expect(consoleSpy).toHaveBeenCalled() // Default connect handler still works
      expect(customDisconnectHandler).toHaveBeenCalledWith('io server disconnect')
    })
  })
})
