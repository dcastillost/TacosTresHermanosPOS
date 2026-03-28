# Feature Research

**Domain:** Small food-service point-of-sale (quick-service taco stand)
**Researched:** 2026-03-28
**Confidence:** HIGH — domain is well-established; findings drawn from training knowledge of POS systems (Square, Toast, Clover) and existing codebase analysis. WebSearch unavailable; no external verification performed.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features staff assume will work on day one. Missing any of these makes the app feel broken, not unfinished.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Menu grid / tap-to-add ordering | Core interaction pattern; every POS since iPad-era works this way | MEDIUM | Menu under 15 items — flat grid layout, no search needed. Items tap to add to active order. |
| Running order total with line items | Staff must confirm what was tapped before submitting | LOW | Show item name, quantity, per-item price, and running total in real time. |
| Order submission | Orders must reach the kitchen | LOW | POST to `/api/v1/orders`; currently stubbed. Backend implementation required. |
| Payment method selection at checkout | Cash vs card distinction needed for end-of-day reconciliation | LOW | Enum field on order — no processing logic, just recording the method. |
| Kitchen view of incoming orders | Kitchen staff need to see what to make | MEDIUM | Separate route/page. Must show order items and timestamp. Polling or SSE acceptable for a taco stand volume. |
| Mark order complete / fulfilled | Kitchen needs to dismiss orders when done | LOW | Status transition: `pending` → `complete`. PATCH call on order. Kitchen display removes completed orders. |
| Menu management UI (CRUD) | Owner needs to add/edit/remove items and prices without code changes | MEDIUM | Wire existing menu item API to a React admin form. Name, price, category, availability toggle. |
| Item availability toggle | 86ing items mid-service is a daily reality in food service | LOW | `availability: Boolean` already exists on MenuItem schema. Needs UI toggle and filtering in order-taking view. |
| Order history list | Owner reviews what was sold | LOW | Paginated list of past orders, filterable by date. |
| Daily sales summary | End-of-day cash count and revenue total | MEDIUM | Aggregate totals by payment method and item. Can be server-side aggregation or client-side from order history. |

### Differentiators (Competitive Advantage)

These go beyond table stakes. Given the project's stated core value — "quickly build an order, see the total, submit it" — differentiators are about speed and reducing friction during a rush.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Real-time kitchen display (push, not poll) | Orders appear on kitchen screen instantly without staff hitting refresh | MEDIUM | Server-Sent Events (SSE) on Express is low-overhead; no library needed. Eliminates the "did you get the order?" problem. More valuable than any reporting feature. |
| Order number / ticket number display | Counter staff can call out a number; kitchen knows which ticket to mark done | LOW | Auto-incrementing daily counter or short UUID suffix. Shown large on kitchen display. |
| Quantity controls on line items (+ / -) | Faster than tapping the same item 4 times for a group order | LOW | UI-only change. Line item component needs increment/decrement. |
| Category tabs on order-taking screen | Group items by type (tacos, drinks, sides) so staff find them faster | LOW | `category` array already on MenuItem. Tab filter reduces scan time when menu grows beyond 10 items. |
| Order notes / special instructions field | Common need: "no onions", "extra salsa" | LOW | Free-text string on the order or per line item. Already reasonable to add to order schema. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Receipt printing | Seems professional | Requires hardware driver integration (ESC/POS), browser print dialogs are fragile on tablets, adds a dependency path that blocks order flow if printer is offline | Skip for v1. If ever needed, use a cloud print service (PrintNode) as a separate integration, not inline with order submit. |
| User authentication / login | Seems like good practice | Adds friction every time a staff member picks up the tablet; a taco stand has 2-4 people, trust-based is fine; auth complexity outweighs security benefit at this scale | Single shared session or no auth. Lock screen via tablet OS if physical security is needed. |
| Inventory / stock tracking | "We run out of carnitas sometimes" | Accurate inventory requires decrement-on-order, manual adjustments, and waste tracking — a full sub-system. Wrong counts are worse than no counts. | Use the `availability` toggle to manually 86 items. That's the right tool at this scale. |
| Stripe / Square card processing | "So we don't need a separate terminal" | Card processing requires PCI compliance, webhook handling, refund flows, and error recovery. Adds significant scope and regulatory risk for marginal gain when a physical terminal already exists. | Record cash/card as a payment method only. Keep the external terminal. |
| Online ordering / customer-facing UI | "Customers could order from their phone" | Doubles the surface area: customer auth, order-ahead timing, payment capture, and a completely different UX. None of that exists and it conflicts with the in-person taco-stand model. | In-scope for a future major version, not this milestone. |
| Multi-location support | "Maybe we open a second stand" | Requires tenant isolation in the data model, per-location menus, and staff routing. Retrofitting this later is cheaper than building it speculatively. | Design the schema with `location` as a reserved future field; don't implement any multi-tenant logic now. |
| Modifier / customization sub-menus | "Customers want to customize tacos" | Complex modifier trees (base item → protein choice → topping choices → price adjustments) are a product unto themselves. Toast and Square each have entire teams working on modifier UX. | Use the `options: [String]` field on MenuItem for simple fixed variants (e.g., "3 tacos / 5 tacos"). Free-text order notes cover edge cases. |

---

## Feature Dependencies

```
[Order-Taking UI]
    └──requires──> [Order API (create)]
                       └──requires──> [Order Schema / DB model]

[Kitchen Display]
    └──requires──> [Order API (read, list pending)]
    └──requires──> [Order status model (pending/complete)]
    └──enhances──> [Real-time push (SSE)] ──requires──> [Order API (event stream endpoint)]

[Mark Order Complete]
    └──requires──> [Order API (update status)]
    └──requires──> [Kitchen Display]

[Order History]
    └──requires──> [Order API (read, list with date filter)]

[Daily Sales Summary]
    └──requires──> [Order History]
    └──enhances──> [Payment method on order]

[Menu Management UI]
    └──requires──> [Menu Item API (existing — all CRUD endpoints already built)]

[Item Availability Toggle]
    └──requires──> [Menu Item API — PATCH availability field]
    └──enhances──> [Order-Taking UI — filter out unavailable items]

[Category Tabs]
    └──requires──> [Menu Item API — category data already present]
    └──enhances──> [Order-Taking UI]

[Order Number / Ticket Number]
    └──enhances──> [Order submission]
    └──enhances──> [Kitchen Display]
```

### Dependency Notes

- **Order API requires Order Schema:** The order service and controller are stubs. A MongoDB schema for orders (items array, total, payment method, status, timestamp) must be built before any UI feature can submit or display orders.
- **Kitchen Display requires Order status model:** The `pending` / `complete` lifecycle needs to be on the order document before the kitchen screen can filter what to show.
- **Daily Sales Summary requires Order History:** Summary is an aggregation over the orders collection. Build the history list first; summary is a query on top of that data.
- **Real-time push enhances Kitchen Display:** SSE is a differentiator, not a blocker. Kitchen display can launch with polling (setInterval GET) and be upgraded to SSE as a follow-on improvement.
- **Item Availability Toggle enhances Order-Taking UI:** The toggle is most valuable when the order screen already filters out `availability: false` items. These should be built together in the same phase.

---

## MVP Definition

### Launch With (v1)

This is the minimum set that makes the app genuinely useful for a service shift.

- [ ] Order-taking UI (menu grid, tap-to-add, running total) — without this there is no product
- [ ] Order submission with payment method (cash/card) — completes the core loop
- [ ] Order API backend (create, read, status update) — required by both counter and kitchen
- [ ] Kitchen display (pending orders list, mark complete) — without this, orders go nowhere
- [ ] Item availability toggle (86 items mid-service) — daily operational need; already in schema
- [ ] Menu management UI — owner must control the menu without touching code or database directly

### Add After Validation (v1.x)

Add once the service loop (order → kitchen → complete) is running in real use.

- [ ] Order history — add when owner asks "what did we sell last Tuesday?" (first shift will generate this question)
- [ ] Daily sales summary — add once order history exists; it is a query on top of history data
- [ ] Order notes / special instructions — add when staff start verbally relaying modifications that should be on the ticket
- [ ] Real-time push via SSE — upgrade from polling once kitchen staff complain about lag
- [ ] Category tabs — add if menu grows past 12 items or staff report scanning time as friction

### Future Consideration (v2+)

Defer until the v1 loop is proven and the owner has identified specific pain points.

- [ ] Receipt printing — defer; requires hardware and complicates the order flow
- [ ] Order number / ticket counter — nice when order volume is high; low value for a new stand
- [ ] Reporting beyond daily summary (weekly, per-item) — real value but not day-one need

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Order-taking UI | HIGH | MEDIUM | P1 |
| Order submission + payment method | HIGH | LOW | P1 |
| Order API backend | HIGH | MEDIUM | P1 |
| Kitchen display | HIGH | MEDIUM | P1 |
| Mark order complete | HIGH | LOW | P1 |
| Item availability toggle | HIGH | LOW | P1 |
| Menu management UI | HIGH | MEDIUM | P1 |
| Order history | MEDIUM | LOW | P2 |
| Daily sales summary | MEDIUM | MEDIUM | P2 |
| Order notes / special instructions | MEDIUM | LOW | P2 |
| Category tabs on order screen | MEDIUM | LOW | P2 |
| Real-time push (SSE) | MEDIUM | MEDIUM | P2 |
| Order number / ticket counter | LOW | LOW | P3 |
| Quantity controls (+ / -) | MEDIUM | LOW | P2 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

Reference systems: Square for Restaurants (quick-service mode), Toast Go (tablet POS), Clover Mini.

| Feature | Square (quick-service) | Toast | Our Approach |
|---------|------------------------|-------|--------------|
| Menu grid layout | Large tile grid, category tabs | Large tile grid, category tabs | Large tile grid; category tabs in v1.x |
| Kitchen display | Dedicated KDS screen, auto-advance | KDS with bump bar or touchscreen | Separate browser route on a kitchen tablet |
| Order status model | Open → In progress → Completed | Fired → In progress → Done | Pending → Complete (two states, sufficient for a taco stand) |
| Payment method tracking | Cash, card, split tender | Cash, card, split, comps | Cash / card (no split; external terminal handles card) |
| Modifier system | Full tree (required/optional, price deltas) | Full tree | Flat `options` field + free-text notes; no price deltas |
| Receipt printing | Integrated, optional | Integrated, optional | Out of scope v1 |
| Reporting | Real-time dashboard, labor costs, COGS | Full analytics suite | Daily sales summary sufficient for a one-location taco stand |
| Auth / staff management | Role-based, shift tracking | Role-based, clock-in/out | No auth for v1; trust-based small team |

**Key takeaway:** Square and Toast both support the same core loop (tap menu → build order → send to kitchen → mark done). Their complexity comes from modifiers, inventory, and multi-location — none of which applies here. The core loop is achievable without their complexity.

---

## Sources

- Existing codebase analysis: `src/database/menuItem.js` (schema), `src/v1/services/orderService.js` (stub), `src/v1/routes/orderRoutes.js` (route shape)
- `.planning/PROJECT.md` — validated requirements, out-of-scope decisions, constraints
- Training knowledge of Square for Restaurants, Toast POS, and Clover quick-service configurations (MEDIUM confidence — no live verification performed; WebSearch unavailable during research session)
- General knowledge of quick-service restaurant operations and food-service POS UX patterns (HIGH confidence — well-established domain)

---

*Feature research for: quick-service taco stand POS*
*Researched: 2026-03-28*
