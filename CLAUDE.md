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

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Tacos Tres Hermanos POS**

A point-of-sale application for a taco stand, used by both the owner and staff to take customer orders, manage the menu, and track daily sales. Built as a web app with a React frontend and Express/MongoDB backend, designed to run on tablets and desktops at the counter and in the kitchen.

**Core Value:** A staff member can quickly build a customer's order from the menu, see the total, and submit it — fast and error-free during a rush.

### Constraints

- **Tech stack**: Build on existing Express.js 4 + React 17 + MongoDB/Mongoose stack — no framework migration
- **Device**: Must work on tablets (touch-friendly) and desktop browsers
- **Simplicity**: Small team, no auth needed — optimize for speed of use over security features
- **Connectivity**: Assumes local network; both counter and kitchen on same network
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- JavaScript (Node.js) - Server API, CommonJS modules
- JavaScript (ES6+) - Frontend UI, ES modules
- JSX/TSX - React component development
- None identified
## Runtime
- Node.js - Backend runtime (version inferred from package-lock lockfileVersion 2, suggesting Node 12+)
- npm - Primary package manager for both sub-projects
- Lockfile: Present (package-lock.json in both sub-projects)
## Frameworks
- Express.js 4.17.3 - Server REST API framework (`tacos-tres-hermanos-pos-server`)
- React 17.0.2 - Frontend UI framework (`tacos-tres-hermanos-pos-ui`)
- React Router DOM 5.3.1 - Client-side routing (`tacos-tres-hermanos-pos-ui`)
- Mocha 10.0.0 - Server test runner (`tacos-tres-hermanos-pos-server`)
- Chai 4.3.6 - Server assertion library
- chai-http 4.3.0 - HTTP integration testing for server
- Supertest 6.2.3 - HTTP assertion helper
- Jest 5.0.0 (via react-scripts) - Frontend test runner (`tacos-tres-hermanos-pos-ui`)
- React Testing Library 12.1.3 - React component testing utilities
- react-scripts 5.0.0 - Create React App build tools and scripts
- nodemon - Development server auto-reload (`tacos-tres-hermanos-pos-server`)
## Key Dependencies
- mongoose 6.3.0 - MongoDB object modeling and database abstraction (`tacos-tres-hermanos-pos-server`)
- express-validator 6.14.1 - Input validation middleware (`tacos-tres-hermanos-pos-server`)
- axios 0.26.1 - HTTP client for making API requests (`tacos-tres-hermanos-pos-ui`)
- body-parser 1.20.0 - Express middleware for parsing request bodies
- dotenv 16.0.0 - Environment variable loading for both projects
- apicache 1.6.3 - API response caching middleware (currently disabled in `src/index.js`)
- swagger-jsdoc 6.2.1 - OpenAPI documentation generation from JSDoc
- swagger-ui-express 4.4.0 - Swagger UI serving for API documentation
- ejs 3.0.2 - Template engine (present but unused in current implementation)
- react-dom 17.0.2 - React DOM rendering
- web-vitals 2.1.4 - Web performance metrics
## Configuration
- `.env` file required in both sub-projects (location: `tacos-tres-hermanos-pos-server/.env` and `tacos-tres-hermanos-pos-ui/.env`)
- dotenv loads environment variables at runtime
- No configuration files (no tsconfig.json, no .eslintrc, no .prettierrc detected)
- Create React App default configuration (embedded in react-scripts)
- Express app listen port: `process.env.PORT || 3000` in `src/index.js`
- MongoDB connection: `mongodb://localhost:27017/Tacos3HermanosDB` (hardcoded default, environment variable commented out)
## Platform Requirements
- Node.js with npm
- MongoDB server (local or Atlas connection string via `.env`)
- A modern browser (Chrome, Firefox, Safari)
- Node.js server with npm dependencies installed
- MongoDB instance (Atlas URI or self-hosted)
- Static hosting or Node.js server for React build output
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Camel case for file names: `menuItemController.js`, `menuItemService.js`, `menuItemValidator.js`
- Descriptive purpose-based names: `{domain}{LayerType}.js` (e.g., `menuItemController`, `orderService`)
- Routes use plural form: `menuItemRoutes.js`, `orderRoutes.js`
- Camel case: `getAllMenuItems()`, `getOneMenuItem()`, `createNewMenuItem()`
- Verb-first pattern: `get*`, `create*`, `update*`, `delete*`, `fetch*`
- Async functions not marked with special suffix but declared with `async` keyword
- Private utility functions use camel case: `catch500Error()`
- Camel case exclusively: `menuItemName`, `allMenuItems`, `createdMenuItem`, `newMenuItem`
- Use const for all declarations unless reassignment is needed
- Line 38 in `src/v1/services/menuItemService.js` shows undeclared variable (`updates = {...}`) — violates convention
- Domain objects use descriptive names: `menuItemToInsert`, `newTestMenuItem`, `dataToUpdate`
- Database schemas use PascalCase: `MenuItem` (Mongoose model)
- JSDoc uses CamelCase for property references: `menuItemName`, `createdAt`
- API route constants in UPPERCASE: `const API_URI = '/api/v1/menuitems'` (line 10 in `test/menuItem.js`)
- Configuration values use descriptive names: `mongoString`, `PORT`
## Code Style
- No linter/formatter auto-config found (no `.eslintrc`, `.prettierrc`, `prettier.config.*`)
- React projects use CRA default eslint config (extends `react-app` and `react-app/jest`)
- Manual style observed: 2-space indentation (inconsistently applied)
- Object destructuring heavily used: `const { body, params: { menuItemName } } = req`
- React app: CRA default ESLint (extends `react-app`, `react-app/jest`)
- Server: No explicit eslint config detected — code quality depends on developer discipline
- Semicolons present at end of statements (consistent)
- Used in both require statements and function calls
## Import Organization
- No path aliases detected — relative imports used throughout
- Relative imports follow pattern: `'../api/t3h'`, `'./components/MenuItem'`, `'../../database/menuItem'`
## Error Handling
- Try-catch blocks wrap async operations: `try { ... } catch (error) { throw error }`
- Error objects with status and message properties:
- Centralized error response in controllers: `catch500Error(error, res)` function (line 102 in `src/v1/controllers/menuItemController.js`)
- Consistent API response shape: `{ status: "OK"|"FAILED", data: ... }` across all endpoints
- Parameter validation with manual checks before service calls:
## Logging
- Database connection logging: `console.log(error)`, `console.log('Database Connected')` (lines 54-59 in `src/database/menuItem.js`)
- Server startup logging: `console.log(\`API server is listening on port ${PORT}\`)`
- Swagger docs logging: `console.log(\`Version 1 Docs are available on...\`)`
- Debug logging present but commented out: `// console.log(this.state.menuItems)` in UI components
- Service layer passes errors up without logging — logging happens at boundaries
## Comments
- JSDoc annotations for API documentation (OpenAPI 3.0):
- Inline comments for TODO/clarification: `//For now only handles queries by item name` (line 14 in `src/v1/controllers/menuItemController.js`)
- Comments documenting why, not what: `// id insertion is handled by MongoDB` (line 25 in `src/v1/services/menuItemService.js`)
- No @param, @return JSDoc used for regular functions (only for Swagger)
- Block comments for section separation: `//Mongo Schema for menu items` (line 62 in `src/database/menuItem.js`)
- Used exclusively for OpenAPI/Swagger schema generation in route and database files
- Not used for function documentation in controllers/services
- Includes `@openapi` tags with full endpoint documentation (methods, parameters, responses)
## Function Design
- Single parameter functions preferred: `getOneMenuItem(menuItemName)`
- Multi-property destructuring used for request objects: `const { body, params: { menuItemName } } = req`
- Service functions accept single domain object when multiple properties needed: `createNewMenuItem(newMenuItem)`
- Database layer returns domain objects or counts: `await MenuItem.find({})`, `deletedCount`
- Service layer returns same as database (pass-through) with timestamp addition
- Controllers return void (call `res.json()` or `res.send()` directly)
- Async functions always return a value or throw
## Module Design
- CommonJS: Named exports via object literal:
- ES Modules: Default or named exports:
- Not used; each layer has separate files per resource (menuItem.js, order.js)
- Routes, controllers, services, validators all separate files
## Validation
- express-validator middleware array (chain of validators)
- Applied at route level before controller: `router.post('/', menuItemValidator, menuItemController.createNewMenuItem)`
- Validators check existence, data type, URL format, range constraints:
- Controllers check `validationResult(req)` and return 400 with error array if validation fails (line 38-46 in `src/v1/controllers/menuItemController.js`)
## React Conventions
- Mix of class and functional components
- Class component `App` at root level (line 9 in `src/components/App.js`)
- Functional components with hooks for feature components: `SearchBar` (useState), `MenuList` (useState)
- Arrow function components preferred for simple components: `MenuItem`
- Component files use PascalCase matching export name: `App.js`, `MenuItem.js`, `MenuList.js`
- Props named descriptively: `menuItemName`, `menuItemDescription`, `onSearchSubmit`, `onTitleClick`
- Class component state: `state = { menuItems: [] }`
- Functional component hooks: `const [term, setTerm] = useState('')`
- Follows React naming convention: `set{PropertyName}`
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Clear separation between HTTP routing, business logic, and data persistence layers
- Request-response pattern with standardized JSON response envelope
- RESTful API design with OpenAPI/Swagger documentation
- Service layer for business logic encapsulation and timestamp management
- Validator middleware for input validation before controller processing
- Early-stage React UI that does not yet integrate with server API
## Layers
- Purpose: Define endpoints and apply middleware; generate OpenAPI documentation
- Location: `src/v1/routes/` (server)
- Contains: Express router definitions with OpenAPI JSDoc annotations
- Depends on: Controllers, validators
- Used by: Express app initialization
- Purpose: Validate request body before processing; prevent invalid data reaching business logic
- Location: `src/v1/validators/menuItemValidator.js`
- Contains: express-validator middleware arrays with field validation rules
- Depends on: express-validator library
- Used by: Routes (applied as middleware in POST requests)
- Purpose: Parse HTTP requests, invoke services, format responses, handle HTTP-specific concerns
- Location: `src/v1/controllers/` (menuItemController.js, orderController.js)
- Contains: Route handler functions that check validation results, call services, and send responses
- Depends on: Services, express-validator for result checking
- Used by: Routes
- Purpose: Implement business rules, manage timestamps, orchestrate data operations
- Location: `src/v1/services/` (menuItemService.js, orderService.js)
- Contains: Functions that transform data, add metadata (createdAt/updatedAt), delegate to database layer
- Depends on: Database layer
- Used by: Controllers
- Purpose: Define Mongoose schemas, manage MongoDB connection, implement CRUD operations
- Location: `src/database/` (menuItem.js, order.js)
- Contains: Mongoose schema definitions, OpenAPI schema documentation, raw database queries
- Depends on: Mongoose, MongoDB
- Used by: Services
- Purpose: Render user interface and handle client-side interactions
- Location: `src/components/` (App.js, Header.js, SearchBar.js, MenuList.js, MenuItem.js, GoogleAuth.js)
- Contains: Class and functional React components using state and hooks
- Depends on: Axios (currently pointed at Unsplash API, not server)
- Used by: Entry point (index.js)
## Data Flow
## State Management
- No global state; request-specific data flows through layers
- Timestamps added in service layer (controlled, centralized)
- Database schema enforces data structure; no in-memory caching
- Class-based component (App) maintains menuItems array in local state
- Functional components (SearchBar, MenuItem) manage form state and UI state independently
- No global state management (Redux, Context API)
- Currently disconnected from server API; uses Unsplash API for demo data
## Key Abstractions
- Purpose: Represents a menu item in the POS system
- Examples: `src/database/menuItem.js`, `src/v1/controllers/menuItemController.js`, `src/v1/routes/menuItemRoutes.js`
- Pattern: CRUD operations with name-based identity (not _id), validation, and timestamp tracking
- Schema fields: name, price, shortDescription, longDescription, imageURL, units, category[], options[], availability, createdAt, updatedAt
- Purpose: Represents customer orders (stub - not yet implemented)
- Examples: `src/database/order.js`, `src/v1/controllers/orderController.js`, `src/v1/routes/orderRoutes.js`
- Pattern: Route handlers and stubs exist but return placeholder strings; service and database layers return mock data or undefined
- Current state: Routes defined, no schema, no logic
- Purpose: Standardized response format across all endpoints
- Pattern: `{ status: "OK"|"FAILED", data: <payload or error object> }`
- Used by: All controllers for consistent response shape
- Purpose: Reusable validation rules applied at route level before controller
- Pattern: Array of express-validator body() rules
- Example: `menuItemValidator` validates name, price, descriptions, URL, category, options, availability
## Entry Points
- Location: `src/index.js`
- Triggers: `npm run dev` (via nodemon) or `npm start`
- Responsibilities: Express app setup, route registration, body-parser middleware, Swagger docs initialization, port listening
- Location: `src/index.js`
- Triggers: `npm start` (Create React App dev server)
- Responsibilities: React app mounting to root element; App component initialization
## Error Handling
- Controllers wrap service calls in try-catch; catch500Error helper formats errors as `{ status: "FAILED", data: { error: message } }`
- Database layer throws custom error objects with `{ status: <code>, message: <msg> }`
- Database checks preconditions (duplicate name, item exists) and throws 400/404 errors before Mongoose operations
- Validation errors checked after middleware; validation failures return 400 status with array of error messages
- Missing parameters checked in controller; returns 400 if required param empty
- 404 errors thrown in database layer when item not found
- 500 errors for unexpected exceptions with optional status from error object
- No error handling in components; API calls can fail silently
- Console logging exists for debugging but not for user-facing errors
## Cross-Cutting Concerns
- Server: Console.log for database connection status and Swagger docs URL
- No structured logging or log levels
- Tests output via Mocha test runner
- UI: Minimal console logging (search effect logging)
- Server: express-validator middleware for request body validation
- Client: HTML5 form inputs with types but no React-level validation
- Database: Mongoose schema provides basic structure; application logic checks duplicates and existence
- Server: No authentication currently implemented
- UI: GoogleAuth component stub exists but not integrated
- No token generation, session management, or protected routes
- Centralized in service layer (menuItemService)
- UTC locale format: `new Date().toLocaleString('en-US', { timeZone: 'UTC' })`
- Applied to createdAt on insert; updatedAt on every write
- Order service (stub) does not implement this yet
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
