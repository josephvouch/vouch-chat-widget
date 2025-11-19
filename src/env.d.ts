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
  readonly VITE_CHAT_MICROSERVICE_HOST?: string
  readonly VITE_SOCKET_SERVER_URL?: string
  readonly VITE_RECAPTCHA_SITE_KEY?: string
  readonly VITE_WIDGET_API_KEY?: string
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ImportMeta {
  readonly env: ImportMetaEnv
}
