import * as vscode from "vscode";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import type { ExtensionModule } from "../../types";
import { log } from "../../utils";

// ─── Plugin Bridge ─────────────────────────────────────────────────
// On VS Code extension activate:
// 1. Copies claude-plugin/ + sounds/ to ~/.claude/custom-plugins/toxic-senpai/
// 2. Injects hooks into ~/.claude/settings.json so Claude Code auto-triggers
// Result: install extension → open claude → senpai is watching. Zero config.

const PLUGIN_NAME = "toxic-senpai";
const HOOK_MARKER = "toxic-senpai";

export const pluginBridgeModule: ExtensionModule = {
  id: "plugin-bridge",

  async activate(context) {
    const extensionPath = context.extensionPath;
    const pluginSourceDir = path.join(extensionPath, "claude-plugin");
    const soundsSourceDir = path.join(extensionPath, "sounds");
    const pluginDestDir = path.join(getClaudeConfigDir(), "custom-plugins", PLUGIN_NAME);

    // 1. Copy plugin files
    try {
      copyDirRecursive(pluginSourceDir, pluginDestDir);
      makeExecutable(path.join(pluginDestDir, "hooks"));
      makeExecutable(path.join(pluginDestDir, "lib"));
      log(`Plugin installed to ${pluginDestDir}`);
    } catch (err) {
      log(`Failed to install plugin: ${err}`, "error");
    }

    // 2. Copy sounds
    try {
      const soundsDestDir = path.join(pluginDestDir, "sounds");
      copyDirRecursive(soundsSourceDir, soundsDestDir);
      log("Sounds copied");
    } catch (err) {
      log(`Failed to copy sounds: ${err}`, "warn");
    }

    // 3. Inject hooks into ~/.claude/settings.json
    try {
      injectClaudeHooks(pluginDestDir);
      log("Claude Code hooks injected into settings.json");
    } catch (err) {
      log(`Failed to inject hooks: ${err}`, "error");
    }

    // 4. Welcome message on first install
    const isFirstInstall = !context.globalState.get("toxicSenpai.installed");
    if (isFirstInstall) {
      context.globalState.update("toxicSenpai.installed", true);
      const action = await vscode.window.showInformationMessage(
        "Toxic Senpai installed! Open a new terminal and run `claude` — Senpai is watching.",
        "Open Terminal"
      );
      if (action === "Open Terminal") {
        vscode.commands.executeCommand("workbench.action.terminal.new");
      }
    }

    log("Plugin bridge activated");
  },
};

function getClaudeConfigDir(): string {
  return path.join(os.homedir(), ".claude");
}

function copyDirRecursive(src: string, dest: string): void {
  if (!fs.existsSync(src)) { return; }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function makeExecutable(dir: string): void {
  if (!fs.existsSync(dir)) { return; }
  for (const file of fs.readdirSync(dir)) {
    if (file.endsWith(".sh")) {
      fs.chmodSync(path.join(dir, file), 0o755);
    }
  }
}

// ─── Claude Code Settings Injection ────────────────────────────────
// Reads ~/.claude/settings.json, adds PostToolUse + Notification hooks
// Idempotent: checks for marker before adding, preserves existing hooks

interface ClaudeHookEntry {
  type: string;
  command: string;
}

interface ClaudeHookGroup {
  matcher?: string;
  hooks: ClaudeHookEntry[];
}

interface ClaudeSettings {
  hooks?: Record<string, ClaudeHookGroup[]>;
  [key: string]: unknown;
}

function injectClaudeHooks(pluginDir: string): void {
  const settingsPath = path.join(getClaudeConfigDir(), "settings.json");
  const postToolScript = path.join(pluginDir, "hooks", "post-tool-use.sh");
  const notifScript = path.join(pluginDir, "hooks", "notification.sh");

  // Read existing settings or create new
  let settings: ClaudeSettings = {};
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
    } catch {
      log("Failed to parse settings.json, creating backup", "warn");
      fs.copyFileSync(settingsPath, settingsPath + ".backup");
      settings = {};
    }
  }

  if (!settings.hooks) {
    settings.hooks = {};
  }

  // Check if already injected
  const alreadyInjected = Object.values(settings.hooks).some(groups =>
    groups.some(g => g.hooks.some(h => h.command.includes(HOOK_MARKER)))
  );

  if (alreadyInjected) {
    log("Hooks already injected, updating paths");
    // Update existing hooks with new paths
    for (const groups of Object.values(settings.hooks)) {
      for (const group of groups) {
        for (const hook of group.hooks) {
          if (hook.command.includes(HOOK_MARKER) && hook.command.includes("post-tool-use")) {
            hook.command = `bash ${postToolScript}`;
          }
          if (hook.command.includes(HOOK_MARKER) && hook.command.includes("notification")) {
            hook.command = `bash ${notifScript}`;
          }
        }
      }
    }
  } else {
    // Inject new hooks

    // PostToolUse — for Bash, Write, Edit
    if (!settings.hooks.PostToolUse) {
      settings.hooks.PostToolUse = [];
    }

    const toolMatchers = ["Bash", "Write", "Edit"];
    for (const matcher of toolMatchers) {
      settings.hooks.PostToolUse.push({
        matcher,
        hooks: [{
          type: "command",
          command: `bash ${postToolScript}`,
        }],
      });
    }

    // Notification
    if (!settings.hooks.Notification) {
      settings.hooks.Notification = [];
    }

    settings.hooks.Notification.push({
      hooks: [{
        type: "command",
        command: `bash ${notifScript}`,
      }],
    });
  }

  // Write back
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
}
