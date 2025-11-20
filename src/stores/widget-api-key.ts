/**
 * Shared helpers for widget API key persistence prefixes
 */

let globalWidgetApiKey = ''

/**
 * Persist the widget API key globally so stores can build prefixed keys.
 */
export function setWidgetApiKeyGlobal(apiKey: string): void {
  globalWidgetApiKey = apiKey
}

/**
 * Retrieve the widget API key that was set before Pinia initialization.
 */
export function getWidgetApiKey(): string {
  return globalWidgetApiKey
}

/**
 * Build a persistence key with the widget API key prefix.
 */
export function getWidgetPersistKey(suffix: string): string {
  const normalizedSuffix = suffix.startsWith('__') ? suffix : `__${suffix}`
  if (!globalWidgetApiKey) {
    return normalizedSuffix
  }
  return `${globalWidgetApiKey}${normalizedSuffix}`
}
