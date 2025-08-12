#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MCP_DIR="$ROOT_DIR/mcp"

if [ ! -d "$MCP_DIR" ]; then
  echo "❌ MCP directory not found: $MCP_DIR"
  exit 1
fi

cd "$MCP_DIR"

# Install dependencies if node_modules missing
if [ ! -d node_modules ]; then
  echo "📦 Installing MCP dependencies..."
  npm install --silent
fi

# Start dev server
echo "🌀 Starting Spiral MCP dev server..."
npm run dev
