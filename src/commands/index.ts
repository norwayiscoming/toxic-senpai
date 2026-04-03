import * as vscode from "vscode";
import type { ExtensionModule, CommandDefinition } from "../types";
import { log } from "../utils";

// ─── Command Definitions ───────────────────────────────────────────
// Handlers are placeholders — modules override via registerCommand.

const commands: CommandDefinition[] = [
  {
    id: "toxicSenpai.showBoss",
    handler: () => {
      vscode.window.showInformationMessage("Senpai is watching you...");
    },
  },
  {
    id: "toxicSenpai.resetAnger",
    handler: () => {
      vscode.window.showInformationMessage("Senpai has calmed down. For now.");
    },
  },
  {
    id: "toxicSenpai.toggleSound",
    handler: async () => {
      const cfg = vscode.workspace.getConfiguration("toxicSenpai");
      const current = cfg.get<boolean>("soundEnabled", true);
      await cfg.update("soundEnabled", !current, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(`Sound ${!current ? "enabled" : "disabled"}`);
    },
  },
];

// ─── Commands Module ───────────────────────────────────────────────

export const commandsModule: ExtensionModule = {
  id: "commands",
  activate(context) {
    for (const cmd of commands) {
      context.subscriptions.push(
        vscode.commands.registerCommand(cmd.id, cmd.handler)
      );
      log(`Registered command: ${cmd.id}`);
    }
  },
};
