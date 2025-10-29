export type ChatbotMessageRole = 'user' | 'assistant' | 'system'

export interface ChatbotMessage {
  id: string
  role: ChatbotMessageRole
  text: string
  ts: number
}
