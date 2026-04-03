#!/bin/bash
# Toxic Senpai - Notification Hook
# Fires when Claude reports errors/warnings

set -euo pipefail

PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LIB_DIR="${PLUGIN_DIR}/lib"
STATE_FILE="${PLUGIN_DIR}/state.json"

source "${LIB_DIR}/state.sh"
source "${LIB_DIR}/message.sh"
source "${LIB_DIR}/notify.sh"

# Read notification from stdin
NOTIFICATION=$(cat)

# Check if it contains error keywords
if echo "$NOTIFICATION" | grep -qiE "(error|failed|failure|exception)"; then
  init_state "$STATE_FILE"
  add_anger 1 "$STATE_FILE"
  BOSS_STATE=$(get_boss_state "$STATE_FILE")
  MESSAGE=$(pick_message "$BOSS_STATE" "code_errors")
  send_notification "$MESSAGE" "$BOSS_STATE" "code_errors"
fi
