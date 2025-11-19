export interface ITypingIndicatorDot {
  id: string
  style: Readonly<Record<string, string>>
}

export interface ITypingIndicatorConfig {
  dots?: number
  delayStepSeconds?: number
  label?: string
}
