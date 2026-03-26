# Coding Conventions

**Analysis Date:** 2026-03-26

## Naming Patterns

**Files:**
- Camel case for file names: `menuItemController.js`, `menuItemService.js`, `menuItemValidator.js`
- Descriptive purpose-based names: `{domain}{LayerType}.js` (e.g., `menuItemController`, `orderService`)
- Routes use plural form: `menuItemRoutes.js`, `orderRoutes.js`

**Functions:**
- Camel case: `getAllMenuItems()`, `getOneMenuItem()`, `createNewMenuItem()`
- Verb-first pattern: `get*`, `create*`, `update*`, `delete*`, `fetch*`
- Async functions not marked with special suffix but declared with `async` keyword
- Private utility functions use camel case: `catch500Error()`

**Variables:**
- Camel case exclusively: `menuItemName`, `allMenuItems`, `createdMenuItem`, `newMenuItem`
- Use const for all declarations unless reassignment is needed
- Line 38 in `src/v1/services/menuItemService.js` shows undeclared variable (`updates = {...}`) — violates convention
- Domain objects use descriptive names: `menuItemToInsert`, `newTestMenuItem`, `dataToUpdate`

**Types (Schemas):**
- Database schemas use PascalCase: `MenuItem` (Mongoose model)
- JSDoc uses CamelCase for property references: `menuItemName`, `createdAt`

**Constants:**
- API route constants in UPPERCASE: `const API_URI = '/api/v1/menuitems'` (line 10 in `test/menuItem.js`)
- Configuration values use descriptive names: `mongoString`, `PORT`

## Code Style

**Formatting:**
- No linter/formatter auto-config found (no `.eslintrc`, `.prettierrc`, `prettier.config.*`)
- React projects use CRA default eslint config (extends `react-app` and `react-app/jest`)
- Manual style observed: 2-space indentation (inconsistently applied)
- Object destructuring heavily used: `const { body, params: { menuItemName } } = req`

**Linting:**
- React app: CRA default ESLint (extends `react-app`, `react-app/jest`)
- Server: No explicit eslint config detected — code quality depends on developer discipline

**Semicolons:**
- Semicolons present at end of statements (consistent)
- Used in both require statements and function calls

## Import Organization

**Order (Server - CommonJS):**
1. Core dependencies: `const express = require('express')`
2. External packages: `const bodyParser = require('body-parser')`, `const apicache = require('apicache')`
3. Local modules: `const v1MenuItemRouter = require('./v1/routes/menuItemRoutes')`
4. Named exports: `const { swaggerDocs: V1SwaggerDocs } = require('./v1/swagger.js')`

**Order (UI - ES Modules):**
1. React core: `import React from 'react'`
2. React libraries: `import { BrowserRouter, Route } from 'react-router-dom'`
3. Local API/utils: `import t3h from '../api/t3h'`
4. Local components: `import SearchBar from './SearchBar'`

**Path Aliases:**
- No path aliases detected — relative imports used throughout
- Relative imports follow pattern: `'../api/t3h'`, `'./components/MenuItem'`, `'../../database/menuItem'`

## Error Handling

**Patterns:**
- Try-catch blocks wrap async operations: `try { ... } catch (error) { throw error }`
- Error objects with status and message properties:
  ```javascript
  throw {
    status: 400,
    message: `Item with the name '${createdMenuItem.name}' already exists`
  }
  ```
- Centralized error response in controllers: `catch500Error(error, res)` function (line 102 in `src/v1/controllers/menuItemController.js`)
- Consistent API response shape: `{ status: "OK"|"FAILED", data: ... }` across all endpoints
- Parameter validation with manual checks before service calls:
  ```javascript
  if (!menuItemName) {
    res.status(400).send({ status: "FAILED", data: "Parameter 'menuItemName' can not be empty" });
  }
  ```

**Error Response Format:**
```javascript
{ status: "FAILED", data: { error: "message" } }
{ status: "FAILED", data: { errors: ["error1", "error2"] } }
```

## Logging

**Framework:** `console` (no logging library)

**Patterns:**
- Database connection logging: `console.log(error)`, `console.log('Database Connected')` (lines 54-59 in `src/database/menuItem.js`)
- Server startup logging: `console.log(\`API server is listening on port ${PORT}\`)`
- Swagger docs logging: `console.log(\`Version 1 Docs are available on...\`)`
- Debug logging present but commented out: `// console.log(this.state.menuItems)` in UI components
- Service layer passes errors up without logging — logging happens at boundaries

## Comments

**When to Comment:**
- JSDoc annotations for API documentation (OpenAPI 3.0):
  ```javascript
  /**
   * @openapi
   * /api/v1/menuitems:
   *   get:
   *     tags:
   *       - menuItems
   *     responses:
   *       200:
   *         description: OK
   */
  ```
- Inline comments for TODO/clarification: `//For now only handles queries by item name` (line 14 in `src/v1/controllers/menuItemController.js`)
- Comments documenting why, not what: `// id insertion is handled by MongoDB` (line 25 in `src/v1/services/menuItemService.js`)
- No @param, @return JSDoc used for regular functions (only for Swagger)
- Block comments for section separation: `//Mongo Schema for menu items` (line 62 in `src/database/menuItem.js`)

**JSDoc/TSDoc:**
- Used exclusively for OpenAPI/Swagger schema generation in route and database files
- Not used for function documentation in controllers/services
- Includes `@openapi` tags with full endpoint documentation (methods, parameters, responses)

## Function Design

**Size:** Functions range 10-25 lines; no functions exceed 30 lines

**Parameters:**
- Single parameter functions preferred: `getOneMenuItem(menuItemName)`
- Multi-property destructuring used for request objects: `const { body, params: { menuItemName } } = req`
- Service functions accept single domain object when multiple properties needed: `createNewMenuItem(newMenuItem)`

**Return Values:**
- Database layer returns domain objects or counts: `await MenuItem.find({})`, `deletedCount`
- Service layer returns same as database (pass-through) with timestamp addition
- Controllers return void (call `res.json()` or `res.send()` directly)
- Async functions always return a value or throw

**Async Pattern:**
All database and service operations are async with explicit `await`:
```javascript
const getAllMenuItems = async (filterParams) => {
  try {
    const allMenuItems = await MenuItem.getAllMenuItems(filterParams);
    return allMenuItems;
  } catch (error) {
    throw error;
  }
};
```

## Module Design

**Exports:**
- CommonJS: Named exports via object literal:
  ```javascript
  module.exports = {
    getAllMenuItems,
    getOneMenuItem,
    createNewMenuItem,
    updateOneMenuItem,
    deleteOneMenuItem
  };
  ```
- ES Modules: Default or named exports:
  ```javascript
  export default MenuItem;
  export default App;
  ```

**Barrel Files:**
- Not used; each layer has separate files per resource (menuItem.js, order.js)
- Routes, controllers, services, validators all separate files

## Validation

**Pattern:**
- express-validator middleware array (chain of validators)
- Applied at route level before controller: `router.post('/', menuItemValidator, menuItemController.createNewMenuItem)`
- Validators check existence, data type, URL format, range constraints:
  ```javascript
  body('price', 'Price is required').exists(),
  body('price', "Price can't exceed 20k").isInt({ gt: 0, lt: 20000 }),
  body('imageURL', 'Need a valid image URL').isURL(),
  body('availability', "Availability must be a boolean value").isIn(['true', 'false', 1, 0])
  ```
- Controllers check `validationResult(req)` and return 400 with error array if validation fails (line 38-46 in `src/v1/controllers/menuItemController.js`)

## React Conventions

**Component Types:**
- Mix of class and functional components
- Class component `App` at root level (line 9 in `src/components/App.js`)
- Functional components with hooks for feature components: `SearchBar` (useState), `MenuList` (useState)
- Arrow function components preferred for simple components: `MenuItem`

**Naming:**
- Component files use PascalCase matching export name: `App.js`, `MenuItem.js`, `MenuList.js`
- Props named descriptively: `menuItemName`, `menuItemDescription`, `onSearchSubmit`, `onTitleClick`

**State Management:**
- Class component state: `state = { menuItems: [] }`
- Functional component hooks: `const [term, setTerm] = useState('')`
- Follows React naming convention: `set{PropertyName}`

---

*Convention analysis: 2026-03-26*
