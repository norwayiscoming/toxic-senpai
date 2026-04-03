#!/bin/bash
# Toxic Senpai - Message Picker

pick_message() {
  local boss_state="$1"
  local trigger_type="$2"

  # Detect language
  local lang="en"
  if echo "${LANG:-}" | grep -qi "^vi"; then
    lang="vi"
  fi

  # Get trigger description
  local trigger_desc
  trigger_desc=$(get_trigger_desc "$trigger_type" "$lang")

  # Pick random message
  local message
  message=$(get_random_message "$boss_state" "$trigger_type" "$lang")

  # Replace {trigger} placeholder
  echo "${message//\{trigger\}/$trigger_desc}"
}

get_trigger_desc() {
  local trigger="$1"
  local lang="$2"

  if [ "$lang" = "vi" ]; then
    case "$trigger" in
      code_errors) echo "viết code có lỗi" ;;
      forgot_build) echo "commit mà không build" ;;
      forgot_test) echo "push mà không test" ;;
      push_main) echo "push thẳng lên main" ;;
      file_too_long) echo "viết file dài vô tận" ;;
      no_commit_too_long) echo "code hàng giờ mà không commit" ;;
      tiny_commit) echo "commit có mỗi vài dòng thay đổi" ;;
      too_many_commits_rapid) echo "commit liên tục mà không chịu push" ;;
      too_many_commits_push) echo "gom cả đống commits vào 1 push" ;;
      *) echo "$trigger" ;;
    esac
  else
    case "$trigger" in
      code_errors) echo "write code with errors" ;;
      forgot_build) echo "commit without building" ;;
      forgot_test) echo "push without testing" ;;
      push_main) echo "push directly to main" ;;
      file_too_long) echo "write an endless file" ;;
      no_commit_too_long) echo "code for hours without committing" ;;
      tiny_commit) echo "commit just a couple lines of changes" ;;
      too_many_commits_rapid) echo "keep committing without pushing" ;;
      too_many_commits_push) echo "dump a mountain of commits in one push" ;;
      *) echo "$trigger" ;;
    esac
  fi
}

get_random_message() {
  local state="$1"
  local trigger="$2"
  local lang="$3"

  local plugin_dir
  plugin_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  local msg_file="${plugin_dir}/messages/${lang}/${state}.json"

  if [ -f "$msg_file" ]; then
    python3 -c "
import json, random
with open('$msg_file') as f:
  messages = json.load(f)
print(random.choice(messages))
"
  else
    # Fallback messages
    case "$state" in
      chill) echo "Senpai is watching. Keep coding." ;;
      annoyed) echo "Senpai noticed you {trigger}. Not cool." ;;
      angry) echo "OI! You just {trigger}?! Senpai is NOT happy!" ;;
      insane) echo "SENPAI RAGE MODE: {trigger}?! EVERYTHING BURNS!" ;;
    esac
  fi
}
