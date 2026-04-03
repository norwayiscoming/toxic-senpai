import * as vscode from "vscode";
import type { ExtensionModule } from "./types";
import { log } from "./utils";

// ─── Module Imports ────────────────────────────────────────────────
import { configModule } from "./config";
import { commandsModule } from "./commands";
import { statusBarModule } from "./statusbar";
import { pluginBridgeModule } from "./modules/toxic-senpai/plugin-bridge";
import { toxicSenpaiModule } from "./modules/toxic-senpai";

// ─── Module Registry ───────────────────────────────────────────────
// Add or remove modules here to enable/disable features.
// Order matters: config should load first, then plugin bridge.

const modules: ExtensionModule[] = [
  configModule,
  commandsModule,
  statusBarModule,
  pluginBridgeModule,
  toxicSenpaiModule,
];

// ─── Activation ────────────────────────────────────────────────────

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  log("Activating Toxic Senpai...");

  for (const mod of modules) {
    try {
      await mod.activate(context);
      log(`Module "${mod.id}" activated`);
    } catch (err) {
      log(`Failed to activate module "${mod.id}": ${err}`, "error");
    }
  }

  log(`Toxic Senpai activated with ${modules.length} modules. Senpai is watching.`);
}

// ─── Deactivation ──────────────────────────────────────────────────

export async function deactivate(): Promise<void> {
  for (const mod of modules.reverse()) {
    try {
      await mod.deactivate?.();
    } catch (err) {
      log(`Failed to deactivate module "${mod.id}": ${err}`, "error");
    }
  }
}
