import type { IMessage } from '@/services/apis/chat-microservice/types'

const createMessageId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

export const createMessage = (partial: Partial<IMessage> = {}): IMessage => ({
  _id: partial._id ?? createMessageId(),
  fromMe: partial.fromMe ?? false,
  msgType: partial.msgType ?? 'text',
  text: partial.text ?? '',
  senderBy:
    partial.senderBy ?? (partial.fromMe ?? false ? 'You' : 'Assistant'),
  channel: partial.channel ?? 'Web',
  createdAt: partial.createdAt ?? new Date().toISOString(),
})

export const createTypingIndicatorMessage = (
  partial: Partial<IMessage> = {},
): IMessage =>
  createMessage({
    ...partial,
    fromMe: partial.fromMe ?? false,
    msgType: 'typing-indicator',
    text: '',
  })
