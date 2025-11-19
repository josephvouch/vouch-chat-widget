import { messagingModule } from '../apis/chat-microservice/messaging-module'
import type { ISendMessageRequest } from '../apis/chat-microservice/types'

export const STREAMING_EVENT_AI_ANSWER = 'ai-answer'
export const STREAMING_EVENT_TOKEN_USAGE = 'token-usage'
export const STREAMING_EVENT_HTTP_ERROR = 'http-error'
export const STREAMING_EVENT_CHAIN_RESULT = 'chain-result'
export const STREAMING_EVENT_IS_UNDERSTAND = 'is-understand'
export const STREAMING_EVENT_LLM_CONVO_MEMORY = 'llm-convo-memory'
export const STREAMING_EVENT_BOT_DISABLED = 'bot-disabled'
export const STREAMING_EVENT_TYPING_INDICATOR = 'typing-indicator'

export interface IMessageStreamEvent<T = unknown> {
  event: string
  data: T
  raw: string
}

export interface IMessageStreamCallbacks {
  onOpen?: () => void
  onEvent?: (payload: IMessageStreamEvent) => void
  onError?: (error: unknown) => void
  onComplete?: () => void
}

export interface IMessageStreamController {
  cancel: () => void
}

const COMMENT_PREFIX = ':'

const parseSseChunk = (chunk: string): IMessageStreamEvent | null => {
  const trimmed = chunk.trim()
  if (!trimmed.length || trimmed.startsWith(COMMENT_PREFIX)) {
    return null
  }

  const lines = trimmed.replace(/\r/g, '').split('\n')
  let eventName = 'message'
  const dataLines: string[] = []

  for (const line of lines) {
    if (line.startsWith('event:')) {
      eventName = line.slice('event:'.length).trim() || 'message'
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trim())
    }
  }

  if (dataLines.length === 0) {
    return {
      event: eventName,
      data: null,
      raw: trimmed,
    }
  }

  const joinedData = dataLines.join('\n')
  let parsed: unknown = joinedData

  try {
    parsed = joinedData.length ? JSON.parse(joinedData) : null
  } catch {
    parsed = joinedData
  }

  return {
    event: eventName,
    data: parsed,
    raw: trimmed,
  }
}

/**
 * Send a message to the core API and consume the SSE response stream.
 * Returns a controller that allows the caller to cancel the stream.
 */
export async function sendMessageWithStream(
  payload: ISendMessageRequest,
  callbacks: IMessageStreamCallbacks = {},
): Promise<IMessageStreamController> {
  const abortController = new AbortController()
  const response = await messagingModule.sendMessage(payload, abortController.signal)

  if (!response.body) {
    throw new Error('The messaging endpoint did not return a streamable response body')
  }

  callbacks.onOpen?.()

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let isActive = true

  const cancel = (): void => {
    if (!isActive) return
    isActive = false
    abortController.abort()
    void reader.cancel().catch(() => {
      // Swallow cancellation errors as they are expected when aborting
    })
  }

  const flushBuffer = (final = false): void => {
    if (!buffer.length) {
      return
    }

    const segments = buffer.split('\n\n')
    if (!final) {
      buffer = segments.pop() ?? ''
    } else {
      buffer = ''
    }

    for (const segment of segments) {
      const event = parseSseChunk(segment)
      if (!event) {
        continue
      }

      callbacks.onEvent?.(event)

      if (event.event === STREAMING_EVENT_HTTP_ERROR) {
        const error =
          typeof event.data === 'string'
            ? new Error(event.data)
            : event.data && typeof event.data === 'object'
              ? new Error(
                  'message' in (event.data as Record<string, unknown>) &&
                    typeof (event.data as Record<string, unknown>).message === 'string'
                    ? String((event.data as Record<string, unknown>).message)
                    : 'Streaming request failed',
                )
              : new Error('Streaming request failed')

        callbacks.onError?.(error)
        cancel()
        return
      }
    }
  }

  const readStream = async (): Promise<void> => {
    try {
      while (isActive) {
        const { value, done } = await reader.read()

        if (done) {
          buffer += decoder.decode()
          flushBuffer(true)
          break
        }

        buffer += decoder.decode(value, { stream: true })
        flushBuffer()
      }

      if (isActive) {
        callbacks.onComplete?.()
      }
    } catch (error) {
      if (isActive) {
        callbacks.onError?.(error)
      }
    } finally {
      cancel()
    }
  }

  void readStream()

  return {
    cancel,
  }
}
