#!/bin/bash
# Toxic Senpai - Notification System

send_notification() {
  local message="$1"
  local boss_state="$2"
  local trigger="${3:-}"

  # Play sound (non-blocking)
  play_sound "$boss_state" &

  # Show macOS notification banner
  show_os_notification "$message"

  # Print to stderr (visible in terminal)
  print_terminal_message "$message" "$boss_state"

  # Show HTML popup with boss image + advice (non-blocking, only for violations)
  if [ -n "$trigger" ] && [ "$boss_state" != "chill" ]; then
    local plugin_dir
    plugin_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
    source "${plugin_dir}/lib/advice.sh"
    source "${plugin_dir}/lib/popup.sh"

    local lang="en"
    if echo "${LANG:-}" | grep -qi "^vi"; then
      lang="vi"
    fi

    local advice
    advice=$(get_advice "$trigger" "$lang")
    show_popup "$message" "$boss_state" "$trigger" "$advice" &
  fi
}

play_sound() {
  local state="$1"
  local plugin_dir
  plugin_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  local sound_file="${plugin_dir}/sounds/${state}.mp3"

  if [ -f "$sound_file" ]; then
    afplay "$sound_file" 2>/dev/null || true
  fi
}

show_os_notification() {
  local message="$1"
  local escaped="${message//\"/\\\"}"
  osascript -e "display notification \"${escaped}\" with title \"Toxic Senpai\"" 2>/dev/null || true
}

print_terminal_message() {
  local message="$1"
  local state="$2"

  local color
  case "$state" in
    chill)   color="\033[32m" ;;  # Green
    annoyed) color="\033[33m" ;;  # Yellow
    angry)   color="\033[31m" ;;  # Red
    insane)  color="\033[1;31m" ;; # Bold Red
    *)       color="\033[0m" ;;
  esac

  local reset="\033[0m"
  echo -e "${color}[Toxic Senpai] ${message}${reset}" >&2
}
