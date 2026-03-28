# Pitfalls Research

**Domain:** Food-service POS — order management, kitchen display, real-time sync
**Researched:** 2026-03-28
**Confidence:** HIGH (codebase inspected directly; pitfalls derived from known patterns in this exact stack and domain)

---

## Critical Pitfalls

### Pitfall 1: Order State Is Not a String — It's a State Machine

**What goes wrong:**
The order status field is stored as a free-form string (`"pending"`, `"ready"`, `"done"`). Code in the controller, service, and frontend each start hardcoding their own string literals. After two weeks you have `"pending"`, `"Pending"`, `"in-progress"`, and `"in_progress"` coexisting in the database. Filtering and display logic silently breaks for orders with the "wrong" string.

**Why it happens:**
The order stub has no schema yet. The first developer to implement it picks a string and moves on. There is no enum validation at the Mongoose layer or the API layer to prevent drift.

**How to avoid:**
Define the status enum in the Mongoose schema before writing any controller logic. Use `enum: ['pending', 'ready', 'complete', 'cancelled']` on the schema field. Add an express-validator check on the PATCH endpoint that rejects values outside the enum. Export the enum array as a constant shared by both server and client if possible, or document it in the OpenAPI spec so both sides agree.

**Warning signs:**
- The `updateOneOrder` PATCH handler accepts any string for `status` with no validation
- Status values are checked with `===` against inline string literals in multiple places
- Kitchen display shows different counts than the counter UI for the same order state

**Phase to address:**
Order API implementation phase — before any UI consumes order status.

---

### Pitfall 2: Real-Time Sync Built as an Afterthought

**What goes wrong:**
The counter UI and kitchen display are built as polling-or-nothing implementations: either the kitchen page refreshes every few seconds (hammering the server) or it never updates until the user manually refreshes. During a lunch rush this means the kitchen misses orders or works from a stale queue. The problem is discovered in production, not development.

**Why it happens:**
Real-time sync is deferred because "it works fine when I test it manually." Local testing masks the problem because the developer is on the same machine as the server and refreshes both tabs simultaneously.

**How to avoid:**
Decide on the sync mechanism during the order API phase, not during the kitchen display phase. The two realistic options for this stack are:
- **Server-Sent Events (SSE):** One-directional push from server to browser. Native in Node/Express, no extra library. Sufficient for the kitchen display use case (kitchen only reads, never writes orders from the display).
- **Socket.io:** Bidirectional. Adds a dependency but enables the counter UI to also receive confirmations. Heavier for a taco stand.

For this project, SSE is the correct choice: the kitchen display only needs to *receive* new orders and status changes. Implement the SSE endpoint at the same time as `createNewOrder` — not after.

**Warning signs:**
- Kitchen display is built before any real-time transport is chosen
- `createNewOrder` endpoint is implemented without any notification/event emission
- "We'll add real-time later" is said during planning

**Phase to address:**
Order API phase — SSE endpoint established alongside `POST /orders`. Kitchen display phase then consumes it.

---

### Pitfall 3: Order Items Stored as Name Strings Instead of Snapshots

**What goes wrong:**
An order is saved with `items: ["Carnitas Taco", "Agua de Jamaica"]`. The menu item prices later change. Historical orders now show incorrect totals because the order recalculates price by looking up the current menu. Daily sales reports become unreliable. Refund or recount scenarios are impossible to audit.

**Why it happens:**
The order is built on the frontend by tapping menu items. It is tempting to just send the names and have the server resolve prices at query time, treating the menu as the source of truth for all price calculations.

**How to avoid:**
Store a snapshot of each ordered item at the time of order creation: `{ name, price, quantity, options }`. The price field in the order item is immutable after creation — it records what the customer was charged, not the current menu price. This is the standard approach in every POS and e-commerce system for the same reason: historical accuracy.

**Warning signs:**
- Order schema design has only item names (or IDs) with no price field on the order item itself
- The order total is computed at read time by joining against the current menu collection
- There is no `lineTotal` or `subtotal` field on the order

**Phase to address:**
Order data model design — must be correct before `createNewOrder` is implemented.

---

### Pitfall 4: Touch Targets Too Small for Rush-Hour Use

**What goes wrong:**
Menu items are rendered as a standard HTML list or small cards. On a tablet with greasy fingers during a lunch rush, the staff member hits the wrong item, adds an incorrect quantity, or misses the button entirely. Errors require voiding and re-entering orders, slowing service exactly when speed matters most.

**Why it happens:**
Development happens on a desktop browser with a mouse. Everything looks fine and feels responsive. The touch-first constraint is forgotten when laying out components.

**How to avoid:**
- Minimum tap target: 48x48px (Google Material guideline for touch). For primary order-entry buttons (menu items), go larger: 72-96px height.
- Test the order-entry UI on an actual tablet (or browser device emulation with touch simulation) before considering the feature complete.
- Remove all hover-only affordances — hover does not exist on touch. Pressed/active states must be visible.
- Since the menu is under 15 items, use a grid of large tiles rather than a scrollable list. Scrollable lists require precise drag gestures that fail under time pressure.

**Warning signs:**
- Menu item components use default `<li>` or `<button>` sizing without explicit height/padding
- No touch testing performed during development
- The developer is only testing with a mouse

**Phase to address:**
Order-taking UI phase — enforce touch target sizes as an acceptance criterion before completion.

---

### Pitfall 5: The Brownfield Reconnection Bug — Mongoose Connected Twice

**What goes wrong:**
The existing `menuItem.js` database file calls `mongoose.connect()` at module load time. When the order database module is created by a different developer (or in a later phase), it also calls `mongoose.connect()`. Node.js loads both modules, and Mongoose emits a deprecation warning or, in some configurations, opens a second connection pool. In the worst case, the `database.once('connected')` handler never fires for one of the modules because the connection already happened.

**Why it happens:**
The existing codebase initializes the MongoDB connection inside `database/menuItem.js` (line 51 of the inspected file) rather than in a dedicated connection module. This is a common early-stage shortcut. Anyone adding a new database module copies the pattern.

**How to avoid:**
Extract the Mongoose connection setup into a single `database/connection.js` module that is required once at app startup (`app.js` or `server.js`). All model files (`menuItem.js`, `order.js`, etc.) should only define schemas and models — they should not call `mongoose.connect()`. This is the correct layered architecture: connection lifecycle managed in one place, models declared in their own files.

Do this refactor before implementing the order database module. It is a small change that prevents a class of subtle runtime bugs.

**Warning signs:**
- `mongoose.connect()` is called in `database/menuItem.js` at line 51 (confirmed in codebase)
- `database/order.js` is currently empty — the trap is set for whoever fills it in
- Console shows "Database Connected" multiple times on startup

**Phase to address:**
Order API implementation phase — fix connection architecture before adding the order model.

---

### Pitfall 6: Daily Sales Reports With No Indexed Date Field

**What goes wrong:**
The sales reporting feature queries all orders and filters in JavaScript, or runs a MongoDB `find()` with a date range on an unindexed string field. With 50 orders per day this is imperceptible. After a year of operation (18,000+ orders), the end-of-day report takes 10+ seconds or times out.

**Why it happens:**
At development time the database has 10-20 test orders. Everything is instant. No one thinks about indexes during initial schema design because the pain doesn't show up until production data accumulates.

**How to avoid:**
- Store `createdAt` as a proper `Date` type (not a string — the current `menuItem.js` stores timestamps as strings, which is incorrect). Use `Date.now` or a Mongoose middleware `pre('save')` to set it automatically.
- Add a MongoDB index on the `createdAt` field of the order schema: `orderSchema.index({ createdAt: 1 })`.
- Use MongoDB's aggregation pipeline for daily summaries rather than fetching all documents and summing in JS.

**Warning signs:**
- `createdAt` is stored as a formatted string (confirmed: `menuItem.js` uses `String` type for timestamps)
- No `.index()` calls in any schema definition
- Sales total is computed in service layer by iterating an array of order objects

**Phase to address:**
Order data model phase — correct timestamp type and add index before the collection accumulates data.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Timestamps as strings (`createdAt: String`) | Matches human-readable display format | Cannot do date-range queries in MongoDB; reports require JS filtering | Never — fix before adding order schema |
| `mongoose.connect()` in model files | Copy-paste from tutorial is fast | Double-connection bugs when second model file is added | Never — extract to connection.js before order model |
| Order items as name strings only (no price snapshot) | Simpler initial schema | Historical orders show wrong totals after price changes | Never for financial data |
| Polling instead of SSE for kitchen display | No new server code needed | Hammers server; orders missed between poll intervals | Only acceptable as a 1-day prototype to prove the UI before implementing SSE |
| Class-based React components for new UI | Consistent with existing `App.js` | Harder to share logic; hooks are the current standard; functional components are lighter | Only if existing class components must be extended; new components should use functions |
| No CORS configuration | Works in local dev | Blocks kitchen tablet on a different local IP from reaching the API | Never — add CORS before first multi-device test |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| React 17 + Express API | Leaving Axios pointed at Unsplash (`src/api/t3h.js`) — confirmed in codebase | Replace `baseURL` with the Express server URL; use an env var (`REACT_APP_API_URL`) so it works in both local dev and any future deployment |
| MongoDB + Mongoose | Calling `mongoose.connect()` in each model file | Single connection in `database/connection.js`, required at app startup |
| SSE in Express | Forgetting to set `Content-Type: text/event-stream` and `Cache-Control: no-cache` headers | Always set both headers; also disable Express response buffering with `res.flushHeaders()` immediately |
| Touch devices + CSS | Testing only in desktop Chrome's device emulation | Use real tablet or Chrome remote debugging to a physical device; emulation does not reproduce all touch event timing issues |
| MongoDB date queries | Storing dates as locale-formatted strings (`"4/20/2022, 2:21:56 PM"`) | Store as `Date` type; format for display in the UI layer only |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Fetching all orders to compute daily totals | Report endpoint is slow; memory spikes | MongoDB aggregation pipeline with `$match` on date range, `$group` for totals | ~500+ orders (a few weeks of operation) |
| Kitchen display polling every 2-5 seconds | Server handles steady background load even during idle periods; order latency up to 5 seconds | Replace with SSE — instant push, zero server load when idle | Immediately under any multi-tab load |
| Re-fetching full menu on every order-taking session | Extra round-trip on every page load | Cache menu in React state after first fetch; invalidate only on menu management save | Not a scale issue — a UX issue from day one (adds latency before first order) |
| Unindexed `status` field on orders | Kitchen display query by status is a full collection scan | Add `orderSchema.index({ status: 1, createdAt: -1 })` | ~1,000+ orders |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| No CORS configuration on Express | Kitchen tablet (different browser tab or IP) gets blocked, or — if wildcard `*` CORS is added without thought — the API is open to any origin | Configure CORS with `cors` npm package; allow only `localhost` origins in development; document which origins to allow when deploying to local network |
| Hardcoded MongoDB connection string with no env var | Connection string committed to git; if repo ever goes public the database is exposed | The code already has the pattern (`process.env.DATABASE_URL`) but it is commented out (line 48 of `menuItem.js`) — uncomment and enforce |
| No rate limiting on order creation | A bug in the UI could fire dozens of duplicate order submissions during a rush | Add `express-rate-limit` on `POST /api/v1/orders` with a per-IP limit (e.g., 30 requests/minute) — this is not auth, just a safety valve |
| Payment method stored without validation | Arbitrary strings reach the database; reporting breaks when `"Cash"`, `"cash"`, and `"CASH"` are all present | Validate `paymentMethod` as an enum: `['cash', 'card']` using express-validator, same pattern as other validators |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Confirmation dialog before every order submission | Adds an extra tap during every single order; slows service; staff learns to tap through it without reading | Skip confirmation; instead provide a clear undo/cancel state for 5-10 seconds after submission, or show the order in a "pending" state the staff can recall |
| Order total calculated only on submission | Staff member has to remember running total mentally; wrong orders submitted because cost wasn't visible | Show running total prominently in real time as items are tapped — this is the "core value" per PROJECT.md |
| Kitchen display uses order ID as identifier | Kitchen staff must cross-reference IDs to understand what to make | Display order number (short sequential number) plus item names and quantities prominently; IDs are for computers |
| Menu item tiles in alphabetical order | Slowest items to reach are wherever A-Z lands; high-volume items buried | Order menu tiles by frequency of order (or allow the owner to set a display order); most-ordered items should be in the top-left zone of the grid |
| No visual feedback on item tap | Touch devices have ~100ms tap latency; double-taps happen if there is no immediate visual response | Add CSS `:active` style or a brief highlight animation on tap; update quantity counter immediately on tap before the API call completes |

---

## "Looks Done But Isn't" Checklist

- [ ] **Order submission:** Verify the order is actually persisted to MongoDB, not just acknowledged with a 200. The current stub returns a string — easy to overlook when the UI shows "success."
- [ ] **Kitchen display:** Verify it receives orders submitted from a *different* browser tab or device, not just from the same browser session that submitted them.
- [ ] **Real-time sync:** Verify the kitchen display updates when a new order is submitted *without* the kitchen tab being refreshed.
- [ ] **Daily sales report:** Verify totals are correct when the day spans midnight (UTC vs. local time zone difference). Test with orders at 11:59 PM and 12:01 AM.
- [ ] **Order status update:** Verify that marking an order complete on the kitchen display is reflected on the counter within the real-time update window (not just on next page load).
- [ ] **Menu management:** Verify that editing a menu item price does not change the displayed total of already-submitted orders.
- [ ] **Touch UX:** Verify the order-taking UI is usable with finger taps on a real tablet, not just mouse clicks on a desktop browser.
- [ ] **CORS:** Verify the kitchen tablet (separate device or separate browser) can reach the Express API without CORS errors.
- [ ] **Connection string:** Verify `DATABASE_URL` env var is used and the commented-out line in `menuItem.js` is not the active connection path.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Order status enum drift (mixed strings in DB) | MEDIUM | Write a one-time migration script to normalize all status values; add Mongoose enum validation to prevent recurrence |
| Timestamps stored as strings | HIGH | Write a migration to convert all string dates to `Date` objects; test report queries against migrated data; high cost because it touches every document |
| Mongoose double-connection | LOW | Extract connection to `database/connection.js`; remove `mongoose.connect()` from model files; restart server and verify single "Database Connected" log line |
| Polling instead of SSE | MEDIUM | SSE can be added alongside polling as a drop-in: add the SSE endpoint, update the kitchen display to use `EventSource`, remove the polling interval |
| Order items without price snapshot | HIGH | Requires schema migration; historical orders cannot be retroactively fixed if prices have already changed; catch before any real orders are stored |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Order status enum drift | Order API implementation | PATCH `/orders/:id` rejects status values outside the defined enum |
| Real-time sync afterthought | Order API implementation (SSE endpoint alongside POST) | Submit order from Tab A; kitchen display in Tab B updates within 1 second without refresh |
| Order items without price snapshot | Order data model design | POST `/orders` stores `price` on each line item; GET `/orders/:id` returns original price even after menu item price is changed |
| Touch targets too small | Order-taking UI | Order can be entered and submitted on a tablet using only touch with no mis-taps in 10 consecutive test orders |
| Mongoose double-connection | Order API implementation (before order model added) | Server starts with exactly one "Database Connected" log line |
| Unindexed date field | Order data model design | Order schema includes `createdAt: Date` with `orderSchema.index({ createdAt: 1 })` |
| Hardcoded MongoDB connection string | Order API / brownfield reconnection cleanup | `.env` file is the only place the connection string appears; `menuItem.js` line 48 uses `process.env.DATABASE_URL` |
| No CORS | API setup / counter-kitchen wiring phase | Kitchen tablet on separate browser session can call `GET /api/v1/orders` without CORS error |
| Payment method without enum validation | Order API implementation | POST `/orders` with `paymentMethod: "bitcoin"` returns 400 |

---

## Sources

- Direct codebase inspection: `tacos-tres-hermanos-pos-server/src/database/menuItem.js` (timestamp-as-string pattern, double-connect risk)
- Direct codebase inspection: `tacos-tres-hermanos-pos-server/src/v1/controllers/orderController.js` (stub with no persistence)
- Direct codebase inspection: `tacos-tres-hermanos-pos-ui/src/components/App.js` (Unsplash placeholder, class component pattern)
- Direct codebase inspection: `tacos-tres-hermanos-pos-server/src/database/order.js` (empty file — confirms order model not yet designed)
- Domain knowledge: Standard POS design patterns (order snapshot pricing, status state machines, touch-first UI)
- Domain knowledge: MongoDB performance patterns (index design, aggregation vs. application-layer filtering)
- Domain knowledge: Express + SSE pattern for lightweight real-time push in Node.js

---
*Pitfalls research for: Food-service POS (taco stand) — Express + React + MongoDB*
*Researched: 2026-03-28*
