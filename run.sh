#!/usr/bin/env bash
# LaunchPilot local demo launcher. No package installation is required.
# Invoke with: ./run.sh (not: sh run.sh)

if [[ -z "${BASH_VERSION:-}" ]]; then
  echo "Error: LaunchPilot must be launched with Bash." >&2
  echo "Run: chmod +x run.sh && ./run.sh" >&2
  exit 1
fi

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-3000}"
SERVER_PID=""
SERVER_LOG=""
STARTED=false

fail() {
  echo "Error: $*" >&2
  exit 1
}

cleanup() {
  local exit_code=$?

  if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    echo
    echo "Stopping LaunchPilot..."
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi

  [[ -n "$SERVER_LOG" ]] && rm -f "$SERVER_LOG"
  trap - EXIT
  exit "$exit_code"
}

on_interrupt() {
  echo
  echo "LaunchPilot stopped by operator."
  exit 130
}

trap cleanup EXIT
trap on_interrupt INT TERM

[[ "$HOST" == "127.0.0.1" || "$HOST" == "localhost" || "$HOST" == "::1" ]] || fail "HOST must be a loopback address (127.0.0.1, localhost, or ::1)."
[[ "$PORT" =~ ^[0-9]+$ ]] && (( PORT >= 1 && PORT <= 65535 )) || fail "PORT must be a number between 1 and 65535. Example: PORT=4000 ./run.sh"

command -v python3 >/dev/null 2>&1 || fail "python3 was not found on PATH. Install Python 3.9+ and run ./run.sh again."
PYTHON_VERSION="$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:3])))' 2>/dev/null)" || fail "python3 could not run. Reinstall or repair Python 3, then retry."

if ! python3 - "$HOST" "$PORT" <<'PY'
import socket
import sys

host, port = sys.argv[1], int(sys.argv[2])
family = socket.AF_INET6 if ':' in host else socket.AF_INET
sock = socket.socket(family, socket.SOCK_STREAM)
try:
    sock.bind((host, port))
except OSError as exc:
    print(f"{exc}", file=sys.stderr)
    raise SystemExit(1)
finally:
    sock.close()
PY
then
  fail "${HOST}:${PORT} is unavailable or already in use. Stop the process using that port, or run: PORT=$((PORT + 1)) ./run.sh"
fi

URL="http://${HOST}:${PORT}"
SERVER_LOG="$(mktemp "${TMPDIR:-/tmp}/launchpilot-server.XXXXXX.log")"
cd "$ROOT_DIR"

echo "Launching LaunchPilot local demo"
echo "  Python: ${PYTHON_VERSION}"
echo "  URL: ${URL}"
echo "  Mode: local simulation — no source code, credentials, or Apple services are used"
echo "Press Ctrl+C to stop."

python3 server.py --host "$HOST" --port "$PORT" >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!

sleep 0.45
if ! kill -0 "$SERVER_PID" 2>/dev/null; then
  wait "$SERVER_PID" 2>/dev/null || true
  echo "Error: the local server failed to start." >&2
  echo "Server output:" >&2
  sed 's/^/  /' "$SERVER_LOG" >&2 || true
  echo "Try: PORT=4000 ./run.sh" >&2
  exit 1
fi

STARTED=true
echo "Server started successfully. Open ${URL} if a browser does not open automatically."

if [[ "${NO_BROWSER:-false}" != "true" ]]; then
  if command -v open >/dev/null 2>&1; then
    open "$URL" >/dev/null 2>&1 || echo "Note: browser could not be opened automatically; use ${URL}." >&2
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 || echo "Note: browser could not be opened automatically; use ${URL}." >&2
  else
    echo "Note: no supported browser opener was found; open ${URL} manually." >&2
  fi
fi

wait "$SERVER_PID"
SERVER_EXIT=$?
if (( SERVER_EXIT != 0 )); then
  echo "Error: the local server stopped unexpectedly with exit status ${SERVER_EXIT}." >&2
  echo "Server output:" >&2
  sed 's/^/  /' "$SERVER_LOG" >&2 || true
fi
exit "$SERVER_EXIT"
