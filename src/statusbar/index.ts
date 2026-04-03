import * as vscode from "vscode";
import type { ExtensionModule } from "../types";
import { log } from "../utils";

// ─── Status Bar Manager ────────────────────────────────────────────

let statusBarItem: vscode.StatusBarItem;

export function updateStatusBar(state: string, tooltip: string): void {
  if (!statusBarItem) { return; }

  const icons: Record<string, string> = {
    chill: "$(smiley)",
    annoyed: "$(eye)",
    angry: "$(flame)",
    insane: "$(zap)",
  };

  statusBarItem.text = `${icons[state] || "$(smiley)"} Senpai`;
  statusBarItem.tooltip = tooltip;
}

// ─── Status Bar Module ─────────────────────────────────────────────

export const statusBarModule: ExtensionModule = {
  id: "statusbar",
  activate(context) {
    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    statusBarItem.text = "$(smiley) Senpai";
    statusBarItem.tooltip = "Toxic Senpai is chill. Keep it up.";
    statusBarItem.command = "toxicSenpai.showBoss";
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    log("Status bar item created");
  },
};
