# Desktop Pets — License Setup Guide

## Step 1 — Create your JSONBin (2 minutes, free)

1. Go to **https://jsonbin.io** and sign up free
2. Click **Create Bin**
3. Paste this as the content:
   ```json
   {"hashes":[]}
   ```
4. Click **Save**
5. Copy the **Bin ID** from the URL (looks like: `6507abc123def456`)
6. Go to **API Keys** in your account → copy your **Master Key**

## Step 2 — Put your credentials in license.js

Open `license.js` and replace:
```js
const _binR = 'https://api.jsonbin.io/v3/b/YOUR_BIN_ID/latest';
const _binW = 'https://api.jsonbin.io/v3/b/YOUR_BIN_ID';
const _key  = 'YOUR_MASTER_KEY';
```
With your actual Bin ID and Master Key.

## Step 3 — Create license keys

Pick any secret strings as license keys (e.g. `pets-alpha-2024`, `hars-dev-key`).
For each key, get its SHA256 hash:

```bash
echo -n "your-key-here" | shasum -a 256
```

Add each hash to your JSONBin:
```json
{
  "hashes": [
    { "h": "abc123...hash1", "fp": null, "revoked": false },
    { "h": "def456...hash2", "fp": null, "revoked": false }
  ]
}
```

## Step 4 — Give keys to users

Tell them their key (e.g. `pets-alpha-2024`).
They enter it once → it binds to their device.

## To DEACTIVATE a device remotely

1. Go to jsonbin.io → your bin → Edit
2. Either remove that key entry from the `hashes` array or set `"revoked": true`
3. Save

The app checks in the background. It will lock on the next launch or during an active session after the next poll.

## The flow

- First launch → shows license gate → user enters key
- Key is hashed, checked against JSONBin, bound to device fingerprint
- Subsequent launches → local check (instant, no network)
- Background revoke check runs silently every 10 minutes — if key is removed or revoked, app locks
- One key = one device (can't share keys)
