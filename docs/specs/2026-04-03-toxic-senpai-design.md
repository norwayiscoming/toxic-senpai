# Toxic Senpai — Design Spec

A fun Claude Code plugin that acts as a "toxic gangster senpai boss" who reacts to bad developer habits with anime sounds, sarcastic messages, and escalating anger states.

## Overview

| Field | Value |
|---|---|
| Name | Toxic Senpai |
| Type | Claude Code Plugin (pure hooks) |
| Target | Claude CLI |
| Mascot | Pixel art gangster boss, 4 states |
| Sounds | Anime-style sound effects |
| Messages | 30+ hardcoded, 2 languages (EN/VI) |
| Approach | Pure Claude Code Hooks (no daemon, no API) |

## Project Structure

```
toxic-senpai/
├── .claude-plugin/
│   └── plugin.json              # Plugin metadata & hook declarations
├── hooks/
│   ├── post-tool-use.sh         # Fires after each tool call
│   └── notification.sh          # Fires on errors/warnings
├── messages/
│   ├── en/
│   │   ├── chill.json           # ~8 praise messages
│   │   ├── annoyed.json         # ~8 passive aggressive messages
│   │   ├── angry.json           # ~8 toxic-but-funny messages
│   │   └── insane.json          # ~8 dramatic anime villain messages
│   └── vi/
│       ├── chill.json
│       ├── annoyed.json
│       ├── angry.json
│       └── insane.json
├── sounds/
│   ├── chill.mp3                # Anime "yosh!" / pleasant chime
│   ├── annoyed.mp3              # Anime "tch..." / disappointed sigh
│   ├── angry.mp3                # Anime "NANI?!" / dramatic sting
│   └── insane.mp3               # Dramatic scream / explosion
├── assets/
│   ├── boss-chill.svg           # Relaxed gangster, cigar, thumbs up
│   ├── boss-annoyed.svg         # Glasses down, arms crossed, "?"
│   ├── boss-angry.svg           # Glasses off, red eyes, fists up
│   └── boss-insane.svg          # Full rage, fire eyes, broken chain, desk smash
├── lib/
│   ├── detect.sh                # Trigger detection logic
│   ├── state.sh                 # Anger score management
│   ├── message.sh               # Message picker (state + language)
│   └── notify.sh                # Sound playback + OS notification
├── state.json                   # Runtime state (anger score, timestamps)
└── config.json                  # User settings
```

## Triggers

7 triggers detected via Claude Code hooks:

### 1. Code Errors
- **Hook:** `notification.sh`
- **Detection:** Claude reports errors or warnings in diagnostics
- **Anger points:** +1

### 2. Forgot Build Before Commit
- **Hook:** `post-tool-use.sh`
- **Detection:** `git commit` detected in Bash tool output, no prior `build`/`compile` command in session
- **Anger points:** +3

### 3. Forgot Test Before Push
- **Hook:** `post-tool-use.sh`
- **Detection:** `git push` detected in Bash tool output, no prior `test` command in session
- **Anger points:** +4

### 4. Bad Commit Message
- **Hook:** `post-tool-use.sh`
- **Detection:** `git commit -m` detected, message matches bad patterns: "fix", "update", "wip", "asdf", "test", or fewer than 5 characters
- **Anger points:** +2

### 5. Push Directly to Main/Master
- **Hook:** `post-tool-use.sh`
- **Detection:** `git push` detected + current branch is `main` or `master`
- **Anger points:** +5

### 6. File Too Long
- **Hook:** `post-tool-use.sh`
- **Detection:** After `Write` or `Edit` tool, run `wc -l` on target file. Trigger if > 500 lines
- **Anger points:** +1

### 7. No Commit for Too Long
- **Hook:** `post-tool-use.sh`
- **Detection:** Track timestamp of last `git commit`. Trigger if > 2 hours since last commit while file edits have occurred
- **Anger points:** +2

## Anger Score System

Cumulative score determines boss state. Score persisted in `state.json`.

### Scoring

| Trigger | Points |
|---|---|
| Code errors | +1 |
| File too long | +1 |
| No commit for too long | +2 |
| Bad commit message | +2 |
| Forgot build before commit | +3 |
| Forgot test before push | +4 |
| Push directly to main | +5 |

### State Thresholds

| Score | State | Tone |
|---|---|---|
| 0 | Chill | Praise, encouraging |
| 1-3 | Annoyed | Passive aggressive office senpai |
| 4-6 | Angry | Toxic but funny |
| 7+ | Insane | Dramatic anime villain |

### Score Decay

- **-1 point every 10 minutes** of no violations (dev coding clean)
- **Reset to 0** when user runs both test AND build successfully
- **Minimum score: 0** (never goes negative)

## Messages

30+ hardcoded messages split across 4 states x 2 languages.

### Language Detection

Claude Code hooks receive environment variables including `$CLAUDE_CONVERSATION` context. However, direct conversation access may be limited. Pragmatic approach:

1. Check `config.json` for explicit `language` setting
2. If `"auto"`, check the `LANG` / `LC_ALL` environment variable (e.g., `vi_VN` → Vietnamese)
3. Fallback: English

Users can override by setting `"language": "vi"` or `"language": "en"` in config.

### Message Format

Each message JSON file contains an array of strings:

```json
[
  "Message template with {trigger} placeholder",
  "Another message..."
]
```

`{trigger}` is replaced with a human-readable description of what the dev did wrong.

### Sample Messages

**Chill (EN):**
- "Not bad, not bad... Senpai is almost impressed. Almost."
- "Look at you, coding like a good little junior. Senpai approves."

**Chill (VI):**
- "Được đấy... Senpai gần như ấn tượng. Gần như thôi."
- "Nhìn em code ngoan thế này senpai thấy cuộc đời vẫn còn ý nghĩa."

**Annoyed (EN):**
- "Oh, it's fine. Senpai only reviewed this 47 times already. Go ahead, {trigger}."
- "No no, please continue. Senpai loves watching you {trigger}. Really."

**Annoyed (VI):**
- "Không sao đâu em. Senpai chỉ review 47 lần thôi mà. Cứ {trigger} đi."
- "Em cứ tiếp tục đi. Senpai quen rồi. Quen lắm rồi."

**Angry (EN):**
- "OI OI OI! Did you just {trigger}?! Senpai's blood pressure can't take this!"
- "You absolute menace. {trigger}?! In THIS economy?!"

**Angry (VI):**
- "Ê Ê Ê! Em vừa {trigger} hả?! Huyết áp senpai lên 180 rồi đó!"
- "Trời ơi em. {trigger}?! Senpai nuôi em bao năm để được ngày hôm nay hả?!"

**Insane (EN):**
- "OMAE WA MOU SHINDEIRU... and so is this codebase. You just {trigger}. There is no forgiveness."
- "THIS IS THE END! {trigger}?! Senpai is flipping the table. EVERYTHING BURNS."

**Insane (VI):**
- "OMAE WA MOU SHINDEIRU... code của em cũng vậy. Em vừa {trigger}. Không có sự tha thứ."
- "THẾ LÀ HẾT! {trigger}?! Senpai lật bàn. LẬT HẾT. CHÁY HẾT."

## Sounds

4 sound files, one per state. Played via `afplay` on macOS.

| State | Sound | Description |
|---|---|---|
| Chill | `chill.mp3` | Gentle anime chime, "yosh!" vibe |
| Annoyed | `annoyed.mp3` | Disappointed sigh, "tch..." |
| Angry | `angry.mp3` | Dramatic sting, "NANI?!" energy |
| Insane | `insane.mp3` | Explosion + dramatic scream |

Sound files will be short (1-3 seconds each) to avoid annoyance. Sourced from royalty-free sound effect libraries.

## Boss Images (Assets)

4 pixel art SVGs of a gangster boss character. Already designed:

- **Chill:** Sunglasses on, cigar, smirk with gold tooth, gold chain, thumbs up, zzz
- **Annoyed:** Glasses pulled down, suspicious eyes peeking, arms crossed, toothpick, "?"
- **Angry:** Glasses thrown off, red bloodshot eyes, mouth open shouting, fists raised, "!!!"
- **Insane:** Red face, hair standing up, fire in eyes, broken chain flying, smashing desk, @#$%!, flames

Images are used for future popup window feature (not in v1 CLI scope, but assets ready).

## Notification Flow

```
Hook fires
  → detect.sh: identify which trigger (if any)
  → state.sh: add anger points, calculate current state, apply decay
  → message.sh: pick random message for state + detected language
  → notify.sh:
      → Play sound via afplay (background, non-blocking)
      → Show macOS notification via osascript
      → Print colored message to stderr (visible in terminal)
```

## Config

`config.json` for user customization:

```json
{
  "language": "auto",
  "sound_enabled": true,
  "notification_enabled": true,
  "triggers": {
    "code_errors": true,
    "forgot_build": true,
    "forgot_test": true,
    "bad_commit_message": true,
    "push_main": true,
    "file_too_long": true,
    "no_commit_too_long": true
  },
  "thresholds": {
    "file_max_lines": 500,
    "no_commit_minutes": 120
  },
  "decay_minutes": 10,
  "bad_message_patterns": ["fix", "update", "wip", "asdf", "test", "changes"]
}
```

## Platform Support

- **v1: macOS only** — `afplay` for sound, `osascript` for notifications
- Future: Linux (`paplay`, `notify-send`), Windows (`powershell`)

## Installation

As a Claude Code plugin:
1. Clone/download to `~/.claude/custom-plugins/toxic-senpai/`
2. Register in Claude Code settings
3. Start a Claude Code session — Toxic Senpai is watching

## Out of Scope (v1)

- Popup window with boss image (future feature)
- VS Code extension integration
- Claude API for dynamic message generation
- Linux/Windows support
- Leaderboard / multiplayer shaming
