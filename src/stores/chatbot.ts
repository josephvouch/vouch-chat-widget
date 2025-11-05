import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import type { IMessage } from '../services/apis/core/types'
import {
  type IMessageStreamController,
  type IMessageStreamEvent,
  sendMessageWithStream,
  STREAMING_EVENT_AI_ANSWER,
  STREAMING_EVENT_CHAIN_RESULT,
  STREAMING_EVENT_TOKEN_USAGE,
} from '../services/handlers/message-handler'

interface TokenUsage {
  inputToken?: number
  outputToken?: number
  totalToken?: number
}

const createMessageId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

const createMessage = (partial: Partial<IMessage>): IMessage => ({
  _id: partial._id ?? createMessageId(),
  fromMe: partial.fromMe ?? false,
  msgType: partial.msgType ?? 'text',
  text: partial.text ?? '',
  senderBy: partial.senderBy ?? (partial.fromMe ? 'You' : 'Assistant'),
  channel: partial.channel ?? 'Web',
  createdAt: partial.createdAt ?? new Date().toISOString(),
})

const extractTokenUsage = (event?: IMessageStreamEvent): TokenUsage | null => {
  if (!event || typeof event.data !== 'object' || event.data === null) {
    return null
  }

  const payload = event.data as Record<string, unknown>
  const inputToken =
    typeof payload.inputToken === 'number' ? payload.inputToken : undefined
  const outputToken =
    typeof payload.outputToken === 'number' ? payload.outputToken : undefined
  const totalToken =
    typeof payload.totalToken === 'number' ? payload.totalToken : undefined

  if (
    inputToken === undefined &&
    outputToken === undefined &&
    totalToken === undefined
  ) {
    return null
  }

  return {
    inputToken,
    outputToken,
    totalToken,
  }
}

export const useChatbotStore = defineStore('chatbot', () => {
  const isOpen = ref(false)
  const isLoading = ref(false)
  const messages = ref<IMessage[]>([])
  const unreadCount = ref(0)
  const lastTokenUsage = ref<TokenUsage | null>(null)
  const activeStream = ref<IMessageStreamController | null>(null)

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
            text: `${message.text ?? ''}${chunk}`,
          }
        : message,
    )
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

    const assistantMessage = createMessage({
      fromMe: false,
      text: '',
      senderBy: 'Assistant',
    })
    appendMessage(assistantMessage)

    isLoading.value = true
    lastTokenUsage.value = null

    let streamResolve: (() => void) | null = null
    let streamReject: ((reason?: unknown) => void) | null = null

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
                    patchMessage(assistantMessage._id, { text: aiMessage })
                  }
                }
                break
              }
              case STREAMING_EVENT_TOKEN_USAGE: {
                const usage = extractTokenUsage(event)
                if (usage) {
                  lastTokenUsage.value = usage
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
            patchMessage(assistantMessage._id, {
              text: message,
              msgType: 'system',
            })
            streamReject?.(error)
            streamReject = null
          },
          onComplete: () => {
            // Ensure we have some assistant text even if no chunks were streamed
            const assistant = messages.value.find(
              (message) => message._id === assistantMessage._id,
            )
            if (assistant && !assistant.text.trim()) {
              patchMessage(assistantMessage._id, {
                text: 'Thanks for your message! I will get back shortly.',
              })
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
      patchMessage(assistantMessage._id, {
        text:
          error instanceof Error && error.message
            ? error.message
            : 'Unable to send your message. Please try again.',
        msgType: 'system',
      })
      if (streamReject) {
        streamReject(error)
        streamReject = null
      }
    } finally {
      activeStream.value = null
      if (streamResolve) {
        streamResolve()
        streamResolve = null
      }
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
    lastTokenUsage,
    open,
    close,
    toggle,
    sendMessage,
  }
})
