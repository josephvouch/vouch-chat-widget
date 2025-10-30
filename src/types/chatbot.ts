export type ChatbotMessageRole = 'user' | 'assistant' | 'system'

export interface IChatbotMessage {
  id: string
  role: ChatbotMessageRole
  text: string
  ts: number
}

export type ChatbotMessage = IChatbotMessage
