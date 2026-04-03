# Toxic Senpai

A Claude Code plugin that watches your coding habits and reacts like a toxic gangster senpai boss — with anime sounds, sarcastic messages, and escalating rage.

![Toxic Senpai](media/icon.png)

## Meet the Boss

Your senpai has **4 moods** depending on how badly you code:

| State | Score | Mood | What you'll hear |
|---|---|---|---|
| **Chill** | 0 | Relaxed, cigar in mouth | "Hmph. Acceptable." |
| **Annoyed** | 1-3 | Glasses down, arms crossed | "Senpai's eye is twitching." |
| **Angry** | 4-6 | Glasses off, fists up | "NANI?! Senpai is NOT calm!" |
| **Insane** | 7+ | Fire eyes, desk smash | "@#$%! EVERYTHING BURNS." |

*Chill* | *Annoyed* | *Angry* | *Insane*

> Boss states are pixel-art SVGs — check the `assets/` folder to see them.

## What triggers Senpai?

| Trigger | Points | Example |
|---|---|---|
| Code errors | +1 | Errors in your diagnostics |
| File too long | +1 | File exceeds 500 lines |
| Tiny commit | +1 | Commit with < 4 lines changed (15 min cooldown) |
| No commit too long | +2 | Coding 2+ hours without committing |
| Too many rapid commits | +2 | 6+ commits in 15 minutes without pushing |
| Too many commits per push | +3 | Pushing 10+ commits at once |
| Forgot to build | +3 | `git commit` without running build first |
| Forgot to test | +4 | `git push` without running tests first |
| Push to main | +5 | `git push origin main` directly |

Anger **decays** over time: -1 point every 10 minutes of good behavior.

## What happens when Senpai triggers?

1. **Sound effect** — anime-style sounds matching the mood
2. **Terminal message** — colored text in your terminal
3. **macOS notification** — system notification popup
4. **Browser popup** — senpai's face + advice on what you did wrong and how to fix it

## Languages

Senpai speaks **English** and **Vietnamese**. Auto-detects from your system locale, or set manually in config.

**English:**
> "OI OI OI! Did you just push directly to main?! Senpai's blood pressure can't take this!"

**Vietnamese:**
> "Ê Ê Ê! Em vừa push thẳng lên main hả?! Huyết áp senpai lên 180 rồi đó!"

## Installation

### VS Code Extension (recommended)

1. Install from `.vsix`:
   ```
   code --install-extension toxic-senpai-0.1.0.vsix
   ```
2. Open a new terminal in VS Code
3. Run `claude` — Senpai is watching

The extension automatically installs the Claude Code plugin and configures your shell.

### Manual (Claude Code plugin only)

1. Clone this repo:
   ```bash
   git clone https://github.com/norwayiscoming/toxic-senpai.git
   ```

2. Copy plugin to Claude Code:
   ```bash
   cp -r toxic-senpai/claude-plugin ~/.claude/custom-plugins/toxic-senpai
   cp -r toxic-senpai/sounds ~/.claude/custom-plugins/toxic-senpai/sounds
   chmod +x ~/.claude/custom-plugins/toxic-senpai/hooks/*.sh
   chmod +x ~/.claude/custom-plugins/toxic-senpai/lib/*.sh
   ```

3. Run Claude with the plugin:
   ```bash
   claude --plugin-dir ~/.claude/custom-plugins/toxic-senpai
   ```

## Configuration

Settings available in VS Code (`Preferences > Settings > Toxic Senpai`):

| Setting | Default | Description |
|---|---|---|
| `toxicSenpai.language` | `auto` | `auto`, `en`, or `vi` |
| `toxicSenpai.soundEnabled` | `true` | Enable anime sound effects |
| `toxicSenpai.notificationEnabled` | `true` | Enable OS notifications |
| `toxicSenpai.triggers.*` | `true` | Enable/disable individual triggers |
| `toxicSenpai.thresholds.fileMaxLines` | `500` | Lines before file-too-long triggers |
| `toxicSenpai.thresholds.noCommitMinutes` | `120` | Minutes before no-commit triggers |
| `toxicSenpai.decayMinutes` | `10` | Minutes of good behavior for -1 anger |

## How it works

Toxic Senpai uses [Claude Code hooks](https://docs.anthropic.com/en/docs/claude-code) to intercept tool calls:

- **PostToolUse** hook fires after `Bash`, `Write`, `Edit` tools — detects git commands and file changes
- **Notification** hook fires on errors — detects code problems

An **anger score** accumulates with each violation and decays over time. The score determines senpai's state, which determines the tone of messages and which sound plays.

```
Hook fires → detect trigger → add anger → pick state → 
  → play sound
  → show notification  
  → print terminal message
  → open browser popup with advice
```

## Requirements

- macOS (for `afplay` sounds and `osascript` notifications)
- Claude Code CLI
- Python 3 (pre-installed on macOS)

## License

MIT

## Credits

Built with the [VS Code Extension Template](https://github.com/norwayiscoming/vs-code-extension-template) by NorwayIsHere.
