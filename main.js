const {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  Tray,
  Menu,
  nativeImage,
} = require("electron");
const path = require("path");
const { exec } = require("child_process");
const { autoUpdater } = require("electron-updater");
const {
  initAppSettings,
  readAppSettings,
  getAppSettings,
  updateAppSettings,
} = require("./app-settings");
const { isSystemInFullscreenAsync } = require("./fullscreen-detector");
const AutonomousBehaviorEngine = require("./autonomous-behavior-engine");
const ActionExecutor = require("./action-executor");

let petWin = null,
  overlayWin = null,
  settingsWin = null,
  chatWin = null;
let tray = null,
  currentPet = "cat";
let appSettings = { aiEnabled: true };

// Fullscreen detection state
let fullscreenCheckInterval = null;
let isHiddenDueToFullscreen = false;
let wasFullscreenLastCheck = false;

const REVOCATION_POLL_MS = 10 * 60 * 1000;
const PET_WINDOW_WIDTH = 220;
const PET_WINDOW_HEIGHT = 220;
const PET_ANCHOR_X = 110;
const PET_ANCHOR_Y = 130;

function clampPetPosition(x, y, sw, sh) {
  return {
    x: Math.max(-PET_ANCHOR_X, Math.min(sw - PET_ANCHOR_X, Math.round(x))),
    y: Math.max(-PET_ANCHOR_Y, Math.min(sh - PET_ANCHOR_Y, Math.round(y))),
  };
}

// ── Overlay window ────────────────────────────────────────────────────────────

// ── Overlay window ────────────────────────────────────────────────────────────
function createOverlayWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  overlayWin = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    focusable: false,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  overlayWin.setAlwaysOnTop(true, "screen-saver");
  overlayWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWin.setIgnoreMouseEvents(true, { forward: true });
  overlayWin.loadFile("overlay.html");
}

// ── Pet window ────────────────────────────────────────────────────────────────
function createPetWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  petWin = new BrowserWindow({
    width: 220,
    height: 220,
    x: Math.floor(width / 2),
    y: height - 240,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      preload: path.join(__dirname, "scribble-fix.js"),
    },
  });
  petWin.setAlwaysOnTop(true, "screen-saver");
  petWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  petWin.loadFile("index.html");
  petWin.webContents.once("did-finish-load", () => {
    petWin.webContents.send("ai-enabled-changed", appSettings.aiEnabled);
  });
  petWin.on("blur", () => {
    if (petWin && !petWin.isDestroyed())
      petWin.setAlwaysOnTop(true, "screen-saver");
  });
}

// ── Settings window ───────────────────────────────────────────────────────────
function createSettingsWindow() {
  if (settingsWin && !settingsWin.isDestroyed()) {
    settingsWin.focus();
    return;
  }
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  settingsWin = new BrowserWindow({
    width: 420,
    height: 600,
    x: Math.floor(width / 2) - 210,
    y: Math.floor(height / 2) - 300,
    frame: true,
    alwaysOnTop: true,
    resizable: false,
    title: "Desktop Pets — Settings",
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  settingsWin.setMenuBarVisibility(false);
  settingsWin.loadFile("settings.html");
  settingsWin.webContents.once("did-finish-load", () => {
    settingsWin.webContents.send("app-settings-updated", appSettings);
  });
  settingsWin.on("closed", () => {
    settingsWin = null;
  });
}

// ── Chat window ───────────────────────────────────────────────────────────────
function createChatWindow() {
  if (chatWin && !chatWin.isDestroyed()) {
    chatWin.focus();
    return;
  }
  const [px, py] = petWin ? petWin.getPosition() : [400, 400];
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const cx = Math.max(10, Math.min(sw - 310, px - 40));
  const cy = Math.max(10, Math.min(sh - 400, py - 400));
  chatWin = new BrowserWindow({
    width: 300,
    height: 380,
    x: cx,
    y: cy,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: true,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  chatWin.setAlwaysOnTop(true, "screen-saver");
  chatWin.loadFile("chat.html");
  chatWin.on("closed", () => {
    chatWin = null;
  });
  chatWin.webContents.once("did-finish-load", () => {
    chatWin.webContents.send("set-pet", currentPet);
    chatWin.webContents.send("ai-enabled-changed", appSettings.aiEnabled);
  });
}

// ── IPC ───────────────────────────────────────────────────────────────────────
ipcMain.on("quit-app", () => app.quit());
ipcMain.on("open-settings", () => createSettingsWindow());
ipcMain.on("open-chat", () => createChatWindow());

// Pixel-perfect click-through
ipcMain.on("set-mouse-ignore", (e, ignore) => {
  if (!petWin || petWin.isDestroyed()) return;
  if (ignore) petWin.setIgnoreMouseEvents(true, { forward: true });
  else petWin.setIgnoreMouseEvents(false);
});

ipcMain.on("pet-changed", (e, pet) => {
  currentPet = pet;
  if (chatWin && !chatWin.isDestroyed())
    chatWin.webContents.send("set-pet", pet);
});
ipcMain.handle("get-app-settings", () => appSettings);
ipcMain.on("set-ai-enabled", (e, enabled) => {
  appSettings = updateAppSettings({ aiEnabled: !!enabled });
  if (petWin && !petWin.isDestroyed())
    petWin.webContents.send("ai-enabled-changed", appSettings.aiEnabled);
  if (chatWin && !chatWin.isDestroyed())
    chatWin.webContents.send("ai-enabled-changed", appSettings.aiEnabled);
  if (settingsWin && !settingsWin.isDestroyed())
    settingsWin.webContents.send("app-settings-updated", appSettings);
  if (tray) buildTrayMenu();
});
ipcMain.on("pet-thinking", (e, on) => {
  if (petWin && !petWin.isDestroyed())
    petWin.webContents.send("pet-thinking", on);
});
ipcMain.on("pet-response", (e, data) => {
  if (petWin && !petWin.isDestroyed())
    petWin.webContents.send("pet-response", data);
  // Log action execution
  if (data.actions && Array.isArray(data.actions)) {
    data.actions.forEach((action) => {
      ActionExecutor.logExecution(action, "queued", currentPet);
    });
  }
});
ipcMain.on("auto-reaction", (e, data) => {
  if (chatWin && !chatWin.isDestroyed())
    chatWin.webContents.send("auto-message", data);
  // Log autonomous behavior execution
  if (data.actions && Array.isArray(data.actions)) {
    data.actions.forEach((action) => {
      ActionExecutor.logExecution(action, "autonomous", currentPet);
    });
  }
});
ipcMain.on("overlay-draw", (e, data) => {
  if (overlayWin && !overlayWin.isDestroyed())
    overlayWin.webContents.send("overlay-draw", data);
});
ipcMain.on("overlay-input", (e, payload) => {
  if (petWin && !petWin.isDestroyed())
    petWin.webContents.send("overlay-input", payload);
});
ipcMain.on("overlay-clear", () => {
  if (overlayWin && !overlayWin.isDestroyed())
    overlayWin.webContents.send("overlay-clear");
});
ipcMain.on("set-win-pos", (e, { x, y }) => {
  if (!petWin || petWin.isDestroyed()) return;
  x = Number.isFinite(x) ? x : 0;
  y = Number.isFinite(y) ? y : 0;
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const next = clampPetPosition(x, y, sw, sh);
  petWin.setPosition(next.x, next.y);
});
ipcMain.on("move-window", (e, { dx, dy }) => {
  if (!petWin || petWin.isDestroyed()) return;
  const [x, y] = petWin.getPosition();
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const next = clampPetPosition(x + dx, y + dy, sw, sh);
  petWin.setPosition(next.x, next.y);
});
ipcMain.handle("get-screen-info", () => {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const [wx, wy] = petWin ? petWin.getPosition() : [0, 0];
  return { sw, sh, wx, wy };
});
ipcMain.on("switch-pet", (e, name) => {
  currentPet = name;
  if (petWin && !petWin.isDestroyed())
    petWin.webContents.send("switch-pet", name);
  if (chatWin && !chatWin.isDestroyed())
    chatWin.webContents.send("set-pet", name);
});
ipcMain.on("toggle-behaviour", (e, data) => {
  if (petWin && !petWin.isDestroyed())
    petWin.webContents.send("toggle-behaviour", data);
});
ipcMain.handle("reward-affection", (e, amount) => {
  const s = readAppSettings();
  s.affectionPoints = (s.affectionPoints || 0) + amount;
  updateAppSettings(s);
});

// ── Fullscreen Detection ──────────────────────────────────────────────────────

/**
 * Handle fullscreen state changes
 */
function handleFullscreenChange(isFullscreen) {
  if (isFullscreen && !isHiddenDueToFullscreen) {
    // Entering fullscreen - hide pet and chat
    console.log("[Fullscreen] Detected fullscreen mode - hiding windows");

    if (petWin && !petWin.isDestroyed()) {
      petWin.hide();
    }
    if (chatWin && !chatWin.isDestroyed()) {
      chatWin.hide();
    }
    if (overlayWin && !overlayWin.isDestroyed()) {
      overlayWin.hide();
    }

    isHiddenDueToFullscreen = true;
  } else if (!isFullscreen && isHiddenDueToFullscreen) {
    // Exiting fullscreen - show pet and chat again
    console.log("[Fullscreen] Exited fullscreen mode - showing windows");

    if (petWin && !petWin.isDestroyed()) {
      petWin.show();
    }
    // Only show chat if it was open before
    if (chatWin && !chatWin.isDestroyed()) {
      chatWin.show();
    }
    if (overlayWin && !overlayWin.isDestroyed()) {
      overlayWin.show();
    }

    isHiddenDueToFullscreen = false;
  }
}

/**
 * Start monitoring for fullscreen mode (OPTIMIZED - non-blocking)
 */
function startFullscreenDetection() {
  if (fullscreenCheckInterval) return;

  console.log("[Fullscreen] Starting optimized fullscreen detection");

  // Check every 5 seconds (reduced frequency; osascript result cached for 5s)
  fullscreenCheckInterval = setInterval(() => {
    // Exclude our own windows from the check
    const excludeWindows = [petWin, overlayWin, chatWin, settingsWin].filter(
      (w) => w,
    );

    // Use async detection to avoid blocking
    isSystemInFullscreenAsync(excludeWindows, (isFullscreen) => {
      // Only trigger change if state actually changed
      if (isFullscreen !== wasFullscreenLastCheck) {
        handleFullscreenChange(isFullscreen);
        wasFullscreenLastCheck = isFullscreen;
      }
    });
  }, 5000);
}

/**
 * Stop monitoring for fullscreen mode
 */
function stopFullscreenDetection() {
  if (fullscreenCheckInterval) {
    clearInterval(fullscreenCheckInterval);
    fullscreenCheckInterval = null;
    console.log("[Fullscreen] Stopped fullscreen detection");
  }

  // Reset state
  isHiddenDueToFullscreen = false;
  wasFullscreenLastCheck = false;
}

// ── Launch ────────────────────────────────────────────────────────────────────
function closeWindow(win) {
  if (win && !win.isDestroyed()) win.close();
}

// ── Launch ────────────────────────────────────────────────────────────────────

function buildTrayMenu() {
  if (!tray) return;
  const menu = Menu.buildFromTemplate([
    { label: "🐾 Desktop Pets", enabled: false },
    { type: "separator" },
    { label: "⚙️  Settings", click: () => createSettingsWindow() },
    { label: "💬 Chat", click: () => createChatWindow() },
    {
      label: "🤖 AI Enabled",
      type: "checkbox",
      checked: !!appSettings.aiEnabled,
      click: (item) => {
        appSettings = updateAppSettings({ aiEnabled: item.checked });
        if (petWin && !petWin.isDestroyed())
          petWin.webContents.send("ai-enabled-changed", appSettings.aiEnabled);
        if (chatWin && !chatWin.isDestroyed())
          chatWin.webContents.send("ai-enabled-changed", appSettings.aiEnabled);
        if (settingsWin && !settingsWin.isDestroyed())
          settingsWin.webContents.send("app-settings-updated", appSettings);
        buildTrayMenu();
      },
    },
    { type: "separator" },
    { label: "Show", click: () => petWin && petWin.show() },
    { label: "Hide", click: () => petWin && petWin.hide() },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);
  tray.setContextMenu(menu);
}

function launchApp() {
  if (
    (petWin && !petWin.isDestroyed()) ||
    (overlayWin && !overlayWin.isDestroyed())
  )
    return;
  createPetWindow();
  setTimeout(() => {
    if (!overlayWin || overlayWin.isDestroyed()) createOverlayWindow();
  }, 0);
  startFullscreenDetection();
  try {
    const icon = nativeImage.createEmpty();
    tray = new Tray(icon);
    tray.setToolTip("Desktop Pets 🐾");
    buildTrayMenu();
    tray.on("double-click", () => createChatWindow());
  } catch (e) {}

  // ── Auto-Update ─────────────────────────────────────────────────────────────
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on("update-available", () => {
    if (petWin && !petWin.isDestroyed()) {
      petWin.webContents.send("update-available");
    }
  });

  autoUpdater.on("update-downloaded", () => {
    if (petWin && !petWin.isDestroyed()) {
      petWin.webContents.send("update-downloaded");
    }
    // Optional: autoUpdater.quitAndInstall(); // You can also wait for human confirmation
  });

}

ipcMain.on("check-for-updates-manual", (e) => {
  autoUpdater
    .checkForUpdates()
    .then((result) => {
      if (!result || !result.updateInfo) {
        checkForGitUpdates((gitMsg) => {
          if (settingsWin && !settingsWin.isDestroyed()) {
            settingsWin.webContents.send("update-check-result", gitMsg);
          }
        });
      } else {
        if (settingsWin && !settingsWin.isDestroyed()) {
          settingsWin.webContents.send(
            "update-check-result",
            "New release found! Downloading...",
          );
        }
      }
    })
    .catch((err) => {
      checkForGitUpdates((gitMsg) => {
        if (settingsWin && !settingsWin.isDestroyed()) {
          settingsWin.webContents.send("update-check-result", gitMsg);
        }
      });
    });
});

/**
 * Checks for updates via Git and handles stashing to preserve local changes
 */
function checkForGitUpdates(callback) {
  console.log("[UpdateSystem] Checking for cloud updates...");

  // Use a slightly smarter approach: check if we are actually in a git repo first
  exec("git rev-parse --is-inside-work-tree", { cwd: __dirname }, (gitErr) => {
    if (gitErr) {
      console.log("[UpdateSystem] Not a git repository, skipping git updates.");
      if (callback) callback("Not a git repository.");
      return;
    }

    // Phase 1: Stash any local changes safely
    exec("git stash", { cwd: __dirname }, (error) => {
      // Phase 2: Pull latest changes from GitHub
      exec("git pull origin main", { cwd: __dirname }, (pullError, stdout) => {
        // Phase 3: Restore stashed changes
        exec("git stash pop", { cwd: __dirname }, () => {
          if (!pullError && stdout && stdout.includes("Already up to date")) {
            console.log("[UpdateSystem] Application is up to date.");
            if (callback) callback("Up to date.");
          } else if (!pullError) {
            console.log(
              "[UpdateSystem] Application updated from cloud! Refreshing soon...",
            );
            if (petWin && !petWin.isDestroyed()) {
              petWin.webContents.send(
                "git-update-message",
                "I just got an update from GitHub! I'm smarter now.",
              );
            }
            if (callback) callback("Updated successfully!");
          } else {
            console.error("[UpdateSystem] Update check failed:", pullError);
            if (callback) callback("Update failed. Check console.");
          }
        });
      });
    });
  });
}

app.whenReady().then(async () => {
  initAppSettings(app);
  appSettings = getAppSettings();
  launchApp();
});

app.on("window-all-closed", () => {});
app.on("before-quit", () => {
  stopFullscreenDetection();
});
