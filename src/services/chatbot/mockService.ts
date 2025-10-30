import type { ChatbotMessage } from '../../types/chatbot'

const RESPONSES: readonly string[] = [
  'Thanks for reaching out! I’m here to help with anything around onboarding and account setup.',
  'Could you share a little more detail? I want to make sure I point you in the best direction.',
  'I’ve noted this and passed it to the team. In the meantime, you can review our quick start docs for a walkthrough.',
  'Great question! The widget supports both light and dark themes—head into settings to pick what matches your brand.',
]

const STORAGE_KEY = 'vouch-chatbot-dev-history'
const randomInRange = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

const createMessage = (
  partial: Omit<ChatbotMessage, 'id' | 'ts'>,
): ChatbotMessage => ({
  id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
  ts: Date.now(),
  ...partial,
})

export const loadPersistedMessages = (): ChatbotMessage[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    if (
      !parsed.every(
        (message) => typeof message === 'object' && message !== null,
      )
    ) {
      return []
    }
    return parsed as ChatbotMessage[]
  } catch (error) {
    console.warn('[chatbot] Failed to parse stored messages', error)
    return []
  }
}

export const persistMessages = (messages: ChatbotMessage[]): void => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch (error) {
    console.warn('[chatbot] Failed to persist messages', error)
  }
}

export const seedMessages = (): ChatbotMessage[] => [
  createMessage({
    role: 'system',
    text: 'You’re chatting with the Vouch assistant. Ask anything about implementation or onboarding.',
  }),
  createMessage({
    role: 'assistant',
    text: 'Hey there! 👋 Ready to help whenever you are.',
  }),
]

export const sendMockAssistantReply = async (
  prompt: string,
): Promise<ChatbotMessage> => {
  const delay = randomInRange(600, 1250)
  const body = RESPONSES[randomInRange(0, RESPONSES.length - 1)]
  await new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, delay)
  })
  const hasQuestion = prompt.includes('?')
  return createMessage({
    role: 'assistant',
    text: hasQuestion ? body : `${body} Let me know if you have any questions.`,
  })
}

export const createUserMessage = (text: string): ChatbotMessage =>
  createMessage({
    role: 'user',
    text,
  })
