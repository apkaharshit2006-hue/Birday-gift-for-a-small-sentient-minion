# 🚀 GitHub Setup Guide

Step-by-step guide to publish Desktop Pets on GitHub.

## 📋 Prerequisites

1. **GitHub Account** - Create one at [github.com](https://github.com)
2. **Git Installed** - Check with `git --version`

If Git is not installed:
```bash
# macOS
brew install git

# Or download from: https://git-scm.com/
```

---

## 🎯 Quick Setup (5 steps)

### Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Fill in:
   - **Repository name**: `desktop-pets`
   - **Description**: "AI-powered desktop pets with unique personalities"
   - **Public** or **Private**: Choose based on preference
   - **DO NOT** initialize with README (we already have one)
3. Click **Create repository**

### Step 2: Initialize Git (if not already done)

```bash
# Navigate to your project
cd ~/Desktop/desktop-cat  # or wherever your project is

# Initialize git (if not already initialized)
git init

# Check status
git status
```

### Step 3: Add Files to Git

```bash
# Add all files
git add .

# Check what will be committed
git status

# Commit
git commit -m "Initial commit: Desktop Pets with AI chat and 7 characters"
```

### Step 4: Connect to GitHub

```bash
# Add GitHub as remote (replace apkaharshit2006-hue with your GitHub username)
git remote add origin https://github.com/apkaharshit2006-hue/desktop-pets.git

# Verify
git remote -v
```

### Step 5: Push to GitHub

```bash
# Push to GitHub
git branch -M main
git push -u origin main

# Enter your GitHub credentials if prompted
```

🎉 **Done!** Your project is now on GitHub!

---

## 🔐 Authentication Options

### Option 1: Personal Access Token (Recommended)

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token** → **Generate new token (classic)**
3. Give it a name: "Desktop Pets"
4. Select scopes: `repo` (full control of private repositories)
5. Click **Generate token**
6. **Copy the token** (you won't see it again!)

When pushing, use the token as your password:
```bash
Username: apkaharshit2006-hue
Password: ghp_xxxxxxxxxxxxxxxxxxxx  # Your token
```

### Option 2: SSH Key

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub:
# 1. Go to github.com/settings/keys
# 2. Click "New SSH key"
# 3. Paste your public key
# 4. Click "Add SSH key"

# Change remote to SSH
git remote set-url origin git@github.com:apkaharshit2006-hue/desktop-pets.git
```

---

## 📝 Update README with Your Info

Before pushing, update these in `README.md`:

```bash
# Replace apkaharshit2006-hue with your actual GitHub username
sed -i '' 's/apkaharshit2006-hue/your-actual-username/g' README.md

# Or edit manually:
# - Line with: git clone https://github.com/apkaharshit2006-hue/desktop-pets.git
# - Links to Issues and Discussions
```

---

## 🎨 Add Screenshots (Optional but Recommended)

1. Take screenshots of your pets
2. Create a `screenshots` folder:
   ```bash
   mkdir screenshots
   ```

3. Add images:
   ```bash
   # Add your screenshots
   cp ~/Desktop/screenshot1.png screenshots/
   cp ~/Desktop/screenshot2.png screenshots/
   ```

4. Update README.md:
   ```markdown
   ## 🎨 Screenshots
   
   ![Cat Character](screenshots/cat.png)
   ![Dog Character](screenshots/dog.png)
   ![Chat Interface](screenshots/chat.png)
   ```

5. Commit and push:
   ```bash
   git add screenshots/
   git add README.md
   git commit -m "Add screenshots"
   git push
   ```

---

## 🏷️ Create a Release (Optional)

### Step 1: Tag Your Version

```bash
# Create a tag
git tag -a v1.0.0 -m "Initial release: Desktop Pets v1.0.0"

# Push tag to GitHub
git push origin v1.0.0
```

### Step 2: Create Release on GitHub

1. Go to your repository on GitHub
2. Click **Releases** → **Create a new release**
3. Choose tag: `v1.0.0`
4. Release title: "Desktop Pets v1.0.0"
5. Description:
   ```markdown
   ## 🎉 Initial Release
   
   Desktop Pets v1.0.0 - AI-powered desktop companions!
   
   ### Features
   - 7 unique characters with distinct personalities
   - AI-powered chat using Ollama
   - Autonomous behavior and animations
   - Fullscreen auto-hide
   - Cross-platform support (macOS, Windows)
   
   ### Installation
   See [INSTALL.md](INSTALL.md) for detailed instructions.
   
   ### Quick Start
   ```bash
   git clone https://github.com/apkaharshit2006-hue/desktop-pets.git
   cd desktop-pets
   npm install
   npm start
   ```
   ```

6. Click **Publish release**

---

## 📦 Add Topics/Tags

Make your repository discoverable:

1. Go to your repository on GitHub
2. Click the gear icon next to "About"
3. Add topics:
   - `desktop-pet`
   - `electron`
   - `ai`
   - `ollama`
   - `javascript`
   - `nodejs`
   - `macos`
   - `windows`
   - `virtual-pet`
   - `desktop-companion`

---

## 🔄 Future Updates

### Making Changes

```bash
# Make your changes to files

# Check what changed
git status
git diff

# Add changes
git add .

# Commit with descriptive message
git commit -m "Add new feature: X"

# Push to GitHub
git push
```

### Creating Branches

```bash
# Create a new branch for a feature
git checkout -b feature/new-character

# Make changes and commit
git add .
git commit -m "Add new character: Dragon"

# Push branch to GitHub
git push -u origin feature/new-character

# Create Pull Request on GitHub
# Then merge when ready
```

---

## 🌟 Make it Popular

### Add Badges to README

Add these at the top of your README.md:

```markdown
![GitHub stars](https://img.shields.io/github/stars/apkaharshit2006-hue/desktop-pets?style=social)
![GitHub forks](https://img.shields.io/github/forks/apkaharshit2006-hue/desktop-pets?style=social)
![GitHub issues](https://img.shields.io/github/issues/apkaharshit2006-hue/desktop-pets)
![GitHub license](https://img.shields.io/github/license/apkaharshit2006-hue/desktop-pets)
```

### Share Your Project

- Post on Reddit: r/electronjs, r/javascript, r/programming
- Share on Twitter/X with hashtags: #electron #ai #desktoppet
- Submit to Awesome Lists
- Post on Hacker News
- Share in Discord communities

---

## 🐛 Troubleshooting

### "Permission denied (publickey)"

```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/apkaharshit2006-hue/desktop-pets.git
```

### "Repository not found"

```bash
# Check remote URL
git remote -v

# Update if wrong
git remote set-url origin https://github.com/apkaharshit2006-hue/desktop-pets.git
```

### "Failed to push some refs"

```bash
# Pull first
git pull origin main --rebase

# Then push
git push
```

### Large files error

```bash
# If you accidentally added large files
git rm --cached large-file.zip
echo "large-file.zip" >> .gitignore
git commit -m "Remove large file"
git push
```

---

## ✅ Checklist Before Publishing

- [ ] Updated README.md with your GitHub username
- [ ] Added .gitignore file
- [ ] Added LICENSE file
- [ ] Removed sensitive data (API keys, passwords)
- [ ] Tested that `npm install && npm start` works
- [ ] Added screenshots (optional but recommended)
- [ ] Wrote clear installation instructions
- [ ] Added topics/tags to repository
- [ ] Created initial release (optional)

---

## 📞 Need Help?

- [GitHub Docs](https://docs.github.com/)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
- [GitHub Desktop](https://desktop.github.com/) - GUI alternative to command line

---

**Ready to share your Desktop Pets with the world! 🚀**
