# Stack Research

**Domain:** Food-service POS — real-time capabilities added to existing Express + React + MongoDB stack
**Researched:** 2026-03-28
**Confidence:** MEDIUM (npm registry and web tools unavailable during research; versions from training data knowledge cutoff August 2025, flagged where uncertain)

---

## Context: What Already Exists

Do NOT replace these. Every library below is additive to the existing stack.

| Existing | Version | Keep As-Is |
|----------|---------|------------|
| Express.js | 4.17.3 | Yes |
| React | 17.0.2 | Yes |
| React Router DOM | 5.3.1 | Yes |
| Mongoose | 6.3.0 | Yes |
| axios | 0.26.1 | Yes |
| body-parser | 1.20.0 | Yes |
| express-validator | 6.14.1 | Yes |

---

## Recommended Stack (Additions Only)

### Real-Time: WebSockets (Kitchen Display)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| socket.io | ^4.7.x | Server-side WebSocket hub | De facto standard for Express + Node; handles reconnection, room-based broadcasting, and fallback to long-polling automatically. The existing codebase exports `app.listen()` — see integration note below. |
| socket.io-client | ^4.7.x | Browser WebSocket client for React | Must match major version of server package. Provides auto-reconnect and a clean event API that integrates naturally with React class component lifecycle methods (`componentDidMount` / `componentWillUnmount`). |

**Confidence:** MEDIUM — Socket.IO 4.x has been the stable major version since 2021. Exact patch version (4.7.x) based on training data; verify `npm show socket.io version` before pinning.

**Critical integration constraint — `index.js` exports the server wrong for Socket.IO:**

The current `src/index.js` does:
```js
module.exports = app.listen(PORT, () => { ... });
```

Socket.IO requires attaching to an `http.Server` instance *before* `listen()` is called. The correct pattern is:

```js
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: "http://localhost:3001" } });
// ... attach io event handlers ...
module.exports = server.listen(PORT, () => { ... });
```

This is a one-time refactor of `src/index.js`. Tests (chai-http) attach to the exported server — they will continue working because `server.listen()` still returns an `http.Server`.

### CORS (Counter → API Connection)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| cors | ^2.8.5 | Allow React dev server to call Express | The React UI runs on a different port (CRA default: 3001 when Express takes 3000) during development. Without CORS middleware, every browser request from the UI will be blocked. This is a day-one blocker. |

**Confidence:** HIGH — `cors` is a stable, widely-used Express middleware with no breaking changes in years. Version 2.8.5 has been current for an extended period.

**Install:** `cd tacos-tres-hermanos-pos-server && npm install cors`

### Touch UI (Order-Taking Screen)

**Recommendation: Write CSS directly. Do not add a UI component library.**

Rationale: The menu is under 15 items. A POS order screen is a grid of large tap targets — this is 30–50 lines of CSS, not a problem requiring a framework. Adding Material UI, Ant Design, or Chakra to React 17 + CRA introduces hundreds of KB of JavaScript, potential React version conflicts, and significant learning overhead for a taco stand app. The touch optimization needed here is:

- Large tap targets (minimum 48×48px per WCAG / Apple HIG)
- `touch-action: manipulation` to eliminate 300ms tap delay on mobile browsers
- `user-select: none` on order buttons
- Adequate spacing so fat-finger errors don't add wrong items

All of this is standard CSS. No library needed.

**If a library is added later (not recommended for v1):**

| Library | React 17 compatible | Why you might consider it |
|---------|---------------------|---------------------------|
| React Bootstrap 2.x | Yes | Familiar to most devs, grid system is fast to write |
| Mantine 6.x | Yes (Mantine 7+ requires React 18) | Good form components if menu management UI gets complex |

Do not use Material UI v5+ — it requires React 18+ in recent versions and the MUI team targets React 18 patterns. Introducing it to React 17 + CRA 5 creates version drift problems.

### Sales Reporting Charts

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| recharts | ^2.10.x | Daily sales bar/line charts in React | Pure React components (no imperative canvas API); renders via SVG; designed for data dashboards; integrates cleanly with React's render cycle. Works with React 17. No ref gymnastics or canvas cleanup needed in class components. |

**Confidence:** MEDIUM — Recharts 2.x has been stable on React 17 throughout its lifecycle. Version 2.10.x is the approximate latest as of training data; verify before installing.

**Install:** `cd tacos-tres-hermanos-pos-ui && npm install recharts`

**Why not Chart.js / react-chartjs-2:** Chart.js is canvas-based. Using it in React class components requires manual cleanup of Chart instances in `componentWillUnmount` to avoid memory leaks and "Canvas is already in use" errors. Recharts avoids this entirely.

**Why not Victory or Nivo:** Both are good libraries but heavier and more opinionated than needed for a simple daily-totals bar chart.

### Sales Reporting: MongoDB Aggregation

**No new library needed.** Mongoose 6.3.0 (already installed) fully supports the aggregation pipeline.

The daily sales query uses native Mongoose:

```js
// Example: daily totals for a date range
Order.aggregate([
  { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
  { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }
])
```

The existing `menuItem.js` stores `createdAt` as a `String` (human-readable timestamp). The **Order model** (not yet built) should store `createdAt` as a proper `Date` type so date-range queries and aggregation work correctly. Using `String` for dates on the order model would make sales reporting significantly harder.

**Confidence:** HIGH — This is standard Mongoose/MongoDB usage. No version concerns.

---

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| cors | ^2.8.5 | Cross-origin requests from React UI to Express | Day one — needed as soon as UI calls the API |
| socket.io | ^4.7.x | Real-time order push to kitchen display | Kitchen display milestone only |
| socket.io-client | ^4.7.x | Browser WebSocket client in React | Same milestone as socket.io server |
| recharts | ^2.10.x | Sales reporting charts | Daily sales milestone only |

---

## Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| nodemon (existing) | Auto-restart Express on file changes | Already installed; no changes needed |
| react-scripts (existing) | CRA dev server with HMR | Already installed; no changes needed |

No new dev tooling is needed. The existing setup handles all three capabilities.

---

## Installation

```bash
# Server — add these to tacos-tres-hermanos-pos-server/
cd tacos-tres-hermanos-pos-server
npm install cors socket.io

# UI — add these to tacos-tres-hermanos-pos-ui/
cd ../tacos-tres-hermanos-pos-ui
npm install socket.io-client recharts
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| socket.io | Native WebSocket API (`ws` package) | If bundle size is critical and you need max performance — `ws` is lower-level with no auto-reconnect or rooms. Not worth the added complexity for a local-network POS. |
| socket.io | Server-Sent Events (SSE) | If the data flow is one-directional only (server → kitchen). SSE is simpler to implement but kitchen needs to send "mark complete" back to counter, making SSE insufficient. |
| recharts | Chart.js + react-chartjs-2 | If you need chart types recharts doesn't support (gauge, polar area). For bar/line sales charts, recharts is simpler. |
| Plain CSS for touch UI | Tailwind CSS | If the team already knows Tailwind and the project scope grows significantly. Adding Tailwind to CRA 5 requires `craco` or ejecting, which is maintenance overhead for v1. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Material UI v5+ | Targets React 18+; installing on React 17 causes peer dependency warnings and potential breakage as MUI drops React 17 support | Use React Bootstrap 2.x if a component library is truly needed |
| `ws` (raw WebSocket) | No built-in reconnection, no rooms, no namespace support — you'd rebuild what Socket.IO provides for free | socket.io |
| SSE (EventSource) | One-directional only; kitchen needs to send status updates back to counter, so a bidirectional channel is required | socket.io |
| `moment.js` for date handling in reports | Deprecated and 67KB; the project has no existing date library | Use native `Date` methods or `date-fns` (tree-shakeable, ~10KB for needed functions) |
| Storing order `createdAt` as String (like menuItem does) | Date-range queries and `$match` aggregation become string comparisons, not date comparisons — queries will be incorrect or require post-processing | Store `createdAt` as `Date` type in the Order schema |

---

## Stack Patterns by Variant

**For the kitchen display route:**
- Use a dedicated React route (`/kitchen`) with its own socket connection
- Socket.IO room `kitchen` — counter emits `new-order` to room, kitchen listens
- Kitchen emits `order-complete` to server, server broadcasts to counter room
- This avoids any complex state sync — each screen only processes events relevant to it

**For the order-taking (counter) UI:**
- No WebSocket needed for building orders — purely local React state until submit
- WebSocket only fires on order submission (emit `new-order`) and receives `order-complete` events
- This keeps the counter UI simple; WebSocket is only needed at the edge of the transaction

**For daily sales reporting:**
- Build as a separate React route (`/reports` or `/sales`)
- Single GET API endpoint: `GET /api/v1/orders/daily-summary?date=YYYY-MM-DD`
- Returns aggregated totals from MongoDB; React renders with recharts bar chart
- No real-time needed here — daily summary is a manual refresh action

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| socket.io@4.x | Express@4.x | Confirmed compatible; attaches to `http.Server` not Express app directly |
| socket.io@4.x | socket.io-client@4.x | Major versions must match; mixing 3.x server with 4.x client breaks handshake |
| recharts@2.x | React@17.x | Recharts 2.x targets React 16/17; recharts 3.x (if released) targets React 18+ — stay on 2.x |
| cors@2.x | Express@4.x | Long-term compatibility; no concerns |

---

## Sources

- Existing codebase analysis (`src/index.js`, `src/database/menuItem.js`, `package.json`) — HIGH confidence
- Socket.IO official docs (unavailable during research session — WebFetch blocked) — version estimate from training data, MEDIUM confidence
- Recharts documentation (unavailable during research session) — version estimate from training data, MEDIUM confidence
- Node.js `http` module docs — built-in, no version concern, HIGH confidence
- Mongoose aggregation pipeline — built-in to existing dependency, HIGH confidence

---

*Stack research for: Tacos Tres Hermanos POS — real-time capabilities milestone*
*Researched: 2026-03-28*
