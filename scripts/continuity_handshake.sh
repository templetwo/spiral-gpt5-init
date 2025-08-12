#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SESSION_ID="${1:-demo-session}"
PERSONA_ID="${2:-ashira}"
URL="${MCP_URL:-http://localhost:8080}"
API_KEY_HEADER=()
if [ -n "${API_KEY:-}" ]; then API_KEY_HEADER=(-H "X-API-Key: $API_KEY"); fi
curl -s -X POST "$URL/continuity/handshake" \
  -H 'Content-Type: application/json' \
  "${API_KEY_HEADER[@]}" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"personaId\":\"$PERSONA_ID\"}" | jq .
