# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **web-fe-chat-widget-v3** - a Vue 3 + TypeScript chat widget for the Vouch AVA hotel management system. The widget is designed to be embedded on hotel websites, providing a floating chat interface for guest support powered by the AVA chatbot backend.

**Key Architecture Principle**: This widget compiles to multiple build targets - an activator IIFE bundle that can be embedded anywhere, and an iframe-compatible view for the chat panel UI.

## Common Commands

### Development
```bash
pnpm install              # Install dependencies (sync with pnpm-lock.yaml)
pnpm dev                  # Start Vite dev server with HMR on default port
pnpm lint                 # Run ESLint + Prettier checks
pnpm lint --fix           # Auto-fix linting issues
pnpm format               # Format code with Prettier
```

### Building
```bash
pnpm build                # TypeScript compile + production build (main app)
pnpm build:widget-activator   # Build activator IIFE bundle (dist/activator/)
pnpm build:widget-view        # Build iframe-compatible view (dist/view/)
pnpm build:widgets        # Clean + build both widget bundles
pnpm clean                # Remove dist/ directory
pnpm preview              # Serve production build locally
```

### Testing
Currently no automated test suite is configured. Manual validation via `pnpm preview` is the current approach.

## Multi-Build Architecture

This project uses **three separate Vite configurations** to support different deployment scenarios:

### 1. Main Development App (`vite.config.ts`)
- Default configuration for `pnpm dev`
- Full Vue 3 app with router for rapid development
- Routes: `/` (bot view), `/preview` (widget preview), `/panel` (panel-only)

### 2. Widget Activator IIFE Bundle (`vite.activator.config.ts`)
- Entry: `src/widget/shell.ts`
- Output: `dist/activator/app.js` + `app.css` (single-file IIFE bundle)
- Bundles Vue, Pinia, and all dependencies into one file
- Global: `ChatWidgetActivator`
- Purpose: Embed on any website without module system
- Mounts `ChatbotShell` component with iframe or component panel mode
- Configuration via `data-src` attribute on mount element or `VITE_CHATBOT_VIEW_PANEL_IFRAME_URL`

### 3. Widget View SPA (`vite.view.config.ts`)
- Entry: `index.html` (full Vue app)
- Output: `dist/view/app-[hash].js` + `app-[hash].css`
- Hash-based routing for static hosting compatibility
- Purpose: Iframe-embeddable chat panel UI (when activator uses `panelMode: 'iframe'`)
- Route `/panel` renders just the chat panel without activator button

## Code Architecture

### Component Hierarchy

**Two Deployment Modes:**

1. **Activator + Component Panel** (single-origin, no iframe):
   ```
   ChatbotShell (manages state, teleports to body)
     ├─ ChatbotButtonActivator (floating button)
     └─ ChatbotPanel (direct component mount)
         └─ ChatbotView (message list + input)
   ```

2. **Activator + Iframe Panel** (cross-origin or isolated):
   ```
   ChatbotShell (panelMode='iframe', teleports to body)
     ├─ ChatbotButtonActivator (floating button)
     └─ <iframe src="..."> → separate app instance
         └─ PanelView.vue → ChatbotPanel → ChatbotView
   ```

### State Management (Pinia)

**Store: `useChatbotStore`** (`src/stores/chatbot.ts`)
- `isOpen`: Panel visibility state
- `isLoading`: Message send state
- `messages`: Chat transcript (array of `ChatbotMessage`)
- `unreadCount`: Unread message counter (increments when assistant replies while closed)
- `lastMessage`: Computed last message in transcript
- Actions: `open()`, `close()`, `toggle()`, `sendMessage(text)`, `hydrate()`
- Persistence: Messages auto-persist to `localStorage` under `vouch-chatbot-dev-history` key

### Composables

**`useChatbotWidget`** (`src/composables/useChatbotWidget.ts`)
- Manages focus restoration when panel opens/closes
- Global keyboard shortcut: `Ctrl+Shift+L` to toggle widget
- Returns: `{ store, setActivator, restoreFocus }`
- Saves `lastFocusedEl` before opening, restores on close
- Used by `ChatbotShell` and `ChatbotView`

### Environment Configuration

**`src/config/env.ts`** - Centralized environment handling:
- `envConfig.isDev`: Development mode flag
- `envConfig.chatbotViewPanel`: `'iframe'` or `'component'` (default)
- `envConfig.chatframeURL`: URL for iframe panel mode
- Environment variables:
  - `VITE_CHATBOT_VIEW_PANEL` / `CHATBOT_VIEW_PANEL` → panel mode
  - `VITE_CHATBOT_VIEW_PANEL_IFRAME_URL` / `CHATBOT_VIEW_PANEL_IFRAME_URL` → iframe URL

### Routing

**Hash vs. History Mode** (`src/router/index.ts`):
- Automatically uses hash history (`createWebHashHistory`) when:
  - `MODE === 'widget-view'` (widget view build)
  - OR pathname ends with `index.html` (static hosting)
- Otherwise uses `createWebHistory` with computed base path
- Routes:
  - `/` → `BotView` (full widget with activator)
  - `/preview` → `WidgetView` (widget preview)
  - `/panel` → `PanelView` (panel-only for iframe embedding)

### Mock Service

**`src/services/chatbot/mockService.ts`**:
- `createUserMessage(text)`: Factory for user messages
- `sendMockAssistantReply(text)`: Simulated assistant reply with 600-1200ms delay
- `loadPersistedMessages()`: Load from localStorage
- `persistMessages(messages)`: Save to localStorage
- `seedMessages()`: Initial greeting message
- Storage key: `vouch-chatbot-dev-history`

## ESLint Configuration

Strict TypeScript + Vue linting with security and import sorting:

**Key Rules:**
- All TypeScript `any` forbidden (`@typescript-eslint/no-explicit-any: error`)
- Explicit return types required on functions
- Interfaces must start with `I` prefix (e.g., `IChatbotWidgetHook`)
- Single quotes, no semicolons, 140 character line limit
- Import sorting: Vue → external → node → internal → relative
- Security plugin enabled (object injection, non-literal regexp detection)
- No console.log allowed (only warn/error/info)
- Vue prop types and defaults required

**Running Linter:**
```bash
pnpm lint              # Check for issues
pnpm lint --fix        # Auto-fix issues
```

## Integration with AVA Backend

This widget is designed to integrate with the AVA chatbot backend services:

- **Backend API**: Expects integration with `web-be-botbuilder-bot-process` service
- **Message Format**: See `src/types/chatbot.ts` for `ChatbotMessage` interface
- **Future Work**: Replace `mockService.ts` with real API calls to chatbot backend
- **Multi-tenancy**: Widget will be scoped by merchant/property ID (configuration TBD)

## Embedding the Widget

### Method 1: IIFE Bundle (Recommended for external websites)
```html
<script src="https://your-cdn.com/dist/activator/app.js"></script>
<link rel="stylesheet" href="https://your-cdn.com/dist/activator/app.css">
<div id="app" data-src="https://your-cdn.com/dist/view/index.html"></div>
```

### Method 2: Component Mode (Same-origin deployments)
Set `VITE_CHATBOT_VIEW_PANEL=component` to render panel directly without iframe.

## Development Workflow

### Adding New Features
1. Components go in `src/components/chatbot/` (PascalCase naming)
2. Views go in `src/views/` (route-level components)
3. Use `<script setup lang="ts">` with explicit return types
4. Import types from `src/types/chatbot.ts`
5. State changes go through Pinia store actions
6. Run `pnpm lint --fix` before committing

### Testing Widget Builds
```bash
pnpm build:widgets          # Build both bundles
cd dist/activator
python3 -m http.server 8000 # Serve activator bundle
# Test embedding in separate HTML file
```

### Replacing Mock Service with Real API
1. Create `src/services/chatbot/apiService.ts` with same interface as mockService
2. Update `useChatbotStore` to import from apiService
3. Add API base URL to environment configuration
4. Handle authentication (JWT tokens from AVA auth system)
5. Handle WebSocket connections for real-time messages

## Code Style Conventions

- **Components**: PascalCase (e.g., `ChatbotPanel.vue`)
- **Composables**: camelCase with `use` prefix (e.g., `useChatbotWidget`)
- **Types/Interfaces**: PascalCase with `I` prefix for interfaces (e.g., `IChatbotWidgetHook`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `GLOBAL_SHORTCUT`)
- **Indentation**: 2 spaces
- **Styling**: Tailwind utility classes preferred, scoped styles when needed
- **Imports**: Auto-sorted by ESLint (Vue → external → internal → relative)

## Known Limitations & Future Work

1. **No Automated Tests**: Test suite not yet configured (see README.md "Next Steps")
2. **Mock Data Only**: Currently uses simulated API responses
3. **No Real-time Updates**: WebSocket integration pending
4. **No Multi-language**: i18n not yet implemented (AVA uses i18next in other services)
5. **No Analytics**: Smartlook/tracking not yet integrated
6. **No Error Boundary**: Need graceful degradation for API failures

## Local Storage Keys

- `vouch-chatbot-dev-history`: Persisted chat messages (JSON array of `ChatbotMessage`)
- Future: May need merchant/session scoping for multi-tenant deployments

## Troubleshooting

**Widget not appearing:**
- Check browser console for errors
- Verify `data-src` attribute or `VITE_CHATBOT_VIEW_PANEL_IFRAME_URL` is set
- Check iframe URL returns valid HTML

**TypeScript errors:**
- Run `vue-tsc -b` to type-check entire project
- Check `tsconfig.app.json` and `tsconfig.node.json` are valid

**Build errors:**
- Clear dist: `pnpm clean`
- Check for ESLint errors: `pnpm lint`
- Verify all imports have explicit file extensions in import statements
