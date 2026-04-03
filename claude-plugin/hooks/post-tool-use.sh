#!/bin/bash
# Toxic Senpai - Post Tool Use Hook
# Fires after Bash, Write, Edit tool calls in Claude Code

set -euo pipefail

PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LIB_DIR="${PLUGIN_DIR}/lib"
STATE_FILE="${PLUGIN_DIR}/state.json"

source "${LIB_DIR}/state.sh"
source "${LIB_DIR}/detect.sh"
source "${LIB_DIR}/message.sh"
source "${LIB_DIR}/notify.sh"

# Read tool input from stdin
TOOL_INPUT=$(cat)
TOOL_NAME="${CLAUDE_TOOL_NAME:-}"

# Initialize state if needed
init_state "$STATE_FILE"

# Detect triggers based on tool
TRIGGER=""
POINTS=0

case "$TOOL_NAME" in
  Bash)
    COMMAND=$(echo "$TOOL_INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('command',''))" 2>/dev/null || echo "")
    detect_bash_trigger "$COMMAND"
    ;;
  Write|Edit)
    FILE_PATH=$(echo "$TOOL_INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('file_path',''))" 2>/dev/null || echo "")
    if [ -n "$FILE_PATH" ] && [ -f "$FILE_PATH" ]; then
      LINE_COUNT=$(wc -l < "$FILE_PATH" | tr -d ' ')
      detect_file_trigger "$FILE_PATH" "$LINE_COUNT"
    fi
    ;;
esac

# If trigger detected, react
if [ -n "$TRIGGER" ]; then
  add_anger "$POINTS" "$STATE_FILE"
  BOSS_STATE=$(get_boss_state "$STATE_FILE")
  MESSAGE=$(pick_message "$BOSS_STATE" "$TRIGGER")
  send_notification "$MESSAGE" "$BOSS_STATE" "$TRIGGER"
fi
