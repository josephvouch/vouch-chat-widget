import { createPinia, setActivePinia } from 'pinia'
import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useUsersStore } from '@/stores/users'

import {
  disconnectSocketClient,
  getSocketClient,
  initSocketClient
} from '../socket-client'

vi.mock('socket.io-client', () => ({
  io: vi.fn()
}))

vi.mock('../socket-event-handlers', () => ({
  registerSocketEventHandlers: vi.fn(() => vi.fn())
}))

describe('socket-client', () => {
  let mockSocket: Partial<Socket>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Reset module state before each test
    disconnectSocketClient()

    mockSocket = {
      id: 'socket-123',
      connect: vi.fn(),
      disconnect: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      io: {
        on: vi.fn(),
        off: vi.fn()
      }
    } as unknown as Partial<Socket>

    vi.mocked(io).mockReturnValue(mockSocket as Socket)
  })

  afterEach(() => {
    disconnectSocketClient()
  })

  describe('initSocketClient', () => {
    it('creates and returns socket instance', () => {
      const socket = initSocketClient()

      expect(io).toHaveBeenCalled()
      expect(socket).toBe(mockSocket)
    })

    it('uses default socket server URL from config', () => {
      initSocketClient()

      const [[url, options]] = vi.mocked(io).mock.calls
      expect(url).toBeTruthy()
      expect(options).toBeDefined()
    })

    it('uses custom URL when provided', () => {
      const customUrl = 'http://custom-server.com:3000'
      initSocketClient({ url: customUrl })

      const [[url]] = vi.mocked(io).mock.calls
      // The port is preserved in the origin
      expect(url).toMatch(/http:\/\/custom-server\.com/)
    })

    it('configures socket with default options', () => {
      initSocketClient()

      const [[, options]] = vi.mocked(io).mock.calls
      expect(options).toMatchObject({
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 10,
        timeout: 20000,
        transports: ['websocket'],
        withCredentials: true
      })
    })

    it('includes widget API key in auth payload', () => {
      const usersStore = useUsersStore()
      const mockApiKey = 'test-api-key-123'

      // Manually set the widgetApiKey
      usersStore.widgetApiKey = mockApiKey

      initSocketClient()

      const [[, options]] = vi.mocked(io).mock.calls
      expect(options?.auth).toMatchObject({
        'x-widget-key': mockApiKey
      })
    })

    it('sets correct socket path with suffix', () => {
      initSocketClient()

      const [[, options]] = vi.mocked(io).mock.calls
      expect(options?.path).toContain('/chat-socket')
    })

    it('auto-connects when autoConnect is true', () => {
      initSocketClient({ autoConnect: true })

      expect(mockSocket.connect).toHaveBeenCalled()
    })

    it('does not auto-connect when autoConnect is false', () => {
      initSocketClient({ autoConnect: false })

      expect(mockSocket.connect).not.toHaveBeenCalled()
    })

    it('returns same instance on multiple calls', () => {
      const socket1 = initSocketClient()
      const socket2 = initSocketClient()

      expect(socket1).toBe(socket2)
      expect(io).toHaveBeenCalledOnce()
    })

    it('merges custom options with defaults', () => {
      initSocketClient({
        options: {
          reconnectionAttempts: 5,
          timeout: 10000
        }
      })

      const [[, options]] = vi.mocked(io).mock.calls
      expect(options).toMatchObject({
        reconnectionAttempts: 5,
        timeout: 10000,
        autoConnect: false,
        reconnection: true
      })
    })

    it('handles URL with pathname correctly', () => {
      initSocketClient({ url: 'http://server.com/api/v1' })

      const [[url, options]] = vi.mocked(io).mock.calls
      expect(url).toBe('http://server.com')
      expect(options?.path).toBe('/api/v1/chat-socket')
    })

    it('handles URL without pathname correctly', () => {
      initSocketClient({ url: 'http://server.com' })

      const [[url, options]] = vi.mocked(io).mock.calls
      expect(url).toBe('http://server.com')
      expect(options?.path).toBe('/chat-socket')
    })

    it('registers socket event handlers', async () => {
      const { registerSocketEventHandlers } = await import(
        '../socket-event-handlers'
      )

      initSocketClient()

      expect(registerSocketEventHandlers).toHaveBeenCalledWith(mockSocket)
    })

    it('handles auth payload with existing auth options', () => {
      const customAuth = { token: 'custom-token' }
      const usersStore = useUsersStore()
      usersStore.widgetApiKey = 'api-key-123'

      initSocketClient({
        options: {
          auth: customAuth
        }
      })

      const [[, options]] = vi.mocked(io).mock.calls
      expect(options?.auth).toMatchObject({
        token: 'custom-token',
        'x-widget-key': 'api-key-123'
      })
    })

    it('skips auth if widget API key is not available', () => {
      const usersStore = useUsersStore()
      usersStore.widgetApiKey = ''

      initSocketClient()

      const [[, options]] = vi.mocked(io).mock.calls
      expect(options?.auth).toBeUndefined()
    })
  })

  describe('getSocketClient', () => {
    it('returns initialized socket instance', () => {
      initSocketClient()
      const socket = getSocketClient()

      expect(socket).toBe(mockSocket)
    })

    it('throws error if socket not initialized', () => {
      expect(() => getSocketClient()).toThrow(
        'Socket client has not been initialized. Call initSocketClient() first.'
      )
    })
  })

  describe('disconnectSocketClient', () => {
    it('disconnects socket and cleans up handlers', async () => {
      const unregisterHandlers = vi.fn()
      const { registerSocketEventHandlers } = await import(
        '../socket-event-handlers'
      )
      vi.mocked(registerSocketEventHandlers).mockReturnValue(unregisterHandlers)

      initSocketClient()
      disconnectSocketClient()

      expect(mockSocket.disconnect).toHaveBeenCalled()
      expect(unregisterHandlers).toHaveBeenCalled()
    })

    it('resets socket instance after disconnect', () => {
      initSocketClient()
      disconnectSocketClient()

      expect(() => getSocketClient()).toThrow()
    })

    it('allows reinitializing after disconnect', () => {
      initSocketClient()
      disconnectSocketClient()

      vi.clearAllMocks()
      const newSocket = initSocketClient()

      expect(io).toHaveBeenCalled()
      expect(newSocket).toBeTruthy()
    })

    it('does nothing if socket not initialized', () => {
      expect(() => disconnectSocketClient()).not.toThrow()
    })

    it('can be called multiple times safely', () => {
      initSocketClient()
      disconnectSocketClient()

      expect(() => disconnectSocketClient()).not.toThrow()
      expect(mockSocket.disconnect).toHaveBeenCalledOnce()
    })
  })

  describe('socket lifecycle', () => {
    it('handles full connection lifecycle', () => {
      // Initialize
      const socket = initSocketClient({ autoConnect: true })
      expect(socket).toBeDefined()
      expect(mockSocket.connect).toHaveBeenCalled()

      // Get instance
      const sameSocket = getSocketClient()
      expect(sameSocket).toBe(socket)

      // Disconnect
      disconnectSocketClient()
      expect(mockSocket.disconnect).toHaveBeenCalled()

      // Attempt to get after disconnect
      expect(() => getSocketClient()).toThrow()
    })

    it('handles reconnection scenario', () => {
      // First connection
      initSocketClient({ autoConnect: true })
      expect(mockSocket.connect).toHaveBeenCalledTimes(1)

      // Disconnect
      disconnectSocketClient()
      vi.clearAllMocks()

      // Reconnect
      const newSocket = initSocketClient({ autoConnect: true })
      expect(newSocket).toBeDefined()
      expect(mockSocket.connect).toHaveBeenCalledTimes(1)
      expect(io).toHaveBeenCalledTimes(1)
    })
  })

  describe('error handling', () => {
    it('handles socket creation errors gracefully', () => {
      vi.mocked(io).mockImplementation(() => {
        throw new Error('Connection failed')
      })

      expect(() => initSocketClient()).toThrow('Connection failed')
    })

    it('handles missing widgetApiKey gracefully', () => {
      const usersStore = useUsersStore()
      usersStore.widgetApiKey = ''

      expect(() => initSocketClient()).not.toThrow()
    })

    it('handles malformed URL gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Will fall back to provided value if URL parsing fails
      initSocketClient({ url: 'invalid-url' })

      // Just ensure it doesn't throw
      expect(vi.mocked(io)).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})
