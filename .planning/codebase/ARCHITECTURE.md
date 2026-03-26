# Architecture

**Analysis Date:** 2026-03-26

## Pattern Overview

**Overall:** Layered MVC (Model-View-Controller) monorepo with two independent sub-projects

**Key Characteristics:**
- Clear separation between HTTP routing, business logic, and data persistence layers
- Request-response pattern with standardized JSON response envelope
- RESTful API design with OpenAPI/Swagger documentation
- Service layer for business logic encapsulation and timestamp management
- Validator middleware for input validation before controller processing
- Early-stage React UI that does not yet integrate with server API

## Layers

**Routes (HTTP Interface):**
- Purpose: Define endpoints and apply middleware; generate OpenAPI documentation
- Location: `src/v1/routes/` (server)
- Contains: Express router definitions with OpenAPI JSDoc annotations
- Depends on: Controllers, validators
- Used by: Express app initialization

**Validators (Input Guard):**
- Purpose: Validate request body before processing; prevent invalid data reaching business logic
- Location: `src/v1/validators/menuItemValidator.js`
- Contains: express-validator middleware arrays with field validation rules
- Depends on: express-validator library
- Used by: Routes (applied as middleware in POST requests)

**Controllers (HTTP Request/Response Handling):**
- Purpose: Parse HTTP requests, invoke services, format responses, handle HTTP-specific concerns
- Location: `src/v1/controllers/` (menuItemController.js, orderController.js)
- Contains: Route handler functions that check validation results, call services, and send responses
- Depends on: Services, express-validator for result checking
- Used by: Routes

**Services (Business Logic):**
- Purpose: Implement business rules, manage timestamps, orchestrate data operations
- Location: `src/v1/services/` (menuItemService.js, orderService.js)
- Contains: Functions that transform data, add metadata (createdAt/updatedAt), delegate to database layer
- Depends on: Database layer
- Used by: Controllers

**Database (Data Persistence):**
- Purpose: Define Mongoose schemas, manage MongoDB connection, implement CRUD operations
- Location: `src/database/` (menuItem.js, order.js)
- Contains: Mongoose schema definitions, OpenAPI schema documentation, raw database queries
- Depends on: Mongoose, MongoDB
- Used by: Services

**UI Components (React Frontend):**
- Purpose: Render user interface and handle client-side interactions
- Location: `src/components/` (App.js, Header.js, SearchBar.js, MenuList.js, MenuItem.js, GoogleAuth.js)
- Contains: Class and functional React components using state and hooks
- Depends on: Axios (currently pointed at Unsplash API, not server)
- Used by: Entry point (index.js)

## Data Flow

**Read Flow (GET):**
1. HTTP GET request arrives at route handler
2. Route handler calls controller function
3. Controller calls service function
4. Service calls database function
5. Database executes Mongoose query (find/findOne)
6. Data returned through layers back to controller
7. Controller wraps data in `{ status: "OK", data: [...] }` response envelope
8. Response sent to client

**Create Flow (POST):**
1. HTTP POST request with body arrives at route
2. Validator middleware (menuItemValidator) validates body fields
3. Route handler calls controller
4. Controller checks validationResult for errors
5. If errors: return `{ status: "FAILED", data: { errors: [...] } }` with 400 status
6. If valid: call service with parsed body
7. Service adds timestamps (createdAt, updatedAt) in UTC locale
8. Service calls database to insert
9. Database checks for duplicates (by name) before inserting
10. Mongoose schema enforces field structure
11. Document saved and returned through layers
12. Controller returns `{ status: "OK", data: newDocument }` with 201 status

**Update Flow (PATCH):**
1. HTTP PATCH request with menuItemName param and body arrives
2. Controller extracts menuItemName from params, body from request
3. Service adds updatedAt timestamp
4. Database checks if item exists, then checks if update creates duplicate name
5. Mongoose findOneAndUpdate with `{ new: true }` returns updated document
6. Controller returns updated document in response envelope

**Delete Flow (DELETE):**
1. HTTP DELETE with menuItemName param
2. Controller extracts menuItemName
3. Service calls database delete function
4. Database checks if item exists first
5. MongoDB deleteOne removes matching document
6. Controller returns 204 No Content with OK status

## State Management

**Server:**
- No global state; request-specific data flows through layers
- Timestamps added in service layer (controlled, centralized)
- Database schema enforces data structure; no in-memory caching

**UI:**
- Class-based component (App) maintains menuItems array in local state
- Functional components (SearchBar, MenuItem) manage form state and UI state independently
- No global state management (Redux, Context API)
- Currently disconnected from server API; uses Unsplash API for demo data

## Key Abstractions

**MenuItem Resource:**
- Purpose: Represents a menu item in the POS system
- Examples: `src/database/menuItem.js`, `src/v1/controllers/menuItemController.js`, `src/v1/routes/menuItemRoutes.js`
- Pattern: CRUD operations with name-based identity (not _id), validation, and timestamp tracking
- Schema fields: name, price, shortDescription, longDescription, imageURL, units, category[], options[], availability, createdAt, updatedAt

**Order Resource:**
- Purpose: Represents customer orders (stub - not yet implemented)
- Examples: `src/database/order.js`, `src/v1/controllers/orderController.js`, `src/v1/routes/orderRoutes.js`
- Pattern: Route handlers and stubs exist but return placeholder strings; service and database layers return mock data or undefined
- Current state: Routes defined, no schema, no logic

**API Response Envelope:**
- Purpose: Standardized response format across all endpoints
- Pattern: `{ status: "OK"|"FAILED", data: <payload or error object> }`
- Used by: All controllers for consistent response shape

**Validator Middleware:**
- Purpose: Reusable validation rules applied at route level before controller
- Pattern: Array of express-validator body() rules
- Example: `menuItemValidator` validates name, price, descriptions, URL, category, options, availability

## Entry Points

**Server (`src/index.js`):**
- Location: `src/index.js`
- Triggers: `npm run dev` (via nodemon) or `npm start`
- Responsibilities: Express app setup, route registration, body-parser middleware, Swagger docs initialization, port listening

**UI (`src/index.js`):**
- Location: `src/index.js`
- Triggers: `npm start` (Create React App dev server)
- Responsibilities: React app mounting to root element; App component initialization

## Error Handling

**Strategy:** Server-side errors caught in try-catch blocks; error details returned in response envelope

**Patterns:**
- Controllers wrap service calls in try-catch; catch500Error helper formats errors as `{ status: "FAILED", data: { error: message } }`
- Database layer throws custom error objects with `{ status: <code>, message: <msg> }`
- Database checks preconditions (duplicate name, item exists) and throws 400/404 errors before Mongoose operations
- Validation errors checked after middleware; validation failures return 400 status with array of error messages
- Missing parameters checked in controller; returns 400 if required param empty
- 404 errors thrown in database layer when item not found
- 500 errors for unexpected exceptions with optional status from error object

**UI:**
- No error handling in components; API calls can fail silently
- Console logging exists for debugging but not for user-facing errors

## Cross-Cutting Concerns

**Logging:**
- Server: Console.log for database connection status and Swagger docs URL
- No structured logging or log levels
- Tests output via Mocha test runner
- UI: Minimal console logging (search effect logging)

**Validation:**
- Server: express-validator middleware for request body validation
- Client: HTML5 form inputs with types but no React-level validation
- Database: Mongoose schema provides basic structure; application logic checks duplicates and existence

**Authentication:**
- Server: No authentication currently implemented
- UI: GoogleAuth component stub exists but not integrated
- No token generation, session management, or protected routes

**Timestamp Management:**
- Centralized in service layer (menuItemService)
- UTC locale format: `new Date().toLocaleString('en-US', { timeZone: 'UTC' })`
- Applied to createdAt on insert; updatedAt on every write
- Order service (stub) does not implement this yet

---

*Architecture analysis: 2026-03-26*
