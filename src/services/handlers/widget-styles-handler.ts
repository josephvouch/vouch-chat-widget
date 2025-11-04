/**
 * Widget Styles Handler
 * Handles fetching and setting widget styles configuration
 */

import { useWidgetStylesStore } from '../../stores/widget-styles'
import { widgetStylesModule } from '../apis/core/widget-styles-module'

/**
 * Fetch widget styles from API and set in store
 * Retrieves widget styling configuration and updates the Pinia store
 * @returns Promise<boolean> - Returns true if fetch and set is successful
 */
export async function fetchAndSetWidgetStyles(): Promise<boolean> {
  try {
    // Step 1: Call widget styles API
    const response = await widgetStylesModule.getStyles()

    // Step 2: Get widget styles store
    const widgetStylesStore = useWidgetStylesStore()

    // Step 3: Set styles data in store
    widgetStylesStore.setStyles(response.data)

    // Step 4: Return true for successful operation
    return true
  } catch (error) {
    console.error('[widget-styles-handler] Failed to fetch widget styles:', error)
    return false
  }
}
