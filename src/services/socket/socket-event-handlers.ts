import type { Socket } from 'socket.io-client'

import { useChatbotStore } from '@/stores/chatbot'
import { createTypingIndicatorMessage } from '@/utils/message-factory'

import type { IMessage } from '../apis/chat-microservice/types'
import type { ISocketEventHandlers, ITypingEventPayload } from './socket.types'

let agentTypingTimeout: ReturnType<typeof setTimeout> | null = null

const defaultHandlers: ISocketEventHandlers = {
  connect: (socket: Socket) => {
    console.info('[socket] connected guys', { id: socket.id })
  },
  reconnect: (attempt: number) => {
    console.info('[socket] reconnected', { attempt })
  },
  disconnect: (reason: Socket.DisconnectReason) => {
    console.warn('[socket] disconnected guys', { reason })
  },
  error: (error: Error) => {
    console.error('[socket] error', error)
  },
  typing: (payload: ITypingEventPayload) => {
    console.info('[socket] typing event received', payload)
    try {
      const chatbotStore = useChatbotStore()
      const isFromAgent = payload && typeof payload === 'object' && payload.source === 'agent'

      if (!isFromAgent) {
        return
      }

      const isTyping = !!payload.isTyping
      const currentMessages = Array.isArray(chatbotStore.messages) ? chatbotStore.messages : []
      const hasTypingIndicator = currentMessages.some((message) => !message.fromMe && message.msgType === 'typing-indicator')

      if (isTyping) {
        if (!hasTypingIndicator) {
          const typingMessage = createTypingIndicatorMessage({
            fromMe: false,
            senderBy: 'Assistant',
          })
          chatbotStore.appendMessage(typingMessage)
        }

        if (agentTypingTimeout) {
          clearTimeout(agentTypingTimeout)
        }
        agentTypingTimeout = setTimeout(() => {
          const latestMessages = Array.isArray(chatbotStore.messages) ? chatbotStore.messages : []
          const latestHasIndicator = latestMessages.some((message) => !message.fromMe && message.msgType === 'typing-indicator')
          if (latestHasIndicator) {
            const filtered = latestMessages.filter((message) => !(message.msgType === 'typing-indicator' && !message.fromMe))
            chatbotStore.setMessages(filtered)
          }
          agentTypingTimeout = null
        }, 5000)
      } else if (hasTypingIndicator) {
        if (agentTypingTimeout) {
          clearTimeout(agentTypingTimeout)
          agentTypingTimeout = null
        }
        const filtered = currentMessages.filter((message) => !(message.msgType === 'typing-indicator' && !message.fromMe))
        chatbotStore.setMessages(filtered)
      }
    } catch (error) {
      console.error('[socket] failed to handle typing event', error)
    }
  },
}

const mapPayloadToMessage = (payload: Record<string, unknown>): IMessage | null => {
  const idFromPayload = typeof payload._id === 'string' ? payload._id : typeof payload.id === 'string' ? payload.id : undefined

  const textFromPayload =
    typeof payload.text === 'string'
      ? payload.text
      : payload.message && typeof (payload.message as Record<string, unknown>).text === 'string'
        ? String((payload.message as Record<string, unknown>).text)
        : ''

  if (!textFromPayload) {
    return null
  }

  const id = idFromPayload ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const text = textFromPayload

  const senderByRaw = typeof payload.senderBy === 'string' ? payload.senderBy : 'Assistant'
  const msgType = typeof payload.msgType === 'string' ? payload.msgType : 'text'
  const createdAt = typeof payload.createdAt === 'string' ? payload.createdAt : new Date().toISOString()
  const channel = typeof payload.channel === 'string' ? payload.channel : 'chat-widget'

  return {
    _id: id,
    text,
    msgType,
    senderBy: senderByRaw === 'Customer' ? 'You' : senderByRaw,
    fromMe: senderByRaw === 'Customer',
    createdAt,
    channel,
  }
}

const handleIncomingChatMessage = (payload: unknown): void => {
  if (!payload || typeof payload !== 'object') {
    return
  }

  const normalized = mapPayloadToMessage(payload as Record<string, unknown>)
  if (!normalized) {
    return
  }

  // Bot/assistant replies are already handled via SSE.
  // To avoid duplicate messages, skip non-customer messages coming from the socket,
  // except those sent by an Employee, which should still be displayed.
  const sender = normalized.senderBy?.toLowerCase?.()
  if (!normalized.fromMe && sender !== 'employee') {
    return
  }

  const chatbotStore = useChatbotStore()
  const currentMessages = Array.isArray(chatbotStore.messages) ? chatbotStore.messages : []

  const existing = currentMessages.find((message: { _id: string }) => message._id === normalized._id)
  if (existing) {
    chatbotStore.patchMessage(existing._id, normalized)
    return
  }

  if (normalized.fromMe) {
    const placeholder = [...currentMessages].reverse().find((message) => message.fromMe && message.text === normalized.text)

    if (placeholder) {
      chatbotStore.patchMessage(placeholder._id, normalized)
      return
    }
  }

  chatbotStore.appendMessage(normalized)
}

export function registerSocketEventHandlers(socket: Socket, handlers: ISocketEventHandlers = {}): () => void {
  const mergedHandlers: ISocketEventHandlers = {
    ...defaultHandlers,
    ...handlers,
  }

  const connectHandler = (): void => mergedHandlers.connect?.(socket)
  const reconnectHandler = (attempt: number): void => mergedHandlers.reconnect?.(attempt)
  const disconnectHandler = (reason: Socket.DisconnectReason): void => mergedHandlers.disconnect?.(reason)
  const errorHandler = (error: Error): void => mergedHandlers.error?.(error)
  const typingHandler = (payload: ITypingEventPayload): void => mergedHandlers.typing?.(payload)
  const messageReceivedHandler = (payload: unknown): void => {
    handleIncomingChatMessage(payload)
  }

  socket.on('connect', connectHandler)
  socket.io.on('reconnect', reconnectHandler)
  socket.on('disconnect', disconnectHandler)
  socket.on('connect_error', errorHandler)
  socket.on('error', errorHandler)
  socket.on('typing', typingHandler)
  socket.on('chat:messages:received', messageReceivedHandler)

  return () => {
    socket.off('connect', connectHandler)
    socket.io.off('reconnect', reconnectHandler)
    socket.off('disconnect', disconnectHandler)
    socket.off('connect_error', errorHandler)
    socket.off('error', errorHandler)
    socket.off('typing', typingHandler)
    socket.off('chat:messages:received', messageReceivedHandler)
  }
}
