import type { ManagerOptions, Socket, SocketOptions } from 'socket.io-client'

export type SocketConnectionOptions = Partial<ManagerOptions & SocketOptions>

export interface ISocketClientConfig {
  url?: string
  autoConnect?: boolean
  options?: SocketConnectionOptions
}

export interface ITypingEventPayload {
  conversationId: string
  isTyping: boolean
  userId?: string
  source?: string
}

export interface ISocketEventHandlers {
  connect?: (socket: Socket) => void
  reconnect?: (attempt: number) => void
  disconnect?: (reason: Socket.DisconnectReason) => void
  error?: (error: Error) => void
  typing?: (payload: ITypingEventPayload) => void
}
