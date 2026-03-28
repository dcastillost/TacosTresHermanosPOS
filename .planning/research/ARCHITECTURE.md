# Architecture Research

**Domain:** Food-service POS — real-time order flow + sales reporting on existing Express/React/MongoDB stack
**Researched:** 2026-03-28
**Confidence:** HIGH (Socket.io + Express integration is well-documented; MongoDB aggregation confirmed via official docs; patterns are battle-tested in this domain)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
│                                                                      │
│  ┌─────────────────────┐          ┌──────────────────────────────┐   │
│  │   Counter UI        │          │   Kitchen Display UI         │   │
│  │  /                  │          │   /kitchen                   │   │
│  │  - Build order      │          │   - Incoming orders queue    │   │
│  │  - Tap menu items   │          │   - Mark order complete      │   │
│  │  - Submit order     │          │                              │   │
│  └──────────┬──────────┘          └──────────────┬───────────────┘   │
│             │  HTTP POST                          │  Socket.io        │
│             │  (submit order)                     │  (new-order event)│
│  ┌──────────┴────────────────────────────────────┴───────────────┐   │
│  │                     Socket.io Client                          │   │
│  │         (shared, initialized once in React app)               │   │
│  └──────────────────────────────┬─────────────────────────────── ┘   │
└─────────────────────────────────│────────────────────────────────────┘
                                  │  WebSocket + HTTP
┌─────────────────────────────────│────────────────────────────────────┐
│                         SERVER LAYER                                  │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  Express HTTP Server (existing)                                │   │
│  │  routes → validators → controllers → services → database      │   │
│  │                                                                │   │
│  │  POST /api/v1/orders  →  createOrder()  →  emit('new-order')  │   │
│  │  PATCH /api/v1/orders/:id  →  updateStatus()  →  emit(...)    │   │
│  │  GET /api/v1/orders/summary  →  aggregation pipeline          │   │
│  └──────────────────────────┬─────────────────────────────────── ┘   │
│                             │                                         │
│  ┌──────────────────────────┴──────────────────────────────────── ┐   │
│  │  Socket.io Server (attached to same HTTP server instance)      │   │
│  │  - Namespace: /orders                                          │   │
│  │  - Events emitted by controllers after DB write succeeds       │   │
│  └─────────────────────────────────────────────────────────────── ┘   │
└──────────────────────────────────────┬────────────────────────────────┘
                                       │
┌──────────────────────────────────────┴────────────────────────────────┐
│                         DATA LAYER                                     │
│                                                                        │
│  ┌──────────────────┐     ┌──────────────────────────────────────┐    │
│  │  menuItems       │     │  orders                              │    │
│  │  collection      │     │  collection                          │    │
│  │  (existing)      │     │  { items[], total, status,           │    │
│  │                  │     │    paymentMethod, createdAt }        │    │
│  └──────────────────┘     └──────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| Counter UI (`/`) | Build order from menu, display running total, submit | REST API (POST order), Socket.io (receive status updates) |
| Kitchen Display UI (`/kitchen`) | Show pending orders in arrival order, mark complete | Socket.io (receive new-order events), REST API (PATCH status) |
| Menu Management UI (`/menu`) | Add, edit, remove menu items and prices | REST API (existing menuItems endpoints) |
| Order History UI (`/history`) | Browse past orders, filter by date | REST API (GET orders with date filter) |
| Daily Summary UI (`/summary`) | End-of-day totals and breakdown | REST API (GET orders/summary) |
| Socket.io Server | Broadcast order events to all connected clients | Receives calls from controllers; pushes to clients |
| Order Controller | Handle HTTP requests for order CRUD, trigger socket events | orderService, Socket.io instance |
| Order Service | Business logic: timestamps, status transitions, totals | Order database layer |
| Order Database | Mongoose schema, CRUD, aggregation pipeline for sales | MongoDB orders collection |

## Recommended Project Structure

```
tacos-tres-hermanos-pos-server/src/
├── index.js                     # Modified: create http.Server, attach socket.io
├── socket.js                    # New: socket.io server setup, io instance export
├── v1/
│   ├── routes/
│   │   ├── menuItemRoutes.js    # Existing (unchanged)
│   │   └── orderRoutes.js       # Existing (flesh out stubs)
│   ├── validators/
│   │   ├── menuItemValidator.js # Existing (unchanged)
│   │   └── orderValidator.js    # New: validate order body
│   ├── controllers/
│   │   ├── menuItemController.js # Existing (unchanged)
│   │   └── orderController.js    # Existing (implement stubs + emit events)
│   ├── services/
│   │   ├── menuItemService.js    # Existing (unchanged)
│   │   └── orderService.js       # Existing (implement: status, totals, timestamps)
│   └── swagger.js               # Existing (add order schemas)
└── database/
    ├── menuItem.js              # Existing (unchanged)
    ├── order.js                 # Existing (implement schema + CRUD + aggregation)
    └── db.js                    # Existing MongoDB connection

tacos-tres-hermanos-pos-ui/src/
├── api/
│   └── t3h.js                  # Modify: point at POS server (remove Unsplash)
├── socket.js                   # New: single socket.io-client instance, exported
├── components/
│   ├── App.js                  # Modify: add routes for new views
│   ├── counter/
│   │   ├── CounterView.js      # New: order-taking screen
│   │   ├── MenuGrid.js         # New: tap-to-add menu items
│   │   └── OrderSummary.js     # New: running order with total
│   ├── kitchen/
│   │   └── KitchenDisplay.js   # New: incoming orders + complete button
│   ├── menu/
│   │   └── MenuManagement.js   # New: admin CRUD for menu items
│   └── history/
│       ├── OrderHistory.js     # New: past orders list
│       └── DailySummary.js     # New: sales report
```

### Structure Rationale

- **`socket.js` (server):** Isolating socket.io initialization from `index.js` prevents circular dependency when controllers need to `require` the `io` instance to emit events. The `io` object is created once and exported; controllers import it as a module.
- **`socket.js` (client):** One socket instance shared across React components. Prevents multiple connections when different views mount. Exported as a singleton from a module file.
- **Feature folders in UI:** Counter, kitchen, and history are distinct operational contexts with no shared components. Grouping by feature rather than component type makes navigation obvious for a small team.
- **Order layer unchanged structure:** All new order code follows the existing routes → validators → controllers → services → database path. No deviation from the established pattern.

## Architectural Patterns

### Pattern 1: Attach Socket.io to Existing HTTP Server

**What:** Socket.io wraps the same `http.Server` instance that Express listens on. Both HTTP and WebSocket traffic use the same port. No second server or port needed.

**When to use:** Always — this is the standard integration for Express + Socket.io. Avoids CORS configuration for WebSocket connections when both are on the same origin.

**Trade-offs:** Simple setup, no extra port, but the `io` instance must be created before routes load if controllers need to emit. Use a module-level singleton to solve this.

**Example:**
```javascript
// src/index.js
const http = require('http');
const express = require('express');
const { initSocket } = require('./socket');

const app = express();
const server = http.createServer(app);
initSocket(server);  // attaches io to server, makes io importable

// ... register routes
server.listen(PORT);
```

```javascript
// src/socket.js
const { Server } = require('socket.io');
let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: 'http://localhost:3001' }  // CRA dev server port
  });
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
  });
  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
```

### Pattern 2: Emit After Confirmed DB Write

**What:** The controller emits socket events only after the database write succeeds. The event carries the full saved order document so clients don't need a follow-up fetch.

**When to use:** Every mutation (create order, update status) that the kitchen display needs to react to.

**Trade-offs:** The kitchen display gets the full order payload in the event — no extra HTTP round-trip. If the DB write fails, no event fires, so the kitchen display stays consistent with the database.

**Example:**
```javascript
// src/v1/controllers/orderController.js
const { getIO } = require('../../socket');

const createNewOrder = async (req, res) => {
  try {
    const newOrder = await orderService.createNewOrder(req.body);
    getIO().emit('new-order', newOrder);  // broadcast to all clients
    res.status(201).json({ status: 'OK', data: newOrder });
  } catch (error) {
    res.status(error.status || 500).json({ status: 'FAILED', data: { error: error.message } });
  }
};

const updateOneOrder = async (req, res) => {
  try {
    const updated = await orderService.updateOrderStatus(req.params.orderId, req.body.status);
    getIO().emit('order-updated', updated);
    res.status(200).json({ status: 'OK', data: updated });
  } catch (error) {
    res.status(error.status || 500).json({ status: 'FAILED', data: { error: error.message } });
  }
};
```

### Pattern 3: MongoDB Aggregation Pipeline for Sales Summary

**What:** A single `aggregate()` call in the order database layer computes daily totals, item breakdowns, and payment method splits. No application-level looping over fetched documents.

**When to use:** The daily summary endpoint (`GET /api/v1/orders/summary`). Accept `?date=YYYY-MM-DD` query param; default to today.

**Trade-offs:** Aggregation runs in the database — fast even with hundreds of orders. More complex to read than a `.find()` call. Worth it because the alternative (fetch all orders, sum in Node.js) becomes slow as history grows and creates large payloads.

**Example:**
```javascript
// src/database/order.js
const getDailySummary = async (dateString) => {
  const start = new Date(dateString);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateString);
  end.setHours(23, 59, 59, 999);

  return Order.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, status: 'completed' } },
    { $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        orderCount: { $sum: 1 },
        cashOrders: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'cash'] }, 1, 0] } },
        cardOrders: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'card'] }, 1, 0] } }
    }}
  ]);
};
```

Note: The existing codebase stores timestamps as locale strings (`toLocaleString`). For aggregation date range queries to work, `createdAt` on orders should be stored as native `Date` objects (not strings). This is a schema design decision to make at order implementation time.

### Pattern 4: Singleton Socket Client in React

**What:** One `socket.io-client` connection initialized at module load time, exported as a singleton. Components import it directly — no prop drilling, no Context API needed for this scale.

**When to use:** This app. Two views need socket access (Counter, Kitchen). Context API is the right pattern above ~5 components; a module singleton is simpler here.

**Trade-offs:** Simple. No React Context boilerplate. Works with class-based components (the existing pattern) via `componentDidMount`/`componentWillUnmount` for subscribe/unsubscribe.

**Example:**
```javascript
// src/socket.js
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000');
export default socket;
```

```javascript
// src/components/kitchen/KitchenDisplay.js (class-based, matching existing pattern)
import socket from '../../socket';

componentDidMount() {
  socket.on('new-order', (order) => {
    this.setState(prev => ({ orders: [order, ...prev.orders] }));
  });
}
componentWillUnmount() {
  socket.off('new-order');
}
```

## Data Flow

### Order Submission Flow (Counter → Kitchen)

```
Staff taps menu items (Counter UI)
    ↓
Order built in component state (no API call yet)
    ↓
Staff taps "Submit"
    ↓
HTTP POST /api/v1/orders  →  orderController.createNewOrder()
    ↓
orderValidator middleware checks body
    ↓
orderService.createNewOrder() adds timestamps, sets status: 'pending'
    ↓
orderDatabase saves to MongoDB orders collection
    ↓
[DB write confirmed]
    ↓
Controller calls getIO().emit('new-order', savedOrder)
    ↓
Socket.io broadcasts to ALL connected clients simultaneously
    ↓
Counter UI: updates to show "Order submitted" confirmation
Kitchen UI: receives new-order event → adds order card to queue
    ↓
Kitchen staff taps "Complete"
    ↓
HTTP PATCH /api/v1/orders/:id { status: 'completed' }
    ↓
Controller emits 'order-updated' event
    ↓
Kitchen UI: removes order from pending queue
```

### Sales Summary Flow

```
Staff opens /summary (end of day)
    ↓
HTTP GET /api/v1/orders/summary?date=2026-03-28
    ↓
orderController.getDailySummary() reads date param
    ↓
orderService delegates to orderDatabase.getDailySummary()
    ↓
MongoDB aggregation pipeline: $match by date + status, $group for totals
    ↓
Result: { totalRevenue, orderCount, cashOrders, cardOrders }
    ↓
Response: { status: "OK", data: { summary } }
    ↓
DailySummary component renders totals
```

### Menu Management Flow

```
Staff opens /menu
    ↓
HTTP GET /api/v1/menuitems (existing endpoint)
    ↓
Staff edits item → HTTP PATCH /api/v1/menuitems/:name (existing)
Staff adds item  → HTTP POST /api/v1/menuitems (existing)
Staff deletes   → HTTP DELETE /api/v1/menuitems/:name (existing)
    ↓
No socket events needed — menu changes take effect on next page load
```

### State Management Approach

```
Per-component local state (class-based this.state):
  - CounterView: current order items array, running total
  - KitchenDisplay: pending orders array (populated from socket + initial GET)
  - DailySummary: summary data from API

No global state manager needed. Components are independent views.
Socket events mutate local state directly in event handlers.
```

## Build Order (Phase Dependency Map)

The components have clear dependencies that dictate build order:

```
1. Order Schema + CRUD API (database + service + controller stubs → real implementation)
        ↓
2. Connect React to POS server API (fix axios baseURL, get menu items working)
        ↓
3. Counter UI (depends on: menu items API + order POST API)
        ↓
4. Socket.io integration — server side (depends on: order POST controller existing)
   Socket.io integration — client side (depends on: server socket emitting)
        ↓
5. Kitchen Display (depends on: socket.io client + order PATCH API)
        ↓
6. Order History view (depends on: order GET API with filtering)
        ↓
7. Daily Summary (depends on: aggregation pipeline in order database layer)
```

**Why this order:**
- The order schema must exist before any UI that creates or reads orders
- The React-to-API connection must work before building feature views (otherwise you're building against a fake API)
- Socket.io server side must emit before client side can react
- Kitchen Display is the last real-time piece — it requires socket working end-to-end
- Sales summary requires a populated order history, so it naturally comes last

## Integration Points

### Internal Boundaries

| Boundary | Communication Method | Notes |
|----------|---------------------|-------|
| Counter UI ↔ Server | HTTP REST (Axios) | POST /orders, GET /menuitems |
| Kitchen UI ↔ Server | Socket.io (receive) + HTTP (PATCH status) | Kitchen receives via socket; marks complete via HTTP |
| All UIs ↔ Server | Socket.io (subscribe) | All clients on same socket connection; counter and kitchen react to same events |
| Controllers ↔ Socket.io | Module import (`getIO()`) | Controllers import socket singleton; this avoids passing `io` through every function parameter |
| Order Service ↔ Menu Items | None at runtime | Orders embed item name+price snapshot at creation time; no foreign key join needed |

### Order Document — Embed vs Reference Decision

Orders should **embed item snapshots** (name + price at time of order), not reference menuItem documents. This is the standard MongoDB pattern for order data and avoids broken references if menu prices change later.

```javascript
// Order schema shape
{
  items: [{ name: String, price: Number, quantity: Number }],
  total: Number,
  status: { type: String, enum: ['pending', 'completed', 'cancelled'] },
  paymentMethod: { type: String, enum: ['cash', 'card'] },
  createdAt: Date,  // native Date for aggregation queries
  updatedAt: Date
}
```

## Anti-Patterns

### Anti-Pattern 1: Polling Instead of WebSocket for Kitchen Display

**What people do:** Set up `setInterval` in the kitchen component to `GET /orders` every few seconds.

**Why it's wrong:** Adds constant server load even when no orders exist; adds latency (order submitted → up to N seconds before kitchen sees it); unnecessary for a local-network deployment where WebSockets are trivially reliable.

**Do this instead:** Socket.io event on `new-order`. Kitchen display is immediately notified.

### Anti-Pattern 2: Fetching Orders for Sales Totals in Node.js

**What people do:** `GET /orders?date=today` returns all order documents; the frontend or Node sums them up with `.reduce()`.

**Why it's wrong:** Returns potentially hundreds of documents over the wire when only the aggregate numbers are needed. Computation belongs in the database layer where indices exist.

**Do this instead:** MongoDB aggregation pipeline in `orderDatabase.getDailySummary()`. Return only the summary object.

### Anti-Pattern 3: Storing `createdAt` as a Locale String on Orders

**What people do:** Copy the existing menuItem pattern: `new Date().toLocaleString('en-US', { timeZone: 'UTC' })` stores a string like `"3/28/2026, 12:00:00 AM"`.

**Why it's wrong:** String-stored dates cannot be used in MongoDB `$match` with `$gte`/`$lte` date range queries. The aggregation pipeline for daily summaries requires native `Date` objects.

**Do this instead:** Store `createdAt` and `updatedAt` on orders as `new Date()` (native Date). The existing menuItem string format is a technical debt in that collection; do not carry it forward into orders.

### Anti-Pattern 4: Initializing Socket.io Client Multiple Times

**What people do:** `import { io } from 'socket.io-client'; const socket = io(...)` inside each component file.

**Why it's wrong:** Creates multiple WebSocket connections to the server — one per component that mounts. The server sees disconnects and reconnects as views change.

**Do this instead:** Single `src/socket.js` module that initializes once and exports the instance. All components import from that file.

## Scaling Considerations

This is a single-location taco stand on a local network. Scaling considerations are minimal and should not drive design decisions.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1-2 tablets (current) | Single Express process + Socket.io is sufficient. No changes needed. |
| Expand to 5+ terminals | Still fine as-is. Socket.io on a single Node process handles hundreds of concurrent WebSocket connections without issue. |
| Multiple locations | Would require moving MongoDB off localhost (Atlas), separating per-location namespaces. Out of scope per PROJECT.md. |

**First bottleneck if this ever grows:** MongoDB running on localhost with no connection pooling configuration. Fix by moving to Atlas with a proper connection string before any multi-user scenario.

## Sources

- Socket.io v4 server initialization: https://socket.io/docs/v4/server-initialization/ — MEDIUM confidence (WebFetch blocked; based on Socket.io v4 API knowledge confirmed stable since v4.0 release)
- MongoDB aggregation `$group` with `$match` date range: https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/ — HIGH confidence (confirmed via WebFetch)
- Embed vs. reference in MongoDB order systems: https://www.mongodb.com/docs/manual/data-modeling/design-patterns/ — HIGH confidence (standard MongoDB data modeling guidance, embed snapshots for order history)
- Express + Socket.io shared HTTP server pattern: standard Socket.io documentation pattern, HIGH confidence, no deprecation risk

---
*Architecture research for: Tacos Tres Hermanos POS — real-time order flow and sales reporting*
*Researched: 2026-03-28*
