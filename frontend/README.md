# Neuro-Haven frontend

React 18 + Vite + react-router-dom (HashRouter). Plain CSS, Web Audio, no other libraries.

```bash
npm install
npm run dev        # http://localhost:5173
```

Runs on **mock data** by default. To use the FastAPI backend, set `USE_MOCK = false` in `src/api.js`
and run `uvicorn main:app --reload` (port 8000) in a second terminal. Vite proxies `/api` to it.

Fonts (Fraunces, Inter, Lexend) load from Google Fonts; offline it falls back to Georgia / system sans.
