import { getCurrentInstance } from 'vue'
import { type IReCaptchaComposition, useReCaptcha } from 'vue-recaptcha-v3'

let cachedRecaptcha: IReCaptchaComposition | null = null

/**
 * Initialize and cache the reCAPTCHA instance.
 * Must be called within a Vue component setup context.
 */
export function initializeRecaptcha(): void {
  if (cachedRecaptcha) return

  if (!getCurrentInstance()) {
    // No component instance available; defer initialization
    return
  }

  const instance = useReCaptcha() as IReCaptchaComposition | undefined

  if (!instance) {
    console.error('[recaptcha] Failed to obtain reCAPTCHA instance.')
    return
  }

  cachedRecaptcha = instance
}

function requireRecaptchaInstance(): IReCaptchaComposition {
  if (!cachedRecaptcha) {
    initializeRecaptcha()
  }

  if (!cachedRecaptcha) {
    throw new Error('reCAPTCHA instance is not initialized')
  }

  return cachedRecaptcha
}

/**
 * Retrieve a reCAPTCHA token for secured actions.
 * Ensures the widget is loaded before executing the desired action.
 */
export async function getRecaptchaToken(action: string = 'register'): Promise<string> {
  try {
    const instance = requireRecaptchaInstance()
    await instance.recaptchaLoaded()
    const token = await instance.executeRecaptcha(action)
    return token
  } catch (error) {
    console.error('initiate captcha error: ', error)
    throw error
  }
}
