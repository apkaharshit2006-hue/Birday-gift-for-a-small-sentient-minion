const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const {
  initLicenseStore,
  listLicenses,
  createLicense,
  setLicenseRevoked,
  deleteLicense,
  unbindLicense,
} = require('./license');

let managerWin = null;

function createManagerWindow() {
  managerWin = new BrowserWindow({
    width: 1040,
    height: 760,
    minWidth: 920,
    minHeight: 620,
    title: 'Desktop Pets License Manager',
    backgroundColor: '#f3efe6',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  managerWin.loadFile('license-manager.html');
  managerWin.on('closed', () => {
    managerWin = null;
  });
}

ipcMain.handle('license-manager:list', async () => {
  return listLicenses();
});

ipcMain.handle('license-manager:create', async (event, payload) => {
  return createLicense(payload || {});
});

ipcMain.handle('license-manager:revoke', async (event, hash) => {
  return setLicenseRevoked(hash, true);
});

ipcMain.handle('license-manager:restore', async (event, hash) => {
  return setLicenseRevoked(hash, false);
});

ipcMain.handle('license-manager:delete', async (event, hash) => {
  return deleteLicense(hash);
});

ipcMain.handle('license-manager:unbind', async (event, hash) => {
  return unbindLicense(hash);
});

app.whenReady().then(() => {
  initLicenseStore(app);
  createManagerWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
