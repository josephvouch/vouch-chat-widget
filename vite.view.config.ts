import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  plugins: [vue()],
  root: '.',
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
