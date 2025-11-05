import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import globals from 'globals'
import createVueTsConfig from '@vue/eslint-config-typescript'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import stylistic from '@stylistic/eslint-plugin'
import importPlugin from 'eslint-plugin-import'
import securityPlugin from 'eslint-plugin-security'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import vuePlugin from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [
  {
    ignores: [
      'dist',
      'node_modules',
      'eslint.config.js',
      '**/*.config.js',
      '**/*.config.cjs',
      '**/*.config.mjs',
      'test/**/*.ts'
    ]
  },
  ...compat.extends(
    'plugin:vue/essential',
    'eslint:recommended',
    '@vue/eslint-config-prettier/skip-formatting',
    'plugin:security/recommended-legacy',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ),
  ...createVueTsConfig({
    extends: ['recommended']
  }),
  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        projectService: true,
        extraFileExtensions: ['.vue'],
        createDefaultProgram: false
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@stylistic': stylistic,
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      security: securityPlugin,
      'simple-import-sort': simpleImportSort,
      vue: vuePlugin
    },
    rules: {
      'vue/no-static-inline-styles': ['error', { allowBinding: true }],
      'vue/require-prop-types': 'error',
      'vue/require-default-prop': 'error',
      'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
      'no-multi-spaces': 'error',
      'no-undef': 'off',
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'never'],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowBoolean: false, allowNumber: true }
      ],
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true }
      ],
      'security/detect-object-injection': 'error',
      'security/detect-non-literal-regexp': 'error',
      'import/no-unresolved': ['error', { ignore: ['^~icons/'] }],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^vue', '^@?\\w'],
            ['^\\u0000'],
            ['^node:'],
            ['^'],
            ['^\\.']
          ]
        }
      ],
      'simple-import-sort/exports': 'error',
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/array-bracket-spacing': ['error', 'never'],
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/arrow-parens': ['error', 'always'],
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': ['error'],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: true
          }
        }
      ],
      'max-len': ['error', { code: 140, ignoreComments: true }],
      'no-underscore-dangle': ['error', { allow: ['_id'] }],
      'prefer-destructuring': [
        'error',
        {
          VariableDeclarator: { array: false, object: true },
          AssignmentExpression: { array: true, object: false }
        },
        { enforceForRenamedProperties: false }
      ]
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.app.json', './tsconfig.node.json'],
        },
        alias: {
          map: [
            ['@', './src'],
            ['@modules', './src/modules']
          ],
          extensions: ['.ts', '.js', '.vue', '.json']
        }
      }
    }
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: 3,
          multiline: 1
        }
      ]
    }
  }
]
