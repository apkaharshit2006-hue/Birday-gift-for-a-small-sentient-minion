const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { initLicenseStore, activate, localCheck, revokeCheck } = require('./license');
const { initAppSettings, getAppSettings, updateAppSettings } = require('./app-settings');
const { isSystemInFullscreenAsync } = require('./fullscreen-detector');

let petWin=null, overlayWin=null, settingsWin=null, chatWin=null, authWin=null;
let tray=null, currentPet='cat';
let deactivateWin=null, revocationTimer=null, revocationCheckInFlight=false, isDeactivated=false;
let appSettings={ aiEnabled:true };

// Fullscreen detection state
let fullscreenCheckInterval=null;
let isHiddenDueToFullscreen=false;
let wasFullscreenLastCheck=false;

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

// ── Auth window ───────────────────────────────────────────────────────────────
function createAuthWindow() {
  if(isDeactivated) return;
  if(authWin&&!authWin.isDestroyed()){ authWin.focus(); return; }
  const {width,height}=screen.getPrimaryDisplay().workAreaSize;
  authWin=new BrowserWindow({
    width:360,height:260,
    x:Math.floor(width/2)-180, y:Math.floor(height/2)-130,
    frame:false,resizable:false,alwaysOnTop:true,
    webPreferences:{nodeIntegration:true,contextIsolation:false},
  });
  authWin.loadFile('auth.html');
  authWin.on('closed',()=>{authWin=null;});
}

// Key activation — called from auth window
ipcMain.handle('activate-key', async (e, keyStr) => {
  return await activate(keyStr);
});
ipcMain.on('auth-success', () => {
  if(authWin&&!authWin.isDestroyed()) authWin.close();
  if(deactivateWin&&!deactivateWin.isDestroyed()) deactivateWin.close();
  isDeactivated=false;
  launchApp();
});

// ── Overlay window ────────────────────────────────────────────────────────────
function createOverlayWindow(){
  const {width,height}=screen.getPrimaryDisplay().workAreaSize;
  overlayWin=new BrowserWindow({
    width,height,x:0,y:0,
    transparent:true,frame:false,alwaysOnTop:true,
    skipTaskbar:true,resizable:false,hasShadow:false,focusable:false,
    webPreferences:{nodeIntegration:true,contextIsolation:false},
  });
  overlayWin.setAlwaysOnTop(true,'screen-saver');
  overlayWin.setVisibleOnAllWorkspaces(true,{visibleOnFullScreen:true});
  overlayWin.setIgnoreMouseEvents(true,{forward:true});
  overlayWin.loadFile('overlay.html');
}

// ── Pet window ────────────────────────────────────────────────────────────────
function createPetWindow(){
  const {width,height}=screen.getPrimaryDisplay().workAreaSize;
  petWin=new BrowserWindow({
    width:220,height:220,
    x:Math.floor(width/2),y:height-240,
    transparent:true,frame:false,alwaysOnTop:true,
    skipTaskbar:true,resizable:false,hasShadow:false,focusable:true,
    webPreferences:{
      nodeIntegration:true,
      contextIsolation:false,
      preload:path.join(__dirname,'scribble-fix.js'),
    },
  });
  petWin.setAlwaysOnTop(true,'screen-saver');
  petWin.setVisibleOnAllWorkspaces(true,{visibleOnFullScreen:true});
  petWin.loadFile('index.html');
  petWin.webContents.once('did-finish-load',()=>{
    petWin.webContents.send('ai-enabled-changed', appSettings.aiEnabled);
  });
  petWin.on('blur',()=>{ if(petWin&&!petWin.isDestroyed()) petWin.setAlwaysOnTop(true,'screen-saver'); });
}

// ── Settings window ───────────────────────────────────────────────────────────
function createSettingsWindow(){
  if(isDeactivated) return;
  if(settingsWin&&!settingsWin.isDestroyed()){settingsWin.focus();return;}
  const {width,height}=screen.getPrimaryDisplay().workAreaSize;
  settingsWin=new BrowserWindow({
    width:420,height:600,
    x:Math.floor(width/2)-210,y:Math.floor(height/2)-300,
    frame:true,alwaysOnTop:true,resizable:false,
    title:'Desktop Pets — Settings',
    webPreferences:{nodeIntegration:true,contextIsolation:false},
  });
  settingsWin.setMenuBarVisibility(false);
  settingsWin.loadFile('settings.html');
  settingsWin.webContents.once('did-finish-load',()=>{
    settingsWin.webContents.send('app-settings-updated', appSettings);
  });
  settingsWin.on('closed',()=>{settingsWin=null;});
}

// ── Chat window ───────────────────────────────────────────────────────────────
function createChatWindow(){
  if(isDeactivated) return;
  if(chatWin&&!chatWin.isDestroyed()){chatWin.focus();return;}
  const [px,py]=petWin?petWin.getPosition():[400,400];
  const {width:sw,height:sh}=screen.getPrimaryDisplay().workAreaSize;
  const cx=Math.max(10,Math.min(sw-310,px-40));
  const cy=Math.max(10,Math.min(sh-400,py-400));
  chatWin=new BrowserWindow({
    width:300,height:380,x:cx,y:cy,
    frame:false,alwaysOnTop:true,skipTaskbar:true,
    resizable:false,hasShadow:true,
    webPreferences:{nodeIntegration:true,contextIsolation:false},
  });
  chatWin.setAlwaysOnTop(true,'screen-saver');
  chatWin.loadFile('chat.html');
  chatWin.on('closed',()=>{chatWin=null;});
  chatWin.webContents.once('did-finish-load',()=>{
    chatWin.webContents.send('set-pet',currentPet);
    chatWin.webContents.send('ai-enabled-changed', appSettings.aiEnabled);
  });
}

// ── IPC ───────────────────────────────────────────────────────────────────────
ipcMain.on('quit-app',()=>app.quit());
ipcMain.on('open-settings',()=>createSettingsWindow());
ipcMain.on('open-chat',()=>createChatWindow());

// Pixel-perfect click-through
ipcMain.on('set-mouse-ignore',(e,ignore)=>{
  if(!petWin||petWin.isDestroyed()) return;
  if(ignore) petWin.setIgnoreMouseEvents(true,{forward:true});
  else petWin.setIgnoreMouseEvents(false);
});

ipcMain.on('pet-changed',(e,pet)=>{
  currentPet=pet;
  if(chatWin&&!chatWin.isDestroyed()) chatWin.webContents.send('set-pet',pet);
});
ipcMain.handle('get-app-settings',()=>appSettings);
ipcMain.on('set-ai-enabled',(e,enabled)=>{
  appSettings = updateAppSettings({ aiEnabled: !!enabled });
  if(petWin&&!petWin.isDestroyed()) petWin.webContents.send('ai-enabled-changed', appSettings.aiEnabled);
  if(chatWin&&!chatWin.isDestroyed()) chatWin.webContents.send('ai-enabled-changed', appSettings.aiEnabled);
  if(settingsWin&&!settingsWin.isDestroyed()) settingsWin.webContents.send('app-settings-updated', appSettings);
  if(tray) buildTrayMenu();
});
ipcMain.on('pet-thinking',(e,on)=>{
  if(petWin&&!petWin.isDestroyed()) petWin.webContents.send('pet-thinking',on);
});
ipcMain.on('pet-response',(e,data)=>{
  if(petWin&&!petWin.isDestroyed()) petWin.webContents.send('pet-response',data);
});
ipcMain.on('auto-reaction',(e,data)=>{
  if(chatWin&&!chatWin.isDestroyed()) chatWin.webContents.send('auto-message',data);
});
ipcMain.on('overlay-draw',(e,data)=>{
  if(overlayWin&&!overlayWin.isDestroyed()) overlayWin.webContents.send('overlay-draw',data);
});
ipcMain.on('overlay-clear',()=>{
  if(overlayWin&&!overlayWin.isDestroyed()) overlayWin.webContents.send('overlay-clear');
});
ipcMain.on('set-win-pos',(e,{x,y})=>{
  if(!petWin||petWin.isDestroyed()) return;
  const {width:sw,height:sh}=screen.getPrimaryDisplay().workAreaSize;
  const next = clampPetPosition(x, y, sw, sh);
  petWin.setPosition(next.x, next.y);
});
ipcMain.on('move-window',(e,{dx,dy})=>{
  if(!petWin||petWin.isDestroyed()) return;
  const [x,y]=petWin.getPosition();
  const {width:sw,height:sh}=screen.getPrimaryDisplay().workAreaSize;
  const next = clampPetPosition(x + dx, y + dy, sw, sh);
  petWin.setPosition(next.x, next.y);
});
ipcMain.handle('get-screen-info',()=>{
  const {width:sw,height:sh}=screen.getPrimaryDisplay().workAreaSize;
  const [wx,wy]=petWin?petWin.getPosition():[0,0];
  return {sw,sh,wx,wy};
});
ipcMain.on('switch-pet',(e,name)=>{
  currentPet=name;
  if(petWin&&!petWin.isDestroyed()) petWin.webContents.send('switch-pet',name);
  if(chatWin&&!chatWin.isDestroyed()) chatWin.webContents.send('set-pet',name);
});
ipcMain.on('toggle-behaviour',(e,data)=>{
  if(petWin&&!petWin.isDestroyed()) petWin.webContents.send('toggle-behaviour',data);
});

// ── Fullscreen Detection ──────────────────────────────────────────────────────

/**
 * Handle fullscreen state changes
 */
function handleFullscreenChange(isFullscreen) {
  if (isFullscreen && !isHiddenDueToFullscreen) {
    // Entering fullscreen - hide pet and chat
    console.log('[Fullscreen] Detected fullscreen mode - hiding windows');
    
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
    console.log('[Fullscreen] Exited fullscreen mode - showing windows');
    
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
  
  console.log('[Fullscreen] Starting optimized fullscreen detection');
  
  // Check every 2 seconds (reduced frequency for better performance)
  fullscreenCheckInterval = setInterval(() => {
    if (isDeactivated) return;
    
    // Exclude our own windows from the check
    const excludeWindows = [petWin, overlayWin, chatWin, settingsWin, authWin, deactivateWin].filter(w => w);
    
    // Use async detection to avoid blocking
    isSystemInFullscreenAsync(excludeWindows, (isFullscreen) => {
      // Only trigger change if state actually changed
      if (isFullscreen !== wasFullscreenLastCheck) {
        handleFullscreenChange(isFullscreen);
        wasFullscreenLastCheck = isFullscreen;
      }
    });
  }, 2000); // Increased to 2 seconds for better performance
}

/**
 * Stop monitoring for fullscreen mode
 */
function stopFullscreenDetection() {
  if (fullscreenCheckInterval) {
    clearInterval(fullscreenCheckInterval);
    fullscreenCheckInterval = null;
    console.log('[Fullscreen] Stopped fullscreen detection');
  }
  
  // Reset state
  isHiddenDueToFullscreen = false;
  wasFullscreenLastCheck = false;
}

// ── Launch ────────────────────────────────────────────────────────────────────
function stopRevocationPolling() {
  if(revocationTimer){
    clearInterval(revocationTimer);
    revocationTimer=null;
  }
}

function closeWindow(win){
  if(win && !win.isDestroyed()) win.close();
}

function showDeactivateWindow(){
  if(deactivateWin && !deactivateWin.isDestroyed()){
    deactivateWin.focus();
    return;
  }
  const {width,height}=screen.getPrimaryDisplay().workAreaSize;
  deactivateWin=new BrowserWindow({
    width:360,height:200,
    x:Math.floor(width/2)-180,y:Math.floor(height/2)-100,
    frame:false,resizable:false,alwaysOnTop:true,
    webPreferences:{nodeIntegration:true,contextIsolation:false},
  });
  deactivateWin.loadFile('deactivate-window.html');
  deactivateWin.on('closed',()=>{deactivateWin=null;});
}

function deactivateApp(){
  if(isDeactivated) return;
  isDeactivated=true;
  stopRevocationPolling();
  stopFullscreenDetection();
  closeWindow(authWin);
  closeWindow(chatWin);
  closeWindow(settingsWin);
  closeWindow(petWin);
  closeWindow(overlayWin);
  authWin=null;
  chatWin=null;
  settingsWin=null;
  petWin=null;
  overlayWin=null;
  if(tray){
    try { tray.destroy(); } catch(e){}
    tray=null;
  }
  showDeactivateWindow();
}

async function runRevocationCheck(){
  if(isDeactivated || revocationCheckInFlight) return;
  revocationCheckInFlight=true;
  try{
    const still = await revokeCheck();
    if(!still) deactivateApp();
  } finally {
    revocationCheckInFlight=false;
  }
}

function startRevocationPolling(){
  stopRevocationPolling();
  if(isDeactivated) return;
  revocationTimer=setInterval(()=>{ runRevocationCheck(); }, REVOCATION_POLL_MS);
}

function buildTrayMenu(){
  if(!tray) return;
  const menu=Menu.buildFromTemplate([
    {label:'🐾 Desktop Pets',enabled:false},
    {type:'separator'},
    {label:'⚙️  Settings',click:()=>createSettingsWindow()},
    {label:'💬 Chat',click:()=>createChatWindow()},
    {label:'🤖 AI Enabled',type:'checkbox',checked:!!appSettings.aiEnabled,click:item=>{
      appSettings = updateAppSettings({ aiEnabled: item.checked });
      if(petWin&&!petWin.isDestroyed()) petWin.webContents.send('ai-enabled-changed', appSettings.aiEnabled);
      if(chatWin&&!chatWin.isDestroyed()) chatWin.webContents.send('ai-enabled-changed', appSettings.aiEnabled);
      if(settingsWin&&!settingsWin.isDestroyed()) settingsWin.webContents.send('app-settings-updated', appSettings);
      buildTrayMenu();
    }},
    {type:'separator'},
    {label:'Show',click:()=>petWin&&petWin.show()},
    {label:'Hide',click:()=>petWin&&petWin.hide()},
    {type:'separator'},
    {label:'Quit',click:()=>app.quit()},
  ]);
  tray.setContextMenu(menu);
}

function launchApp(){
  if(isDeactivated) return;
  if((petWin&&!petWin.isDestroyed()) || (overlayWin&&!overlayWin.isDestroyed())) return;
  createPetWindow();
  setTimeout(()=>{
    if(!overlayWin || overlayWin.isDestroyed()) createOverlayWindow();
  }, 0);
  startRevocationPolling();
  startFullscreenDetection();
  try{
    const icon=nativeImage.createEmpty();
    tray=new Tray(icon);
    tray.setToolTip('Desktop Pets 🐾');
    buildTrayMenu();
    tray.on('double-click',()=>createChatWindow());
  }catch(e){}
}

app.whenReady().then(async ()=>{
  initLicenseStore(app);
  initAppSettings(app);
  appSettings = getAppSettings();
  // 1. Check local activation first (fast, no network)
  const local = localCheck();
  if(local){
    // Already activated — do background revoke check then launch
    launchApp();
    runRevocationCheck();
  } else {
    // Not activated — show license gate
    createAuthWindow();
  }
});

app.on('window-all-closed',()=>{});
app.on('before-quit',()=>{ 
  stopRevocationPolling();
  stopFullscreenDetection();
});
