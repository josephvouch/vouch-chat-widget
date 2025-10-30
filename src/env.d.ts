declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  type Props = Record<string, unknown>
  type RawBindings = Record<string, unknown>
  type Emits = Record<string, unknown>

  const component: DefineComponent<Props, RawBindings, Emits>
  export default component
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ImportMetaEnv {}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface ImportMeta {
  readonly env: ImportMetaEnv
}
