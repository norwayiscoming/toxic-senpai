#!/bin/bash
# Toxic Senpai - State Management

init_state() {
  local state_file="$1"
  if [ ! -f "$state_file" ]; then
    python3 -c "
import json, time
state = {
  'score': 0,
  'last_violation_time': 0,
  'last_decay_time': time.time(),
  'last_commit_time': time.time(),
  'session_has_build': False,
  'session_has_test': False
}
with open('$state_file', 'w') as f:
  json.dump(state, f)
"
  fi
}

get_score() {
  local state_file="$1"
  python3 -c "
import json
with open('$state_file') as f:
  print(json.load(f).get('score', 0))
"
}

add_anger() {
  local points="$1"
  local state_file="$2"
  python3 -c "
import json, time
with open('$state_file') as f:
  state = json.load(f)

# Apply decay first (1 point per 10 minutes)
elapsed = time.time() - state.get('last_decay_time', time.time())
decay = int(elapsed / 600)
if decay > 0:
  state['score'] = max(0, state['score'] - decay)
  state['last_decay_time'] = time.time()

# Add new anger
state['score'] += $points
state['last_violation_time'] = time.time()

with open('$state_file', 'w') as f:
  json.dump(state, f)
"
}

get_boss_state() {
  local state_file="$1"
  python3 -c "
import json, time
with open('$state_file') as f:
  state = json.load(f)

# Apply decay
elapsed = time.time() - state.get('last_decay_time', time.time())
decay = int(elapsed / 600)
score = max(0, state['score'] - decay)

if score == 0: print('chill')
elif score <= 3: print('annoyed')
elif score <= 6: print('angry')
else: print('insane')
"
}

record_build() {
  local state_file="$1"
  python3 -c "
import json
with open('$state_file') as f:
  state = json.load(f)
state['session_has_build'] = True
with open('$state_file', 'w') as f:
  json.dump(state, f)
"
}

record_test() {
  local state_file="$1"
  python3 -c "
import json
with open('$state_file') as f:
  state = json.load(f)
state['session_has_test'] = True
with open('$state_file', 'w') as f:
  json.dump(state, f)
"
}

record_commit() {
  local state_file="$1"
  python3 -c "
import json, time
with open('$state_file') as f:
  state = json.load(f)
state['last_commit_time'] = time.time()
state['session_has_build'] = False
state['session_has_test'] = False
with open('$state_file', 'w') as f:
  json.dump(state, f)
"
}

has_build() {
  local state_file="$1"
  python3 -c "
import json
with open('$state_file') as f:
  print('true' if json.load(f).get('session_has_build', False) else 'false')
"
}

has_test() {
  local state_file="$1"
  python3 -c "
import json
with open('$state_file') as f:
  print('true' if json.load(f).get('session_has_test', False) else 'false')
"
}

is_tiny_cooldown_expired() {
  local state_file="$1"
  python3 -c "
import json, time
with open('$state_file') as f:
  state = json.load(f)
last = state.get('tiny_cooldown_until', 0)
print('true' if time.time() > last else 'false')
"
}

set_tiny_cooldown() {
  local state_file="$1"
  python3 -c "
import json, time
with open('$state_file') as f:
  state = json.load(f)
state['tiny_cooldown_until'] = time.time() + 900  # 15 min
with open('$state_file', 'w') as f:
  json.dump(state, f)
"
}

increment_rapid_commits() {
  local state_file="$1"
  python3 -c "
import json, time
with open('$state_file') as f:
  state = json.load(f)

now = time.time()
window_start = state.get('rapid_window_start', now)

# Reset if window expired (15 minutes)
if now - window_start > 900:
  state['rapid_count'] = 1
  state['rapid_window_start'] = now
else:
  state['rapid_count'] = state.get('rapid_count', 0) + 1

with open('$state_file', 'w') as f:
  json.dump(state, f)
"
}

get_rapid_commits() {
  local state_file="$1"
  python3 -c "
import json, time
with open('$state_file') as f:
  state = json.load(f)

now = time.time()
window_start = state.get('rapid_window_start', now)

if now - window_start > 900:
  print(0)
else:
  print(state.get('rapid_count', 0))
"
}

reset_rapid_commits() {
  local state_file="$1"
  python3 -c "
import json
with open('$state_file') as f:
  state = json.load(f)
state['rapid_count'] = 0
state['rapid_window_start'] = 0
with open('$state_file', 'w') as f:
  json.dump(state, f)
"
}

increment_pending_commits() {
  local state_file="$1"
  python3 -c "
import json
with open('$state_file') as f:
  state = json.load(f)
state['pending_commits'] = state.get('pending_commits', 0) + 1
with open('$state_file', 'w') as f:
  json.dump(state, f)
"
}

get_pending_commits() {
  local state_file="$1"
  python3 -c "
import json
with open('$state_file') as f:
  print(json.load(f).get('pending_commits', 0))
"
}

reset_pending_commits() {
  local state_file="$1"
  python3 -c "
import json
with open('$state_file') as f:
  state = json.load(f)
state['pending_commits'] = 0
with open('$state_file', 'w') as f:
  json.dump(state, f)
"
}
