# Chat Widget Modern UI – Implementation Notes (web-fe-chat-widget-v3)

This document summarizes the code and style changes made to modernize the chat widget UI in `web-fe-chat-widget-v3`, focusing on reusing the existing widget style parts (`header`, `conversation`, `input`, `welcomeScreen`, `fonts`, `footer`).

---

## 1. Header (Unified Modern Header)

**File:** `web-fe-chat-widget-v3/src/modules/chatbot-view/components/chat/ChatbotHeader.vue`

### Common behaviour

- Uses `useWidgetStylesStore()` to read style parts:
  - `getHeaderStyles` → header background, text colour, title, font, alignment, close icon colour.
  - `getConversationStyles` → avatar URL.
  - `getWelcomeScreenStyles` → welcome phrase + greetings.
  - `getFontsStyles` → body font for subtitle text.
- Header container layout:
  - `vc3-flex-shrink-0`, `vc3-border-b`, `vc3-border-slate-200`, `vc3-px-4`, `vc3-py-4`.
  - Subtle shadow under header via `box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);`.

### Title styling

- Title text value comes from `header.title`.
- Style mapping:
  - `fontSize` is capped at `15px`: `Math.min(header.titleSize, 15)`.
  - `fontWeight: 700` for a stronger, modern heading.
  - `fontFamily` derived from `header.font` (Google font token → CSS family).
  - `textAlign` respects `header.titleFormat`:
    - `'centralised'` → `text-align: center`.
    - `'left'` → `text-align: left`.
    - `'right'` → `text-align: right`.

### Close button

- Close action is rendered as a text “×” icon:
  - Button uses `header.closeIconColor` for colour.
  - Screen-reader label: “Close chat”.

### Unified welcome-style header

The header now always uses the “welcome-style” layout, regardless of whether the user is on the welcome screen or in an active conversation.

- Layout is taller and structured in stacked rows:

1. **Row 1 – Avatar + Close button**
   - Left: large circular avatar using `conversation.avatarUrl`.
     - Fixed size `96x96` (`vc3-h-24 vc3-w-24`), `vc3-rounded-full`, `vc3-object-cover`.
   - Right: “×” close button using `header.closeIconColor`.

2. **Row 2 – Header title**
   - `header.title` rendered under row 1 using the capped `15px` style and `header.titleFormat` alignment.

3. **Row 3 – Welcome phrase**
   - `welcomeScreen.welcomePhrase` rendered as a subtitle:
     - Font family from `fonts.body`.
     - `color` based on `header.textColor` with slight opacity, `font-size: 12px`.
     - Alignment respects `header.titleFormat`.

4. **Row 4 – Greetings text**
   - `welcomeScreen.greetings` (array of strings) is joined into a single text line:
     - `greetingsText = greetings.join(' ')`.
     - Rendered as plain text (no tags/pills), with a slightly smaller text size and the same subtitle styling.

This header acts as a consistent, modern “hero header” for both the welcome screen and the ongoing conversation view.

---

## 2. Message Bubbles

**File:** `web-fe-chat-widget-v3/src/modules/chatbot-view/components/MessageBubble.vue`

- Uses `useWidgetStylesStore()`:
  - `getConversationStyles` → `leftBubble`, `rightBubble`, `bubbleRadius`, avatar URL.
  - `getFontsStyles` → `fonts.body` for bubble text + metadata.

### Alignment and layout

- Wrapper and container classes ensure:
  - Agent messages (`fromMe === false`) are left-aligned.
  - User messages (`fromMe === true`) are right-aligned.

### Bubble styling

- Agent bubble:
  - Uses `conversation.leftBubble.bgColor` and `.textColor`.
  - Border radius from `conversation.bubbleRadius`.
  - `max-width: 80%`, padding and subtle shadow to match modern look.
- User bubble:
  - Uses `conversation.rightBubble.bgColor` and `.textColor`.
  - Same radius/spacing rules as agent bubble.

### Avatar, label, and timestamp

- Avatar:
  - Shown only for agent (left) messages:
    - Uses `conversation.avatarUrl` with circular `vc3-h-8 vc3-w-8 vc3-rounded-full`.
- Sender label:
  - For **user** messages (`fromMe`), a `"You"` label is rendered above the right bubble.
  - For **agent** messages (left bubbles), no name label is shown (no “Assistant” / “Employee” text); only avatar, bubble, and timestamp are visible.
- Timestamp:
  - Rendered under the bubble as a small text line.
  - Formatting uses localised date/time (e.g. “September 23, 2025 2:01 PM”).

---

## 3. Input/Footer (Conversation)

**File:** `web-fe-chat-widget-v3/src/modules/chatbot-view/components/chat/ChatbotFooterInput.vue`

The input/footer already matched the modern preview and is driven by the existing style parts:

- Background: `conversation.backgroundColor`.
- Input field: `input.bgColor`, `input.textColor`.
- Attachment button: `input.attachmentButton.bgColor` + `.iconColor`.
- Send button: `input.sendButton.bgColor`, `.iconColor`, and optional image icon.
- “Powered by Vouch” text uses `fonts.body` for consistent typography.

No schema changes were required; the component continues to use these style parts.

---

## 4. Welcome Body and Footer (unchanged behaviour)

**Files:**

- `web-fe-chat-widget-v3/src/modules/chatbot-view/components/chat/welcome-screen/ChatbotBodyWelcome.vue`
- `web-fe-chat-widget-v3/src/modules/chatbot-view/components/chat/welcome-screen/ChatbotFooterWelcome.vue`

These components already used the `welcomeScreen` styles to render:

- Greeting bubbles, large avatar, and welcome phrase in the body.
- CTA button and “Powered by Vouch” text in the footer.

The header welcome design now complements these existing welcome components by also using:

- `conversation.avatarUrl`
- `header.title`
- `welcomeScreen.welcomePhrase`
- `welcomeScreen.greetings`

---

## 5. Panel Width Adjustment

**File:** `web-fe-chat-widget-v3/src/modules/chatbot-view/components/ChatbotPanel.vue`

- Updated the main widget panel width to feel more compact and modern:
  - `.vc-widget-panel` width changed from `30em` to `27em`.
  - All other position, animation and layout styles remain the same.

---

## 6. Behaviour Wiring (Welcome vs Conversation)

**File:** `web-fe-chat-widget-v3/src/modules/chatbot-view/components/ChatbotView.vue`

- The `showWelcome` flag is computed based on registration state:
  - `showWelcome = !isRegistered`.
- This flag controls:
  - Header: `<ChatbotHeader :title-id="titleId" :show-welcome="showWelcome" />`.
  - Body: `ChatbotBodyWelcome` vs `ChatbotBodyMessage`.
  - Footer: `ChatbotFooterWelcome` vs `ChatbotFooterInput`.

This keeps the modernized header design consistent with the existing welcome flow and conversation flow, without changing the underlying style schema.
