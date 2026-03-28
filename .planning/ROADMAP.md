# Roadmap: Tacos Tres Hermanos POS

## Overview

Starting from a brownfield Express + React + MongoDB codebase where the order resource is a stub and the React frontend points at a placeholder API, this roadmap connects the pieces, implements the order loop end-to-end, and delivers the management and reporting views an owner needs to run a taco stand. Every phase delivers a complete, independently verifiable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Wire React to the Express API and implement the order data model correctly
- [ ] **Phase 2: Order Loop** - Build the counter order-taking UI and kitchen display as one end-to-end flow
- [ ] **Phase 3: Menu Management** - Deliver a UI for staff to add, edit, and delete menu items
- [ ] **Phase 4: Daily Sales Summary** - Display end-of-day revenue totals for owner reconciliation

## Phase Details

### Phase 1: Foundation
**Goal**: The React frontend communicates with the Express API, and the order data model exists with correct schema decisions that cannot be reversed once real orders are stored
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04
**Success Criteria** (what must be TRUE):
  1. A fetch from the React UI to `GET /api/v1/menuitems` returns real menu data from the POS server (not Unsplash)
  2. CORS does not block requests from the React dev server (port 3001) to the Express server (port 3000)
  3. The order Mongoose schema exists with native `Date` timestamps, a validated status enum (`pending`/`completed`/`cancelled`), and embedded item price snapshots (`name`, `price`, `quantity`)
  4. MongoDB connects through a single shared `database/connection.js` module — no double-connect when both menuItem and order models load
**Plans**: TBD

### Phase 2: Order Loop
**Goal**: A staff member can build a customer's order from tappable menu tiles, see a running total, submit it with payment method, and the kitchen display immediately shows the new order for the cook to mark complete
**Depends on**: Phase 1
**Requirements**: ORD-01, ORD-02, ORD-03, ORD-04, ORD-05, ORD-06, ORD-07, ORD-08, KDS-01, KDS-02, KDS-03, KDS-04
**Success Criteria** (what must be TRUE):
  1. Staff can tap menu item tiles on the order screen, see quantities update, and watch the running total recalculate after every change
  2. Staff can remove an item or decrease its quantity to zero and the order updates correctly
  3. Staff can select cash or card, submit the order, and receive a confirmation with an assigned order number
  4. A cook on a separate tablet at `/kitchen` sees the new order appear within seconds of submission without refreshing the page
  5. A cook can tap "Mark complete" and the order is visually removed from the active kitchen queue
  6. All tap targets on both the order screen and kitchen display are large enough to use reliably on a tablet during a service rush
**Plans**: TBD
**UI hint**: yes

### Phase 3: Menu Management
**Goal**: Staff can view, add, edit, and delete menu items through a browser UI without touching the database directly
**Depends on**: Phase 1
**Requirements**: MENU-01, MENU-02, MENU-03, MENU-04
**Success Criteria** (what must be TRUE):
  1. Staff can view all menu items with name, price, and category displayed at `/menu`
  2. Staff can fill out a form to add a new item and see it appear in the list immediately
  3. Staff can edit an existing item's name, price, or category and save the change
  4. Staff can delete an item and confirm it is removed from the list
**Plans**: TBD
**UI hint**: yes

### Phase 4: Daily Sales Summary
**Goal**: Staff can view a daily sales summary showing total revenue for any given day
**Depends on**: Phase 2
**Requirements**: RPT-01
**Success Criteria** (what must be TRUE):
  1. Staff can navigate to `/summary` and select a date to view that day's total revenue
  2. The summary displays a revenue total that correctly reflects all submitted orders for the selected date, broken down by payment method (cash vs card)
  3. The summary page loads in under two seconds for a typical service day (under 200 orders)
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-03-28 |
| 2. Order Loop | 0/TBD | Not started | - |
| 3. Menu Management | 0/TBD | Not started | - |
| 4. Daily Sales Summary | 0/TBD | Not started | - |
