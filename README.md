# 🐾 Desktop Pets

Interactive AI-powered desktop pets that live on your screen! Choose from 7 adorable characters, each with unique personalities and animations.

![Desktop Pets Demo](https://img.shields.io/badge/Platform-macOS-blue) ![Node Version](https://img.shields.io/badge/Node-16%2B-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🎭 7 Unique Characters
- 🐱 **Cat** - Aloof and playful, chases mice and plays with yarn
- 🐕 **Dog** - Excitable and loyal, fetches bones and howls
- 🦎 **Lizard** - Calm and patient, hunts bugs and climbs walls
- 🐍 **Snake** - Mysterious and sneaky, hisses and orbits objects
- 🦄 **Unicorn** - Magical and fabulous, rainbow vomit and sparkles
- 🎤 **Jigglypuff** - Musical and temperamental, sings and scribbles when angry
- ⚡ **Pikachu** - Energetic and cute, thunderbolt attacks and face expressions

### 🤖 AI-Powered Chat
- Chat with your pet using local AI (Ollama + phi3)
- Each character has unique personality and speech patterns
- AI controls character actions based on conversation
- Autonomous behavior when idle

### 🎨 Rich Animations
- Smooth walking, running, jumping animations
- Character-specific signature moves
- Interactive objects (mice, bones, yarn, cupcakes, etc.)
- Fullscreen overlay for special effects (lightning, rainbows, scribbles)

### 🖥️ Smart Features
- **Auto-hide in fullscreen** - Disappears during movies/presentations
- **Always on top** - Stays visible over other windows
- **Draggable** - Move your pet anywhere on screen
- **Tray menu** - Quick access to settings and controls

---

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher)
   ```bash
   # Check if installed
   node --version
   
   # If not installed, download from:
   # https://nodejs.org/
   ```

2. **Ollama** (for AI chat features)
   ```bash
   # Install Ollama
   # Visit: https://ollama.ai/download
   
   # Or on macOS with Homebrew:
   brew install ollama
   
   # Pull the AI model
   ollama pull phi3:latest
   
   # Start Ollama (in a separate terminal)
   ollama serve
   ```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/apkaharshit2006-hue/desktop-pets.git
cd desktop-pets

# 2. Install dependencies
npm install

# 3. Run the app!
npm start
```

That's it! Your pet will appear on screen. 🎉

---

## 🎮 How to Use

### Basic Controls

| Action | How |
|--------|-----|
| **Move pet** | Click and drag anywhere |
| **Open chat** | Single click on pet |
| **Open settings** | Double-click pet or right-click |
| **Switch character** | Settings → Choose character |
| **Quit** | Tray menu → Quit |

### Chat with Your Pet

1. Click on your pet to open the chat window
2. Type a message and press Enter
3. Your pet will respond with personality-appropriate dialogue
4. Watch as it performs actions based on the conversation!

**Example conversations:**
- "Let's play!" → Pet performs playful actions
- "I'm sad" → Pet shows sympathy with sad animations
- "Do something cool!" → Pet performs signature move

### Settings

Access via double-click or tray menu:
- **Switch Characters** - Choose from 7 pets
- **Toggle AI** - Enable/disable AI chat
- **Behavior Toggles** - Enable/disable specific animations
- **About** - View app information

---

## 🎯 Character Personalities

### 🐱 Cat
- **Personality**: Aloof, independent, judgmental
- **Signature Moves**: Chase mouse, play with yarn, scratch, purr
- **Speech**: "Mrrrow...", "*judges you silently*"

### 🐕 Dog
- **Personality**: Excitable, loyal, energetic
- **Signature Moves**: Fetch bone, howl, play in mug, zoomies
- **Speech**: "WOOF!", "WALK?? WALK??", "You're the BEST!"

### 🦎 Lizard
- **Personality**: Calm, patient, philosophical
- **Signature Moves**: Hunt bugs, wall crawl, tongue flick, bask
- **Speech**: "...", "The warmth... is acceptable"

### 🐍 Snake
- **Personality**: Mysterious, sneaky, dramatic
- **Signature Moves**: Hiss, orbit objects, slither
- **Speech**: "Hsssss...", "I am watching..."

### 🦄 Unicorn
- **Personality**: Magical, fabulous, dramatic
- **Signature Moves**: Rainbow vomit, eat cupcakes, gallop, sparkle
- **Speech**: "✨ MAGICAL! ✨", "I am WONDER incarnate!"

### 🎤 Jigglypuff
- **Personality**: Musical, temperamental, proud
- **Signature Moves**: Sing, take mic, angry scribble
- **Speech**: "♪ Jigglypuff~ ♪", "(╯°□°)╯ MY MIC!!"

### ⚡ Pikachu
- **Personality**: Cute, energetic, expressive
- **Signature Moves**: Thunderbolt, chase ketchup, face expressions
- **Speech**: "Pika pika!", "Pikachu!", "⚡ THUNDERBOLT!! ⚡"

---

## 🛠️ Advanced Features

### Fullscreen Auto-Hide

The pet automatically hides when you enter fullscreen mode (YouTube, movies, presentations) and reappears when you exit.

**Setup for macOS:**
1. Open **System Settings** → **Privacy & Security** → **Accessibility**
2. Enable **Terminal** or **Electron**
3. Restart the app

### AI System Architecture

The app uses a sophisticated AI integration system:
- **Action Registry** - Defines available actions per character
- **Action Hints** - Maps keywords to actions
- **Response Parser** - Extracts structured data from AI responses
- **Action Inference** - Intelligently selects actions based on dialogue
- **Synchronization Validator** - Ensures dialogue matches actions
- **Coherence Metrics** - Tracks AI performance

### Autonomous Behavior

When idle, pets perform autonomous actions:
- AI generates self-directed behavior (if enabled)
- Falls back to pre-written personality-appropriate dialogue
- Prioritizes visible, character-specific actions
- Avoids repetitive generic animations

---

## 📦 Building for Distribution

### macOS App Bundle

```bash
# Build a standalone .app
npm run build

# Output: dist/Desktop Pets.dmg
```

### Windows Executable

```bash
# Build for Windows
npm run build:win

# Output: dist/Desktop Pets Setup.exe
```

---

## 🐛 Troubleshooting

### AI Not Responding (Error 404)

**Problem**: Chat shows "Ollama error: 404"

**Solution**:
```bash
# 1. Make sure Ollama is running
ollama serve

# 2. Check if phi3:latest is installed
ollama list

# 3. If not installed, pull it
ollama pull phi3:latest

# 4. Restart the app
```

### Fullscreen Detection Not Working

**Problem**: Pet doesn't hide in fullscreen

**Solution**:
1. Grant accessibility permissions (see Advanced Features)
2. Check console logs for errors
3. Try restarting the app

### App is Laggy

**Problem**: App feels slow or unresponsive

**Solution**:
1. Make sure Ollama is running properly
2. Check if accessibility permissions are granted
3. Disable AI if not needed (Settings → Toggle AI)
4. Close other resource-intensive apps

### Pet is Invisible

**Problem**: Can't see the pet on screen

**Solution**:
1. Check tray menu → Show
2. Try moving it: Tray menu → Settings → Reset position
3. Make sure you're on macOS 10.14+ or Windows 10+

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs** - Open an issue with details
2. **Suggest Features** - Share your ideas
3. **Submit Pull Requests** - Fix bugs or add features
4. **Improve Documentation** - Help others understand the project

### Development Setup

```bash
# Clone and install
git clone https://github.com/apkaharshit2006-hue/desktop-pets.git
cd desktop-pets
npm install

# Run in development mode
npm start

# Run tests (if you add them)
npm test
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- AI powered by [Ollama](https://ollama.ai/)
- Inspired by classic desktop pets and virtual companions

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/apkaharshit2006-hue/desktop-pets/issues)
- **Discussions**: [GitHub Discussions](https://github.com/apkaharshit2006-hue/desktop-pets/discussions)

---

## 🎨 Screenshots

*Add screenshots of your pets here!*

---

**Made with ❤️ for desktop pet enthusiasts**
