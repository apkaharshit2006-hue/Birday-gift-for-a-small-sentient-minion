# 📦 Installation Guide

Complete step-by-step installation guide for Desktop Pets.

## 🎯 Quick Install (5 minutes)

### Step 1: Install Node.js

**macOS:**
```bash
# Option 1: Download from website
# Visit: https://nodejs.org/
# Download and install the LTS version

# Option 2: Using Homebrew
brew install node

# Verify installation
node --version  # Should show v16 or higher
npm --version
```

**Windows:**
```bash
# Download from: https://nodejs.org/
# Run the installer
# Restart your terminal

# Verify installation
node --version
npm --version
```

### Step 2: Install Ollama (for AI features)

**macOS:**
```bash
# Option 1: Download from website
# Visit: https://ollama.ai/download

# Option 2: Using Homebrew
brew install ollama

# Verify installation
ollama --version
```

**Windows:**
```bash
# Download from: https://ollama.ai/download
# Run the installer
```

### Step 3: Pull the AI Model

```bash
# Pull the phi3 model (required for AI chat)
ollama pull phi3:latest

# This will download ~2.3GB
# Wait for it to complete
```

### Step 4: Start Ollama

**macOS/Linux:**
```bash
# Start Ollama server (keep this running)
ollama serve

# Or run in background
ollama serve &
```

**Windows:**
```bash
# Ollama starts automatically after installation
# Check if running:
curl http://localhost:11434/api/tags
```

### Step 5: Install Desktop Pets

```bash
# Clone the repository
git clone https://github.com/apkaharshit2006-hue/desktop-pets.git

# Navigate to the directory
cd desktop-pets

# Install dependencies
npm install

# This will take 1-2 minutes
```

### Step 6: Run the App!

```bash
# Start the app
npm start

# Or use the launch script
./launch.command
```

🎉 **Done!** Your pet should appear on screen.

---

## 🔧 Detailed Setup

### System Requirements

**Minimum:**
- macOS 10.14+ or Windows 10+
- Node.js 16+
- 4GB RAM
- 500MB free disk space

**Recommended:**
- macOS 12+ or Windows 11
- Node.js 18+
- 8GB RAM
- 1GB free disk space (for AI model)

### Optional: Enable Fullscreen Detection (macOS)

For the pet to auto-hide during fullscreen videos/presentations:

1. Open **System Settings**
2. Go to **Privacy & Security** → **Accessibility**
3. Click the lock icon and enter your password
4. Click the **+** button
5. Navigate to `/Applications/Utilities/Terminal.app`
6. Enable the checkbox
7. Restart Desktop Pets

### Optional: Build Standalone App

**macOS:**
```bash
# Build a .app bundle
npm run build

# Output: dist/Desktop Pets.dmg
# Double-click to install
```

**Windows:**
```bash
# Build an .exe installer
npm run build:win

# Output: dist/Desktop Pets Setup.exe
```

---

## 🐛 Troubleshooting Installation

### Node.js Issues

**"node: command not found"**
```bash
# Make sure Node.js is installed
node --version

# If not installed, download from:
# https://nodejs.org/

# After installing, restart your terminal
```

**"npm: command not found"**
```bash
# npm comes with Node.js
# Reinstall Node.js from:
# https://nodejs.org/
```

### Ollama Issues

**"ollama: command not found"**
```bash
# Install Ollama from:
# https://ollama.ai/download

# Or on macOS:
brew install ollama
```

**"Connection refused" when starting app**
```bash
# Make sure Ollama is running
ollama serve

# Check if it's running:
curl http://localhost:11434/api/tags

# Should return a list of models
```

**"Model not found" error**
```bash
# Pull the required model
ollama pull phi3:latest

# Verify it's installed
ollama list

# Should show phi3:latest in the list
```

### Installation Issues

**"npm install" fails**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install

# If still fails, delete node_modules and try again
rm -rf node_modules
npm install
```

**"Permission denied" errors**
```bash
# Don't use sudo with npm
# Instead, fix npm permissions:

# macOS/Linux:
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Then try again
npm install
```

### App Won't Start

**"Electron not found"**
```bash
# Make sure dependencies are installed
npm install

# Try running directly
./node_modules/.bin/electron .
```

**App crashes immediately**
```bash
# Check for errors
npm start 2>&1 | tee error.log

# Share error.log if you need help
```

---

## 🔄 Updating

### Update Desktop Pets

```bash
# Pull latest changes
git pull origin main

# Reinstall dependencies
npm install

# Restart the app
npm start
```

### Update Ollama Model

```bash
# Pull latest version of phi3
ollama pull phi3:latest

# Restart Desktop Pets
```

---

## 🗑️ Uninstalling

### Remove Desktop Pets

```bash
# Delete the directory
cd ..
rm -rf desktop-pets
```

### Remove Ollama (optional)

**macOS:**
```bash
# If installed via Homebrew
brew uninstall ollama

# If installed manually
rm -rf /usr/local/bin/ollama
rm -rf ~/.ollama
```

**Windows:**
```bash
# Use Windows "Add or Remove Programs"
# Search for "Ollama" and uninstall
```

### Remove Node.js (optional)

**macOS:**
```bash
# If installed via Homebrew
brew uninstall node

# If installed manually, download uninstaller from:
# https://nodejs.org/
```

**Windows:**
```bash
# Use Windows "Add or Remove Programs"
# Search for "Node.js" and uninstall
```

---

## 📞 Need Help?

If you're stuck:

1. Check the [Troubleshooting](#-troubleshooting-installation) section above
2. Read the [main README](README.md)
3. Check [existing issues](https://github.com/apkaharshit2006-hue/desktop-pets/issues)
4. Open a [new issue](https://github.com/apkaharshit2006-hue/desktop-pets/issues/new) with:
   - Your OS and version
   - Node.js version (`node --version`)
   - Error messages
   - Steps you've tried

---

**Happy pet keeping! 🐾**
