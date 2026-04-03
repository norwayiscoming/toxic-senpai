import * as vscode from "vscode";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import type { ExtensionModule } from "../../types";
import { log } from "../../utils";

// ─── Plugin Bridge ─────────────────────────────────────────────────
// On VS Code extension activate:
// 1. Copies claude-plugin/ + sounds/ to ~/.claude/custom-plugins/toxic-senpai/
// 2. Adds shell wrapper to ~/.zshrc / ~/.bashrc so `claude` auto-loads plugin
// Result: install extension → open terminal → claude just works

const PLUGIN_NAME = "toxic-senpai";
const SHELL_MARKER = "# >>> toxic-senpai >>>";
const SHELL_MARKER_END = "# <<< toxic-senpai <<<";

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

    // 3. Add shell wrapper
    const shellConfigured = addShellWrapper(pluginDestDir);
    if (shellConfigured) {
      log("Shell wrapper added — `claude` will auto-load toxic-senpai plugin");
    }

    // 4. Configure VS Code terminal env
    configureVSCodeTerminal(pluginDestDir);

    // 5. Welcome message on first install
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

function addShellWrapper(pluginDir: string): boolean {
  const home = os.homedir();
  const shellConfigs = [
    path.join(home, ".zshrc"),
    path.join(home, ".bashrc"),
  ];

  const snippet = `
${SHELL_MARKER}
# Auto-load Toxic Senpai plugin with Claude Code
claude() {
  command claude --plugin-dir "${pluginDir}" "$@"
}
${SHELL_MARKER_END}
`;

  let configured = false;

  for (const configPath of shellConfigs) {
    if (!fs.existsSync(configPath)) { continue; }

    const content = fs.readFileSync(configPath, "utf-8");

    if (content.includes(SHELL_MARKER)) {
      if (!content.includes(pluginDir)) {
        const updated = content.replace(
          new RegExp(`${escapeRegex(SHELL_MARKER)}[\\s\\S]*?${escapeRegex(SHELL_MARKER_END)}`),
          snippet.trim()
        );
        fs.writeFileSync(configPath, updated);
        log(`Updated plugin path in ${configPath}`);
      }
      configured = true;
      continue;
    }

    fs.appendFileSync(configPath, snippet);
    configured = true;
    log(`Added shell wrapper to ${configPath}`);
  }

  return configured;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function configureVSCodeTerminal(pluginDir: string): void {
  const config = vscode.workspace.getConfiguration("terminal.integrated");
  const currentEnv = config.get<Record<string, string>>("env.osx") ?? {};

  if (!currentEnv["TOXIC_SENPAI_PLUGIN_DIR"]) {
    const updatedEnv = { ...currentEnv, TOXIC_SENPAI_PLUGIN_DIR: pluginDir };
    config.update("env.osx", updatedEnv, vscode.ConfigurationTarget.Global);
  }
}
