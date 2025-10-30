import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// IIFE single-file build for non-module usage
export default defineConfig({
  plugins: [vue()],
  define: {
    'process.env.NODE_ENV': '"production"',
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
  },
  build: {
    outDir: 'dist/activator',
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: 'src/widget/shell.ts',
      name: 'ChatWidgetActivator',
      formats: ['iife'],
      fileName: () => 'app.js',
    },
    rollupOptions: {
      // Bundle all deps (vue, pinia) into the single file
      external: [],
      output: {
        inlineDynamicImports: true,
        assetFileNames: (info) => {
          const ext = info.name?.split('.').pop()
          if (ext === 'css') return 'app.css'
          return 'assets/[name][extname]'
        },
      },
    },
  },
})
