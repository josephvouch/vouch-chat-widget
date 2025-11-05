import path from 'node:path'
import { fileURLToPath } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const resolvePath = (dir: string): string =>
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), dir)

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolvePath('./src'),
      '@modules': resolvePath('./src/modules'),
    },
  },
})
