# OGs of Tech Mobile Shell

Expo React Native app for the persona operating system.

## Setup

```bash
cd apps/mobile
npm install
```

## Important: API must be running

In a separate terminal from the repo root:

```powershell
$env:PYTHONPATH = "."
.venv\Scripts\activate
uvicorn services.agent_api.main:app --reload --host 0.0.0.0 --port 8000
```

`--host 0.0.0.0` is required for iPhone / Expo Go.

## Configure phone API URL

Edit `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_PC_LAN_IP:8000
```

Example:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.107:8000
```

Then restart Expo so the env var is picked up:

```powershell
npm run start
```

## Run

```bash
npm run start
```

Scan the QR code with Expo Go on your iPhone (same Wi-Fi).

## Troubleshooting request timeouts

1. Confirm API is up: open `http://YOUR_PC_LAN_IP:8000/health` on the phone browser.
2. Port must be **8000** (not 8001) unless you intentionally changed it.
3. Do **not** use `localhost` on a physical device.
4. Restart Expo after changing `.env`.
5. Allow Windows Firewall for Python on port 8000.
6. Keep phone and PC on the same Wi-Fi (not guest/VPN).

## Current persona

- **Founder OG** — MVP scoping, next steps, and quick follow-up actions
