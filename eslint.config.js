import js from '@eslint/js'
import createVueTsConfig from '@vue/eslint-config-typescript'
import globals from 'globals'
import prettier from '@vue/eslint-config-prettier'

export default [
  {
    ignores: [
      'dist',
      'node_modules',
      'eslint.config.js',
      '**/*.config.js',
      '**/*.config.cjs',
      '**/*.config.mjs'
    ]
  },
  js.configs.recommended,
  ...createVueTsConfig({
    extends: ['recommended'],
    supportedScriptLangs: { ts: true, tsx: false, js: false, jsx: false },
    rootDir: import.meta.dirname
  }),
  {
    files: ['**/*.{js,ts,tsx,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser
      }
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ]
    }
  },
  prettier
]
