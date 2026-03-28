# Tacos Tres Hermanos POS

## What This Is

A point-of-sale application for a taco stand, used by both the owner and staff to take customer orders, manage the menu, and track daily sales. Built as a web app with a React frontend and Express/MongoDB backend, designed to run on tablets and desktops at the counter and in the kitchen.

## Core Value

A staff member can quickly build a customer's order from the menu, see the total, and submit it — fast and error-free during a rush.

## Requirements

### Validated

- ✓ Menu item CRUD API (create, read, update, delete) — existing
- ✓ Menu item data model with name, price, category — existing
- ✓ Order data model (stub) — existing
- ✓ Express REST API with layered MVC architecture — existing
- ✓ MongoDB database integration — existing
- ✓ Input validation on menu item creation — existing
- ✓ Swagger/OpenAPI documentation — existing
- ✓ React frontend scaffold with routing — existing
- ✓ Connect React frontend to Express API (replace Unsplash placeholder) — Validated in Phase 1: Foundation
- ✓ Complete order API — create, read, update order status — Validated in Phase 1: Foundation
- ✓ Shared MongoDB connection module (no double-connect) — Validated in Phase 1: Foundation

### Active

- [ ] Order-taking UI — tap menu items to build an order with running total
- [ ] Order submission with payment method tracking (cash/card)
- [ ] Kitchen display — separate screen showing incoming orders, mark complete
- [ ] Menu management UI — add, edit, remove items and prices
- [ ] Order history — view past orders, filter by date
- [ ] Daily sales summary — end-of-day totals and breakdown
- [ ] Real-time order updates between counter and kitchen views

### Out of Scope

- Actual card payment processing (Stripe/Square SDK) — cards processed externally, app only tracks payment method
- Receipt printing — not needed for v1
- User authentication/login — small team, trust-based for v1
- Inventory/stock tracking — manual for now
- Online ordering / customer-facing UI — in-person only
- Multi-location support — single taco stand

## Context

- Brownfield project: Express API and React frontend are now connected via CRA proxy and CORS
- Server has working menu item endpoints and a fully implemented order resource (Mongoose schema, service, controller, routes, validator)
- React UI is early-stage with class-based components, now pointed at the POS server API
- MongoDB runs locally (localhost:27017/Tacos3HermanosDB)
- Small menu (under 15 items) — UI should prioritize speed over search/filtering
- Kitchen display needs to work as a separate browser tab/URL on a dedicated tablet
- Used by owner and hired staff during service hours

## Constraints

- **Tech stack**: Build on existing Express.js 4 + React 17 + MongoDB/Mongoose stack — no framework migration
- **Device**: Must work on tablets (touch-friendly) and desktop browsers
- **Simplicity**: Small team, no auth needed — optimize for speed of use over security features
- **Connectivity**: Assumes local network; both counter and kitchen on same network

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Track payment method only, no card processing | Cards handled by external terminal; keeps app simple | — Pending |
| Kitchen display as separate route/page | Runs on dedicated tablet in kitchen; no complex multi-window logic | — Pending |
| No user authentication for v1 | Small trusted team; auth adds friction for a taco stand | — Pending |
| Build on existing stack (Express + React + Mongo) | Code already exists; no reason to migrate | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-28 after Phase 1: Foundation completion*
