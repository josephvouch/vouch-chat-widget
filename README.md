# Vouch AVA Chat Widget

Vue 3 + TypeScript + Vite codebase for the embeddable AVA chat experience. The project contains both the floating Chatbot Button Activator and the iframe-friendly Chatbot View along with a development playground used by Vouch engineers and designers.

## Features

- Modern Vue 3 app bootstrapped with Vite, Tailwind utility tokens, and alias-aware TypeScript.
- Modular launcher (`button-activator`) and chat surface (`chatbot-view`) bundles that can be iterated independently.
- Pinia stores with persisted state for widget-level configuration and styles.
- Widget-style bootstrapper that fetches remote theme configuration before the UI mounts.
- Vitest + Testing Library setup for component and store unit tests.

## Requirements

- Node.js 18+ (LTS recommended)
- pnpm 9+

## Getting Started

1. Install dependencies: `pnpm install`
2. Create `.env.local` (you can start by copying `.env` or `.env.widget-view`) and define the following keys:
   - `VITE_WIDGET_API_KEY` – API key injected into the widget root element.
   - `VITE_CHAT_MICROSERVICE_HOST` – Base URL for chat microservice endpoints.
   - `VITE_SOCKET_SERVER_URL` – Socket.IO server (defaults to the chat host).
   - `VITE_RECAPTCHA_SITE_KEY` – Google reCAPTCHA v3 site key.
   - `VITE_CHATBOT_VIEW_PANEL_IFRAME_URL` – URL used by the host page to load the chat view route when the activator opens.
3. Start the playground: `pnpm dev`
4. Visit the dev server URL, click the activator, and interact with the mocked transcript. Launcher state persists under the `vouch-chatbot-dev-history` key.

## Scripts

| Command                       | Description                                                            |
| ----------------------------- | ---------------------------------------------------------------------- |
| `pnpm dev`                    | Run Vite dev server with HMR.                                          |
| `pnpm build`                  | Type-check via `vue-tsc -b` then create a production bundle.           |
| `pnpm preview`                | Serve the latest `dist/` build for local smoke testing.                |
| `pnpm lint`                   | Run ESLint across `.ts` and `.vue` files.                              |
| `pnpm format`                 | Execute Prettier over the repo.                                        |
| `pnpm test`                   | Run the Vitest suite once.                                             |
| `pnpm test:watch`             | Run Vitest in watch mode.                                              |
| `pnpm build:widget-activator` | Build the launcher entry for the embeddable bundle.                    |
| `pnpm build:widget-view`      | Build the iframe chat view entry (`--mode widget-view`).               |
| `pnpm build:widgets`          | Clean `dist/` and run both widget builds sequentially.                 |
| `pnpm type-check`             | Run TypeScript type checking without emitting files.                   |
| `pnpm precommit`              | Run all pre-commit checks manually (lint-staged + type-check + tests). |

## Architecture

- `src/main.ts` initializes Vue, Pinia (with persisted state), the router, and reCAPTCHA. Widget API keys are loaded before mount to ensure downstream stores have the right configuration.
- `src/modules/button-activator` hosts the floating launcher, related composables, and preview route.
- `src/modules/chatbot-view` contains the iframe-ready chat interface, dialogs, and panel-level views.
- `src/routes` aggregates module routes, while shared services/config/stores/utilities live under the `src/` root.
- Tailwind config lives in `src/style.css` for token sharing; static assets are split between `public/` and `src/assets/`.
- Widget build targets reside in `src/widget/` and are bundled with dedicated Vite configs (`vite.activator.config.ts`, `vite.view.config.ts`).

Aliases: `@` → `src/` and `@modules` → `src/modules/`.

## Testing

Vitest and Vue Test Utils are configured in `vitest.config.ts`, sharing the Vite aliases and a `jsdom` environment.

```bash
pnpm test            # run once with coverage reporters
pnpm test:watch      # watch mode during dev
```

`vitest.setup.ts` handles Testing Library cleanup and stubs `matchMedia` for the animated button activator.

## Development Workflow

1. Run `pnpm dev`.
2. Work inside module folders and keep shared functionality at the root of `src`.
3. For stateful features, author Pinia stores in `src/stores` and add unit tests under `src/stores/__tests__/`.
4. **Pre-commit hooks automatically run** on every commit:
   - Lints and formats staged files
   - Type-checks the entire project
   - Runs all tests (105 tests in ~2s)
   - Validates commit message format (Conventional Commits)
   - See [PRE_COMMIT_GUIDE.md](./PRE_COMMIT_GUIDE.md) for details
5. For UI features, document manual QA in PRs (browsers exercised, `pnpm preview` screenshots).

## Deployment / Embedding

1. Execute `pnpm build` for the primary SPA or `pnpm build:widgets` for the embeddable launcher + view combination.
2. Host the generated assets under `/dist` (or the widget-specific outputs) alongside the necessary configuration service.
3. Embed the activator bundle on the target site and configure it with the widget API key and launcher styles API to ensure consistent theming.

Refer to the [Vue TypeScript Guide](https://vuejs.org/guide/typescript/overview.html) for deeper insights into the tooling stack used here.
