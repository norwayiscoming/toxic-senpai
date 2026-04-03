import * as vscode from "vscode";
import type { ExtensionModule, ExtensionConfig } from "../types";
import { log } from "../utils";

// ─── Config Manager ────────────────────────────────────────────────

class ConfigManager {
  private _config!: ExtensionConfig;
  private _onDidChange = new vscode.EventEmitter<ExtensionConfig>();
  readonly onDidChange = this._onDidChange.event;

  get current(): ExtensionConfig {
    return this._config;
  }

  reload(): void {
    const cfg = vscode.workspace.getConfiguration("toxicSenpai");
    this._config = {
      enabled: cfg.get<boolean>("enabled", true),
      logLevel: cfg.get<"debug" | "info" | "warn" | "error">("logLevel", "info"),
      language: cfg.get<"auto" | "en" | "vi">("language", "auto"),
      soundEnabled: cfg.get<boolean>("soundEnabled", true),
      notificationEnabled: cfg.get<boolean>("notificationEnabled", true),
      decayMinutes: cfg.get<number>("decayMinutes", 10),
      triggers: {
        codeErrors: cfg.get<boolean>("triggers.codeErrors", true),
        forgotBuild: cfg.get<boolean>("triggers.forgotBuild", true),
        forgotTest: cfg.get<boolean>("triggers.forgotTest", true),
        pushMain: cfg.get<boolean>("triggers.pushMain", true),
        fileTooLong: cfg.get<boolean>("triggers.fileTooLong", true),
        noCommitTooLong: cfg.get<boolean>("triggers.noCommitTooLong", true),
        tooManyCommits: cfg.get<boolean>("triggers.tooManyCommits", true),
      },
      thresholds: {
        fileMaxLines: cfg.get<number>("thresholds.fileMaxLines", 500),
        noCommitMinutes: cfg.get<number>("thresholds.noCommitMinutes", 120),
      },
    };
    this._onDidChange.fire(this._config);
  }
}

export const configManager = new ConfigManager();

// ─── Config Module ─────────────────────────────────────────────────

export const configModule: ExtensionModule = {
  id: "config",
  activate(context) {
    configManager.reload();
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("toxicSenpai")) {
          configManager.reload();
          log("Configuration reloaded");
        }
      })
    );
  },
};
