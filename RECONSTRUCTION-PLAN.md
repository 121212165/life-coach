# Reconstruction Plan

## Current: 5 deps, WebSocket, ~260 LOC
- express, cors, dotenv, ws, axios
- WebSocket for request/response (overkill)
- axios for HTTP (Node 18+ has fetch)

## Target: 1 dep (express), HTTP POST, ~150 LOC

### Cut
- **ws** → replace WebSocket with HTTP POST `/api/chat`
- **axios** → use native `fetch` (Node 18+)
- **cors** → same-origin, not needed
- **dotenv** → `process.env.API_KEY` directly

### Keep
- **express** → serves static files + API route (1 dep is minimal for this)

### Rewrite
- `server.js` → ~40 lines: express static + POST /api/chat with streaming SSE
- `public/index.html` → ~110 lines: fetch + ReadableStream, no WebSocket
- `package.json` → 1 dependency

### Delete
- `role`, `role001` → unused config cruft
