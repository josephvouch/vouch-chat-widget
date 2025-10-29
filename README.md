# Chat Widget Development Playground

This package houses the web chat widget currently under construction for the Vouch AVA project. It is based on Vue 3 + TypeScript + Vite and now includes a development playground for iterating on the floating Chatbot Button Activator and the Chatbot View.

## Getting Started

```bash
pnpm install
pnpm dev
```

Run `pnpm dev` and open the default route to see the floating Chatbot Button Activator in action. Click the launcher to toggle the Chatbot View dialog, which currently renders a mocked transcript and persists messages to `localStorage` under the `vouch-chatbot-dev-history` key.

## Commands

| Script      | Description                  |
| ----------- | ---------------------------- |
| `pnpm dev`  | Runs Vite with HMR.          |
| `pnpm build`| Produces a production build. |
| `pnpm lint` | Executes ESLint + Prettier.  |

## Next Steps

- Extract a loader build that mounts only the activator and manages an iframe boundary.
- Promote the Chatbot View into its own iframe-compatible Vite entry.
- Replace mock messaging with real API calls scoped by tenant/project configuration.

For more about the Vue tooling setup, refer to the [Vue TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
