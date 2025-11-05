# Repository Guidelines

## Project Structure & Module Organization
- Frontend lives in `src/`; `src/main.ts` boots Vue, Pinia, and the router, with `src/App.vue` as the app shell.
- Routes aggregate from module bundles in `src/routes/`. Stores remain in `src/stores/`. Shared services/config/utilities stay at the root of `src`.
- UI is modularised under `src/modules/`:
  - `button-activator/` holds the launcher components, composeables, and preview view.
  - `chatbot-view/` contains the iframe chat surface components and the bot/panel views.
- Static assets: `public/`; generated media and Tailwind tokens: `src/assets/` and `src/style.css`.
- Widget build target for the embeddable bundle lives under `src/widget/`.
- Place tests in `src/__tests__/` or beside modules they cover.

## Build, Test, and Development Commands
- Install: `pnpm install` (keeps lockfile in sync).
- Dev server: `pnpm dev` (Vite + HMR at localhost).
- Lint: `pnpm lint` or `pnpm lint --fix` (ESLint with Vue + TS presets).
- Build: `pnpm build` (type-checks via `vue-tsc -b` then bundles).
- Preview: `pnpm preview` (serves `dist/` for smoke checks).
- Widgets: `pnpm build:widgets` (runs `build:widget-activator` and `build:widget-view`).

## Coding Style & Naming Conventions
- Use `<script setup lang="ts">`, 2-space indentation, PascalCase component names, and camelCase utilities.
- Tailwind drives layout; share tokens in `@layer base` within `src/style.css`; scope one-offs locally.
- Formatting via Prettier (`.prettierrc.json`: single quotes, no semicolons). Resolve lint issues before committing.

## Testing Guidelines
- Preferred stack: Vitest + Vue Test Utils (not yet wired).
- Name specs `ComponentName.spec.ts`. Collocate mocks near consumers.
- Until automated tests are added, document manual validation in PRs: list exercised routes, browsers, and attach `pnpm preview` results.

## Commit & Pull Request Guidelines
- Commits: concise, present-tense, imperative, e.g., `feat: add billing widget`. Keep changes scoped; rebase for linear history.
- PRs: explain the problem and fix, link tickets, and include screenshots/recordings for UI changes. Conclude with checks run (`pnpm lint`, `pnpm build`, manual QA notes).

## Security & Configuration Tips
- Do not commit secrets; manage env outside the repo.
- Ensure dependencies are ESM-compatible for smooth Vite bundling.
- Follow patterns in root configs: Tailwind (`tailwind.config.js`), PostCSS (`postcss.config.js`), Vite (`vite*.config.ts`).
