import ChatbotButtonActivator from '@modules/button-activator/components/ChatbotButtonActivator.vue'
import type { RenderResult } from '@testing-library/vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const renderComponent = (props?: Record<string, unknown>): RenderResult => {
  const pinia = createPinia()
  setActivePinia(pinia)

  return render(ChatbotButtonActivator, {
    props: {
      open: false,
      unreadCount: 0,
      position: 'right',
      horizontalOffset: 24,
      bottom: 24,
      zIndex: 50,
      ...props,
    },
    global: {
      plugins: [pinia],
    },
  })
}

const mockMatchMedia = (prefersReducedMotion: boolean): void => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: prefersReducedMotion,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

describe('ChatbotButtonActivator', () => {
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    mockMatchMedia(false)
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('emits toggle + open when clicked while closed in reduced motion mode', async () => {
    mockMatchMedia(true)
    const { emitted } = renderComponent()
    const button = screen.getByRole('button', { name: 'Open chat' })

    await fireEvent.click(button)

    expect(emitted().toggle).toHaveLength(1)
    expect(emitted().open).toHaveLength(1)
    expect(emitted().close).toBeUndefined()
  })

  it('updates aria label, badge, and wrapper style from props', () => {
    const { container } = renderComponent({
      unreadCount: 3,
      position: 'left',
      horizontalOffset: 12,
      bottom: 16,
      zIndex: 101,
    })

    const button = screen.getByRole('button', { name: 'Open chat, 3 new messages' })
    expect(button.dataset.testid).toBe('chatbot-activator')

    const badge = container.querySelector('.chatbot-activator-badge')
    expect(badge?.textContent).toBe('3')

    const wrapper = container.querySelector('.chatbot-activator-wrapper')
    const inlineStyle = wrapper?.getAttribute('style') ?? ''

    expect(inlineStyle).toContain('left: 12px')
    expect(inlineStyle).toContain('bottom: 16px')
    expect(inlineStyle).toContain('z-index: 101')
  })
})
