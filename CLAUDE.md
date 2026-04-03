# Toxic Senpai - AI Coding Instructions

## Project Overview

Toxic Senpai is a fun VS Code extension + Claude Code plugin featuring a pixel-art gangster boss who reacts to bad developer habits with anime sounds, sarcastic messages, and escalating rage states.

**Two deployment targets:**
1. **Claude Code Plugin** (main) — `claude-plugin/` — bash hooks that fire during Claude sessions
2. **VS Code Extension** — `src/` — TypeScript modular extension for VS Code sidebar/notifications

## Architecture

```
src/
  extension.ts            ← Entry point. Registers modules.
  types/index.ts          ← All interfaces. ExtensionModule is the core abstraction.
  utils/index.ts          ← Logging, config helpers, nonce, URI helpers, DisposableStore.
  config/index.ts         ← Reactive ConfigManager with onDidChange event.
  commands/index.ts       ← Command registry.
  statusbar/index.ts      ← Status bar manager (boss state indicator).
  providers/index.ts      ← Future providers (webview panel for boss display).
  modules/toxic-senpai/
    index.ts              ← Main module: wires up all watchers and triggers.
    lib/anger.ts          ← Anger score system (points, decay, state thresholds).
    lib/detect.ts         ← Trigger detection (git commands, file length, diagnostics).
    lib/language.ts       ← Language detection (config > locale > fallback EN).
    lib/messages.ts       ← Message picker (state + language + trigger → random message).
    lib/notify.ts         ← Notification: sound (afplay) + OS notification + VS Code popup.
    messages/{en,vi}/     ← JSON arrays of messages per state per language.

claude-plugin/
  plugin.json             ← Claude Code plugin manifest.
  hooks/
    post-tool-use.sh      ← Fires after Bash/Write/Edit tool calls.
    notification.sh       ← Fires on errors/warnings.
  lib/
    state.sh              ← Anger state management (Python3 JSON ops).
    detect.sh             ← Trigger detection (bash pattern matching).
    message.sh            ← Message picker (random from JSON files).
    notify.sh             ← Sound + OS notification + terminal color output.

assets/                   ← Boss SVG images (4 states).
sounds/                   ← Anime sound effects (4 states, mp3).
docs/specs/               ← Design spec.
```

## Module System

Same as vs-code-extension-template. Every feature implements `ExtensionModule`:

```typescript
interface ExtensionModule {
  readonly id: string;
  activate(context: vscode.ExtensionContext): void | Promise<void>;
  deactivate?(): void | Promise<void>;
}
```

## Key Conventions

### Naming
- Command IDs: `toxicSenpai.camelCaseName`
- Config keys: `toxicSenpai.camelCaseName`
- View IDs: `toxicSenpai.camelCaseName`
- File names: `kebab-case.ts`
- Classes: `PascalCase`

### Boss States
| Score | State | Tone |
|---|---|---|
| 0 | chill | Praise, encouraging |
| 1-3 | annoyed | Passive aggressive |
| 4-6 | angry | Toxic but funny |
| 7+ | insane | Dramatic anime villain |

### Triggers & Points
| Trigger | Points |
|---|---|
| code_errors | +1 |
| file_too_long | +1 |
| no_commit_too_long | +2 |
| bad_commit_message | +2 |
| forgot_build | +3 |
| forgot_test | +4 |
| push_main | +5 |

### When Adding Messages
1. Add to both `messages/en/<state>.json` and `messages/vi/<state>.json`
2. Use `{trigger}` placeholder for trigger description
3. Keep messages short (1-2 sentences)
4. Match tone to state (see Boss States table)

### When Adding Triggers
1. Add type to `TriggerType` in `src/types/index.ts`
2. Add detection logic in `src/modules/toxic-senpai/lib/detect.ts`
3. Add points to `TRIGGER_POINTS` in `lib/anger.ts`
4. Add trigger description in `lib/messages.ts` TRIGGER_DESCRIPTIONS
5. Mirror in `claude-plugin/lib/detect.sh`

## Build System

- **esbuild** bundles `src/extension.ts` → `dist/extension.js`
- `npm run watch` for development
- `npm run package` for production

## Do NOT
- Do not import from `dist/` or `out/`
- Do not use `require()` — use ES imports
- Do not hardcode file paths — use `vscode.Uri.joinPath()`
- Do not add messages without both EN and VI versions
- Do not change anger point values without updating the spec
