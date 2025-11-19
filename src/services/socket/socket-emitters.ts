import type { ITypingEventPayload } from './socket.types'
import { getSocketClient } from './socket-client'

export function emitTypingEvent(payload: ITypingEventPayload): void {
  const socket = getSocketClient()

  if (!socket.connected) {
    console.info('[socket][emit] typing requested before connection, attempting to connect')
    socket.connect()
  }

  console.info('[socket][emit] typing', payload)
  socket.emit('typing', payload)
}

// No chat-microservice:messages:create emit path is used anymore.
