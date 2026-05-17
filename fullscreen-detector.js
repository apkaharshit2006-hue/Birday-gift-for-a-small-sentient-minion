/**
 * Fullscreen Detector Module
 * Provides cross-platform fullscreen detection with macOS-specific optimizations
 * OPTIMIZED: Non-blocking, with accessibility permission detection
 */

const { exec } = require('child_process');

// Cache for accessibility permission check
let accessibilityEnabled = null;
let lastAccessibilityCheck = 0;
const ACCESSIBILITY_CHECK_INTERVAL = 30000; // Check every 30 seconds

/**
 * Check if any Electron window is fullscreen
 * NOTE: This function requires Electron context (BrowserWindow)
 */
function isAnyElectronWindowFullscreen(excludeWindows = []) {
  try {
    // Only import BrowserWindow when actually in Electron context
    const { BrowserWindow } = require('electron');
    const allWindows = BrowserWindow.getAllWindows();
    
    for (const win of allWindows) {
      // Skip excluded windows
      if (excludeWindows.includes(win)) {
        continue;
      }
      
      if (win.isFullScreen()) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    // Not in Electron context or BrowserWindow not available
    return false;
  }
}

/**
 * Check if accessibility permissions are enabled (cached)
 */
function checkAccessibilityPermissions(callback) {
  const now = Date.now();
  
  // Return cached result if recent
  if (accessibilityEnabled !== null && (now - lastAccessibilityCheck) < ACCESSIBILITY_CHECK_INTERVAL) {
    return callback(accessibilityEnabled);
  }
  
  // Quick test to see if accessibility is enabled
  exec(
    `osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true'`,
    { timeout: 500 },
    (error, stdout) => {
      lastAccessibilityCheck = now;
      
      if (error) {
        // Check if it's an accessibility error
        if (error.message.includes('-1719') || error.message.includes('assistive access')) {
          accessibilityEnabled = false;
          console.log('[Fullscreen] ⚠️  Accessibility permissions not granted - using fallback detection');
        } else {
          accessibilityEnabled = false;
        }
      } else {
        accessibilityEnabled = true;
      }
      
      callback(accessibilityEnabled);
    }
  );
}

// Cache for macOS fullscreen check to avoid expensive osascript exec
let _macOSFullscreenCache = null;
let _macOSFullscreenCacheTime = 0;
const FULLSCREEN_CACHE_TTL = 5000; // 5 seconds

/**
 * Check if frontmost macOS application is in fullscreen (async, non-blocking)
 * Results are cached for FULLSCREEN_CACHE_TTL ms to avoid expensive osascript exec.
 */
function checkMacOSFullscreenAsync(excludeWindows, callback) {
  const now = Date.now();

  // Return cached result if fresh
  if (_macOSFullscreenCache !== null && (now - _macOSFullscreenCacheTime) < FULLSCREEN_CACHE_TTL) {
    return callback(_macOSFullscreenCache);
  }

  // First check if we have accessibility permissions
  checkAccessibilityPermissions((hasPermission) => {
    if (!hasPermission) {
      // No permissions - use fallback method
      return callback(checkFullscreenFallback(excludeWindows));
    }
    
    // We have permissions - use AppleScript
    exec(
      `osascript -e 'tell application "System Events" to tell (first application process whose frontmost is true) to get value of attribute "AXFullScreen" of window 1'`,
      { timeout: 800 },
      (error, stdout) => {
        if (error) {
          // Fallback on error
          return callback(checkFullscreenFallback(excludeWindows));
        }
        
        const result = stdout.toString().trim() === 'true';
        _macOSFullscreenCache = result;
        _macOSFullscreenCacheTime = now;
        callback(result);
      }
    );
  });
}

/**
 * Fallback fullscreen detection using screen bounds
 * Detects if any window covers the entire screen
 */
function checkFullscreenFallback(excludeWindows = []) {
  try {
    const { BrowserWindow, screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.bounds;
    
    // Get all windows and check if any covers the full screen
    const allWindows = BrowserWindow.getAllWindows();
    
    for (const win of allWindows) {
      if (win.isDestroyed()) continue;
      
      const [winWidth, winHeight] = win.getSize();
      const [x, y] = win.getPosition();
      
      // Skip excluded windows
      if (excludeWindows.includes(win)) {
        continue;
      }
      
      // Check if window covers entire screen
      if (winWidth >= width - 10 && winHeight >= height - 10 && x <= 10 && y <= 10) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    // Not in Electron context
    return false;
  }
}

/**
 * Main fullscreen detection function (SYNCHRONOUS - for Electron windows only)
 * @param {Array} excludeWindows - Array of BrowserWindow instances to exclude from check
 * @returns {boolean} True if Electron windows are fullscreen
 */
function isSystemInFullscreen(excludeWindows = []) {
  // Only check Electron windows synchronously
  return isAnyElectronWindowFullscreen(excludeWindows);
}

/**
 * Async fullscreen detection (includes macOS native apps)
 * @param {Array} excludeWindows - Array of BrowserWindow instances to exclude from check
 * @param {Function} callback - Callback function(isFullscreen)
 */
function isSystemInFullscreenAsync(excludeWindows = [], callback) {
  // First check Electron windows (fast, synchronous)
  if (isAnyElectronWindowFullscreen(excludeWindows)) {
    return callback(true);
  }
  
  // Then check macOS native apps (slower, async)
  if (process.platform === 'darwin') {
    checkMacOSFullscreenAsync(excludeWindows, callback);
  } else {
    callback(false);
  }
}

module.exports = {
  isSystemInFullscreen,
  isSystemInFullscreenAsync,
  isAnyElectronWindowFullscreen,
  checkAccessibilityPermissions
};
