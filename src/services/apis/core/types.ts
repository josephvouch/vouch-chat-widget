/**
 * Core Service API Types
 */

/**
 * Base API response structure
 */
export interface IApiResponse<T> {
  success: boolean
  data?: T
  error?: IApiError
  message?: string
}

/**
 * API error structure
 */
export interface IApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

/**
 * Messaging Module Types
 */

/**
 * Message object structure
 */
export interface IMessage {
  _id: string
  fromMe: boolean
  msgType: string
  text: string
  senderBy: string
  channel: string
  createdAt: string
}

/**
 * Retrieve last messages - Query parameters
 */
export interface IRetrieveLastMessagesParams {
  limit?: number
}

/**
 * Retrieve last messages - Response data
 */
export interface IRetrieveLastMessagesResponse {
  status: number
  message: string
  data: IMessage[]
}

/**
 * Send message - Request body
 */
export interface ISendMessageRequest {
  text: string
  msgType: 'text'
}

/**
 * Send message - Response data
 */
export interface ISendMessageResponse {
  status: number
  message: string
}

/**
 * Register Module Types
 */

/**
 * Register widget - Request body
 */
export interface IRegisterWidgetRequest {
  customerGeneratedCode: string
  customerTimezone?: number | null
  recaptchaToken: string
}

/**
 * Register widget - Response data structure
 */
export interface IRegisterWidgetData {
  customerId: string
}

/**
 * Register widget - Response
 */
export interface IRegisterWidgetResponse {
  status: number
  message: string
  data: IRegisterWidgetData
}

/**
 * Widget Styles Module Types
 */

/**
 * Header styles configuration
 */
export interface IHeaderStyles {
  bgColor: string
  textColor: string
  title: string
  titleFormat: string
  titleSize: number
  font: string
  closeIconColor: string
}

/**
 * Font configuration
 */
export interface IFontsStyles {
  body: string
}

/**
 * Launcher icon URLs
 */
export interface ILauncherStyles {
  openIconURL: string
  closeIconURL: string
}

/**
 * Bubble color configuration
 */
export interface IBubbleStyles {
  bgColor: string
  textColor: string
}

/**
 * Conversation styles configuration
 */
export interface IConversationStyles {
  avatarUrl: string
  backgroundColor: string
  bubbleRadius: number
  leftBubble: IBubbleStyles
  rightBubble: IBubbleStyles
}

/**
 * Attachment button styles
 */
export interface IAttachmentButtonStyles {
  bgColor: string
  iconColor: string
}

/**
 * Send button styles
 */
export interface ISendButtonStyles {
  type: string
  bgColor: string
  iconColor: string
  iconUrl: string
  text: string
}

/**
 * Input area styles configuration
 */
export interface IInputStyles {
  bgColor: string
  textColor: string
  attachmentButton: IAttachmentButtonStyles
  sendButton: ISendButtonStyles
}

/**
 * Welcome screen styles configuration
 */
export interface IWelcomeScreenStyles {
  greetings: string[]
  welcomePhrase: string
  bubble: IBubbleStyles
  ctaButton: IBubbleStyles
}

/**
 * Footer styles configuration
 */
export interface IFooterStyles {
  textColor: string
}

/**
 * Advanced styles configuration
 */
export interface IAdvancedStyles {
  galleryButtonTextColor: string
  stopStreamingButtonTextColor: string
}

/**
 * Complete widget styles data structure
 */
export interface IWidgetStylesData {
  header: IHeaderStyles
  fonts: IFontsStyles
  launcher: ILauncherStyles
  conversation: IConversationStyles
  input: IInputStyles
  welcomeScreen: IWelcomeScreenStyles
  footer: IFooterStyles
  advanced: IAdvancedStyles
}

/**
 * Get widget styles - Response
 */
export interface IGetWidgetStylesResponse {
  status: number
  message: string
  data: IWidgetStylesData
}
