'use strict';

const { app } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

let settingsPath = path.join(os.tmpdir(), 'desktop-pets-settings.json');
let settingsCache = { aiEnabled: true };

function initAppSettings(electronApp = app) {
  try {
    settingsPath = path.join(electronApp.getPath('userData'), 'app-settings.json');
  } catch (e) {
    settingsPath = path.join(os.tmpdir(), 'desktop-pets-settings.json');
  }
  settingsCache = { ...settingsCache, ...readAppSettings() };
  writeAppSettings(settingsCache);
}

function readAppSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }
  } catch (e) {}
  return { aiEnabled: true };
}

function writeAppSettings(nextSettings) {
  settingsCache = { aiEnabled: true, ...nextSettings };
  try {
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify(settingsCache, null, 2));
  } catch (e) {}
  return settingsCache;
}

function updateAppSettings(patch) {
  return writeAppSettings({ ...settingsCache, ...patch });
}

function getAppSettings() {
  return { ...settingsCache };
}

module.exports = {
  initAppSettings,
  readAppSettings,
  writeAppSettings,
  updateAppSettings,
  getAppSettings,
};
