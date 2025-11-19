import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import {
  createMessage,
  createTypingIndicatorMessage,
} from '@/utils/message-factory'

import type { IMessage } from '../services/apis/chat-microservice/types'
import {
  type IMessageStreamController,
  type IMessageStreamEvent,
  sendMessageWithStream,
  STREAMING_EVENT_AI_ANSWER,
  STREAMING_EVENT_BOT_DISABLED,
  STREAMING_EVENT_CHAIN_RESULT,
  STREAMING_EVENT_TYPING_INDICATOR,
} from '../services/handlers/message-stream-handler'

export const useChatbotStore = defineStore('chatbot', () => {
  const isOpen = ref(false)
  const isLoading = ref(false)
  const messages = ref<IMessage[]>([])
  const unreadCount = ref(0)
  const activeStream = ref<IMessageStreamController | null>(null)
  const latestChatMessageId = ref<string | null>(null)

  const lastMessage = computed<IMessage | null>(() => {
    if (messages.value.length === 0) return null
    return messages.value[messages.value.length - 1] ?? null
  })

  const open = (): void => {
    isOpen.value = true
    unreadCount.value = 0
  }

  const close = (): void => {
    isOpen.value = false
    activeStream.value?.cancel()
    activeStream.value = null
  }

  const toggle = (): void => {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  const appendMessage = (message: IMessage): void => {
    messages.value = [...messages.value, message]
    if (!isOpen.value && !message.fromMe) {
      unreadCount.value += 1
    }
  }

  const setMessages = (newMessages: IMessage[]): void => {
    messages.value = [...newMessages]
  }

  const prependMessages = (incoming: IMessage[]): void => {
    if (!incoming.length) return
    const existingIds = new Set(messages.value.map((message) => message._id))
    const filtered = incoming.filter((message) => !existingIds.has(message._id))
    if (!filtered.length) return
    messages.value = [...filtered, ...messages.value]
  }

  const clearMessages = (): void => {
    messages.value = []
  }

  const patchMessage = (id: string, patch: Partial<IMessage>): void => {
    messages.value = messages.value.map((message) =>
      message._id === id ? { ...message, ...patch } : message,
    )
  }

  const appendToMessageText = (id: string, chunk: string): void => {
    if (!chunk) return
    messages.value = messages.value.map((message) =>
      message._id === id
        ? {
            ...message,
            msgType:
              message.msgType === 'typing-indicator' ? 'text' : message.msgType,
            text: `${message.text ?? ''}${chunk}`,
          }
        : message,
    )
  }

  const setLatestChatMessageId = (id: string | null): void => {
    latestChatMessageId.value = id
  }

  const sendMessage = async (text: string): Promise<void> => {
    if (isLoading.value) return

    const trimmed = text.trim()
    if (!trimmed) return

    const userMessage = createMessage({
      fromMe: true,
      text: trimmed,
      senderBy: 'You',
    })
    appendMessage(userMessage)
    let assistantMessage: IMessage | null = null

    isLoading.value = true
    let streamResolve: (() => void) | null = null
    let streamReject: ((reason?: unknown) => void) | null = null
    let botDisabled = false

    const streamPromise = new Promise<void>((resolve, reject) => {
      streamResolve = resolve
      streamReject = reject
    })

    try {
      const controller = await sendMessageWithStream(
        { message: trimmed },
        {
          onEvent: (event: IMessageStreamEvent) => {
            switch (event.event) {
              case STREAMING_EVENT_AI_ANSWER: {
                const chunk =
                  typeof event.data === 'string'
                    ? event.data
                    : typeof event.data === 'number'
                      ? String(event.data)
                      : ''
                if (!assistantMessage) {
                  assistantMessage = createTypingIndicatorMessage({
                    fromMe: false,
                    senderBy: 'Assistant',
                  })
                  appendMessage(assistantMessage)
                }
                appendToMessageText(assistantMessage._id, chunk)
                break
              }
              case STREAMING_EVENT_CHAIN_RESULT: {
                if (
                  event.data &&
                  typeof event.data === 'object' &&
                  'ai_message' in (event.data as Record<string, unknown>)
                ) {
                  const aiMessage = (
                    event.data as Record<string, unknown>
                  ).ai_message
                  if (typeof aiMessage === 'string') {
                    if (!assistantMessage) {
                      assistantMessage = createTypingIndicatorMessage({
                        fromMe: false,
                        senderBy: 'Assistant',
                      })
                      appendMessage(assistantMessage)
                    }
                    patchMessage(assistantMessage._id, {
                      text: aiMessage,
                      msgType: 'text',
                    })
                  }
                }
                break
              }
              case STREAMING_EVENT_TYPING_INDICATOR: {
                const active =
                  !!event.data &&
                  typeof event.data === 'object' &&
                  'active' in (event.data as Record<string, unknown>) &&
                  Boolean(
                    (event.data as Record<string, unknown>).active as boolean,
                  )

                if (active) {
                  if (!assistantMessage) {
                    assistantMessage = createTypingIndicatorMessage({
                      fromMe: false,
                      senderBy: 'Assistant',
                    })
                    appendMessage(assistantMessage)
                  }
                } else if (assistantMessage) {
                  const target = messages.value.find(
                    (message) => message._id === assistantMessage?._id,
                  )
                  if (target && target.msgType === 'typing-indicator') {
                    messages.value = messages.value.filter(
                      (message) => message._id !== assistantMessage?._id,
                    )
                    assistantMessage = null
                  }
                }
                break
              }
              case STREAMING_EVENT_BOT_DISABLED: {
                botDisabled = true
                if (assistantMessage) {
                  messages.value = messages.value.filter(
                    (message) => message._id !== assistantMessage._id,
                  )
                  assistantMessage = null
                }
                break
              }
              default: {
                // Additional events can be handled here if needed
              }
            }
          },
          onError: (error: unknown) => {
            console.error('[chatbot] streaming error', error)
            const message =
              error instanceof Error && error.message
                ? error.message
                : 'Sorry, we ran into a problem while generating a reply.'
            if (assistantMessage) {
              patchMessage(assistantMessage._id, {
                text: message,
                msgType: 'system',
              })
            }
            streamReject?.(error)
            streamReject = null
          },
          onComplete: () => {
            if (!botDisabled) {
              // Ensure we have some assistant text even if no chunks were streamed
              if (assistantMessage) {
                const assistant = messages.value.find(
                  (message) => message._id === assistantMessage._id,
                )
                if (assistant && !assistant.text.trim()) {
                  patchMessage(assistantMessage._id, {
                    text:
                      'Thanks for your message! I will get back shortly.',
                    msgType: 'text',
                  })
                }
              }
            }
            streamResolve?.()
            streamResolve = null
          },
        },
      )

      activeStream.value = {
        cancel: () => {
          controller.cancel()
          streamResolve?.()
          streamResolve = null
          streamReject = null
        },
      }
      await streamPromise
    } catch (error) {
      console.error('[chatbot] failed to send message', error)
      if (assistantMessage) {
        patchMessage(assistantMessage._id, {
          text:
            error instanceof Error && error.message
              ? error.message
              : 'Unable to send your message. Please try again.',
          msgType: 'system',
        })
      }
    } finally {
      activeStream.value = null
      streamReject = null
      isLoading.value = false
    }
  }

  watch(
    () => isOpen.value,
    (openState: boolean) => {
      if (openState) {
        unreadCount.value = 0
      }
    },
  )

  return {
    isOpen,
    isLoading,
    messages,
    unreadCount,
    lastMessage,
    latestChatMessageId,
    open,
    close,
    toggle,
    sendMessage,
    appendMessage,
    setMessages,
    prependMessages,
    clearMessages,
    setLatestChatMessageId,
    patchMessage,
  }
})
