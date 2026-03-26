# Codebase Structure

**Analysis Date:** 2026-03-26

## Directory Layout

```
TacosTresHermanosPOS/
├── tacos-tres-hermanos-pos-server/     # Express.js REST API
│   ├── src/
│   │   ├── index.js                    # Server entry point (Express app setup)
│   │   ├── index_LEGACY.js             # Deprecated entry point (do not use)
│   │   ├── v1/                         # API v1 layer
│   │   │   ├── routes/
│   │   │   │   ├── menuItemRoutes.js   # GET/POST/PATCH/DELETE /api/v1/menuitems
│   │   │   │   └── orderRoutes.js      # GET/POST/PATCH/DELETE /api/v1/orders (stub)
│   │   │   ├── controllers/
│   │   │   │   ├── menuItemController.js # HTTP request/response handlers
│   │   │   │   └── orderController.js    # Stub implementations
│   │   │   ├── services/
│   │   │   │   ├── menuItemService.js    # Business logic, timestamp management
│   │   │   │   └── orderService.js       # Stub (returns mock data)
│   │   │   ├── validators/
│   │   │   │   └── menuItemValidator.js  # express-validator rules
│   │   │   └── swagger.js                # OpenAPI/Swagger UI setup
│   │   └── database/
│   │       ├── menuItem.js               # Mongoose schema + CRUD + MongoDB connection
│   │       └── order.js                  # Empty stub
│   ├── test/
│   │   └── menuItem.js                   # Mocha + Chai test suite
│   ├── package.json                      # Server dependencies
│   ├── .env                              # Environment (DATABASE_URL commented out)
│   └── node_modules/
│
├── tacos-tres-hermanos-pos-ui/          # React 17 frontend (Create React App)
│   ├── src/
│   │   ├── index.js                      # React entry point (renders App to #root)
│   │   ├── reportWebVitals.js            # CRA performance metrics
│   │   ├── setupTests.js                 # Jest configuration
│   │   ├── index.css                     # Global styles
│   │   ├── api/
│   │   │   └── t3h.js                    # Axios instance (currently → Unsplash API)
│   │   └── components/
│   │       ├── App.js                    # Root class component (state, routing)
│   │       ├── App.css                   # App styles
│   │       ├── Header.js                 # Navigation bar with links + GoogleAuth
│   │       ├── SearchBar.js              # Search input form (functional, hooks)
│   │       ├── MenuList.js               # Maps menuItems array → MenuItem components
│   │       ├── MenuList.css              # List styles
│   │       ├── MenuItem.js               # Individual item display (functional)
│   │       ├── GoogleAuth.js             # Google OAuth component (stub)
│   │       └── unused/                   # Experimental components (not active)
│   │           ├── HeaderTabs.js
│   │           ├── Link.js
│   │           └── Route.js
│   ├── public/                           # Static assets (index.html, favicon, etc.)
│   ├── package.json                      # UI dependencies
│   ├── .env                              # Environment (none currently needed)
│   └── node_modules/
│
└── .planning/
    └── codebase/                         # GSD codebase documentation
        └── (this file)
```

## Directory Purposes

**`tacos-tres-hermanos-pos-server/`:**
- Purpose: REST API for POS system; menu item CRUD operations and stub order endpoints
- Contains: Express app, routes, controllers, services, database layer, tests
- Key files: `src/index.js` (entry), `src/v1/routes/` (endpoints), `src/database/menuItem.js` (schema + queries)

**`src/v1/routes/`:**
- Purpose: Define REST endpoints with OpenAPI documentation
- Contains: Express routers that register handlers and middleware
- Key files: `menuItemRoutes.js` (functional), `orderRoutes.js` (stub)

**`src/v1/controllers/`:**
- Purpose: Parse requests, validate results, invoke services, format responses
- Contains: HTTP handler functions
- Key files: `menuItemController.js` (full implementation), `orderController.js` (stubs)

**`src/v1/services/`:**
- Purpose: Business logic and data transformation
- Contains: Functions that add timestamps, call database layer
- Key files: `menuItemService.js` (full), `orderService.js` (stubs)

**`src/v1/validators/`:**
- Purpose: Input validation rules
- Contains: express-validator middleware arrays
- Key files: `menuItemValidator.js` (validates POST body fields)

**`src/database/`:**
- Purpose: Data persistence; schema definitions and CRUD operations
- Contains: Mongoose schemas, MongoDB connection, query functions
- Key files: `menuItem.js` (functional schema + CRUD), `order.js` (empty), swagger doc snippets in JSDoc

**`test/`:**
- Purpose: Test suite for API endpoints
- Contains: Mocha test files with Chai + chai-http
- Key files: `menuItem.js` (tests for GET, POST, PATCH, DELETE)

**`tacos-tres-hermanos-pos-ui/`:**
- Purpose: React frontend for POS UI
- Contains: React components, Axios API client, CSS styling
- Key files: `src/components/App.js` (root), `src/api/t3h.js` (HTTP client)

**`src/components/`:**
- Purpose: UI components for menu display and user interaction
- Contains: Class and functional components; styles
- Key files: `App.js` (state + routing scaffold), `Header.js` (navigation), `MenuList.js` (list container), `MenuItem.js` (list item)

**`src/components/unused/`:**
- Purpose: Experimental/non-functional components (do not use)
- Contains: Partially implemented custom routing and UI elements
- Key files: `HeaderTabs.js`, `Link.js`, `Route.js`

## Key File Locations

**Entry Points:**

- **Server:** `tacos-tres-hermanos-pos-server/src/index.js` — Creates Express app, registers routes, starts listening on PORT (default 3000)
- **UI:** `tacos-tres-hermanos-pos-ui/src/index.js` — Mounts React App to #root element
- **Swagger Docs:** Available at `/api/v1/docs` when server running

**Configuration:**

- **Server env:** `tacos-tres-hermanos-pos-server/.env` — Contains DATABASE_URL (commented out in code), PORT
- **UI env:** `tacos-tres-hermanos-pos-ui/.env` — No critical vars currently needed
- **Server package.json:** `tacos-tres-hermanos-pos-server/package.json` — npm scripts: `dev`, `test`
- **UI package.json:** `tacos-tres-hermanos-pos-ui/package.json` — npm scripts: `start`, `test`, `build`

**Core Logic:**

- **Menu item CRUD:** `tacos-tres-hermanos-pos-server/src/database/menuItem.js` — Mongoose schema, getAllMenuItems, getOneMenuItem, createNewMenuItem, updateOneMenuItem, deleteOneMenuItem
- **Menu item business logic:** `tacos-tres-hermanos-pos-server/src/v1/services/menuItemService.js` — Wraps database calls, adds timestamps
- **Menu item routes:** `tacos-tres-hermanos-pos-server/src/v1/routes/menuItemRoutes.js` — GET /, GET /:menuItemName, POST /, PATCH /:menuItemName, DELETE /:menuItemName
- **Menu item validation:** `tacos-tres-hermanos-pos-server/src/v1/validators/menuItemValidator.js` — Validates name, price, descriptions, URL, category, options, availability
- **UI root:** `tacos-tres-hermanos-pos-ui/src/components/App.js` — Manages menuItems state, provides search callback
- **API client:** `tacos-tres-hermanos-pos-ui/src/api/t3h.js` — Axios instance (currently hardcoded to Unsplash API, not server)

**Testing:**

- **Server tests:** `tacos-tres-hermanos-pos-server/test/menuItem.js` — Mocha test suite; tests all CRUD endpoints by hitting live app
- **UI tests:** `tacos-tres-hermanos-pos-ui/src/setupTests.js` — Jest setup file

## Naming Conventions

**Files:**

- **Lowercase with CamelCase suffixes:** `menuItemRoutes.js`, `menuItemController.js`, `menuItemService.js`, `menuItemValidator.js`
- **Pattern:** `[resourceName][LayerName].js` (e.g., menuItem + Controller = menuItemController.js)
- **Database schemas:** `[resourceName].js` without suffix (e.g., `menuItem.js`)
- **Tests:** `[resourceName].js` in `test/` directory (e.g., `test/menuItem.js`)
- **Components:** PascalCase with `.js` extension (e.g., `App.js`, `Header.js`, `MenuItem.js`)
- **Styles:** Matched to component name with `.css` (e.g., `App.css`, `MenuList.css`)

**Directories:**

- **Lowercase plural for feature areas:** `routes/`, `controllers/`, `services/`, `validators/`, `components/`, `database/`, `test/`
- **Version prefix:** `v1/` to isolate API versioning
- **Descriptive folder names:** `unused/` for deprecated components

**Variables & Functions:**

- **camelCase for functions & variables:** `getAllMenuItems`, `getOneMenuItem`, `createNewMenuItem`, `menuItemName`, `validationErrors`
- **PascalCase for components & classes:** `App`, `MenuItem`, `SearchBar`, `MenuList`
- **CONSTANT_CASE for environment variables:** `PORT`, `DATABASE_URL`

**Route Parameters:**

- **Descriptive singular names:** `:menuItemName` (not `:id` or `:name`), `:orderId`
- **Pattern:** `/:resourceIdentifier` where identifier matches domain language

## Where to Add New Code

**New Endpoint (e.g., categories):**
1. Create `src/v1/routes/categoryRoutes.js` — Define routes and apply middleware
2. Create `src/v1/controllers/categoryController.js` — HTTP request/response logic
3. Create `src/v1/services/categoryService.js` — Business logic and timestamps
4. Create `src/database/category.js` — Mongoose schema and CRUD queries
5. Optionally create `src/v1/validators/categoryValidator.js` if input validation needed
6. Register route in `src/index.js`: `app.use('/api/v1/categories', categoryRouter)`
7. Add JSDoc OpenAPI docs to routes and database schema
8. Update `src/v1/swagger.js` apis array to include new route file if adding docs

**New React Component:**
1. Create `src/components/ComponentName.js` — Functional or class component
2. Create `src/components/ComponentName.css` if styling needed
3. Import in parent component and use as JSX
4. For reusable components, export from `src/components/` and import where needed

**New Test:**
1. For server: Create test file in `tacos-tres-hermanos-pos-server/test/featureName.js`
2. Use Mocha + Chai + chai-http pattern (see `test/menuItem.js`)
3. Tests should hit live app via chai-http (requires running database)
4. For UI: Create `.test.js` file colocated with component or in dedicated test directory
5. Use Jest + React Testing Library

**Utilities:**
- Shared helper functions: Create in appropriate layer (e.g., helpers in services or utils directory if creating)
- Database utilities: Add to `src/database/`
- API utilities: Add to `src/v1/` or in a shared `src/utils/` folder

## Special Directories

**`node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes (via npm install)
- Committed: No (listed in .gitignore)

**`public/` (UI only):**
- Purpose: Static assets (HTML template, favicon, manifest)
- Contains: `index.html` (root DOM element), favicon, robots.txt
- Committed: Yes

**`unused/` (UI components only):**
- Purpose: Experimental or deprecated components
- Generated: No
- Committed: Yes (for historical reference)
- **DO NOT USE** — These are not integrated into the app

**`.env` files:**
- Purpose: Environment-specific configuration
- Server: Contains DATABASE_URL (commented), PORT
- UI: Empty or minimal configuration
- Committed: No (listed in .gitignore)
- **Contains secrets** — Never commit with values

**`.planning/codebase/`:**
- Purpose: GSD documentation for codebase (this location)
- Generated: No (manually created)
- Committed: Yes

---

*Structure analysis: 2026-03-26*
