import { io, type Socket } from 'socket.io-client'

import { SOCKET_SERVER_URL } from '@/config/constants'
import { useUsersStore } from '@/stores/users'

import type { ISocketClientConfig, SocketConnectionOptions } from './socket.types'
import { registerSocketEventHandlers } from './socket-event-handlers'

let socketInstance: Socket | null = null
let unregisterHandlers: (() => void) | null = null

const SOCKET_PATH_SUFFIX = '/chat-socket'

interface ISocketEndpoint {
  url: string
  path: string
}

function resolveSocketEndpoint(rawUrl: string): ISocketEndpoint {
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    const parsed = new URL(rawUrl, base)
    const normalizedPath = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname.replace(/\/$/, '') : ''

    return {
      url: parsed.origin,
      path: `${normalizedPath}${SOCKET_PATH_SUFFIX}` || SOCKET_PATH_SUFFIX,
    }
  } catch (error) {
    console.warn('[socket] Failed to parse socket URL, falling back to provided value', { rawUrl, error })
    return {
      url: rawUrl,
      path: SOCKET_PATH_SUFFIX,
    }
  }
}

function buildAuthPayload(): Record<string, unknown> | undefined {
  const usersStore = useUsersStore()
  const { widgetApiKey } = usersStore

  if (!widgetApiKey) {
    return undefined
  }

  return {
    'x-widget-key': widgetApiKey,
  }
}

export function initSocketClient(config?: ISocketClientConfig): Socket {
  if (socketInstance) {
    return socketInstance
  }

  const { url = SOCKET_SERVER_URL, autoConnect = true, options } = config || {}
  const { url: socketUrl, path: defaultSocketPath } = resolveSocketEndpoint(url)

  const baseOptions: SocketConnectionOptions = {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    timeout: 20000,
    transports: ['websocket'],
    ...options,
  }

  const authPayload: Record<string, unknown> =
    typeof baseOptions.auth === 'object' && baseOptions.auth !== null ? { ...baseOptions.auth } : {}

  const widgetAuth = buildAuthPayload()
  if (widgetAuth) {
    Object.assign(authPayload, widgetAuth)
  }

  const connectionOptions: SocketConnectionOptions = {
    ...baseOptions,
    path: baseOptions.path || defaultSocketPath,
    withCredentials: true,
    auth: Object.keys(authPayload).length > 0 ? authPayload : baseOptions.auth,
  }

  socketInstance = io(socketUrl, connectionOptions)
  unregisterHandlers = registerSocketEventHandlers(socketInstance)

  if (autoConnect) {
    socketInstance.connect()
  }

  return socketInstance
}

export function getSocketClient(): Socket {
  if (!socketInstance) {
    throw new Error('Socket client has not been initialized. Call initSocketClient() first.')
  }

  return socketInstance
}

export function disconnectSocketClient(): void {
  if (!socketInstance) {
    return
  }

  unregisterHandlers?.()
  socketInstance.disconnect()
  socketInstance = null
  unregisterHandlers = null
}
