# Repository Guidelines

## Project Structure & Module Organization

The frontend lives under `src/`, with `main.ts` bootstrapping Vue, Pinia, and the router, and `App.vue` hosting the shell layout. Routes reside in `src/router/index.ts`, stores in `src/stores/`, while UI code is split between `src/views/` for pages and `src/components/` for reusable widgets. Static assets stay in `public/`; generated media or Tailwind tokens belong in `src/assets/` and `src/style.css`. Place new tests inside `src/__tests__/` or beside the module they cover.

## Build, Test, and Development Commands

Run `pnpm install` to sync dependencies with `pnpm-lock.yaml`. Use `pnpm dev` for the Vite dev server with HMR. `pnpm lint` executes ESLint with Vue + TypeScript presets; append `--fix` for auto-formatting. `pnpm build` performs `vue-tsc -b` plus a production bundle, and `pnpm preview` serves the `dist/` output for manual smoke checks.

## Coding Style & Naming Conventions

Author Vue components with `<script setup lang="ts">`, two-space indentation, PascalCase component names, and camelCase utilities. Tailwind utilities drive layout; share common tokens via the `@layer base` section in `src/style.css` and scope one-offs locally. Prettier settings live in `.prettierrc.json`; ensure format-on-save is enabled and resolve lint issues before committing.

## Testing Guidelines

Vitest with Vue Test Utils is the preferred stack, though suites are not yet wired. Name specs `ComponentName.spec.ts` and collocate mocks near consumers. Until automated coverage exists, document manual validation in PRs—list exercised routes, browser targets, and attach `pnpm preview` results.

## Commit & Pull Request Guidelines

Follow the existing history: concise, present-tense, imperative subjects such as `feat: add billing widget`. Keep commits scoped and rebase to maintain a linear history. PRs should explain the problem, outline the fix, link tickets, and include screenshots or recordings for UI changes. Conclude descriptions with the checks you ran (e.g., `pnpm lint`, `pnpm build`, manual QA notes).

## Security & Configuration Tips

Do not commit secrets; rely on environment files managed outside the repo. Tailwind, PostCSS, and Vite configs sit at the project root—mirror their patterns when extending. When introducing third-party dependencies, verify they are ESM-compatible to keep Vite bundling fast and predictable.
