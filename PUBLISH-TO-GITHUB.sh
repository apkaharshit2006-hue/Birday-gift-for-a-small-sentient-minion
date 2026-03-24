#!/bin/bash

echo "🚀 Desktop Pets - GitHub Publishing Script"
echo "=========================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed"
    echo "   Install from: https://git-scm.com/"
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " username

if [ -z "$username" ]; then
    echo "❌ Username cannot be empty"
    exit 1
fi

echo ""
echo "📝 Updating README with your username..."

# Update README with actual username
sed -i.bak "s/YOUR_USERNAME/$username/g" README.md
sed -i.bak "s/YOUR_USERNAME/$username/g" INSTALL.md
sed -i.bak "s/YOUR_USERNAME/$username/g" GITHUB-SETUP.md

# Remove backup files
rm -f README.md.bak INSTALL.md.bak GITHUB-SETUP.md.bak

echo "✅ README updated"
echo ""

# Initialize git if not already
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

echo ""
echo "📋 Adding files to Git..."

# Add all files
git add .

echo "✅ Files added"
echo ""

# Commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Desktop Pets with AI chat and 7 characters

Features:
- 7 unique characters (cat, dog, lizard, snake, unicorn, jigglypuff, pikachu)
- AI-powered chat using Ollama + phi3
- Autonomous behavior and animations
- Fullscreen auto-hide feature
- Cross-platform support (macOS, Windows)"

echo "✅ Commit created"
echo ""

# Add remote
echo "🔗 Connecting to GitHub..."
git remote add origin "https://github.com/$username/desktop-pets.git" 2>/dev/null || \
git remote set-url origin "https://github.com/$username/desktop-pets.git"

echo "✅ Connected to GitHub"
echo ""

# Set branch name
git branch -M main

echo "📤 Ready to push to GitHub!"
echo ""
echo "⚠️  IMPORTANT: Before pushing, make sure you've created the repository on GitHub:"
echo "   1. Go to: https://github.com/new"
echo "   2. Repository name: desktop-pets"
echo "   3. Description: AI-powered desktop pets with unique personalities"
echo "   4. Choose Public or Private"
echo "   5. DO NOT initialize with README"
echo "   6. Click 'Create repository'"
echo ""
read -p "Have you created the repository on GitHub? (y/n): " created

if [ "$created" != "y" ] && [ "$created" != "Y" ]; then
    echo ""
    echo "⏸️  Paused. Create the repository first, then run:"
    echo "   git push -u origin main"
    exit 0
fi

echo ""
echo "🚀 Pushing to GitHub..."
echo ""

# Push
if git push -u origin main; then
    echo ""
    echo "🎉 SUCCESS! Your project is now on GitHub!"
    echo ""
    echo "📍 Repository URL:"
    echo "   https://github.com/$username/desktop-pets"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Add screenshots to make it more attractive"
    echo "   2. Create a release (see GITHUB-SETUP.md)"
    echo "   3. Share your project!"
    echo ""
else
    echo ""
    echo "❌ Push failed. This might be because:"
    echo "   1. Repository doesn't exist on GitHub"
    echo "   2. Authentication failed"
    echo "   3. Network issues"
    echo ""
    echo "💡 Try:"
    echo "   - Create the repository on GitHub first"
    echo "   - Use a Personal Access Token for authentication"
    echo "   - See GITHUB-SETUP.md for detailed instructions"
fi
