#!/bin/bash
# Toxic Senpai - Browser Popup with Boss Image

show_popup() {
  local message="$1"
  local boss_state="$2"
  local trigger="$3"
  local advice="$4"

  local plugin_dir
  plugin_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  local svg_file="${plugin_dir}/assets/boss-${boss_state}.svg"
  local tmp_html="/tmp/toxic-senpai-popup.html"

  # Read SVG
  local svg_content=""
  if [ -f "$svg_file" ]; then
    svg_content=$(cat "$svg_file")
  fi

  # Colors per state
  local bg text accent
  case "$boss_state" in
    chill)   bg="#0d1a0d" text="#4ade80" accent="#166534" ;;
    annoyed) bg="#1a1a0d" text="#fbbf24" accent="#854d0e" ;;
    angry)   bg="#1a0d0d" text="#f87171" accent="#991b1b" ;;
    insane)  bg="#1a0505" text="#ff4444" accent="#7f1d1d" ;;
    *)       bg="#1a0d0d" text="#f87171" accent="#991b1b" ;;
  esac

  local shake_class=""
  if [ "$boss_state" = "insane" ]; then
    shake_class="shake"
  fi

  # Escape HTML special chars in message and advice
  local safe_msg="${message//&/&amp;}"
  safe_msg="${safe_msg//</&lt;}"
  safe_msg="${safe_msg//>/&gt;}"

  local safe_advice="${advice//&/&amp;}"
  safe_advice="${safe_advice//</&lt;}"
  safe_advice="${safe_advice//>/&gt;}"

  local state_upper
  state_upper=$(echo "$boss_state" | tr '[:lower:]' '[:upper:]')

  cat > "$tmp_html" << HTMLEOF
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Toxic Senpai</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
    background: ${bg};
    color: ${text};
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px;
    overflow-y: auto;
  }
  .boss {
    width: 180px; height: 180px;
    margin-bottom: 20px;
    filter: drop-shadow(0 0 24px ${accent});
  }
  .boss svg { width: 100%; height: 100%; }
  .state-label {
    font-size: 11px; text-transform: uppercase;
    letter-spacing: 4px; opacity: 0.5; margin-bottom: 12px;
  }
  .message {
    font-size: 15px; font-weight: bold; text-align: center;
    max-width: 520px; line-height: 1.6; margin-bottom: 28px;
    padding: 18px 24px; border: 1px solid ${accent};
    border-radius: 8px; background: rgba(255,255,255,0.03);
  }
  .advice {
    font-size: 12px; line-height: 1.8; max-width: 520px; width: 100%;
    opacity: 0.85; text-align: left; padding: 20px 24px;
    border-radius: 8px; background: rgba(255,255,255,0.05);
    margin-bottom: 28px; white-space: pre-wrap;
  }
  .btn {
    background: ${accent}; color: ${text};
    border: 1px solid ${text}; padding: 12px 36px;
    font-size: 13px; font-family: 'SF Mono', monospace;
    font-weight: bold; border-radius: 6px; cursor: pointer;
    letter-spacing: 1px; transition: all 0.2s;
  }
  .btn:hover { background: ${text}; color: ${bg}; }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10% { transform: translateX(-6px) rotate(-2deg); }
    30% { transform: translateX(6px) rotate(2deg); }
    50% { transform: translateX(-4px) rotate(-1deg); }
    70% { transform: translateX(4px) rotate(1deg); }
    90% { transform: translateX(-2px); }
  }
  .shake { animation: shake 0.5s ease-in-out 3; }
</style>
</head>
<body>
  <div class="state-label">${state_upper}</div>
  <div class="boss ${shake_class}">
    ${svg_content}
  </div>
  <div class="message">${safe_msg}</div>
  <div class="advice">${safe_advice}</div>
  <button class="btn" onclick="self.close()">Got it, Senpai!</button>
</body>
</html>
HTMLEOF

  # Open in browser (non-blocking)
  open "$tmp_html" 2>/dev/null &
}
