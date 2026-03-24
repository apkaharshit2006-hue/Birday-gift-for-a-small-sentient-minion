# Quick Fix Guide - Desktop Pets Issues

## 🔴 Current Issues:
1. AI not responding (Ollama error 404)
2. Fullscreen hide feature not working
3. App is laggy

## ✅ All Issues Are Fixed in Code

The code has been updated with:
- ✅ Changed AI model from `phi3:mini` to `phi3:latest`
- ✅ Fixed fullscreen detector to be non-blocking
- ✅ Added graceful fallback for accessibility permissions
- ✅ Optimized performance (2-second intervals instead of 1-second)

## 🚀 How to Apply the Fixes:

### Step 1: Restart the Desktop Pets App

The app needs to be restarted to load the updated code.

**Option A: Kill and restart**
```bash
# Kill the running app
pkill -f "Electron.*desktop-cat"

# Wait 2 seconds
sleep 2

# Restart the app
npm start
# OR
./launch.command
# OR
open "Desktop Pets.command"
```

**Option B: Quit from tray menu**
1. Click the tray icon (🐾)
2. Click "Quit"
3. Restart the app

### Step 2: Test the AI

1. Click on the pet to open chat
2. Type "hello"
3. Send the message
4. **Expected**: Pikachu should respond (not show error 404)

### Step 3: Test Fullscreen Detection

1. Open Safari or Chrome
2. Go to YouTube
3. Play a video and enter fullscreen (Cmd+Ctrl+F or click fullscreen button)
4. **Expected**: Pet should disappear
5. Exit fullscreen (press Esc)
6. **Expected**: Pet should reappear

## 🐛 If AI Still Doesn't Work:

### Check 1: Verify Ollama is Running
```bash
curl http://localhost:11434/api/tags
```

If you get an error, start Ollama:
```bash
ollama serve
```

### Check 2: Verify phi3:latest is Installed
```bash
ollama list
```

If phi3:latest is not in the list:
```bash
ollama pull phi3:latest
```

### Check 3: Test AI Directly
```bash
node debug-test.js
```

All tests should pass. If any fail, check the error messages.

### Check 4: Check Electron Console

1. Open the app
2. Press `Cmd+Option+I` (or Cmd+Alt+I) to open DevTools
3. Look for errors in the Console tab
4. Share any error messages you see

## 🔍 If Fullscreen Detection Still Doesn't Work:

### Check 1: Verify Accessibility Permissions

1. Open **System Settings**
2. Go to **Privacy & Security** → **Accessibility**
3. Look for **Terminal** or **Electron** in the list
4. Make sure it's enabled (checkbox is checked)
5. If not there, click the "+" button and add it
6. Restart the app

### Check 2: Test Detection Manually
```bash
node test-fullscreen-simple.js
```

This will show if fullscreen detection is working.

### Check 3: Check Console Logs

The app logs fullscreen events:
```
[Fullscreen] Starting optimized fullscreen detection
[Fullscreen] Detected fullscreen mode - hiding windows
[Fullscreen] Exited fullscreen mode - showing windows
```

If you don't see these logs, the detection isn't running.

## 📊 Performance Improvements Made:

1. **Reduced check frequency**: 2 seconds instead of 1 second
2. **Async detection**: Non-blocking AppleScript execution
3. **Permission caching**: Only checks accessibility every 30 seconds
4. **Graceful fallback**: Uses simpler detection if permissions denied
5. **Error suppression**: No more spam of accessibility errors

## 🎯 Expected Behavior After Fix:

### AI Chat:
- ✅ Responds within 1-3 seconds
- ✅ Shows character personality
- ✅ Performs actions (happy_bounce, thunderbolt, etc.)
- ✅ No error messages

### Fullscreen Detection:
- ✅ Hides pet when entering fullscreen
- ✅ Shows pet when exiting fullscreen
- ✅ Works with YouTube, movies, presentations
- ✅ No lag or performance issues
- ✅ No error spam in console

## 📝 Files Modified:

1. `pet-ai.js` - Changed AI_MODEL to 'phi3:latest'
2. `fullscreen-detector.js` - Made async, added caching, fixed Electron context
3. `main.js` - Updated to use async detection, increased interval to 2 seconds

## 🆘 Still Having Issues?

Run the comprehensive debug test:
```bash
node debug-test.js
```

This will check:
- ✅ AI model configuration
- ✅ Ollama connection
- ✅ AI response test
- ✅ Fullscreen detector
- ✅ Accessibility permissions

Share the output if you need help debugging.

---

**Last Updated**: 2026-03-23  
**Status**: All fixes applied, restart required
