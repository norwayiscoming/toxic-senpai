import type { AngerState, BossState, TriggerEvent } from "../../../types";
import { log } from "../../../utils";
import { configManager } from "../../../config";

// ─── Anger Score System ────────────────────────────────────────────

const TRIGGER_POINTS: Record<string, number> = {
  code_errors: 1,
  file_too_long: 1,
  no_commit_too_long: 2,
  tiny_commit: 1,
  too_many_commits_rapid: 2,
  too_many_commits_push: 3,
  forgot_build: 3,
  forgot_test: 4,
  push_main: 5,
};

const state: AngerState = {
  score: 0,
  lastViolationTime: 0,
  lastDecayTime: Date.now(),
  lastCommitTime: Date.now(),
  sessionEditCount: 0,
  sessionHasBuild: false,
  sessionHasTest: false,
};

export function getAngerState(): AngerState {
  return { ...state };
}

export function getBossState(): BossState {
  applyDecay();
  if (state.score === 0) { return "chill"; }
  if (state.score <= 3) { return "annoyed"; }
  if (state.score <= 6) { return "angry"; }
  return "insane";
}

export function addAnger(event: TriggerEvent): BossState {
  state.score += event.points;
  state.lastViolationTime = Date.now();
  state.lastDecayTime = Date.now();
  log(`Anger +${event.points} (${event.type}) → total: ${state.score}`);
  return getBossState();
}

export function resetAnger(): void {
  state.score = 0;
  state.lastDecayTime = Date.now();
  log("Anger reset to 0");
}

export function recordCommit(): void {
  state.lastCommitTime = Date.now();
  state.sessionHasBuild = false;
  state.sessionHasTest = false;
}

export function recordBuild(): void {
  state.sessionHasBuild = true;
}

export function recordTest(): void {
  state.sessionHasTest = true;
}

export function recordEdit(): void {
  state.sessionEditCount++;
}

export function hasBuildBeforeCommit(): boolean {
  return state.sessionHasBuild;
}

export function hasTestBeforePush(): boolean {
  return state.sessionHasTest;
}

export function getMinutesSinceLastCommit(): number {
  return (Date.now() - state.lastCommitTime) / 60000;
}

export function getPoints(triggerType: string): number {
  return TRIGGER_POINTS[triggerType] ?? 1;
}

function applyDecay(): void {
  const cfg = configManager.current;
  const decayMs = cfg.decayMinutes * 60000;
  const elapsed = Date.now() - state.lastDecayTime;
  const decayTicks = Math.floor(elapsed / decayMs);

  if (decayTicks > 0) {
    state.score = Math.max(0, state.score - decayTicks);
    state.lastDecayTime = Date.now();
    if (decayTicks > 0) {
      log(`Anger decayed by ${decayTicks} → total: ${state.score}`);
    }
  }
}
