import * as vscode from "vscode";
import type { ExtensionModule } from "../../types";
import { log } from "../../utils";
import { addAnger, getBossState, resetAnger } from "./lib/anger";
import { getMessage } from "./lib/messages";
import { notify, setExtensionPath } from "./lib/notify";
import { detectFromBashCommand, detectFromDiagnostics, detectFromFileEdit, detectNoCommitTooLong } from "./lib/detect";
import { updateStatusBar } from "../../statusbar";

// ─── Toxic Senpai Module ───────────────────────────────────────────

let noCommitTimer: ReturnType<typeof setInterval> | undefined;

export const toxicSenpaiModule: ExtensionModule = {
  id: "toxic-senpai",

  activate(context) {
    setExtensionPath(context.extensionPath);
    log("Toxic Senpai is watching...");

    // Listen to diagnostics changes (code errors)
    context.subscriptions.push(
      vscode.languages.onDidChangeDiagnostics((e) => {
        for (const uri of e.uris) {
          const diagnostics = vscode.languages.getDiagnostics(uri);
          const trigger = detectFromDiagnostics(diagnostics);
          if (trigger) {
            const state = addAnger(trigger);
            const message = getMessage(state, trigger.type);
            notify(message, state);
            updateStatusBar(state, `Score: ${trigger.points} | ${trigger.description}`);
          }
        }
      })
    );

    // Listen to terminal shell execution (detect git commands)
    if (vscode.window.onDidEndTerminalShellExecution) {
      context.subscriptions.push(
        vscode.window.onDidEndTerminalShellExecution((e) => {
          const command = (e as { execution?: { commandLine?: { value?: string } } })
            .execution?.commandLine?.value ?? "";
          if (command) {
            const trigger = detectFromBashCommand(command);
            if (trigger) {
              const state = addAnger(trigger);
              const message = getMessage(state, trigger.type);
              notify(message, state);
              updateStatusBar(state, `Score: ${trigger.points} | ${trigger.description}`);
            }
          }
        })
      );
    }

    // Listen to file saves (file too long check)
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument((doc) => {
        const lineCount = doc.lineCount;
        const trigger = detectFromFileEdit(doc.fileName, lineCount);
        if (trigger) {
          const state = addAnger(trigger);
          const message = getMessage(state, trigger.type);
          notify(message, state);
          updateStatusBar(state, `Score: ${trigger.points} | ${trigger.description}`);
        }
      })
    );

    // Periodic check for "no commit too long"
    noCommitTimer = setInterval(() => {
      const trigger = detectNoCommitTooLong();
      if (trigger) {
        const state = addAnger(trigger);
        const message = getMessage(state, trigger.type);
        notify(message, state);
        updateStatusBar(state, `Score: ${trigger.points} | ${trigger.description}`);
      } else {
        const state = getBossState();
        updateStatusBar(state, "Senpai is watching...");
      }
    }, 60000); // Check every minute

    // Override resetAnger command
    context.subscriptions.push(
      vscode.commands.registerCommand("toxicSenpai.resetAnger", () => {
        resetAnger();
        const state = getBossState();
        updateStatusBar(state, "Senpai has calmed down. For now.");
        vscode.window.showInformationMessage("$(smiley) Senpai has calmed down. For now.");
      })
    );

    log("All watchers registered");
  },

  deactivate() {
    if (noCommitTimer) {
      clearInterval(noCommitTimer);
    }
  },
};
