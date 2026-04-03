import * as vscode from "vscode";

// ─── Extension Module System ───────────────────────────────────────

export interface ExtensionModule {
  readonly id: string;
  activate(context: vscode.ExtensionContext): void | Promise<void>;
  deactivate?(): void | Promise<void>;
}

// ─── Webview ───────────────────────────────────────────────────────

export interface WebviewMessage {
  readonly type: string;
  readonly payload?: unknown;
}

// ─── Configuration ─────────────────────────────────────────────────

export interface ExtensionConfig {
  enabled: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
  language: "auto" | "en" | "vi";
  soundEnabled: boolean;
  notificationEnabled: boolean;
  decayMinutes: number;
  triggers: TriggerConfig;
  thresholds: ThresholdConfig;
}

export interface TriggerConfig {
  codeErrors: boolean;
  forgotBuild: boolean;
  forgotTest: boolean;
  pushMain: boolean;
  fileTooLong: boolean;
  noCommitTooLong: boolean;
  tooManyCommits: boolean;
}

export interface ThresholdConfig {
  fileMaxLines: number;
  noCommitMinutes: number;
}

// ─── Anger System ──────────────────────────────────────────────────

export type BossState = "chill" | "annoyed" | "angry" | "insane";

export interface AngerState {
  score: number;
  lastViolationTime: number;
  lastDecayTime: number;
  lastCommitTime: number;
  sessionEditCount: number;
  sessionHasBuild: boolean;
  sessionHasTest: boolean;
}

export type TriggerType =
  | "code_errors"
  | "forgot_build"
  | "forgot_test"
  | "push_main"
  | "file_too_long"
  | "no_commit_too_long"
  | "tiny_commit"
  | "too_many_commits_rapid"
  | "too_many_commits_push";

export interface TriggerEvent {
  type: TriggerType;
  points: number;
  description: string;
}

// ─── Command Handler ───────────────────────────────────────────────

export interface CommandDefinition {
  readonly id: string;
  readonly handler: (...args: unknown[]) => unknown;
}
