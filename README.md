# Smart Mirror — Final Bundle (Weather + Calendar + News + Notes + Gestures)

## Quick start
```bash
npm install
cp .env.example .env
# edit .env and set OPENWEATHER_API_KEY if you have it (CITY defaults to Los Angeles)
npm start
# open http://localhost:4000
```

- Allow **Camera** and **Microphone** when prompted to enable gestures and mic meter.
- If sharing externally, run a tunnel in another terminal: `cloudflared tunnel --url http://localhost:4000`

## Features
- **Weather**: current + 4‑day forecast (OpenWeather, set `OPENWEATHER_API_KEY`, `CITY`, `UNITS`)
- **Calendar**: reads `CALENDAR_ICS_URL` and shows upcoming events
- **News**: server-proxied RSS feeds (`RSS_FEEDS`), ticker auto-rotates
- **Notes**: quick notes saved in browser localStorage
- **Gestures**: open/fist/two‑fingers/thumbs‑up via MediaPipe Hands (loaded from jsDelivr)

## Files
- `server.js` — Express server, CSP configured for MediaPipe, API routes
- `public/` — UI (`index.html`, `style.css`, `app.js`, `gestures.js`)
- `.env.example` — copy to `.env` and edit

## Ports
Default is **4000** to avoid conflicts. Change by editing `PORT` in `.env`.

## Troubleshooting
- **Gestures not working**: ensure internet (MediaPipe CDN), clear cache (Cmd/Ctrl+Shift+R), allow camera.
- **Weather empty**: add your OpenWeather key in `.env`; verify city spelling.
- **Calendar empty**: use a public `.ics` URL and set `CALENDAR_ICS_URL`.
- **News empty**: ensure the RSS URLs in `.env` are reachable.
