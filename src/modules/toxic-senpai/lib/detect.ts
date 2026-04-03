import * as vscode from "vscode";
import type { TriggerEvent } from "../../../types";
import { configManager } from "../../../config";
import { log } from "../../../utils";
import {
  hasBuildBeforeCommit,
  hasTestBeforePush,
  getMinutesSinceLastCommit,
  getPoints,
  recordBuild,
  recordTest,
  recordCommit,
  recordEdit,
} from "./anger";

// ─── Trigger Detection ─────────────────────────────────────────────

export function detectFromBashCommand(command: string): TriggerEvent | null {
  const cfg = configManager.current;

  // Track build/test/commit
  if (/\b(npm run build|pnpm build|yarn build|make|cargo build|go build)\b/i.test(command)) {
    recordBuild();
    log("Build detected");
    return null;
  }

  if (/\b(npm test|pnpm test|yarn test|cargo test|go test|pytest|jest|vitest|mocha)\b/i.test(command)) {
    recordTest();
    log("Test detected");
    return null;
  }

  // Check git commit
  if (/\bgit commit\b/.test(command)) {
    // Check forgot build before resetting
    if (cfg.triggers.forgotBuild && !hasBuildBeforeCommit()) {
      recordCommit();
      return {
        type: "forgot_build",
        points: getPoints("forgot_build"),
        description: "Committed without building first",
      };
    }

    recordCommit();
    return null;
  }

  // Check git push
  if (/\bgit push\b/.test(command)) {
    // Check push to main
    if (cfg.triggers.pushMain) {
      if (/\bgit push\s+(origin\s+)?(main|master)\b/.test(command)) {
        return {
          type: "push_main",
          points: getPoints("push_main"),
          description: "Pushed directly to main/master",
        };
      }
    }

    // Check forgot test
    if (cfg.triggers.forgotTest && !hasTestBeforePush()) {
      return {
        type: "forgot_test",
        points: getPoints("forgot_test"),
        description: "Pushed without testing first",
      };
    }

    return null;
  }

  return null;
}

export function detectFromFileEdit(filePath: string, lineCount: number): TriggerEvent | null {
  const cfg = configManager.current;
  recordEdit();

  if (cfg.triggers.fileTooLong && lineCount > cfg.thresholds.fileMaxLines) {
    return {
      type: "file_too_long",
      points: getPoints("file_too_long"),
      description: `File ${filePath} has ${lineCount} lines (max: ${cfg.thresholds.fileMaxLines})`,
    };
  }

  return null;
}

export function detectFromDiagnostics(diagnostics: vscode.Diagnostic[]): TriggerEvent | null {
  const cfg = configManager.current;

  if (!cfg.triggers.codeErrors) { return null; }

  const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
  if (errors.length > 0) {
    return {
      type: "code_errors",
      points: getPoints("code_errors"),
      description: `${errors.length} error(s) in code`,
    };
  }

  return null;
}

export function detectNoCommitTooLong(): TriggerEvent | null {
  const cfg = configManager.current;

  if (!cfg.triggers.noCommitTooLong) { return null; }

  const minutes = getMinutesSinceLastCommit();
  if (minutes > cfg.thresholds.noCommitMinutes) {
    return {
      type: "no_commit_too_long",
      points: getPoints("no_commit_too_long"),
      description: `${Math.floor(minutes)} minutes without committing`,
    };
  }

  return null;
}
