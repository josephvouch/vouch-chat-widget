import { useChatbotStore } from '../../stores/chatbot'
import { messagingModule } from '../apis/chat-microservice/messaging-module'
import type { IMessage } from '../apis/chat-microservice/types'

export {
  type IMessageStreamCallbacks,
  type IMessageStreamController,
  type IMessageStreamEvent,
  sendMessageWithStream,
  STREAMING_EVENT_AI_ANSWER,
  STREAMING_EVENT_CHAIN_RESULT,
  STREAMING_EVENT_HTTP_ERROR,
  STREAMING_EVENT_IS_UNDERSTAND,
  STREAMING_EVENT_LLM_CONVO_MEMORY,
  STREAMING_EVENT_TOKEN_USAGE,
} from './message-stream-handler'
type HistoryLoadMode = 'replace' | 'prepend'
interface IHistoryLoadResult {
  success: boolean
  hasMore: boolean
}

const HISTORY_PAGE_LIMIT = 20 as const

const sortMessagesChronologically = (messages: IMessage[]): IMessage[] => {
  return [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

const determineFromMe = (message: IMessage): boolean => {
  if (typeof message.fromMe === 'boolean') {
    return message.fromMe
  }

  const sender = message.senderBy?.toLowerCase?.()
  if (!sender) {
    return false
  }

  return sender === 'customer' || sender === 'you'
}

const normalizeMessages = (messages: IMessage[]): IMessage[] => {
  return messages.map((message) => ({
    ...message,
    fromMe: determineFromMe(message),
  }))
}

const retrieveAndStoreMessages = async (mode: HistoryLoadMode): Promise<IHistoryLoadResult> => {
  try {
    const chatbotStore = useChatbotStore()
    const latestChatMessageId = mode === 'prepend' ? chatbotStore.latestChatMessageId : null
    const response = await messagingModule.retrieveLastMessages(
      latestChatMessageId ? { latestChatMessageId, limit: HISTORY_PAGE_LIMIT } : { limit: HISTORY_PAGE_LIMIT }
    )
    const payload = response.data ?? []

    if (!payload.length) {
      return { success: true, hasMore: false }
    }

    const normalizedMessages = normalizeMessages(payload)
    const orderedMessages = sortMessagesChronologically(normalizedMessages)

    if (mode === 'replace') {
      chatbotStore.setMessages(orderedMessages)
    } else {
      chatbotStore.prependMessages(orderedMessages)
    }

    const latestIdFromResponse = payload[payload.length - 1]?._id ?? null
    const latestId = latestIdFromResponse ?? chatbotStore.latestChatMessageId
    if (latestId) {
      chatbotStore.setLatestChatMessageId(latestId)
    }

    const hasMore = mode === 'replace' ? true : orderedMessages.length === HISTORY_PAGE_LIMIT

    return { success: true, hasMore }
  } catch (error) {
    console.error('[message-handler] Failed to retrieve messages:', error)
    return { success: false, hasMore: false }
  }
}

export async function loadInitialChatHistory(): Promise<IHistoryLoadResult> {
  return retrieveAndStoreMessages('replace')
}

export async function loadOlderChatHistory(): Promise<IHistoryLoadResult> {
  return retrieveAndStoreMessages('prepend')
}
