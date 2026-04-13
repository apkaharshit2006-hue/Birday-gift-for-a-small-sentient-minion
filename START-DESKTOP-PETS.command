#!/bin/zsh

# --- MAC SECURITY OVERRIDE ---
# Clear the quarantine flag so macOS doesn't block the app
xattr -dr com.apple.quarantine . 2>/dev/null

# Change to the directory where the script is located
cd "$(dirname "$0")"

# Visuals for the friend
echo "\033[1;36m====================================================\033[0m"
echo "\033[1;35m    ✨  DESKTOP PET SUPER LAUNCHER  ✨    \033[0m"
echo "\033[1;36m====================================================\033[0m"

# 1. Auto-Update
echo "\033[1;33m[1/4] 📥 Checking for new pet features (git pull)...\033[0m"
git stash >/dev/null 2>&1
git pull origin main || echo "\033[0;31m   ⚠️  Skipping update (Internet issue or no Git)\033[0m"
git stash pop >/dev/null 2>&1

# 2. Auto-Install
echo "\n\033[1;33m[2/4] 📦 Refreshing pet brain (npm install)...\033[0m"
npm install || echo "\033[0;31m   ⚠️  Skipping install (some minor errors occurred)\033[0m"

# 3. AI Check (Ollama)
echo "\n\033[1;33m[3/4] 🧠 Checking AI Service (Ollama)...\033[0m"
if pgrep -x "ollama" > /dev/null; then
    echo "\033[0;32m   ✅ Ollama is already active.\033[0m"
else
    echo "\033[0;34m   ⚡ Starting Ollama app...\033[0m"
    open -a "Ollama" 2>/dev/null || echo "\033[0;31m   ⚠️  Could not find Ollama App. Please install it!\033[0m"
    echo "   (Giving it 5 seconds to wake up...)"
    sleep 5
fi

# 4. Launch
echo "\n\033[1;33m[4/4] 🎈 Launching your pet! Have fun!\033[0m"
echo "\033[1;36m====================================================\033[0m"

# Final step: Start the pet
npm start
