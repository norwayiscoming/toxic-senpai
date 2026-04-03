#!/bin/bash
# Toxic Senpai - Trigger Detection

detect_bash_trigger() {
  local command="$1"

  # Track build
  if echo "$command" | grep -qiE "(npm run build|pnpm build|yarn build|make |cargo build|go build)"; then
    record_build "$STATE_FILE"
    return
  fi

  # Track test
  if echo "$command" | grep -qiE "(npm test|pnpm test|yarn test|cargo test|go test|pytest|jest|vitest|mocha)"; then
    record_test "$STATE_FILE"
    return
  fi

  # Check git commit
  if echo "$command" | grep -q "git commit"; then

    # Always count commits
    increment_pending_commits "$STATE_FILE"
    increment_rapid_commits "$STATE_FILE"

    # Check forgot build (before resetting)
    if [ "$(has_build "$STATE_FILE")" = "false" ]; then
      TRIGGER="forgot_build"
      POINTS=3
      record_commit "$STATE_FILE"
      return
    fi

    record_commit "$STATE_FILE"

    # Check tiny commit (<4 lines changed) — with 15 min cooldown
    local changed_lines
    changed_lines=$(git diff --stat HEAD~1 HEAD 2>/dev/null | tail -1 | grep -oE '[0-9]+ insertion|[0-9]+ deletion' | grep -oE '[0-9]+' | paste -sd+ - | bc 2>/dev/null || echo "0")
    if [ -n "$changed_lines" ] && [ "$changed_lines" -gt 0 ] && [ "$changed_lines" -lt 4 ]; then
      if is_tiny_cooldown_expired "$STATE_FILE"; then
        TRIGGER="tiny_commit"
        POINTS=1
        set_tiny_cooldown "$STATE_FILE"
        return
      fi
    fi

    # Check too many commits in short time (6 in 15 min) — nudge to push
    local rapid_count
    rapid_count=$(get_rapid_commits "$STATE_FILE")
    if [ "$rapid_count" -ge 6 ]; then
      TRIGGER="too_many_commits_rapid"
      POINTS=2
      reset_rapid_commits "$STATE_FILE"
      return
    fi

    return
  fi

  # Check git push
  if echo "$command" | grep -q "git push"; then
    # Reset rapid counter on push
    reset_rapid_commits "$STATE_FILE"

    # Check push to main
    if echo "$command" | grep -qE "git push\s+(origin\s+)?(main|master)"; then
      TRIGGER="push_main"
      POINTS=5
      reset_pending_commits "$STATE_FILE"
      return
    fi

    # Check too many commits in one push (>10)
    local pending
    pending=$(get_pending_commits "$STATE_FILE")
    if [ "$pending" -gt 10 ]; then
      TRIGGER="too_many_commits_push"
      POINTS=3
      reset_pending_commits "$STATE_FILE"
      return
    fi

    # Check forgot test
    if [ "$(has_test "$STATE_FILE")" = "false" ]; then
      TRIGGER="forgot_test"
      POINTS=4
      reset_pending_commits "$STATE_FILE"
      return
    fi

    reset_pending_commits "$STATE_FILE"
    return
  fi
}

detect_file_trigger() {
  local file_path="$1"
  local line_count="$2"
  local max_lines=500

  if [ "$line_count" -gt "$max_lines" ]; then
    TRIGGER="file_too_long"
    POINTS=1
  fi
}
