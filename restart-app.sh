#!/bin/bash

echo "🔄 Restarting Desktop Pets App..."
echo ""

# Kill the running app
echo "Stopping running app..."
pkill -f "Electron.*desktop-cat" 2>/dev/null

# Wait for processes to fully terminate
sleep 2

# Check if still running
if pgrep -f "Electron.*desktop-cat" > /dev/null; then
    echo "⚠️  App still running, force killing..."
    pkill -9 -f "Electron.*desktop-cat"
    sleep 1
fi

echo "✅ App stopped"
echo ""

# Start the app
echo "Starting app..."
if [ -f "launch.command" ]; then
    open "launch.command"
    echo "✅ App started via launch.command"
elif [ -f "Desktop Pets.command" ]; then
    open "Desktop Pets.command"
    echo "✅ App started via Desktop Pets.command"
elif [ -f "package.json" ]; then
    npm start &
    echo "✅ App started via npm start"
else
    echo "❌ Could not find launch script"
    echo "   Please start the app manually"
    exit 1
fi

echo ""
echo "🎉 Desktop Pets restarted!"
echo ""
echo "Next steps:"
echo "1. Click on the pet to open chat"
echo "2. Type 'hello' and send"
echo "3. Pet should respond (no error 404)"
echo ""
echo "To test fullscreen:"
echo "1. Open YouTube in fullscreen"
echo "2. Pet should disappear"
echo "3. Exit fullscreen"
echo "4. Pet should reappear"
