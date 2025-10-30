declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  type Props = Record<string, unknown>
  type RawBindings = Record<string, unknown>
  type Emits = Record<string, unknown>

  const component: DefineComponent<Props, RawBindings, Emits>
  export default component
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ImportMetaEnv {
  readonly VITE_CHATBOT_VIEW_PANEL?: string
  readonly VITE_CHATBOT_VIEW_PANEL_IFRAME_URL?: string
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ImportMeta {
  readonly env: ImportMetaEnv
}
