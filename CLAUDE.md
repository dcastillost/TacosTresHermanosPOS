# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monorepo for the Tacos 3 Hermanos point-of-sale system with two independent sub-projects:

- **`tacos-tres-hermanos-pos-server/`** — Express.js REST API (Node.js, CommonJS modules)
- **`tacos-tres-hermanos-pos-ui/`** — React 17 frontend (Create React App, ES modules)

Each sub-project has its own `package.json`, `node_modules`, and `.env`. There is no root-level `package.json`; run all commands from within the respective sub-directory.

## Commands

### Server (`cd tacos-tres-hermanos-pos-server`)

```bash
npm run dev          # Start with nodemon (port 3000 by default)
npm test             # Run Mocha test suite (test/menuItem.js)
```

Tests use **Chai + chai-http** and hit the live app (which connects to MongoDB). There is no mock/stub layer — tests require a running database connection.

### UI (`cd tacos-tres-hermanos-pos-ui`)

```bash
npm start            # Start CRA dev server
npm test             # Run Jest/React Testing Library tests
npm run build        # Production build
```

## Architecture

### Server — layered MVC under `src/v1/`

Request flow: **routes → (validators) → controllers → services → database**

- `routes/` — Express routers with OpenAPI JSDoc annotations (Swagger UI at `/api/v1/docs`)
- `validators/` — express-validator middleware arrays (currently only `menuItemValidator`)
- `controllers/` — HTTP request/response handling, validation result checking
- `services/` — business logic and timestamp generation
- `database/` — Mongoose schemas, MongoDB connection, and raw CRUD operations

Two resources exist: **menuItems** (`/api/v1/menuitems`) and **orders** (`/api/v1/orders`). Menu items are identified by `name` (not `_id`) in route params. The order resource (`database/order.js`) is a stub — not yet implemented.

All API responses follow the shape `{ status: "OK"|"FAILED", data: ... }`.

### UI — class-based React

- `src/components/App.js` — root component (class-based, uses `BrowserRouter`)
- `src/api/t3h.js` — Axios instance (currently pointed at Unsplash API, not the POS server)
- `src/components/unused/` — experimental/unused components

The UI is early-stage; it does not yet consume the POS server API.

## Key Details

- MongoDB connection defaults to `mongodb://localhost:27017/Tacos3HermanosDB` (the Atlas connection string in `.env` is currently commented out in code)
- The `npm test` script in server `package.json` is `"Mocha"` (capital M) — this relies on a globally installed or PATH-accessible `Mocha` binary
- Swagger docs are auto-generated from JSDoc comments in route and database files
