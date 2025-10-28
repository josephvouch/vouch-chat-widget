# Repository Guidelines

## Project Structure & Module Organization
- `src/` hosts application code: `main.ts` bootstraps Vue + Pinia + Router, `App.vue` renders the shell, `router/` lists routes, `stores/` centralizes state, `views/` and `components/` supply UI, `assets/` stores media, and `style.css` pulls in Tailwind layers.
- Tooling lives alongside the entry points: `tailwind.config.js` and `postcss.config.js` shape styling, `vite.config.ts` controls bundling, and `tsconfig*.json` define TypeScript targets.
- `public/` serves static assets verbatim. Add future tests under `src/__tests__/` or beside the unit they exercise.

## Build, Test, and Development Commands
- `pnpm install` ensures dependencies match `pnpm-lock.yaml`.
- `pnpm dev` starts Vite with hot module reload for rapid UI iteration.
- `pnpm lint` runs ESLint with Vue + TypeScript + Prettier rules; append `--fix` to auto-format.
- `pnpm build` performs a full type check with `vue-tsc -b` and outputs production assets to `dist/`; `pnpm preview` serves that bundle for smoke testing.

## Coding Style & Naming Conventions
- Prefer `<script setup lang="ts">`, two-space indentation, PascalCase components, and camelCase composables/utilities.
- Tailwind utilities drive layout. Keep shared tokens in the `@layer base` section of `style.css` and scope one-off tweaks locally.
- Use the provided `.prettierrc.json`, enable format-on-save, and run `pnpm lint` before pushing.

## State, Routing & Data Flow
- Extend routes in `src/router/index.ts`. Lazy-load view modules to control bundle size and ensure each route exports a default SFC.
- Create Pinia stores in `src/stores/` using the setup-style `defineStore`. Return plain refs/computed values, expose typed actions, and import stores via `useXStore()` inside components.
- Share cross-cutting composables or mock data alongside the store or view they support to keep dependencies discoverable.

## Testing Guidelines
- Automated tests are not yet wired up. When adding them, prefer Vitest with Vue Test Utils, store specs as `ComponentName.spec.ts`, and keep mocks near their subjects.
- Until the suite exists, include manual validation notes in pull requests (routes exercised, browsers checked) and verify builds with `pnpm preview` before sign-off.

## Commit & Pull Request Guidelines
- Follow the existing history: short, present-tense, imperative commit subjects with optional context prefixes (`feat:`, `fix:`, `refactor:`) when they trim ambiguity.
- Keep commits focused and rebase locally so reviewers see a linear story.
- Pull requests should describe the problem, summarize the fix, link tickets, and attach screenshots or recordings for UI changes.
- List local checks (`pnpm lint`, `pnpm build`, relevant manual QA) so reviewers can mirror the verification quickly.
