#!/usr/bin/env bash
set -euo pipefail

app_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
backend_dir="$app_root/vehicle-rental-app-backend"
frontend_dir="$app_root/vehicle-rental-details-fix"
server_pids=()

cleanup() {
  for server_pid in "${server_pids[@]}"; do
    kill "$server_pid" 2>/dev/null || true
  done
}
trap cleanup EXIT
trap 'exit 130' INT TERM

wait_for_server() {
  local server_url="$1" server_pid="$2"
  for attempt in {1..30}; do
    if curl --fail --silent --max-time 1 "$server_url" >/dev/null; then return; fi
    if ! kill -0 "$server_pid" 2>/dev/null; then
      echo "Server stopped before startup. Check the error above." >&2
      return 1
    fi
    sleep 1
  done
  echo "Server did not become ready: $server_url" >&2
  return 1
}

if ! curl --fail --silent --max-time 2 http://127.0.0.1:8000/health >/dev/null; then
  (cd "$backend_dir" && exec .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000) &
  server_pids+=("$!")
  wait_for_server http://127.0.0.1:8000/health "$!"
fi
if ! curl --fail --silent --max-time 2 http://127.0.0.1:5173/login >/dev/null; then
  (cd "$frontend_dir" && exec node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort) &
  server_pids+=("$!")
  wait_for_server http://127.0.0.1:5173/login "$!"
fi

echo 'App ready: http://localhost:5173/login'
if ((${#server_pids[@]})); then
  echo 'Keep this terminal open. Press Ctrl+C to stop servers started here.'
  wait -n "${server_pids[@]}"
else
  echo 'Both servers are already running.'
fi
