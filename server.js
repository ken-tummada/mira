// ===== Smart Mirror Server =====

import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import fetch from 'node-fetch';
import ical from 'node-ical';
import Parser from 'rss-parser';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 4000;

// ===== Security (Helmet) =====
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'", "https://cdn.jsdelivr.net"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
      "script-src-elem": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "https://cdn.jsdelivr.net"],
      "connect-src": ["'self'", "https://cdn.jsdelivr.net", "https://api.openweathermap.org"],
      "media-src": ["'self'", "blob:"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Public UI config
app.get('/api/config', (_req, res) => {
  res.json({
    city: process.env.CITY || 'Los Angeles',
    units: process.env.UNITS || 'imperial',
    hasWeatherKey: !!process.env.OPENWEATHER_API_KEY,
    hasCalendar: !!process.env.CALENDAR_ICS_URL,
    calendarMax: Number(process.env.CALENDAR_MAX_ITEMS || 8)
  });
});

// ----- Weather (current) -----
app.get('/api/weather', async (_req, res) => {
  const key = process.env.OPENWEATHER_API_KEY;
  const city = process.env.CITY || 'Los Angeles';
  const units = process.env.UNITS || 'imperial';
  if (!key) return res.json({ disabled: true });
  try {
    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    url.searchParams.set('q', city);
    url.searchParams.set('units', units);
    url.searchParams.set('appid', key);
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'weather_fetch_failed' });
  }
});

// ----- Weather (4-day forecast) -----
app.get('/api/forecast', async (_req, res) => {
  const key = process.env.OPENWEATHER_API_KEY;
  const city = process.env.CITY || 'Los Angeles';
  const units = process.env.UNITS || 'imperial';
  if (!key) return res.json({ disabled: true, days: [] });
  try {
    const url = new URL('https://api.openweathermap.org/data/2.5/forecast');
    url.searchParams.set('q', city);
    url.searchParams.set('units', units);
    url.searchParams.set('appid', key);
    const r = await fetch(url);
    const data = await r.json();
    if (!data || !Array.isArray(data.list)) return res.status(500).json({ error: 'forecast_fetch_failed' });

    const byDay = new Map();
    for (const item of data.list) {
      const dt = new Date((item.dt || 0) * 1000);
      const dayKey = dt.toISOString().slice(0,10);
      const temp = item.main?.temp;
      const w = item.weather?.[0];
      if (!byDay.has(dayKey)) byDay.set(dayKey, { temps: [], icons: [], descriptions: [] });
      const g = byDay.get(dayKey);
      if (Number.isFinite(temp)) g.temps.push(temp);
      if (w?.icon) g.icons.push(w.icon);
      if (w?.description) g.descriptions.push(w.description);
    }

    const days = [...byDay.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([key,g])=>{
      const tmin = Math.round(Math.min(...g.temps));
      const tmax = Math.round(Math.max(...g.temps));
      const icon = g.icons.sort((a,b)=>g.icons.filter(v=>v===a).length - g.icons.filter(v=>v===b).length).pop() || '01d';
      const desc = g.descriptions.sort((a,b)=>g.descriptions.filter(v=>v===a).length - g.descriptions.filter(v=>v===b).length).pop() || '';
      const dateObj = new Date(key + "T00:00:00Z");
      const label = new Intl.DateTimeFormat('en', { weekday:'short', month:'short', day:'numeric' }).format(dateObj);
      return { date: key, label, tmin, tmax, icon, desc };
    });

    const todayKey = new Date().toISOString().slice(0,10);
    const filtered = days.filter(d => d.date >= todayKey).slice(0,5);
    const future = filtered.length>0 && filtered[0].date===todayKey ? filtered.slice(1) : filtered;
    res.json({ days: future.slice(0,4) });
  } catch (e) {
    res.status(500).json({ error: 'forecast_fetch_failed' });
  }
});

// ----- News (RSS) -----
const rssParser = new Parser();
function getRssList(){
  const raw = process.env.RSS_FEEDS || '';
  return raw.split(',').map(s=>s.trim()).filter(Boolean);
}
app.get('/api/news', async (_req, res) => {
  try{
    const feeds = getRssList();
    const maxItems = Number(process.env.RSS_MAX_ITEMS || 15);
    const items = [];
    for (const url of feeds){
      try {
        const feed = await rssParser.parseURL(url);
        for (const it of (feed.items || [])){
          items.push({
            title: it.title || '',
            link: it.link || '',
            source: feed.title || '',
            pubDate: it.isoDate || it.pubDate || ''
          });
        }
      } catch(e) { /* ignore one bad feed */ }
    }
    items.sort((a,b)=>new Date(b.pubDate||0)-new Date(a.pubDate||0));
    res.json({ items: items.slice(0, maxItems) });
  } catch(e){
    res.status(500).json({ error: 'news_fetch_failed' });
  }
});

// ----- Calendar (ICS) -----
app.get('/api/calendar', async (_req, res) => {
  const icsUrl = process.env.CALENDAR_ICS_URL;
  const maxItems = Number(process.env.CALENDAR_MAX_ITEMS || 8);
  if (!icsUrl) return res.json({ events: [] });
  try {
    const data = await ical.async.fromURL(icsUrl);
    const now = new Date();
    const events = Object.values(data)
      .filter(ev => ev.type === 'VEVENT' && ev.start)
      .map(ev => ({ title: ev.summary || '(No title)', start: ev.start, end: ev.end, location: ev.location || '' }))
      .filter(ev => ev.end ? (new Date(ev.end) >= now) : (new Date(ev.start) >= now))
      .sort((a,b) => new Date(a.start) - new Date(b.start))
      .slice(0, maxItems)
      .map(ev => ({ 
        ...ev,
        whenText: new Intl.DateTimeFormat('en', { weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit' }).format(new Date(ev.start))
      }));
    res.json({ events });
  } catch (e) {
    res.status(500).json({ error: 'calendar_fetch_failed' });
  }
});

// Fallback to SPA
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start
app.listen(PORT, () => console.log(`✅ Smart Mirror running at http://localhost:${PORT}`));
