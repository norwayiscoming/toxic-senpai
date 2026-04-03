import * as vscode from "vscode";
import { exec } from "child_process";
import * as path from "path";
import type { BossState } from "../../../types";
import { configManager } from "../../../config";
import { log } from "../../../utils";

// ─── Notification System ───────────────────────────────────────────

let extensionPath: string;

export function setExtensionPath(p: string): void {
  extensionPath = p;
}

export function notify(message: string, bossState: BossState): void {
  const cfg = configManager.current;

  if (cfg.soundEnabled) {
    playSound(bossState);
  }

  if (cfg.notificationEnabled) {
    showOSNotification(message, bossState);
  }

  showVSCodeNotification(message, bossState);
}

function playSound(state: BossState): void {
  if (!extensionPath) { return; }
  const soundFile = path.join(extensionPath, "sounds", `${state}.mp3`);
  exec(`afplay "${soundFile}" &`, (err) => {
    if (err) {
      log(`Failed to play sound: ${err.message}`, "warn");
    }
  });
}

function showOSNotification(message: string, _state: BossState): void {
  const escaped = message.replace(/"/g, '\\"');
  exec(
    `osascript -e 'display notification "${escaped}" with title "Toxic Senpai" sound name "Funk"'`,
    (err) => {
      if (err) {
        log(`Failed to show OS notification: ${err.message}`, "warn");
      }
    }
  );
}

function showVSCodeNotification(message: string, state: BossState): void {
  switch (state) {
    case "chill":
      vscode.window.showInformationMessage(`$(smiley) ${message}`);
      break;
    case "annoyed":
      vscode.window.showWarningMessage(`$(eye) ${message}`);
      break;
    case "angry":
      vscode.window.showWarningMessage(`$(flame) ${message}`);
      break;
    case "insane":
      vscode.window.showErrorMessage(`$(zap) ${message}`);
      break;
  }
}
