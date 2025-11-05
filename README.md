# Chat Widget Development Playground

This package houses the web chat widget currently under construction for the Vouch AVA project. It is based on Vue 3 + TypeScript + Vite and now includes a development playground for iterating on the floating Chatbot Button Activator and the Chatbot View.

## Getting Started

```bash
pnpm install
pnpm dev
```

Run `pnpm dev` and open the default route to see the floating Chatbot Button Activator in action. Click the launcher to toggle the Chatbot View dialog, which currently renders a mocked transcript and persists messages to `localStorage` under the `vouch-chatbot-dev-history` key.

## Commands

| Script       | Description                  |
| ------------ | ---------------------------- |
| `pnpm dev`   | Runs Vite with HMR.          |
| `pnpm build` | Produces a production build. |
| `pnpm lint`  | Executes ESLint + Prettier.  |

## Architecture

The widget codebase is modularised under `src/modules` so the launcher and the chat surface evolve independently.

- `src/modules/button-activator` exposes the floating launcher (`components`), supporting logic in `composeables`, and the wrapper/preview entry in `view`.
- `src/modules/chatbot-view` contains the iframe-friendly chat surface (`components`) and its route-facing screens in `views`.
- `src/routes` aggregates module-level route definitions via `button-activator.routes.ts` and `chatbot-view.routes.ts`.

Shared systems (stores, services, config, utils, types) continue to live at the root of `src`. Vite, TypeScript, and ESLint understand the aliases `@/*` → `src/*` and `@modules/*` → `src/modules/*` for clean cross-module imports.

## Next Steps

- Extract a loader build that mounts only the activator and manages an iframe boundary.
- Promote the Chatbot View into its own iframe-compatible Vite entry.
- Replace mock messaging with real API calls scoped by tenant/project configuration.

For more about the Vue tooling setup, refer to the [Vue TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
