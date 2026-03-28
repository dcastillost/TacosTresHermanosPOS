# Phase 1: Foundation - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire the React frontend to the Express API (replace Unsplash placeholder), refactor the Mongoose connection to a single shared module, and implement the order data model with correct schema decisions. No UI features — this phase establishes the data and connectivity foundation everything else builds on.

</domain>

<decisions>
## Implementation Decisions

### Order Schema Shape
- **D-01:** Orders store an embedded array of item snapshots: `{ name: String, price: Number, quantity: Number }`. No references to MenuItem documents — prices are frozen at order time.
- **D-02:** Order fields: `orderNumber` (auto-incrementing Number), `items` (embedded array), `total` (Number, calculated server-side from items), `paymentMethod` (enum: `cash`/`card`), `status` (enum: `pending`/`completed`/`cancelled`), `createdAt` (Date), `updatedAt` (Date).
- **D-03:** No tax or tip fields for v1 — taco stand uses simple flat pricing.
- **D-04:** Timestamps use native `Date` type (not locale strings like menuItem). Critical for MongoDB aggregation in Phase 4.

### Order Numbering & Lifecycle
- **D-05:** Order numbers auto-increment per day, starting at 1 each day. Simple counter — find today's max order number + 1.
- **D-06:** New orders start as `pending`. Kitchen marks them `completed`. `cancelled` is available but no cancel UI in v1 — API-only for now.

### API Connection Strategy
- **D-07:** Replace Unsplash axios instance in `src/api/t3h.js` with Express API baseURL. Use CRA proxy (`"proxy": "http://localhost:3000"` in UI `package.json`) for development so relative URLs work without CORS issues during dev.
- **D-08:** Also install `cors` middleware on the Express server for production/cross-origin scenarios (kitchen tablet on different port or IP).

### Mongoose Connection Refactor
- **D-09:** Extract `mongoose.connect()` from `database/menuItem.js` into a new `database/connection.js` module. Both `menuItem.js` and the new `order.js` import the connection — no duplicate connect calls.
- **D-10:** Connection module exports the `database` (mongoose.connection) object for health checks.

### Order API Endpoints
- **D-11:** Complete the order stub with full CRUD following existing menuItem pattern: routes → controllers → services → database.
- **D-12:** Endpoints: `GET /api/v1/orders` (all, with optional date filter), `GET /api/v1/orders/:orderNumber`, `POST /api/v1/orders`, `PATCH /api/v1/orders/:orderNumber` (status update), `DELETE /api/v1/orders/:orderNumber`.
- **D-13:** Add express-validator middleware for order creation (validate items array, paymentMethod enum).

### Claude's Discretion
- Order schema shape details (all infrastructure decisions)
- API connection strategy (proxy vs direct)
- Mongoose refactor approach
- Validation rule specifics
- Error response format (follow existing menuItem pattern)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Server Patterns
- `tacos-tres-hermanos-pos-server/src/index.js` — Express app setup, route registration, port config
- `tacos-tres-hermanos-pos-server/src/database/menuItem.js` — Mongoose connection (to be refactored), MenuItem schema, CRUD pattern to follow
- `tacos-tres-hermanos-pos-server/src/v1/controllers/menuItemController.js` — Controller pattern with catch500Error helper
- `tacos-tres-hermanos-pos-server/src/v1/services/menuItemService.js` — Service layer pattern with timestamp management
- `tacos-tres-hermanos-pos-server/src/v1/validators/menuItemValidator.js` — Validator middleware pattern
- `tacos-tres-hermanos-pos-server/src/v1/routes/menuItemRoutes.js` — Route definition pattern with OpenAPI JSDoc

### Existing Order Stubs
- `tacos-tres-hermanos-pos-server/src/database/order.js` — Empty file, needs full implementation
- `tacos-tres-hermanos-pos-server/src/v1/controllers/orderController.js` — Stub controller
- `tacos-tres-hermanos-pos-server/src/v1/services/orderService.js` — Stub service
- `tacos-tres-hermanos-pos-server/src/v1/routes/orderRoutes.js` — Stub routes

### Frontend Connection
- `tacos-tres-hermanos-pos-ui/src/api/t3h.js` — Axios instance (currently Unsplash, needs replacement)
- `tacos-tres-hermanos-pos-ui/package.json` — CRA config, add proxy setting here

### Research
- `.planning/research/STACK.md` — Library recommendations (cors, socket.io, recharts)
- `.planning/research/ARCHITECTURE.md` — Component boundaries and data flow
- `.planning/research/PITFALLS.md` — Schema design pitfalls, double-connection trap

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `menuItem.js` database layer: Full CRUD pattern to replicate for orders
- `menuItemController.js`: `catch500Error()` helper — reuse for order controller
- `menuItemValidator.js`: Validation middleware pattern — replicate for orders
- `menuItemRoutes.js`: OpenAPI JSDoc annotation pattern — replicate for orders

### Established Patterns
- CommonJS modules throughout server (`require`/`module.exports`)
- Layered MVC: routes → validators → controllers → services → database
- Response envelope: `{ status: "OK"|"FAILED", data: ... }`
- Error objects with `{ status: <code>, message: <msg> }` thrown from database layer
- Timestamps managed in service layer (not database layer)

### Integration Points
- `src/index.js` line 17: `app.use('/api/v1/orders', v1OrderRouter)` — already registered
- `database/menuItem.js` line 51: `mongoose.connect()` — must be extracted to connection.js
- `src/api/t3h.js`: Axios instance — replace baseURL and headers
- `module.exports = app.listen(...)` in index.js — exports server (useful for testing, will need refactor for Socket.IO in Phase 2)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User deferred all infrastructure decisions to Claude's discretion.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-28*
