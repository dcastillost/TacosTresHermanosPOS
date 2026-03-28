# Project Research Summary

**Project:** Tacos Tres Hermanos POS
**Domain:** Quick-service food-service point-of-sale (taco stand)
**Researched:** 2026-03-28
**Confidence:** MEDIUM (stack versions estimated from training data; architecture and pitfalls HIGH based on direct codebase inspection)

## Executive Summary

This is a brownfield food-service POS project built on an existing Express.js + React 17 + MongoDB stack. The core loop — staff builds an order on a tablet, submits it, kitchen sees it and marks it done — is the entire product. Research confirms that the core interaction model is identical to Square and Toast in quick-service mode, but the complexity from those systems (modifiers, inventory, multi-location, payment processing) does not apply here. A focused implementation that covers the order-taking screen, order API backend, and kitchen display is a complete, shippable product for a one-location taco stand.

The recommended approach is additive to the existing stack. Only three new dependencies are needed: `cors` (unblocks UI-to-API communication, a day-one requirement), `socket.io` + `socket.io-client` (real-time kitchen display), and `recharts` (sales charting). The existing Express routes, Mongoose schemas, and React class component pattern should be extended, not replaced. The order resource is the single most important thing to build — it is a stub today, and every feature depends on it.

The critical risks are not feature risks — they are data model risks. Three decisions made during order schema design have permanent consequences: storing timestamps as native `Date` objects (not strings like the existing `menuItem` schema does), embedding item price snapshots on each order line item (not referencing current menu prices), and defining status as a validated enum (not a free-form string). Get these three right before writing any controller or UI code, and the rest of the implementation is straightforward. The Mongoose double-connection pattern in the existing codebase is also a trap that must be corrected before the order model is added.

## Key Findings

### Recommended Stack

The existing stack (Express 4.17.3, React 17.0.2, Mongoose 6.3.0, Axios 0.26.1) is fully capable of delivering this product without replacement or major upgrades. The additions are minimal and targeted: `cors` middleware is needed immediately to allow the React dev server (port 3001) to call Express (port 3000); Socket.IO 4.x is the correct choice for real-time kitchen display because it handles reconnection, room-based broadcasting, and the bidirectional status-update flow; `recharts` 2.x is the right charting library because it works as pure React components with React 17 without the canvas-lifecycle cleanup that Chart.js requires.

Socket.IO integration requires a one-time refactor of `src/index.js` to use `http.createServer(app)` before calling `listen()` — this is a constraint of how Socket.IO attaches to an HTTP server. The existing test suite (chai-http) will continue working because it attaches to the same exported server instance. No UI component library is recommended for v1; the order-taking grid needs large tap targets, which is 30-50 lines of CSS, not a framework problem.

**Core technologies:**
- `cors ^2.8.5`: Cross-origin access from React UI to Express — needed before first multi-device test
- `socket.io ^4.7.x` (server) + `socket.io-client ^4.7.x` (React): Real-time kitchen display — major versions must match
- `recharts ^2.10.x`: Daily sales charts in React — pure SVG components, React 17 compatible, no canvas cleanup needed
- Mongoose aggregation pipeline (existing): Daily sales queries — no new library; `$match` + `$group` on the orders collection

See `.planning/research/STACK.md` for version compatibility details and the `index.js` refactor pattern.

### Expected Features

The core loop (tap menu item → build order → submit → kitchen sees it → mark done) is the entire v1 product. Every other feature is either a supporting enabler (menu management, availability toggle) or a post-launch addition.

**Must have (table stakes):**
- Order-taking UI (menu grid, tap-to-add, running total) — without this there is no product
- Order submission with payment method (cash/card) — completes the core loop
- Order API backend (create, read, status update) — required by both counter and kitchen; currently a stub
- Kitchen display (pending orders list, mark complete) — without this, orders go nowhere
- Item availability toggle (86 items mid-service) — daily operational need; `availability` field already in schema
- Menu management UI (CRUD for menu items) — owner must control the menu without touching the database

**Should have (competitive):**
- Order history (paginated list by date) — owner will ask "what did we sell last Tuesday?" after the first shift
- Daily sales summary (totals by payment method) — end-of-day reconciliation
- Real-time kitchen display via Socket.IO — upgrade from polling once staff experience lag; most valuable differentiator
- Order notes / special instructions — staff will verbally relay modifications that should be on the ticket
- Category tabs on order screen — needed once menu exceeds ~12 items

**Defer (v2+):**
- Receipt printing — requires hardware driver integration; complicates order flow if printer goes offline
- User authentication — friction outweighs security benefit for a 2-4 person trust-based team
- Inventory / stock tracking — wrong counts are worse than no counts; use the availability toggle
- Payment processing (Stripe/Square) — PCI scope, refund flows, regulatory overhead for marginal gain when a physical terminal already exists
- Modifier / customization sub-menus — use free-text order notes for edge cases; modifier trees are a product unto themselves

See `.planning/research/FEATURES.md` for full dependency tree and prioritization matrix.

### Architecture Approach

The architecture is a standard layered Express MVC extended with a Socket.IO server on the same HTTP port and a dedicated React route per operational context (counter `/`, kitchen `/kitchen`, menu management `/menu`, history `/history`, summary `/summary`). The order flow is: HTTP POST from counter → controller saves to MongoDB → controller emits `new-order` socket event → kitchen display receives event and adds order card without polling. Sales reporting uses a MongoDB aggregation pipeline endpoint (`GET /api/v1/orders/summary?date=YYYY-MM-DD`) so only summary numbers travel over the wire, not full order documents.

**Major components:**
1. Counter UI (`/`) — build order from menu grid, show running total, submit via HTTP POST
2. Kitchen Display UI (`/kitchen`) — receive new orders via Socket.IO, mark complete via HTTP PATCH
3. Order API (routes → validator → controller → service → database) — the central new backend piece; follows existing layered pattern exactly
4. Socket.IO server (`src/socket.js` singleton) — attached to existing HTTP server, emits events after confirmed DB writes
5. Menu Management UI (`/menu`) — wires existing menu item API endpoints to a React admin form
6. Sales Summary UI (`/summary`) — renders MongoDB aggregation output via recharts bar chart

Key data model decision: orders embed item price snapshots `{ name, price, quantity }` rather than referencing menu items. This is standard MongoDB practice for financial records — historical accuracy requires that prices are frozen at the time of the order.

See `.planning/research/ARCHITECTURE.md` for full data flow diagrams, component structure layout, and code examples for all four core patterns.

### Critical Pitfalls

1. **Order schema designed without enum validation on status** — Mixed status strings accumulate in the database; kitchen display filter logic silently breaks. Define `enum: ['pending', 'completed', 'cancelled']` on the Mongoose schema and validate on the PATCH endpoint before writing any controller or UI code.

2. **Timestamps stored as strings (copying the existing menuItem pattern)** — The current `menuItem.js` stores `createdAt` as a locale-formatted string. This pattern cannot be used on orders — MongoDB date-range queries (`$match` with `$gte`/`$lte`) require native `Date` objects. Store `createdAt: Date` on the order schema and add `orderSchema.index({ createdAt: 1 })` before the collection accumulates data.

3. **Order items stored without price snapshots** — Saving only item names and looking up current prices at query time means historical totals change when menu prices change. Store `{ name, price, quantity }` on each order line item. Recovery cost is HIGH if real orders have already been stored under the wrong schema.

4. **Mongoose double-connection** — `database/menuItem.js` calls `mongoose.connect()` at module load time. Anyone adding `database/order.js` will copy this pattern, creating two connection attempts. Extract the connection to a dedicated `database/connection.js` before adding the order model.

5. **Real-time sync treated as a follow-on feature** — Kitchen display built with polling "for now" becomes permanent. Decide on Socket.IO during the order API phase, implement the server-side emit in the same sprint as `createNewOrder`, and the kitchen display implementation becomes trivial.

See `.planning/research/PITFALLS.md` for the full pitfall-to-phase mapping, verification checklists, and recovery strategies.

## Implications for Roadmap

Based on research, the architecture build-order is clear and the dependencies are hard. The suggested phase structure follows the dependency map from ARCHITECTURE.md.

### Phase 1: Foundation — Order API and API Connection

**Rationale:** Every other feature depends on the order schema and a working React-to-API connection. The Axios instance in `src/api/t3h.js` currently points at Unsplash. Fix this and implement the order model before building any UI feature, or UI development happens against a fake API and has to be redone.

**Delivers:** Fully implemented order resource (schema, CRUD, status transitions), CORS configured, Axios pointed at POS server, MongoDB connection extracted to `database/connection.js`.

**Addresses:** Order API backend (P1), foundational enabler for all other features.

**Avoids:** Mongoose double-connection pitfall, timestamp-as-string pitfall, order items without price snapshot, order status enum drift, missing CORS blocker. All six of the highest-recovery-cost pitfalls are addressed here.

**Research flags:** Standard patterns — no phase research needed. The order schema shape, layered service pattern, and connection architecture are fully specified in ARCHITECTURE.md.

### Phase 2: Core Order-Taking Loop — Counter UI + Kitchen Display

**Rationale:** With a working order API, both the counter and kitchen UIs can be built and tested end-to-end. These two views are the product. Build them together so the full loop (submit order → kitchen sees it → mark done) can be validated in a single phase.

**Delivers:** Counter UI (menu grid, tap-to-add, running total, submit), Kitchen Display (pending orders list, mark-complete button), item availability toggle wired to both views.

**Uses:** Socket.IO (server and client), CORS, the order API from Phase 1.

**Implements:** Counter UI component (`/`), Kitchen Display component (`/kitchen`), Socket.IO server singleton (`src/socket.js`), Socket.IO client singleton (`src/socket.js` in UI).

**Avoids:** Touch targets too small pitfall (enforce 72px+ tap targets as acceptance criterion), polling anti-pattern (Socket.IO is built in this phase, not deferred), multiple socket client instantiation anti-pattern.

**Research flags:** Standard patterns for Socket.IO integration are fully specified in ARCHITECTURE.md (Patterns 1-4 with code examples). No additional research needed.

### Phase 3: Menu Management UI

**Rationale:** All menu item API endpoints already exist and are tested. This phase wires them to a React UI. It is lower risk than the order loop and can be delivered independently. The owner needs this before going live to manage the menu without direct database access.

**Delivers:** Menu management admin view (`/menu`) — add, edit, delete menu items, set prices, toggle availability.

**Addresses:** Menu management UI (P1), item availability toggle admin side.

**Avoids:** No new pitfalls introduced — purely consuming existing, tested API endpoints.

**Research flags:** Skip research. The menu item API is complete and well-tested. Standard REST + React form pattern.

### Phase 4: Order History and Daily Sales Summary

**Rationale:** These features depend on real order data accumulating from Phases 2-3. They are P2 features that require the order collection to exist and be populated. Sales summary specifically requires the MongoDB aggregation pipeline and the `recharts` chart component.

**Delivers:** Order history view (`/history`) with date filter, Daily sales summary view (`/summary`) with revenue totals and payment method breakdown rendered as a bar chart.

**Uses:** Recharts, MongoDB aggregation pipeline (`getDailySummary()`), existing Mongoose 6.3.0.

**Implements:** OrderHistory component, DailySummary component, `GET /api/v1/orders/summary` endpoint with aggregation.

**Avoids:** Fetching all orders to compute totals in Node.js (use aggregation pipeline), unindexed date field (index set in Phase 1).

**Research flags:** Skip research. MongoDB aggregation pattern is fully specified in ARCHITECTURE.md (Pattern 3 with code example). Recharts usage is standard React component pattern.

### Phase Ordering Rationale

- Phase 1 must come first because the order schema drives all other features and three data model decisions (Date type, price snapshots, status enum) have irreversible consequences if made incorrectly with real data in the database.
- Phase 2 groups counter + kitchen together because the end-to-end loop is untestable if either half is missing; testing half a loop is not useful validation.
- Phase 3 (menu management) can technically come before Phase 2 since it uses only the existing menu item API, but it is lower operational priority — staff can manage the menu directly through the API during Phase 2 testing.
- Phase 4 comes last because it aggregates data from Phases 2-3; it is meaningless to build sales reporting before any orders exist.

### Research Flags

Phases with standard patterns (skip research-phase):
- **Phase 1:** Order schema design follows documented Mongoose patterns; connection architecture is a standard Node.js refactor; all patterns are specified in ARCHITECTURE.md.
- **Phase 2:** Socket.IO 4.x integration with Express is battle-tested; code examples provided in ARCHITECTURE.md cover all integration points.
- **Phase 3:** Entirely within the existing menu item API surface; no new technology.
- **Phase 4:** MongoDB aggregation `$group` with `$match` is documented and example provided; recharts is a standard React chart library.

No phases require a `/gsd:research-phase` call. All patterns are covered in the research files.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Existing libraries confirmed via codebase. New library versions (socket.io 4.7.x, recharts 2.10.x) estimated from training data — verify with `npm show [package] version` before pinning. |
| Features | HIGH | Domain is well-established (Square/Toast/Clover reference patterns); existing codebase confirms schema state; feature dependency tree derived from direct code inspection. |
| Architecture | HIGH | Socket.IO + Express shared HTTP server pattern is documented and stable; MongoDB aggregation confirmed via official docs; all code examples in ARCHITECTURE.md are from confirmed patterns. |
| Pitfalls | HIGH | Five of six critical pitfalls identified directly from codebase inspection (confirmed string timestamps, confirmed double-connect risk, confirmed empty order.js stub, confirmed Unsplash baseURL). Not speculative. |

**Overall confidence:** HIGH for architecture, pitfalls, and features. MEDIUM for specific library versions — confirm before installing.

### Gaps to Address

- **Socket.IO exact patch version:** `npm show socket.io version` before pinning `^4.7.x`. Major version (4.x) is confirmed correct; patch version is estimated.
- **Recharts exact version:** `npm show recharts version` before pinning `^2.10.x`. Confirm recharts 2.x is still the React 17 compatible branch (recharts 3.x, if released, targets React 18+).
- **CORS allowed origins for local network deployment:** During development `localhost:3001` is sufficient. When deploying to a local network (kitchen tablet on a different IP), the CORS `origin` option needs the server's local network IP. Document this in the implementation.
- **MongoDB connection string:** The `.env` Atlas connection string is confirmed commented out in `menuItem.js` line 48. The team must decide whether to use the local MongoDB instance permanently or configure Atlas. This does not block development but should be resolved before any production-like deployment.

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection: `tacos-tres-hermanos-pos-server/src/database/menuItem.js` — timestamp-as-string pattern, double-connect risk, connection string status
- Direct codebase inspection: `tacos-tres-hermanos-pos-server/src/database/order.js` — confirmed empty; no schema yet
- Direct codebase inspection: `tacos-tres-hermanos-pos-server/src/v1/controllers/orderController.js` — confirmed stub with no persistence
- Direct codebase inspection: `tacos-tres-hermanos-pos-ui/src/api/t3h.js` — confirmed Unsplash baseURL
- MongoDB aggregation `$group`/`$match` official docs — verified via WebFetch during architecture research
- Express + Socket.io shared HTTP server pattern — standard Socket.io documentation pattern, no deprecation risk

### Secondary (MEDIUM confidence)
- Socket.IO v4 server initialization docs (WebFetch blocked during research) — pattern confirmed from training data; Socket.IO 4.x stable since 2021
- Recharts 2.x React 17 compatibility — training data; React version compatibility confirmed by library release history
- Square for Restaurants / Toast POS feature analysis — training data; no live verification; used for competitor feature benchmarking only

### Tertiary (LOW confidence)
- Exact patch version of socket.io (4.7.x) — estimate from training data; verify before use
- Exact patch version of recharts (2.10.x) — estimate from training data; verify before use

---
*Research completed: 2026-03-28*
*Ready for roadmap: yes*
