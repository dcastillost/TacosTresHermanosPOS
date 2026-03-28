# Requirements: Tacos Tres Hermanos POS

**Defined:** 2026-03-28
**Core Value:** A staff member can quickly build a customer's order from the menu, see the total, and submit it — fast and error-free during a rush.

## v1 Requirements

### Infrastructure

- [ ] **INFRA-01**: React frontend connects to Express API (replace Unsplash axios config)
- [ ] **INFRA-02**: CORS configured to allow frontend-to-backend communication
- [ ] **INFRA-03**: Mongoose connection refactored to single shared connection module
- [ ] **INFRA-04**: Order data model with status enum, Date timestamps, and embedded item price snapshots

### Order Taking

- [ ] **ORD-01**: Staff can view available menu items as tappable tiles on the order screen
- [ ] **ORD-02**: Staff can tap a menu item to add it to the current order
- [ ] **ORD-03**: Staff can increase or decrease item quantity in the current order
- [ ] **ORD-04**: Staff can remove an item from the current order
- [ ] **ORD-05**: Staff can see a running total that updates as items are added/removed
- [ ] **ORD-06**: Staff can select payment method (cash or card) before submitting
- [ ] **ORD-07**: Staff can submit a completed order, which assigns an order number
- [ ] **ORD-08**: Order screen is touch-friendly and usable on a tablet during a rush

### Kitchen Display

- [ ] **KDS-01**: Kitchen display is accessible at a separate URL/route for a dedicated tablet
- [ ] **KDS-02**: New orders appear on the kitchen display in real-time (no manual refresh)
- [ ] **KDS-03**: Kitchen staff can mark an order as complete
- [ ] **KDS-04**: Completed orders are visually distinguished or removed from the active view

### Menu Management

- [ ] **MENU-01**: Staff can view all menu items with name, price, and category
- [ ] **MENU-02**: Staff can add a new menu item with name, price, and category
- [ ] **MENU-03**: Staff can edit an existing menu item's name, price, or category
- [ ] **MENU-04**: Staff can delete a menu item

### Reporting

- [ ] **RPT-01**: Staff can view a daily sales summary showing total revenue for a given day

## v2 Requirements

### Order Taking

- **ORD-V2-01**: Staff can add free-text notes per item (e.g., "no onions")
- **ORD-V2-02**: Staff can add order-level notes

### Kitchen Display

- **KDS-V2-01**: Audio alert plays when a new order arrives
- **KDS-V2-02**: Order age timer shows how long each order has been waiting

### Menu Management

- **MENU-V2-01**: Staff can toggle item availability (86'd items hidden from order screen)
- **MENU-V2-02**: Staff can reorder/prioritize item display position

### Reporting

- **RPT-V2-01**: View past orders with date filtering
- **RPT-V2-02**: Sales breakdown by menu item
- **RPT-V2-03**: Sales breakdown by payment method
- **RPT-V2-04**: Busiest hours chart

## Out of Scope

| Feature | Reason |
|---------|--------|
| Card payment processing (Stripe/Square) | Cards processed on external terminal; app tracks method only |
| Receipt printing | Not needed for taco stand operations |
| User authentication/login | Small trusted team; auth adds friction |
| Inventory/stock tracking | Manual tracking sufficient at this scale |
| Online ordering / customer-facing UI | In-person service only |
| Multi-location support | Single taco stand |
| Modifier/topping trees | Free-text notes (v2) covers 95% of customization needs |
| Item reordering by popularity | Nice-to-have, not essential for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Pending |
| ORD-01 | Phase 2 | Pending |
| ORD-02 | Phase 2 | Pending |
| ORD-03 | Phase 2 | Pending |
| ORD-04 | Phase 2 | Pending |
| ORD-05 | Phase 2 | Pending |
| ORD-06 | Phase 2 | Pending |
| ORD-07 | Phase 2 | Pending |
| ORD-08 | Phase 2 | Pending |
| KDS-01 | Phase 2 | Pending |
| KDS-02 | Phase 2 | Pending |
| KDS-03 | Phase 2 | Pending |
| KDS-04 | Phase 2 | Pending |
| MENU-01 | Phase 3 | Pending |
| MENU-02 | Phase 3 | Pending |
| MENU-03 | Phase 3 | Pending |
| MENU-04 | Phase 3 | Pending |
| RPT-01 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after roadmap creation — all requirements mapped to phases*
