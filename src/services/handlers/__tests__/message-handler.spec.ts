import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useChatbotStore } from '@/stores/chatbot'

import type { IMessage, IRetrieveLastMessagesResponse } from '../../apis/chat-microservice/types'
import { loadInitialChatHistory, loadOlderChatHistory } from '../message-handler'

const mockRetrieveLastMessages = vi.fn()

vi.mock('../../apis/chat-microservice/messaging-module', () => ({
  messagingModule: {
    get retrieveLastMessages() {
      return mockRetrieveLastMessages
    },
  },
}))

describe('message-handler', () => {

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const createMockMessage = (
    id: string,
    text: string,
    senderBy: string,
    createdAt?: string,
  ): IMessage => ({
    _id: id,
    text,
    msgType: 'text',
    senderBy,
    fromMe: senderBy === 'Customer',
    channel: 'chat-widget',
    createdAt: createdAt ?? new Date().toISOString(),
  })

  describe('loadInitialChatHistory', () => {
    it('loads initial messages and stores them', async () => {
      const store = useChatbotStore()
      const mockMessages: IMessage[] = [
        createMockMessage('msg-1', 'Hello', 'Customer', '2024-01-01T10:00:00Z'),
        createMockMessage('msg-2', 'Hi there!', 'Assistant', '2024-01-01T10:01:00Z'),
      ]

      const mockResponse: IRetrieveLastMessagesResponse = {
        status: 200,
        message: 'Success',
        data: mockMessages,
      }

      mockRetrieveLastMessages.mockResolvedValue(mockResponse)

      const result = await loadInitialChatHistory()

      expect(result).toEqual({ success: true, hasMore: true })
      expect(mockRetrieveLastMessages).toHaveBeenCalledWith({ limit: 20 })
      expect(store.messages).toHaveLength(2)
      expect(store.messages[0]._id).toBe('msg-1')
      expect(store.messages[1]._id).toBe('msg-2')
    })

    it('sorts messages chronologically', async () => {
      const store = useChatbotStore()
      const mockMessages: IMessage[] = [
        createMockMessage('msg-2', 'Second', 'Assistant', '2024-01-01T10:02:00Z'),
        createMockMessage('msg-1', 'First', 'Customer', '2024-01-01T10:01:00Z'),
        createMockMessage('msg-3', 'Third', 'Customer', '2024-01-01T10:03:00Z'),
      ]

      const mockResponse: IRetrieveLastMessagesResponse = {
        status: 200,
        message: 'Success',
        data: mockMessages,
      }

      mockRetrieveLastMessages.mockResolvedValue(mockResponse)

      await loadInitialChatHistory()

      expect(store.messages[0]._id).toBe('msg-1')
      expect(store.messages[1]._id).toBe('msg-2')
      expect(store.messages[2]._id).toBe('msg-3')
    })

    it('normalizes fromMe field based on senderBy', async () => {
      const store = useChatbotStore()
      // Create messages WITHOUT fromMe field to test normalization
      // The normalization returns existing fromMe if it's a boolean, so we omit it
      const mockMessages = [
        {
          _id: 'msg-1',
          text: 'Customer message',
          senderBy: 'Customer',
          msgType: 'text',
          channel: 'chat-widget',
          createdAt: new Date().toISOString(),
          // No fromMe field - will be set by normalization
        },
        {
          _id: 'msg-2',
          text: 'Bot message',
          senderBy: 'Assistant',
          msgType: 'text',
          channel: 'chat-widget',
          createdAt: new Date().toISOString(),
          // No fromMe field - will be set by normalization
        },
      ] as IMessage[]

      const mockResponse: IRetrieveLastMessagesResponse = {
        status: 200,
        message: 'Success',
        data: mockMessages,
      }

      mockRetrieveLastMessages.mockResolvedValue(mockResponse)

      await loadInitialChatHistory()

      expect(store.messages[0].fromMe).toBe(true) // Normalized to true
      expect(store.messages[1].fromMe).toBe(false) // Stays false
    })

    it('sets latest chat message ID', async () => {
      const store = useChatbotStore()
      const mockMessages: IMessage[] = [
        createMockMessage('msg-1', 'First', 'Customer'),
        createMockMessage('msg-2', 'Last', 'Assistant'),
      ]

      const mockResponse: IRetrieveLastMessagesResponse = {
        status: 200,
        message: 'Success',
        data: mockMessages,
      }

      mockRetrieveLastMessages.mockResolvedValue(mockResponse)

      await loadInitialChatHistory()

      expect(store.latestChatMessageId).toBe('msg-2')
    })

    it('returns success false when API fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockRetrieveLastMessages.mockRejectedValue(new Error('Network error'))

      const result = await loadInitialChatHistory()

      expect(result).toEqual({ success: false, hasMore: false })
      expect(consoleSpy).toHaveBeenCalled()
    })

    it('returns hasMore false when no messages returned', async () => {
      const mockResponse: IRetrieveLastMessagesResponse = {
        status: 200,
        message: 'Success',
        data: [],
      }

      mockRetrieveLastMessages.mockResolvedValue(mockResponse)

      const result = await loadInitialChatHistory()

      expect(result).toEqual({ success: true, hasMore: false })
    })

    it('replaces existing messages', async () => {
      const store = useChatbotStore()

      // Add existing messages
      store.setMessages([
        createMockMessage('old-1', 'Old message 1', 'Customer'),
        createMockMessage('old-2', 'Old message 2', 'Assistant'),
      ])

      const mockMessages: IMessage[] = [
        createMockMessage('new-1', 'New message 1', 'Customer'),
        createMockMessage('new-2', 'New message 2', 'Assistant'),
      ]

      const mockResponse: IRetrieveLastMessagesResponse = {
        status: 200,
        message: 'Success',
        data: mockMessages,
      }

      mockRetrieveLastMessages.mockResolvedValue(mockResponse)

      await loadInitialChatHistory()

      expect(store.messages).toHaveLength(2)
      expect(store.messages[0]._id).toBe('new-1')
      expect(store.messages[1]._id).toBe('new-2')
    })
  })

  describe('loadOlderChatHistory', () => {
    it('prepends older messages to existing messages', async () => {
      const store = useChatbotStore()

      // Set existing messages
      store.setMessages([
        createMockMessage('msg-3', 'Newer', 'Customer', '2024-01-01T10:03:00Z'),
        createMockMessage('msg-4', 'Newest', 'Assistant', '2024-01-01T10:04:00Z'),
      ])
      store.setLatestChatMessageId('msg-4')

      const olderMessages: IMessage[] = [
        createMockMessage('msg-1', 'Oldest', 'Customer', '2024-01-01T10:01:00Z'),
        createMockMessage('msg-2', 'Older', 'Assistant', '2024-01-01T10:02:00Z'),
      ]

      const mockResponse: IRetrieveLastMessagesResponse = {
        status: 200,
        message: 'Success',
        data: olderMessages,
      }

      mockRetrieveLastMessages.mockResolvedValue(mockResponse)

      const result = await loadOlderChatHistory()

      // hasMore is false because we only loaded 2 messages (less than 20)
      expect(result.success).toBe(true)
      expect(mockRetrieveLastMessages).toHaveBeenCalledWith({
        latestChatMessageId: 'msg-4',
        limit: 20,
      })
      expect(store.messages).toHaveLength(4)
      expect(store.messages[0]._id).toBe('msg-1')
      expect(store.messages[1]._id).toBe('msg-2')
      expect(store.messages[2]._id).toBe('msg-3')
      expect(store.messages[3]._id).toBe('msg-4')
    })

    it('does not add duplicate messages', async () => {
      const store = useChatbotStore()

      store.setMessages([
        createMockMessage('msg-2', 'Existing', 'Customer'),
        createMockMessage('msg-3', 'Newer', 'Assistant'),
      ])
      store.setLatestChatMessageId('msg-3')

      const olderMessages: IMessage[] = [
        createMockMessage('msg-1', 'Old', 'Customer'),
        createMockMessage('msg-2', 'Duplicate', 'Assistant'), // Duplicate ID
      ]

      const mockResponse: IRetrieveLastMessagesResponse = {
        status: 200,
        message: 'Success',
        data: olderMessages,
      }

      mockRetrieveLastMessages.mockResolvedValue(mockResponse)

      await loadOlderChatHistory()

      expect(store.messages).toHaveLength(3)
      expect(store.messages[0]._id).toBe('msg-1')
      expect(store.messages[1]._id).toBe('msg-2')
      expect(store.messages[1].text).toBe('Existing') // Original message preserved
      expect(store.messages[2]._id).toBe('msg-3')
    })

    it('uses latestChatMessageId for pagination', async () => {
      const store = useChatbotStore()
      store.setLatestChatMessageId('msg-100')

      const mockResponse: IRetrieveLastMessagesResponse = {
        status: 200,
        message: 'Success',
        data: [],
      }

      mockRetrieveLastMessages.mockResolvedValue(mockResponse)

      await loadOlderChatHistory()

      expect(mockRetrieveLastMessages).toHaveBeenCalledWith({
        latestChatMessageId: 'msg-100',
        limit: 20,
      })
    })

    it('returns hasMore false when fewer than 20 messages returned', async () => {
      const store = useChatbotStore()
      store.setLatestChatMessageId('msg-10')

      const messages = Array.from({ length: 15 }, (_, i) =>
        createMockMessage(`msg-${i}`, `Message ${i}`, 'Customer'),
      )

      const mockResponse: IRetrieveLastMessagesResponse = {
        status: 200,
        message: 'Success',
        data: messages,
      }

      mockRetrieveLastMessages.mockResolvedValue(mockResponse)

      const result = await loadOlderChatHistory()

      expect(result).toEqual({ success: true, hasMore: false })
    })

    it('returns hasMore true when exactly 20 messages returned', async () => {
      const store = useChatbotStore()
      store.setLatestChatMessageId('msg-20')

      const messages = Array.from({ length: 20 }, (_, i) =>
        createMockMessage(`msg-${i}`, `Message ${i}`, 'Customer'),
      )

      const mockResponse: IRetrieveLastMessagesResponse = {
        status: 200,
        message: 'Success',
        data: messages,
      }

      mockRetrieveLastMessages.mockResolvedValue(mockResponse)

      const result = await loadOlderChatHistory()

      expect(result).toEqual({ success: true, hasMore: true })
    })

    it('updates latestChatMessageId with last message from response', async () => {
      const store = useChatbotStore()
      store.setLatestChatMessageId('old-id')

      const messages: IMessage[] = [
        createMockMessage('msg-1', 'First', 'Customer'),
        createMockMessage('msg-2', 'Last', 'Assistant'),
      ]

      const mockResponse: IRetrieveLastMessagesResponse = {
        status: 200,
        message: 'Success',
        data: messages,
      }

      mockRetrieveLastMessages.mockResolvedValue(mockResponse)

      await loadOlderChatHistory()

      expect(store.latestChatMessageId).toBe('msg-2')
    })

    it('handles error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const store = useChatbotStore()
      store.setLatestChatMessageId('msg-1')

      mockRetrieveLastMessages.mockRejectedValue(new Error('API Error'))

      const result = await loadOlderChatHistory()

      expect(result).toEqual({ success: false, hasMore: false })
      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  describe('message normalization', () => {
    it('correctly identifies customer messages', async () => {
      const store = useChatbotStore()
      // Test normalization with various customer-related senderBy values
      // Messages must NOT have fromMe field for normalization to work
      const messages = [
        {
          _id: 'msg-1',
          text: 'Message',
          senderBy: 'customer', // lowercase
          msgType: 'text',
          channel: 'chat-widget',
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'msg-2',
          text: 'Message',
          senderBy: 'Customer', // capitalized
          msgType: 'text',
          channel: 'chat-widget',
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'msg-3',
          text: 'Message',
          senderBy: 'you', // lowercase
          msgType: 'text',
          channel: 'chat-widget',
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'msg-4',
          text: 'Message',
          senderBy: 'You', // capitalized
          msgType: 'text',
          channel: 'chat-widget',
          createdAt: new Date().toISOString(),
        },
      ] as IMessage[]

      const mockResponse: IRetrieveLastMessagesResponse = {
        status: 200,
        message: 'Success',
        data: messages,
      }

      mockRetrieveLastMessages.mockResolvedValue(mockResponse)

      await loadInitialChatHistory()

      expect(store.messages[0].fromMe).toBe(true) // customer (lowercase)
      expect(store.messages[1].fromMe).toBe(true) // Customer
      expect(store.messages[2].fromMe).toBe(true) // you (lowercase)
      expect(store.messages[3].fromMe).toBe(true) // You
    })

    it('correctly identifies non-customer messages', async () => {
      const store = useChatbotStore()
      const messages: IMessage[] = [
        createMockMessage('msg-1', 'Message', 'Assistant'),
        createMockMessage('msg-2', 'Message', 'Bot'),
        createMockMessage('msg-3', 'Message', 'Employee'),
      ]

      const mockResponse: IRetrieveLastMessagesResponse = {
        status: 200,
        message: 'Success',
        data: messages,
      }

      mockRetrieveLastMessages.mockResolvedValue(mockResponse)

      await loadInitialChatHistory()

      expect(store.messages[0].fromMe).toBe(false)
      expect(store.messages[1].fromMe).toBe(false)
      expect(store.messages[2].fromMe).toBe(false)
    })
  })
})
