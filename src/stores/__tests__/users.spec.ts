import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useUsersStore } from '../users'

describe('useUsersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('initial state', () => {
    it('initializes with null customer and session IDs', () => {
      const store = useUsersStore()

      expect(store.customerId).toBeNull()
      expect(store.sessionId).toBeNull()
      expect(store.isRegistered).toBe(false)
    })

    it('has widget API key from global config', () => {
      const store = useUsersStore()

      expect(store.widgetApiKey).toBeDefined()
      expect(typeof store.widgetApiKey).toBe('string')
    })
  })

  describe('isRegistered computed', () => {
    it('returns false when customerId is null', () => {
      const store = useUsersStore()

      expect(store.isRegistered).toBe(false)
    })

    it('returns true when customerId is set', () => {
      const store = useUsersStore()

      store.setCustomerId('customer-123')

      expect(store.isRegistered).toBe(true)
    })
  })

  describe('setCustomerId', () => {
    it('sets customer ID', () => {
      const store = useUsersStore()

      store.setCustomerId('customer-123')

      expect(store.customerId).toBe('customer-123')
      expect(store.isRegistered).toBe(true)
    })
  })

  describe('setSessionId', () => {
    it('sets session ID', () => {
      const store = useUsersStore()

      store.setSessionId('session-456')

      expect(store.sessionId).toBe('session-456')
    })

    it('allows setting session ID independently of customer ID', () => {
      const store = useUsersStore()

      store.setSessionId('session-456')

      expect(store.sessionId).toBe('session-456')
      expect(store.customerId).toBeNull()
    })
  })

  describe('clearCustomerId', () => {
    it('clears customer ID', () => {
      const store = useUsersStore()
      store.setCustomerId('customer-123')

      store.clearCustomerId()

      expect(store.customerId).toBeNull()
      expect(store.isRegistered).toBe(false)
    })

    it('clears session ID when clearing customer ID', () => {
      const store = useUsersStore()
      store.setCustomerId('customer-123')
      store.setSessionId('session-456')

      store.clearCustomerId()

      expect(store.customerId).toBeNull()
      expect(store.sessionId).toBeNull()
    })
  })

  describe('clearSessionId', () => {
    it('clears session ID', () => {
      const store = useUsersStore()
      store.setSessionId('session-456')

      store.clearSessionId()

      expect(store.sessionId).toBeNull()
    })

    it('does not clear customer ID when clearing session ID', () => {
      const store = useUsersStore()
      store.setCustomerId('customer-123')
      store.setSessionId('session-456')

      store.clearSessionId()

      expect(store.customerId).toBe('customer-123')
      expect(store.sessionId).toBeNull()
    })
  })

  describe('full registration flow', () => {
    it('handles complete registration workflow', () => {
      const store = useUsersStore()

      // Initial state - not registered
      expect(store.isRegistered).toBe(false)

      // Registration
      store.setCustomerId('customer-123')
      store.setSessionId('session-456')

      expect(store.isRegistered).toBe(true)
      expect(store.customerId).toBe('customer-123')
      expect(store.sessionId).toBe('session-456')

      // Session expiry - clear session but keep customer
      store.clearSessionId()

      expect(store.isRegistered).toBe(true)
      expect(store.customerId).toBe('customer-123')
      expect(store.sessionId).toBeNull()

      // Re-authenticate - new session
      store.setSessionId('session-789')

      expect(store.sessionId).toBe('session-789')

      // Logout - clear all
      store.clearCustomerId()

      expect(store.isRegistered).toBe(false)
      expect(store.customerId).toBeNull()
      expect(store.sessionId).toBeNull()
    })
  })
})
