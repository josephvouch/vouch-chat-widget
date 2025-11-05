import path from 'node:path'
import { fileURLToPath } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const resolvePath = (dir: string): string =>
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), dir)

export default defineConfig({
  base: './',
  plugins: [vue()],
  root: '.',
  resolve: {
    alias: {
      '@': resolvePath('./src'),
      '@modules': resolvePath('./src/modules'),
    },
  },
  build: {
    outDir: 'dist/view',
    emptyOutDir: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: 'index.html',
      output: {
        entryFileNames: 'app-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (info) => {
          const ext = info.name?.split('.').pop()
          if (ext === 'css') return 'app-[hash].css'
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
})
