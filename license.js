/* Desktop Pets — Device-Bound License (same system as Inkflow) */
'use strict';

const { app, net } = require('electron');
const crypto = require('crypto');
const os = require('os');
const fs = require('fs');
const path = require('path');

// ── JSONBin config — REPLACE THESE WITH YOUR OWN ─────────────────────────────
// 1. Go to https://jsonbin.io and create a free account
// 2. Create a new bin with this content:  {"hashes":[]}
// 3. Copy the Bin ID and Master Key below
const _binR = 'https://api.jsonbin.io/v3/b/69bac7e0b7ec241ddc7d9364/latest';
const _binW = 'https://api.jsonbin.io/v3/b/69bac7e0b7ec241ddc7d9364';
const _key  = '$2a$10$.FsJ/9zsLla5F8HAMZL2dO4a0mNCz2UlCbfDKdV9HTGh9oDuAg3wS';
// ─────────────────────────────────────────────────────────────────────────────

let _storeDir = path.join(os.tmpdir(), 'desktop-pets-license');
let _ck = path.join(_storeDir, 'cache.json');
let _dk = path.join(_storeDir, 'device.json');
let _sk = path.join(_storeDir, 'seed.txt');

function _ensureStoreDir() {
  try {
    fs.mkdirSync(_storeDir, { recursive: true });
  } catch (e) {}
}

function initLicenseStore(electronApp = app) {
  try {
    const baseDir = electronApp && typeof electronApp.getPath === 'function'
      ? electronApp.getPath('userData')
      : os.tmpdir();
    _storeDir = path.join(baseDir, 'license');
  } catch (e) {
    _storeDir = path.join(os.tmpdir(), 'desktop-pets-license');
  }
  _ck = path.join(_storeDir, 'cache.json');
  _dk = path.join(_storeDir, 'device.json');
  _sk = path.join(_storeDir, 'seed.txt');
  _ensureStoreDir();
}

function _sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function _getSeed() {
  _ensureStoreDir();
  try {
    if (fs.existsSync(_sk)) return fs.readFileSync(_sk, 'utf8').trim();
  } catch(e) {}
  const seed = crypto.randomBytes(18).toString('hex');
  try { fs.writeFileSync(_sk, seed); } catch(e) {}
  return seed;
}

function _fp() {
  const seed = _getSeed();
  const parts = [
    seed,
    os.cpus().length,
    os.platform(),
    os.arch(),
    os.totalmem(),
    os.hostname(),
  ];
  return _sha256(parts.join('|'));
}

function _readCache(file) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch(e) {}
  return null;
}
function _writeCache(file, data) {
  _ensureStoreDir();
  try { fs.writeFileSync(file, JSON.stringify(data)); } catch(e) {}
}

function _normalizeEntry(entry) {
  if (!entry) return null;
  if (typeof entry === 'string') return { h: entry, fp: null, revoked: false };
  if (typeof entry !== 'object' || !entry.h) return null;
  return {
    ...entry,
    h: entry.h,
    fp: entry.fp || null,
    revoked: entry.revoked === true,
  };
}

function _normalizeData(data) {
  if (!data || !Array.isArray(data.hashes)) return null;
  return {
    ...data,
    hashes: data.hashes.map(_normalizeEntry).filter(Boolean),
  };
}

function _findEntry(entries, hash) {
  for (let i = 0; i < entries.length; i++) {
    if (entries[i] && entries[i].h === hash) return { idx: i, entry: entries[i] };
  }
  return null;
}

function _createLicenseKey() {
  return crypto.randomBytes(18).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
}

function _entryView(entry) {
  return {
    hash: entry.h,
    label: entry.label || '',
    note: entry.note || '',
    createdAt: entry.createdAt || null,
    revoked: entry.revoked === true,
    revokedAt: entry.revokedAt || null,
    deviceBound: !!entry.fp,
    fingerprint: entry.fp || null,
  };
}

function clearLocalLicense() {
  [_dk, _ck, _sk].forEach(file => {
    try { fs.unlinkSync(file); } catch (e) {}
  });
}

function _fetch(url, options={}) {
  return new Promise((resolve, reject) => {
    const req = net.request({ url, method: options.method || 'GET' });
    if (options.headers)
      Object.entries(options.headers).forEach(([k,v]) => req.setHeader(k, v));
    req.on('response', res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ ok: res.statusCode < 400, json: () => JSON.parse(body) }); }
        catch(e) { resolve({ ok: false, json: () => ({}) }); }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function _read() {
  try {
    const r = await _fetch(_binR, { headers: { 'X-Master-Key': _key, 'X-Bin-Meta': 'false' } });
    if (!r.ok) throw 0;
    const d = r.json();
    const data = _normalizeData(d.record || d);
    if (!data) throw 0;
    _writeCache(_ck, data);
    return data;
  } catch(e) {}
  const c = _normalizeData(_readCache(_ck));
  return c;
}

async function _write(data) {
  try {
    const normalized = _normalizeData(data);
    if (!normalized) return false;
    await _fetch(_binW, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': _key },
      body: JSON.stringify(normalized),
    });
    _writeCache(_ck, normalized);
    return true;
  } catch(e) { return false; }
}

async function activate(keyStr) {
  const kh  = _sha256(keyStr);
  const fp  = _fp();
  const data = await _read();
  if (!data || !Array.isArray(data.hashes))
    return { ok: false, msg: 'Cannot reach license server. Check connection.' };

  const entries = data.hashes;
  const match = _findEntry(entries, kh);
  if (!match) return { ok: false, msg: 'Invalid license key.' };

  const entry = match.entry;
  const bound = entry.fp;

  if (entry.revoked) {
    clearLocalLicense();
    return { ok: false, msg: 'License revoked. This device is no longer authorized.' };
  }

  if (bound === null || bound === undefined || bound === '') {
    entries[match.idx] = { h: kh, fp, revoked: false };
    const written = await _write(data);
    if (!written) return { ok: false, msg: 'Activation failed. Check connection.' };
    _writeCache(_dk, { h: kh, fp });
    return { ok: true };
  }
  if (bound === fp) {
    _writeCache(_dk, { h: kh, fp });
    return { ok: true };
  }
  return { ok: false, msg: 'Key already activated on another device.' };
}

function localCheck() {
  try {
    const saved = _readCache(_dk);
    if (!saved) return false;
    const fp = _fp();
    return saved.fp === fp && !!saved.h;
  } catch(e) { return false; }
}

async function revokeCheck() {
  try {
    const saved = _readCache(_dk);
    if (!saved || !saved.h) return false;
    const fp = _fp();
    if (saved.fp !== fp) {
      clearLocalLicense();
      return false;
    }
    const data = await _read();
    if (!data || !Array.isArray(data.hashes)) return true; // offline = stay active
    const match = _findEntry(data.hashes, saved.h);
    if (!match || match.entry.revoked || (match.entry.fp && match.entry.fp !== saved.fp)) {
      clearLocalLicense();
      return false;
    }
    return true;
  } catch(e) { return true; } // network error = stay active
}

async function listLicenses() {
  const data = await _read();
  if (!data || !Array.isArray(data.hashes)) {
    return { ok: false, msg: 'Cannot reach license server. Check connection.', licenses: [] };
  }
  return {
    ok: true,
    licenses: data.hashes.map(_entryView),
  };
}

async function createLicense({ key, label, note } = {}) {
  const data = await _read();
  if (!data || !Array.isArray(data.hashes)) {
    return { ok: false, msg: 'Cannot reach license server. Check connection.' };
  }
  const plainKey = (key || _createLicenseKey()).trim();
  if (!plainKey) return { ok: false, msg: 'License key cannot be empty.' };
  const hash = _sha256(plainKey);
  if (_findEntry(data.hashes, hash)) {
    return { ok: false, msg: 'That license key already exists.' };
  }
  const entry = {
    h: hash,
    fp: null,
    revoked: false,
    createdAt: new Date().toISOString(),
    label: (label || '').trim(),
    note: (note || '').trim(),
    revokedAt: null,
  };
  data.hashes.unshift(entry);
  const written = await _write(data);
  if (!written) return { ok: false, msg: 'Failed to save the new license key.' };
  return { ok: true, key: plainKey, license: _entryView(entry) };
}

async function setLicenseRevoked(hash, revoked) {
  const data = await _read();
  if (!data || !Array.isArray(data.hashes)) {
    return { ok: false, msg: 'Cannot reach license server. Check connection.' };
  }
  const match = _findEntry(data.hashes, hash);
  if (!match) return { ok: false, msg: 'License key not found.' };
  data.hashes[match.idx] = {
    ...match.entry,
    revoked: revoked === true,
    revokedAt: revoked ? new Date().toISOString() : null,
  };
  const written = await _write(data);
  if (!written) return { ok: false, msg: 'Failed to update license status.' };
  return { ok: true, license: _entryView(data.hashes[match.idx]) };
}

async function deleteLicense(hash) {
  const data = await _read();
  if (!data || !Array.isArray(data.hashes)) {
    return { ok: false, msg: 'Cannot reach license server. Check connection.' };
  }
  const nextHashes = data.hashes.filter(entry => entry.h !== hash);
  if (nextHashes.length === data.hashes.length) {
    return { ok: false, msg: 'License key not found.' };
  }
  data.hashes = nextHashes;
  const written = await _write(data);
  if (!written) return { ok: false, msg: 'Failed to delete license key.' };
  return { ok: true };
}

async function unbindLicense(hash) {
  const data = await _read();
  if (!data || !Array.isArray(data.hashes)) {
    return { ok: false, msg: 'Cannot reach license server. Check connection.' };
  }
  const match = _findEntry(data.hashes, hash);
  if (!match) return { ok: false, msg: 'License key not found.' };
  data.hashes[match.idx] = {
    ...match.entry,
    fp: null,
  };
  const written = await _write(data);
  if (!written) return { ok: false, msg: 'Failed to unbind license key.' };
  return { ok: true, license: _entryView(data.hashes[match.idx]) };
}

module.exports = {
  initLicenseStore,
  activate,
  localCheck,
  revokeCheck,
  clearLocalLicense,
  listLicenses,
  createLicense,
  setLicenseRevoked,
  deleteLicense,
  unbindLicense,
};
