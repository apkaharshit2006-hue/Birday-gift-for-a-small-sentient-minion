#!/bin/bash
# Desktop Pets Launcher
# Double-click this file to start everything

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "🐾 Starting Desktop Pets..."

SETTINGS_FILE="$HOME/Library/Application Support/desktop-pets/app-settings.json"
AI_ENABLED="true"

if [ -f "$SETTINGS_FILE" ] && grep -q '"aiEnabled"[[:space:]]*:[[:space:]]*false' "$SETTINGS_FILE"; then
  AI_ENABLED="false"
fi

if [ "$AI_ENABLED" = "true" ]; then
  # Warm AI in the background so the pet app can open immediately.
  if ! pgrep -x "ollama" > /dev/null; then
    echo "🤖 Starting Ollama in background..."
    nohup ollama serve >/tmp/desktop-pets-ollama.log 2>&1 &
  fi

  if ! ollama list 2>/dev/null | grep -q "phi3:mini"; then
    echo "⬇️  phi3:mini is missing, downloading in background..."
    nohup ollama pull phi3:mini >/tmp/desktop-pets-ollama-pull.log 2>&1 &
  fi
else
  echo "🛑 AI is turned off in app settings, skipping Ollama startup."
fi

echo "🚀 Launching pets..."
nohup ./node_modules/.bin/electron . >/tmp/desktop-pets-app.log 2>&1 &

echo "✅ Desktop Pets is running!"
echo "   Right-click the pet to open Settings"
echo "   Click once to open Chat"
if [ "$AI_ENABLED" = "true" ]; then
  echo "   AI may take a moment to become ready in the background"
fi
