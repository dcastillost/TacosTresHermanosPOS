# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 01-Foundation
**Areas discussed:** Order schema shape, Order numbering & lifecycle, API connection strategy, Mongoose connection refactor, Order API endpoints

---

## Gray Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Order schema shape | How orders store items — flat list, nested objects, references? | |
| Order numbering & lifecycle | Past orders display, kitchen closure, numbering start | |
| API connection strategy | Proxy config vs direct URL, env variables | |
| Claude decides all | Skip all — infrastructure decisions Claude can handle | ✓ |

**User's choice:** Claude decides all
**Notes:** User deferred all Phase 1 decisions to Claude. All decisions were made based on codebase analysis, research findings, and established patterns.

---

## Decisions Made (Claude's Discretion)

### Order Schema Shape
- Embedded item snapshots with frozen prices (not references)
- Native Date timestamps (not locale strings)
- No tax/tip fields for v1

### Order Numbering
- Daily auto-increment starting at 1 each day

### API Connection
- CRA proxy for dev + cors middleware for production
- Replace Unsplash axios config with relative URLs

### Mongoose Refactor
- Extract connection to database/connection.js
- Both models import shared connection

### Order API
- Full CRUD following menuItem pattern
- Express-validator middleware for order creation

## Claude's Discretion

All areas — user explicitly deferred infrastructure decisions.

## Deferred Ideas

None.
